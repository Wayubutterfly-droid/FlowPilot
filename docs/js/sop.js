// ========== FlowPilot 标准 SOP 数据结构 ==========
// 数据结构（真系统返回结构）：
// {
//   title:    string,        // SOP 标题
//   summary:  string,        // 一句话摘要
//   steps: [                 // 步骤列表
//     {
//       step:        number, // 序号
//       name:        string, // 步骤名称
//       type:        'ai' | 'confirm' | 'human',  // AI自动执行 / 人工确认 / 纯人工
//       description: string, // 描述
//       risk:        string, // 风险提示
//       prompts:     string[] // 推荐的 Prompt 列表
//     }
//   ],
//   warnings: string[]       // 全局提醒
// }

// 节点类型定义：code 为内部值，label 为展示文案，badge/border 为对应颜色
const STEP_TYPES = {
    ai: {
        code: 'ai',
        label: 'AI自动执行',
        badge: 'bg-blue-100 text-blue-700 border-blue-200',
        border: 'border-l-4 border-blue-500',
        actionLabel: '模拟执行并完成'
    },
    confirm: {
        code: 'confirm',
        label: '人工确认',
        badge: 'bg-orange-100 text-orange-700 border-orange-200',
        border: 'border-l-4 border-orange-500',
        actionLabel: '确认通过'
    },
    human: {
        code: 'human',
        label: '纯人工',
        badge: 'bg-red-100 text-red-700 border-red-200',
        border: 'border-l-4 border-red-500',
        actionLabel: '标记人工完成'
    }
};

// 无法识别类型时按纯人工处理（宁可多要人确认，也不要把人工步骤误判成可自动执行）
const DEFAULT_STEP_TYPE = 'human';

// 把各种写法统一成 ai / confirm / human
function normalizeStepType(raw) {
    const v = String(raw || '').toLowerCase().trim();
    if (!v) return DEFAULT_STEP_TYPE;
    // AI 自动执行
    if (['ai', 'ai_assist', 'ai_auto', 'ai自动执行', 'ai执行', '自动执行', '机器执行'].includes(v)) return 'ai';
    // 人工确认
    if (['confirm', 'human_confirm', '人工确认', '确认', '审批', '复核'].includes(v)) return 'confirm';
    // 纯人工
    if (['human', 'manual', '纯人工', '人工介入', '人工', '线下'].includes(v)) return 'human';
    return DEFAULT_STEP_TYPE;
}

function getStepTypeMeta(type) {
    return STEP_TYPES[normalizeStepType(type)] || STEP_TYPES[DEFAULT_STEP_TYPE];
}

function _sopStr(v, d) {
    return (typeof v === 'string' && v.trim()) ? v.trim() : (d || '');
}

// 构造单个标准步骤（供内部使用与反馈调整）
function createStep(name, opts = {}) {
    return {
        step: opts.step || 0,
        name: _sopStr(name, '未命名步骤'),
        type: normalizeStepType(opts.type),
        description: _sopStr(opts.description, ''),
        risk: _sopStr(opts.risk, ''),
        prompts: Array.isArray(opts.prompts) ? opts.prompts.filter(p => typeof p === 'string' && p.trim()) : []
    };
}

// 把任意来源（后端接口 / 大模型 / mock）的返回规范化成标准结构
function normalizeSOPResult(raw) {
    const src = (raw && typeof raw === 'object') ? raw : {};

    // 兼容 steps 与旧版 timeline 两种写法
    const rawSteps = Array.isArray(src.steps) ? src.steps
        : Array.isArray(src.timeline) ? src.timeline
        : [];

    const steps = rawSteps.map((item, i) => {
        const o = (item && typeof item === 'object') ? item : {};
        return {
            step: Number(o.step) > 0 ? Number(o.step) : i + 1,
            name: _sopStr(o.name || o.title, '未命名步骤'),
            type: normalizeStepType(o.type),
            description: _sopStr(o.description || o.desc, ''),
            risk: _sopStr(o.risk, ''),
            prompts: Array.isArray(o.prompts)
                ? o.prompts.filter(p => typeof p === 'string' && p.trim())
                : []
        };
    });

    // warnings 兼容旧版 risks
    let warnings = [];
    if (Array.isArray(src.warnings)) {
        warnings = src.warnings
            .map(w => typeof w === 'string' ? w : (w && w.text) || '')
            .filter(Boolean);
    } else if (Array.isArray(src.risks)) {
        warnings = src.risks
            .map(w => typeof w === 'string' ? w : (w && w.text) || '')
            .filter(Boolean);
    }

    return {
        title: _sopStr(src.title, '未命名 SOP'),
        summary: _sopStr(src.summary || src.goal, ''),
        steps,
        warnings
    };
}

// 按节点类型统计，供结果页概览使用
function countStepTypes(steps) {
    const counts = { ai: 0, confirm: 0, human: 0 };
    (steps || []).forEach(s => { counts[normalizeStepType(s.type)]++; });
    return counts;
}

// ========== 生成请求 ==========
// 最近一次生成数据的来源：api | mock
let LAST_SOP_SOURCE = 'mock';

// 请求后端 /api/generate；后端不可用时降级为 mock 数据（仅用于未部署后端时的预览）
// 提示词与模型调用逻辑只保留在后端，前端不内置
async function requestGenerateSOP(task, feedback) {
    const reqBody = { task };
    if (feedback) reqBody.feedback = feedback;

    try {
        const res = await fetch('/api/generate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(reqBody)
        });
        if (!res.ok) {
            // 带上后端返回的 detail，便于定位是模型未启动还是解析失败
            let detail = '';
            try {
                const body = await res.json();
                detail = body && body.detail ? String(body.detail) : '';
            } catch (e) { /* 忽略非 JSON 响应 */ }
            throw new Error('HTTP ' + res.status + (detail ? '：' + detail : ''));
        }
        const data = await res.json();
        LAST_SOP_SOURCE = 'api';
        return normalizeSOPResult(data);
    } catch (apiErr) {
        console.warn('后端接口不可用，使用 mock 数据预览：', apiErr.message);

        // 兜底：mock 数据，模拟网络延迟
        await new Promise(r => setTimeout(r, 600));
        LAST_SOP_SOURCE = 'mock';
        return normalizeSOPResult(getMockSOP(task, feedback));
    }
}
