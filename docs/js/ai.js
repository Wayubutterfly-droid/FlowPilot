// ========== AI 模型接入层（OpenAI 兼容接口，配置存 localStorage） ==========
const AI_CONFIG_KEY = 'aiApiConfig';

// 免费服务商预设（2026-09 核对）
const AI_PROVIDERS = {
    groq: {
        label: 'Groq',
        baseUrl: 'https://api.groq.com/openai/v1',
        model: 'moonshotai/kimi-k2-instruct',
        keyUrl: 'https://console.groq.com/keys',
        keyHint: 'Groq 免费 Key：console.groq.com/keys（邮箱注册，无需信用卡）',
        keyPrefix: 'gsk_',
        keyFormatHint: 'Groq 的 Key 应以 gsk_ 开头'
    },
    gemini: {
        label: 'Google Gemini',
        baseUrl: 'https://generativelanguage.googleapis.com/v1beta/openai',
        model: 'gemini-2.5-flash',
        keyUrl: 'https://aistudio.google.com/apikey',
        keyHint: 'Gemini 免费 Key：aistudio.google.com/apikey（Google 账号登录）',
        keyPrefix: 'AIza',
        keyFormatHint: 'Gemini 的 Key 应以 AIza 开头（约39位）'
    },
    openrouter: {
        label: 'OpenRouter',
        baseUrl: 'https://openrouter.ai/api/v1',
        model: 'meta-llama/llama-3.3-70b-instruct:free',
        keyUrl: 'https://openrouter.ai/keys',
        keyHint: 'OpenRouter Key：openrouter.ai/keys（免费模型名带 :free 后缀）',
        keyPrefix: 'sk-or-v1-',
        keyFormatHint: 'OpenRouter 的 Key 应以 sk-or-v1- 开头'
    },
    custom: {
        label: '自定义',
        baseUrl: '',
        model: '',
        keyUrl: '',
        keyHint: '填写任意 OpenAI 兼容接口的地址、模型与 Key',
        keyPrefix: '',
        keyFormatHint: ''
    }
};

function getAIConfig() {
    try {
        const saved = localStorage.getItem(AI_CONFIG_KEY);
        return saved ? JSON.parse(saved) : null;
    } catch (e) { return null; }
}

function isAIConfigured() {
    const cfg = getAIConfig();
    return !!(cfg && cfg.baseUrl && cfg.apiKey && cfg.model);
}

// Key 规范化：API Key 不含空白字符，去除复制时带入的空格/换行
function normalizeApiKey(k) {
    return (k || '').replace(/\s+/g, '');
}

// 校验 Key 前缀是否与所选服务商匹配；返回 {ok, hint}
function checkKeyFormat(provider, apiKey) {
    const p = AI_PROVIDERS[provider];
    const key = normalizeApiKey(apiKey);
    if (!p || !p.keyPrefix) return { ok: true, hint: '' };
    if (!key) return { ok: true, hint: '' }; // Key 为空时不校验
    if (key.startsWith(p.keyPrefix)) return { ok: true, hint: '' };
    // 前缀不匹配：提示用户可能把别的平台的 Key 粘进来了
    // 尝试识别 Key 实际属于哪个平台，给出更精准的提示
    let actualProvider = '';
    for (const [name, info] of Object.entries(AI_PROVIDERS)) {
        if (info.keyPrefix && key.startsWith(info.keyPrefix) && name !== provider) {
            actualProvider = info.label;
            break;
        }
    }
    let detail = '';
    if (actualProvider) {
        detail = '这个 Key 看起来属于「' + actualProvider + '」而不是「' + p.label + '」。';
    } else {
        detail = '当前 Key 以「' + key.slice(0, 8) + '」开头，无法与「' + p.label + '」的前缀匹配。';
    }
    return {
        ok: false,
        hint: detail + '「' + p.label + '」' + p.keyFormatHint + '。'
    };
}

// 实时校验：用户粘贴/修改 Key 或切换服务商时调用
function validateKeyMatch() {
    const provider = document.getElementById('ai_provider').value;
    const key = document.getElementById('ai_apiKey').value;
    const hintEl = document.getElementById('ai_keyHint');
    const providerEl = document.getElementById('ai_provider');
    if (!key) {
        hintEl.classList.add('hidden');
        providerEl.classList.remove('border-red-500', 'ring-red-500');
        providerEl.classList.add('border-gray-300', 'ring-blue-500');
        return;
    }
    const check = checkKeyFormat(provider, key);
    if (check.ok) {
        hintEl.classList.add('hidden');
        providerEl.classList.remove('border-red-500', 'ring-red-500');
        providerEl.classList.add('border-gray-300', 'ring-blue-500');
    } else {
        hintEl.classList.remove('hidden');
        hintEl.className = 'text-xs mt-1 rounded px-2 py-1 bg-red-50 text-red-700 border border-red-200';
        hintEl.textContent = '⚠ ' + check.hint;
        providerEl.classList.add('border-red-500');
        providerEl.classList.remove('border-gray-300');
    }
}

// 统一的大模型调用入口：返回消息文本（所有网络请求只在此处发起）
async function callLLM(messages, opts = {}) {
    const cfg = getAIConfig();
    if (!cfg || !cfg.baseUrl || !cfg.apiKey || !cfg.model) {
        throw new Error('未配置 AI 模型，请先在「模型设置」中填写配置');
    }
    const base = cfg.baseUrl.replace(/\/+$/, '');
    let res;
    try {
        res = await fetch(base + '/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + cfg.apiKey
            },
            body: JSON.stringify({
                model: cfg.model,
                messages,
                temperature: opts.temperature ?? 0.7,
                ...(opts.jsonMode ? { response_format: { type: 'json_object' } } : {})
            })
        });
    } catch (networkErr) {
        throw new Error('网络请求失败（可能是跨域限制或网络不通）：' + networkErr.message);
    }

    if (!res.ok) {
        let detail = '';
        const rawText = await res.text().catch(() => '');
        try { detail = JSON.parse(rawText).error?.message || ''; } catch (e) { detail = rawText.slice(0, 200); }
        const p = AI_PROVIDERS[cfg.provider];
        if (res.status === 401) {
            throw new Error('认证失败（401 Unauthorized）：API Key 被服务商拒绝。常见原因：' +
                '① Key 与所选服务商不对应（例如 Groq 里粘了 Google 的 Key）；' +
                '② Key 复制不全或已被删除/重置。' +
                (p ? p.label + ' 的 Key ' + p.keyFormatHint + '。' : '') +
                (detail ? '\n服务商返回：' + detail : ''));
        }
        if (res.status === 404) throw new Error('接口地址或模型名不正确（404），请检查 Base URL 与 Model（401 以外的认证问题不会报这个错）' + (detail ? '\n服务商返回：' + detail : ''));
        if (res.status === 429) throw new Error('触发免费额度限流（429），请稍等片刻再试，或换一家免费服务商' + (detail ? '\n服务商返回：' + detail : ''));
        throw new Error('接口返回错误（HTTP ' + res.status + '）' + (detail ? '\n服务商返回：' + detail : ''));
    }

    const data = await res.json();
    const content = data?.choices?.[0]?.message?.content;
    if (!content) throw new Error('模型返回内容为空');
    return content;
}

// 从模型输出中稳健提取 JSON（去除代码块包裹、截取大括号段）
function extractJSON(text) {
    let t = text.trim();
    t = t.replace(/^```(?:json)?/i, '').replace(/```$/i, '').trim();
    try { return JSON.parse(t); } catch (e) { /* 继续兜底 */ }
    const start = t.indexOf('{');
    const end = t.lastIndexOf('}');
    if (start !== -1 && end > start) {
        try { return JSON.parse(t.slice(start, end + 1)); } catch (e) { /* ignore */ }
    }
    throw new Error('无法解析模型返回的 JSON 内容');
}

// SOP 生成提示词：要求模型直接返回标准结构（title / steps / warnings）
function buildGenerateMessages(task, feedback) {
    const system = '你是一名资深企业运营流程专家，负责把用户的任务拆解成标准作业程序（SOP）。\n' +
        '只返回一个 JSON 对象，不要输出任何解释或 markdown。结构必须严格如下：\n' +
        '{\n' +
        '  "title": "SOP 标题",\n' +
        '  "summary": "一句话摘要",\n' +
        '  "steps": [\n' +
        '    {\n' +
        '      "step": 1,\n' +
        '      "name": "步骤名称",\n' +
        '      "type": "ai | confirm | human",\n' +
        '      "description": "这一步具体怎么做",\n' +
        '      "risk": "这一步的风险提示（写具体后果）",\n' +
        '      "prompts": ["可直接交给 AI 使用的 Prompt"]\n' +
        '    }\n' +
        '  ],\n' +
        '  "warnings": ["全局提醒"]\n' +
        '}\n' +
        'type 只能取以下三个值之一：\n' +
        '- "ai"：AI 能独立完成，例如写文案、整理资料、做汇总分析；\n' +
        '- "confirm"：产出后必须由人审核确认才能继续；\n' +
        '- "human"：必须线下由人完成，例如签字、布置现场、发放设备。\n' +
        '要求：\n' +
        '1. 步骤 6-10 个，按执行顺序排列；\n' +
        '2. 三类节点都要出现，不要全部标成同一类；\n' +
        '3. 每个步骤的 risk 必须写具体后果，不要写空话；\n' +
        '4. type 为 ai 或 confirm 的步骤至少给 1 条 prompts；type 为 human 的步骤 prompts 给空数组；\n' +
        '5. 全部使用中文。';

    let userContent = '任务：' + task;
    if (feedback) {
        userContent += '\n\n修改意见：' + feedback + '\n请按修改意见重新输出完整 SOP JSON。';
    }

    return [
        { role: 'system', content: system },
        { role: 'user', content: userContent }
    ];
}

// AI 生成 SOP（返回已解析的原始对象，由调用方统一规范化）
async function aiGenerateSOP(task, feedback) {
    const raw = await callLLM(buildGenerateMessages(task, feedback), { jsonMode: true });
    return extractJSON(raw);
}

// ========== 模型设置弹窗 ==========
function openAISettings() {
    const cfg = getAIConfig() || {};
    document.getElementById('ai_provider').value = cfg.provider || 'groq';
    applyProviderPreset(); // 填 baseUrl/model + 触发一次 validateKeyMatch（此时 key 还空，相当于清理状态）
    document.getElementById('ai_baseUrl').value = cfg.baseUrl || '';
    document.getElementById('ai_model').value = cfg.model || '';
    document.getElementById('ai_apiKey').value = cfg.apiKey || '';
    document.getElementById('ai_testResult').classList.add('hidden');
    document.getElementById('aiSettingsModal').classList.remove('hidden');
    // Key 填完之后再校验一次，让用户一眼看到状态
    validateKeyMatch();
}

function closeAISettings() {
    document.getElementById('aiSettingsModal').classList.add('hidden');
}

function applyProviderPreset() {
    const p = AI_PROVIDERS[document.getElementById('ai_provider').value] || AI_PROVIDERS.custom;
    document.getElementById('ai_baseUrl').value = p.baseUrl;
    document.getElementById('ai_model').value = p.model;
    document.getElementById('ai_keyLink').innerHTML = p.keyUrl
        ? `免费 Key 获取：<a href="${p.keyUrl}" target="_blank" class="text-blue-600 underline">${p.keyUrl.replace('https://','')}</a>`
        : p.keyHint;
    // 切换服务商后，如果已粘贴 Key，立即重新校验前缀匹配
    validateKeyMatch();
}

function saveAISettings() {
    const provider = document.getElementById('ai_provider').value;
    const apiKey = normalizeApiKey(document.getElementById('ai_apiKey').value);
    const cfg = {
        provider,
        baseUrl: document.getElementById('ai_baseUrl').value.trim().replace(/\/+$/, ''),
        model: document.getElementById('ai_model').value.trim(),
        apiKey
    };
    if (!cfg.baseUrl || !cfg.model || !cfg.apiKey) { alert('请完整填写 Base URL、模型名称和 API Key'); return; }
    const check = checkKeyFormat(provider, apiKey);
    if (!check.ok && !confirm(check.hint + '\n\n格式看起来不对，仍要保存吗？')) return;
    localStorage.setItem(AI_CONFIG_KEY, JSON.stringify(cfg));
    updateAIStatus();
    closeAISettings();
    showToast('模型设置已保存');
}

async function testAIConnection() {
    const btn = document.getElementById('aiTestBtn');
    const result = document.getElementById('ai_testResult');
    // 临时保存当前表单值供 callLLM 读取
    const existing = getAIConfig();
    const provider = document.getElementById('ai_provider').value;
    const apiKey = normalizeApiKey(document.getElementById('ai_apiKey').value);
    const temp = {
        provider,
        baseUrl: document.getElementById('ai_baseUrl').value.trim().replace(/\/+$/, ''),
        model: document.getElementById('ai_model').value.trim(),
        apiKey
    };

    // 发送前先做 Key 格式预检（不联网）——防止把别家 Key 粘到这里白跑一趟
    const check = checkKeyFormat(provider, apiKey);
    if (!check.ok) {
        result.className = 'text-sm rounded-lg p-3 bg-red-50 text-red-700 border border-red-200 whitespace-pre-wrap';
        result.textContent = '✗ Key 前缀与服务商不匹配！\n\n' + check.hint + '\n\n这几乎肯定会导致 401/403 认证失败。请先修复再测试。';
        result.classList.remove('hidden');
        // 允许用户执意测试（可能是特殊情况），但二次确认
        if (!confirm('系统检测到 Key 前缀与所选「' + AI_PROVIDERS[provider].label + '」不匹配。\n\n确定仍要强行测试吗？（99% 会报 401 认证失败）')) {
            return; // 用户取消，不继续
        }
        // 用户执意要测 → 继续执行下面的 fetch
    }

    localStorage.setItem(AI_CONFIG_KEY, JSON.stringify(temp));
    btn.disabled = true;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin mr-1"></i>测试中...';
    result.className = 'text-sm rounded-lg p-3 bg-gray-50 text-gray-600 whitespace-pre-wrap';
    result.textContent = '正在请求 ' + AI_PROVIDERS[provider]?.label + '…';
    result.classList.remove('hidden');
    try {
        const reply = await callLLM([
            { role: 'system', content: '只回复两个字：正常' },
            { role: 'user', content: '连接测试' }
        ], { temperature: 0 });
        result.className = 'text-sm rounded-lg p-3 bg-green-50 text-green-700';
        result.textContent = '✓ 连接成功！模型回复：' + reply.slice(0, 30);
    } catch (err) {
        result.className = 'text-sm rounded-lg p-3 bg-red-50 text-red-700 whitespace-pre-wrap';
        result.textContent = '✗ ' + err.message;
        // 恢复原配置
        if (existing) localStorage.setItem(AI_CONFIG_KEY, JSON.stringify(existing));
        else localStorage.removeItem(AI_CONFIG_KEY);
    } finally {
        btn.disabled = false;
        btn.innerHTML = '<i class="fas fa-plug mr-1"></i>测试连接';
    }
}

// 刷新顶部 AI 状态徽标
function updateAIStatus() {
    const dot = document.getElementById('aiStatusDot');
    const text = document.getElementById('aiStatusText');
    if (!dot || !text) return;
    const cfg = getAIConfig();
    if (isAIConfigured()) {
        dot.className = 'w-2 h-2 rounded-full bg-green-500 mr-2';
        text.textContent = 'AI 已接入：' + (AI_PROVIDERS[cfg.provider]?.label || cfg.provider) + ' · ' + cfg.model;
        text.className = 'text-green-600 font-medium';
    } else {
        dot.className = 'w-2 h-2 rounded-full bg-gray-400 mr-2';
        text.textContent = '模型设置（未接入 AI）';
        text.className = 'text-gray-600';
    }
}
