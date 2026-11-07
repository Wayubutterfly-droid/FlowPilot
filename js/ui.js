// ========== 新建场景弹窗 ==========
function openScenarioModal() {
    ['m_name','m_cardTitle','m_cardDesc','m_keywords','m_goal','m_role','m_time',
     'm_msgTitle','m_msgContent','m_risks','m_review'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.value = '';
    });
    document.getElementById('m_icon').value = 'fa-tasks';
    document.getElementById('m_color').value = 'blue';
    document.getElementById('stepRows').innerHTML = '';
    document.getElementById('fieldRows').innerHTML = '';
    // 默认 3 个步骤、3 个字段
    for (let i = 0; i < 3; i++) addStepRow();
    for (let i = 0; i < 3; i++) addFieldRow();
    document.getElementById('scenarioModal').classList.remove('hidden');
}

function closeScenarioModal() {
    document.getElementById('scenarioModal').classList.add('hidden');
}

function addStepRow() {
    const row = document.createElement('div');
    row.className = 'flex gap-2 items-start';
    row.innerHTML = `
        <input type="text" placeholder="步骤名称" class="step-title flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm">
        <input type="text" placeholder="交付物" class="step-delivery flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm">
        <input type="text" placeholder="描述" class="step-desc flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm">
        <button type="button" onclick="this.parentElement.remove()" class="text-red-500 hover:text-red-600 px-2 py-2" title="删除该步骤">
            <i class="fas fa-minus-circle"></i>
        </button>
    `;
    document.getElementById('stepRows').appendChild(row);
}

function addFieldRow() {
    const row = document.createElement('div');
    row.className = 'flex gap-2 items-start';
    row.innerHTML = `
        <input type="text" placeholder="字段名" class="field-name flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm">
        <select class="field-type px-3 py-2 border border-gray-300 rounded-lg text-sm">
            <option>文本</option><option>多行文本</option><option>数字</option>
            <option>日期</option><option>日期时间</option><option>下拉选择</option><option>货币</option>
        </select>
        <select class="field-required px-3 py-2 border border-gray-300 rounded-lg text-sm">
            <option value="是">必填</option><option value="否">选填</option>
        </select>
        <input type="text" placeholder="说明" class="field-desc flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm">
        <button type="button" onclick="this.parentElement.remove()" class="text-red-500 hover:text-red-600 px-2 py-2" title="删除该字段">
            <i class="fas fa-minus-circle"></i>
        </button>
    `;
    document.getElementById('fieldRows').appendChild(row);
}

function saveCustomScenarioFromForm() {
    const name = document.getElementById('m_name').value.trim();
    const keywordsRaw = document.getElementById('m_keywords').value.trim();
    if (!name) { alert('请填写场景名称'); return; }
    if (!keywordsRaw) { alert('请至少填写一个匹配关键词'); return; }

    // 收集步骤
    const steps = [];
    document.querySelectorAll('#stepRows > div').forEach(row => {
        const title = row.querySelector('.step-title').value.trim();
        if (!title) return;
        steps.push({
            title,
            delivery: row.querySelector('.step-delivery').value.trim() || '交付物',
            desc: row.querySelector('.step-desc').value.trim() || title
        });
    });
    if (steps.length === 0) { alert('请至少添加一个 SOP 步骤'); return; }

    // 收集模板字段
    const template = [];
    document.querySelectorAll('#fieldRows > div').forEach(row => {
        const fname = row.querySelector('.field-name').value.trim();
        if (!fname) return;
        template.push({
            name: fname,
            type: row.querySelector('.field-type').value,
            required: row.querySelector('.field-required').value,
            desc: row.querySelector('.field-desc').value.trim() || fname
        });
    });

    const risks = document.getElementById('m_risks').value.split('\n').map(s => s.trim()).filter(Boolean);
    const msgTitle = document.getElementById('m_msgTitle').value.trim() || '【通知】';
    const msgContent = document.getElementById('m_msgContent').value.trim() || '请知悉。';

    const scenario = {
        name,
        cardTitle: document.getElementById('m_cardTitle').value.trim() || name,
        cardDesc: document.getElementById('m_cardDesc').value.trim(),
        icon: document.getElementById('m_icon').value,
        color: document.getElementById('m_color').value,
        keywords: keywordsRaw.split(/[,，]/).map(s => s.trim()).filter(Boolean),
        data: {
            goal: document.getElementById('m_goal').value.trim() || `完成${name}任务`,
            role: document.getElementById('m_role').value.trim() || '任务负责人',
            time: document.getElementById('m_time').value.trim() || '视情况而定',
            timeline: steps,
            template: template.length ? template : [{ name: '备注', type: '多行文本', required: '否', desc: '备注' }],
            messages: [{ title: msgTitle, content: msgContent }],
            risks: risks.length ? risks : ['执行偏差'],
            review: document.getElementById('m_review').value.trim() || '目标达成、效率、改进方向'
        }
    };

    addCustomScenario(scenario);
    closeScenarioModal();
    showToast('场景已创建并保存到本地');
}

// ========== 场景卡片渲染 ==========
// 动态渲染场景卡片（数据驱动，新增场景自动出现）
function renderScenarioCards() {
    const container = document.getElementById('scenarioCards');
    if (!container) return;
    container.innerHTML = SCENARIOS.map(s => {
        const deleteBtn = s.isCustom
            ? `<button onclick="event.stopPropagation(); deleteCustomScenario('${s.id}')"
                   class="text-gray-400 hover:text-red-500 text-sm p-1" title="删除该自定义场景">
                   <i class="fas fa-trash-alt"></i>
               </button>`
            : '';
        const customTag = s.isCustom
            ? `<span class="ml-2 text-xs bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded">自定义</span>`
            : '';
        return `
        <div onclick="selectScenario('${s.name}')"
             class="card cursor-pointer hover:shadow-lg transition border-t-4 border-${s.color}-500 relative">
            ${deleteBtn ? `<div class="absolute top-2 right-2">${deleteBtn}</div>` : ''}
            <div class="flex items-center">
                <div class="bg-${s.color}-500 rounded-full p-4">
                    <i class="fas ${s.icon} text-white text-xl"></i>
                </div>
                <div class="ml-4">
                    <h3 class="font-bold text-gray-800 flex items-center">
                        ${s.cardTitle || s.name}${customTag}
                    </h3>
                    <p class="text-gray-500 text-sm mt-1">${s.cardDesc || ''}</p>
                </div>
            </div>
        </div>
    `;
    }).join('');
}

// 选择场景卡片：把场景名写入输入框并触发生成
function selectScenario(scenarioName) {
    document.getElementById('taskInput').value = scenarioName;
    generateSOP();
}

// ========== SOP 结果渲染 ==========
function renderCurrentSOP(title, resetHistory = true) {
    document.getElementById('resultTitle').textContent = title;
    const steps = currentData.steps || [];
    stepStates = steps.map((_, index) => index === 0 ? 'in-progress' : 'pending');
    if (resetHistory) iterationHistory = [];

    // 概览：摘要 + 节点构成
    document.getElementById('overviewGoal').textContent = currentData.summary || '—';
    document.getElementById('overviewSteps').textContent = steps.length + ' 步';

    const counts = countStepTypes(steps);
    document.getElementById('overviewTypes').innerHTML =
        `<span class="text-blue-600 font-medium">AI自动 ${counts.ai}</span>` +
        `<span class="text-gray-400 mx-1">/</span>` +
        `<span class="text-orange-600 font-medium">人工确认 ${counts.confirm}</span>` +
        `<span class="text-gray-400 mx-1">/</span>` +
        `<span class="text-red-600 font-medium">纯人工 ${counts.human}</span>`;

    renderTimeline();
    renderTemplate();
    renderMessages();
    renderRisks();
    renderReview();
    updateProgress();

    document.getElementById('resultSection').classList.remove('hidden');
    document.getElementById('resultSection').scrollIntoView({ behavior: 'smooth' });
}

function goBack() {
    document.getElementById('resultSection').classList.add('hidden');
}

// ========== 进度与步骤 ==========
function updateProgress() {
    const completedCount = stepStates.filter(s => s === 'completed').length;
    const total = stepStates.length;
    const percentage = total > 0 ? (completedCount / total) * 100 : 0;

    document.getElementById('progressText').textContent = `${completedCount}/${total} 已完成`;
    document.getElementById('progressFill').style.width = percentage + '%';
}

// 完成某一步骤
function completeStep(index) {
    if (stepStates[index] !== 'in-progress') return;

    // 将当前步骤标记为已完成
    stepStates[index] = 'completed';

    // 将下一步设为进行中（如果存在）
    if (index + 1 < stepStates.length) {
        stepStates[index + 1] = 'in-progress';
    }

    // 重新渲染步骤列表
    renderTimeline();
    updateProgress();

    // 自动滚动到下一步（如果存在）
    if (index + 1 < stepStates.length) {
        setTimeout(() => {
            const nextStep = document.getElementById('step-' + (index + 1));
            if (nextStep) {
                nextStep.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
        }, 300);
    }
}

function renderTimeline() {
    const container = document.getElementById('sopTimeline');
    const steps = currentData.steps || [];
    container.innerHTML = steps.map((item, index) => {
        const state = stepStates[index];
        const isInProgress = state === 'in-progress';
        const isCompleted = state === 'completed';
        const meta = getStepTypeMeta(item.type);

        const numberIcon = isCompleted
            ? '<i class="fas fa-check text-white text-xs"></i>'
            : `<span class="text-white text-xs font-bold">${item.step || index + 1}</span>`;

        const actionBtn = isInProgress
            ? `<button onclick="completeStep(${index})" class="mt-3 bg-gray-700 hover:bg-gray-800 text-white text-sm px-4 py-2 rounded-lg transition flex items-center">
                    <i class="fas fa-check mr-2"></i>${meta.actionLabel}
               </button>`
            : '';

        const riskHtml = item.risk
            ? `<p class="text-xs text-red-600 mt-2 flex items-start">
                   <i class="fas fa-exclamation-triangle mt-0.5 mr-1.5 flex-shrink-0"></i>
                   <span>${item.risk}</span>
               </p>`
            : '';

        const promptsHtml = (item.prompts && item.prompts.length)
            ? `<div class="mt-2">
                   <p class="text-xs text-gray-500 mb-1">推荐 Prompt（点击复制）</p>
                   <div class="space-y-1">
                       ${item.prompts.map((p, pi) => `
                           <button onclick="copyPrompt(${index}, ${pi})"
                               class="block w-full text-left text-xs bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded px-2 py-1.5 text-gray-600">
                               <i class="fas fa-terminal mr-1 text-gray-400"></i>${p}
                           </button>`).join('')}
                   </div>
               </div>`
            : '';

        return `
            <div id="step-${index}" class="sop-step ${state} relative pl-10 pb-3 rounded-lg p-4 ${meta.border} ${isInProgress ? 'bg-blue-50' : 'bg-gray-50'}">
                <div class="absolute left-1 top-4 w-8 h-8 rounded-full flex items-center justify-center step-number">
                    ${numberIcon}
                </div>
                <div class="step-content ml-2">
                    <div class="flex items-center justify-between gap-2">
                        <div class="flex items-center gap-2 flex-wrap">
                            <h4 class="step-title font-bold text-gray-800">${item.name}</h4>
                            <span class="text-xs px-2 py-0.5 rounded border ${meta.badge}">${meta.label}</span>
                        </div>
                        <button onclick="toggleEditStep(${index})" class="text-gray-400 hover:text-blue-600 text-sm p-1 flex-shrink-0" title="编辑步骤描述">
                            <i class="fas fa-pencil-alt"></i>
                        </button>
                    </div>
                    <p class="text-gray-600 text-sm mt-1" id="step-desc-${index}">${item.description}</p>
                    ${riskHtml}
                    ${promptsHtml}
                    ${actionBtn}
                </div>
            </div>
        `;
    }).join('');
}

// 复制某一步骤的推荐 Prompt
function copyPrompt(stepIndex, promptIndex) {
    const p = currentData.steps[stepIndex]?.prompts?.[promptIndex];
    if (!p) return;
    navigator.clipboard.writeText(p).then(() => showToast('Prompt 已复制'));
}

// 切换步骤编辑状态
function toggleEditStep(index) {
    const descEl = document.getElementById('step-desc-' + index);
    const currentDesc = currentData.steps[index].description;

    // 如果已经有输入框，直接返回
    if (descEl.querySelector('input')) return;

    // 创建输入框
    const input = document.createElement('input');
    input.type = 'text';
    input.value = currentDesc;
    input.className = 'w-full px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:border-blue-500';
    input.onkeydown = function(e) {
        if (e.key === 'Enter') {
            saveStepEdit(index, this.value);
        } else if (e.key === 'Escape') {
            cancelStepEdit(index);
        }
    };

    // 清空并替换为输入框
    descEl.innerHTML = '';
    descEl.appendChild(input);
    input.focus();
    input.select();

    // 添加保存和取消按钮
    const btnContainer = document.createElement('div');
    btnContainer.className = 'mt-2 flex gap-2';
    btnContainer.innerHTML = `
        <button onclick="saveStepEdit(${index}, this.previousSibling.value)" class="bg-blue-500 hover:bg-blue-600 text-white text-xs px-3 py-1 rounded">保存</button>
        <button onclick="cancelStepEdit(${index})" class="bg-gray-300 hover:bg-gray-400 text-gray-700 text-xs px-3 py-1 rounded">取消</button>
    `;
    descEl.parentNode.appendChild(btnContainer);
}

// 保存步骤编辑
function saveStepEdit(index, newValue) {
    if (newValue && newValue.trim()) {
        currentData.steps[index].description = newValue.trim();
    }
    renderTimeline();
    updateProgress();
}

// 取消步骤编辑
function cancelStepEdit(index) {
    renderTimeline();
    updateProgress();
}

// 新版结构不一定带模板字段 / 沟通文案 / 复盘建议，无数据时隐藏整块，避免出现空卡片
function toggleCard(cardId, visible) {
    const el = document.getElementById(cardId);
    if (el) el.classList.toggle('hidden', !visible);
}

function renderTemplate() {
    const list = currentData.template || [];
    toggleCard('templateCard', list.length > 0);
    if (!list.length) return;
    const tbody = document.getElementById('templateBody');
    tbody.innerHTML = list.map(item => `
        <tr class="border-b hover:bg-gray-50">
            <td class="px-4 py-2 font-medium">${item.name}</td>
            <td class="px-4 py-2 text-gray-600">${item.type}</td>
            <td class="px-4 py-2">${item.required === '是' ? '<span class="text-green-600"><i class="fas fa-check"></i></span>' : '-'}</td>
            <td class="px-4 py-2 text-gray-500 text-xs">${item.desc}</td>
        </tr>
    `).join('');
}

function renderMessages() {
    const list = currentData.messages || [];
    toggleCard('messageCard', list.length > 0);
    if (!list.length) return;
    const container = document.getElementById('messageContent');
    container.innerHTML = list.map(msg => `
        <div class="bg-gray-50 rounded-lg p-4 border-l-4 border-purple-400">
            <p class="font-bold text-gray-800 mb-1">${msg.title}</p>
            <p class="text-gray-600 text-sm whitespace-pre-line">${msg.content}</p>
        </div>
    `).join('');
}

// 全局风险提醒（单步风险已展示在步骤卡片内，这里不重复）
function renderRisks() {
    const list = currentData.warnings || [];
    toggleCard('riskCard', list.length > 0);
    if (!list.length) return;
    const container = document.getElementById('riskContent');
    container.innerHTML = list.map(risk => `
        <div class="flex items-start p-3 risk-card rounded-lg">
            <i class="fas fa-exclamation-triangle text-red-500 mt-0.5 mr-3"></i>
            <p class="text-gray-700">${risk}</p>
        </div>
    `).join('');
}

function renderReview() {
    const review = currentData.review || '';
    toggleCard('reviewCard', !!review);
    const container = document.getElementById('reviewContent');
    if (!container || !review) return;
    container.textContent = review;
}

// ========== 迭代记录 ==========
function addIterationRecord(feedback) {
    const record = {
        version: iterationHistory.length + 2, // 从v2开始
        feedback: feedback,
        time: new Date().toLocaleString('zh-CN')
    };
    iterationHistory.push(record);
    renderIterationHistory();
}

function renderIterationHistory() {
    const container = document.getElementById('iterationHistoryList');
    if (iterationHistory.length === 0) {
        container.innerHTML = '<p class="text-gray-400 text-sm">暂无迭代记录</p>';
        return;
    }

    container.innerHTML = iterationHistory.map(r => `
        <div class="bg-purple-50 p-3 rounded border-l-4 border-purple-500">
            <div class="font-medium text-purple-700">v${r.version}：优化了"${r.feedback}"</div>
            <div class="text-xs text-gray-500 mt-1">${r.time}</div>
        </div>
    `).reverse().join('');
}

function toggleIterationHistory() {
    const content = document.getElementById('iterationHistoryContent');
    const toggleText = document.getElementById('iterationToggleText');
    if (content.classList.contains('hidden')) {
        content.classList.remove('hidden');
        toggleText.textContent = '收起';
    } else {
        content.classList.add('hidden');
        toggleText.textContent = '展开';
    }
}

function clearIterationHistory() {
    iterationHistory = [];
    renderIterationHistory();
}

// ========== 复制 / Toast / 打印 ==========
function copyContent(type) {
    if (!currentData) return;
    let text = '';
    switch(type) {
        case 'sop':
            text = `【${currentData.title || 'SOP'}】\n`;
            if (currentData.summary) text += currentData.summary + '\n';
            text += '\n';
            (currentData.steps || []).forEach((s, i) => {
                text += `${s.step || i + 1}. [${getStepTypeMeta(s.type).label}] ${s.name}\n`;
                if (s.description) text += `   ${s.description}\n`;
                if (s.risk) text += `   风险：${s.risk}\n`;
                if (s.prompts && s.prompts.length) text += `   Prompt：${s.prompts.join(' ｜ ')}\n`;
                text += '\n';
            });
            break;
        case 'template':
            text = '【模板字段】\n字段\t类型\t必填\t说明\n';
            (currentData.template || []).forEach(t => text += `${t.name}\t${t.type}\t${t.required}\t${t.desc}\n`);
            break;
        case 'messages':
            text = '【沟通文案】\n';
            (currentData.messages || []).forEach(m => text += `${m.title}\n${m.content}\n\n`);
            break;
        case 'risks':
            text = '【风险提醒】\n';
            (currentData.warnings || []).forEach((r, i) => text += `${i+1}. ${r}\n`);
            break;
        case 'review':
            text = '【复盘建议】\n' + (currentData.review || '暂无复盘建议');
            break;
    }
    navigator.clipboard.writeText(text).then(() => showToast('已复制到剪贴板'));
}

function showToast(msg) {
    const toast = document.getElementById('toast');
    document.getElementById('toastMsg').textContent = msg;
    toast.classList.remove('hidden');
    setTimeout(() => toast.classList.add('hidden'), 2000);
}

// ========== 导出为打印文档 ==========
function exportToPrint() {
    if (!currentData || !document.getElementById('resultTitle').textContent) {
        alert('请先生成SOP');
        return;
    }

    const taskName = document.getElementById('resultTitle').textContent;
    const goalText = document.getElementById('overviewGoal').textContent;

    const generateDate = new Date().toLocaleString('zh-CN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });

    // 构建 SOP 步骤 HTML（带节点类型标识）
    const stepTypeColor = { ai: '#2563eb', confirm: '#ea580c', human: '#dc2626' };
    const sopStepsHtml = (currentData.steps || []).map((s, i) => {
        const meta = getStepTypeMeta(s.type);
        const color = stepTypeColor[meta.code];
        return `
        <div style="margin-bottom:16px;padding-left:30px;position:relative;page-break-inside:avoid;">
            <span style="position:absolute;left:0;top:0;width:22px;height:22px;background:${color};color:white;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:bold;">${s.step || i + 1}</span>
            <div style="border-left:2px solid #ddd;padding-left:15px;margin-left:10px;">
                <div style="font-weight:bold;font-size:14px;margin-bottom:4px;">
                    ${s.name}
                    <span style="font-size:11px;font-weight:normal;color:${color};border:1px solid ${color};border-radius:3px;padding:1px 6px;margin-left:6px;">${meta.label}</span>
                </div>
                <div style="font-size:13px;color:#555;">${s.description}</div>
                ${s.risk ? `<div style="font-size:12px;color:#dc2626;margin-top:4px;">风险：${s.risk}</div>` : ''}
                ${s.prompts && s.prompts.length ? `<div style="font-size:12px;color:#777;margin-top:4px;">推荐 Prompt：${s.prompts.join(' ｜ ')}</div>` : ''}
            </div>
        </div>`;
    }).join('');

    // 构建全局风险提醒 HTML
    const risksHtml = (currentData.warnings || []).map(r => `
        <div style="padding:8px 12px;background:#fef2f2;border-left:3px solid #ef4444;margin-bottom:8px;font-size:13px;">
            ⚠️ ${r}
        </div>
    `).join('');

    const printHTML = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${taskName} - SOP打印文档</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            font-family: "Microsoft YaHei", "黑体", SimHei, sans-serif;
            color: #000;
            font-size: 14px;
            line-height: 1.6;
            padding: 40px 50px;
            max-width: 800px;
            margin: 0 auto;
        }
        .header {
            text-align: right;
            font-size: 12px;
            color: #888;
            margin-bottom: 20px;
            padding-bottom: 15px;
            border-bottom: 2px solid #333;
        }
        .watermark {
            position: fixed;
            top: 20px;
            right: 20px;
            font-size: 11px;
            color: #aaa;
        }
        h1 {
            font-size: 24px;
            font-weight: bold;
            margin-bottom: 20px;
            text-align: center;
        }
        h2 {
            font-size: 16px;
            font-weight: bold;
            margin: 24px 0 12px 0;
            padding-bottom: 8px;
            border-bottom: 1px solid #ddd;
        }
        .goal {
            background: #f5f5f5;
            padding: 12px 16px;
            border-radius: 4px;
            margin-bottom: 20px;
        }
        .goal-label {
            font-weight: bold;
            color: #333;
        }
        table {
            width: 100%;
            border-collapse: collapse;
            margin: 12px 0;
            font-size: 13px;
        }
        th {
            background: #f0f0f0;
            font-weight: bold;
            text-align: left;
        }
        .footer {
            margin-top: 40px;
            padding-top: 20px;
            border-top: 1px solid #ddd;
            text-align: center;
            font-size: 12px;
            color: #888;
        }
        .print-btn {
            position: fixed;
            bottom: 30px;
            right: 30px;
            background: #3b82f6;
            color: white;
            border: none;
            padding: 12px 24px;
            border-radius: 6px;
            cursor: pointer;
            font-size: 14px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.2);
        }
        .print-btn:hover { background: #2563eb; }
        @media print {
            .print-btn { display: none; }
            body { padding: 20px; }
        }
    </style>
</head>
<body>
    <div class="watermark">AI SOP生成器 · 打印版</div>

    <div class="header">
        生成时间：${generateDate}
    </div>

    <h1>📋 ${taskName}</h1>

    <div class="goal">
        <span class="goal-label">任务目标：</span>${goalText}
    </div>

    <h2>📌 SOP执行步骤</h2>
    ${sopStepsHtml}

    <h2>⚠️ 风险提醒</h2>
    ${risksHtml}

    <div class="footer">
        <p>本文档由 AI SOP生成器 自动生成</p>
        <p>生成时间：${generateDate}</p>
    </div>

    <button class="print-btn" onclick="window.print()">🖨️ 打印文档</button>
</body>
</html>`;

    // 打开新窗口并写入内容
    const printWindow = window.open('', '_blank', 'width=900,height=700');
    if (printWindow) {
        printWindow.document.write(printHTML);
        printWindow.document.close();
    } else {
        alert('无法打开新窗口，请检查浏览器设置');
    }
}

// ========== 图表 ==========
// 重新绘制场景相关图表（场景增删后调用）
function refreshCharts() {
    const scenarioLabels = SCENARIOS.map(s => s.cardTitle || s.name);
    const scenarioColors = SCENARIOS.map(s => COLOR_MAP[s.color] || '#9ca3af');
    // 模拟各场景使用次数（实际项目中可替换为后端统计接口）
    const scenarioUsage = SCENARIOS.map((_, i) => Math.max(10, 50 - i * 6));

    // 销毁旧实例再重建
    [chart1, chart2, chart3].forEach(c => { if (c) c.destroy(); });

    chart1 = new Chart(document.getElementById('chart1'), {
        type: 'line',
        data: {
            labels: scenarioLabels,
            datasets: [{ label: '使用次数', data: scenarioUsage, borderColor: '#4f46e5', fill: false, tension: 0.1 }]
        }
    });

    chart2 = new Chart(document.getElementById('chart2'), {
        type: 'doughnut',
        data: {
            labels: [...scenarioLabels, '其他'],
            datasets: [{
                data: [...scenarioUsage, 10],
                backgroundColor: [...scenarioColors, '#9ca3af']
            }]
        }
    });

    chart3 = new Chart(document.getElementById('chart3'), {
        type: 'bar',
        data: {
            labels: ['1月', '2月', '3月', '4月', '5月', '6月'],
            datasets: [{ label: '生成次数', data: [28, 35, 42, 55, 48, 62], backgroundColor: 'rgba(59, 130, 246, 0.5)' }]
        },
        options: { scales: { y: { beginAtZero: true } } }
    });
}
