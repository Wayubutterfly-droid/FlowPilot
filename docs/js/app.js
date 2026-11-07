// ========== 生成 SOP ==========
function setGenerateLoading(loading) {
    const btn = document.getElementById('generateBtn');
    btn.disabled = loading;
    document.getElementById('btnText').innerHTML = loading
        ? '<i class="fas fa-spinner loading-spin mr-2"></i>AI 生成中...'
        : '<i class="fas fa-magic mr-2"></i>生成SOP';
}

// 点击「生成 SOP」：请求后端 /api/generate（后端未就绪时走 mock）
async function generateSOP() {
    const taskInput = document.getElementById('taskInput').value.trim();
    if (!taskInput) { alert('请输入任务描述或选择一个场景'); return; }
    currentTaskName = taskInput;

    setGenerateLoading(true);
    try {
        currentData = await requestGenerateSOP(taskInput);
        renderCurrentSOP(currentData.title || taskInput);
        if (LAST_SOP_SOURCE === 'mock') {
            showToast('当前为 mock 数据（后端 /api/generate 未就绪）');
        } else if (LAST_SOP_SOURCE === 'ai') {
            showToast('AI 已生成 SOP');
        } else {
            showToast('SOP 已生成');
        }
    } catch (err) {
        console.error('生成失败：', err);
        alert('生成失败：' + err.message);
    } finally {
        setGenerateLoading(false);
    }
}

// ========== 修正反馈 ==========
// 把用户反馈作为附加参数重新请求，生成新版本
async function submitFeedback() {
    const fb = document.getElementById('feedbackInput').value.trim();
    if (!fb || !currentData) { alert('请输入反馈内容'); return; }

    document.getElementById('feedbackLoading').classList.remove('hidden');
    document.getElementById('feedbackBtn').disabled = true;
    document.getElementById('feedbackBtnText').innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>优化中...';

    try {
        const next = await requestGenerateSOP(currentTaskName, fb);
        currentData = next;
        addIterationRecord('优化：' + fb);
        renderCurrentSOP(next.title || currentTaskName, false);
        document.getElementById('feedbackInput').value = '';
        showToast('已按反馈重新生成');
    } catch (err) {
        console.error('重新生成失败：', err);
        alert('重新生成失败：' + err.message);
    } finally {
        document.getElementById('feedbackLoading').classList.add('hidden');
        document.getElementById('feedbackBtn').disabled = false;
        document.getElementById('feedbackBtnText').innerHTML = '<i class="fas fa-sync-alt mr-2"></i>重新生成（基于反馈优化）';
    }
}

// ========== 页面初始化 ==========
(async function init() {
    await initScenarios();
    renderScenarioCards();
    refreshCharts();
    updateAIStatus();
})();
