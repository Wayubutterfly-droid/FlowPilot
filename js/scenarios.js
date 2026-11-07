// ========== 数据层：内置 + localStorage 自定义 + 可选远程 JSON ==========

function rebuildSopData() {
    sopData = {};
    SCENARIOS.forEach(s => { sopData[s.name] = s.data; });
}

// 从 localStorage 加载自定义场景
function loadCustomScenarios() {
    try {
        const saved = localStorage.getItem('customScenarios');
        CUSTOM_SCENARIOS = saved ? JSON.parse(saved) : [];
    } catch (e) {
        console.warn('读取本地自定义场景失败：', e);
        CUSTOM_SCENARIOS = [];
    }
}

// 保存自定义场景到 localStorage
function saveCustomScenarios() {
    try {
        localStorage.setItem('customScenarios', JSON.stringify(CUSTOM_SCENARIOS));
    } catch (e) {
        console.warn('保存自定义场景失败：', e);
    }
}

// 合并三层数据源：内置 + 远程 + 自定义
function mergeScenarios() {
    SCENARIOS = [...BUILTIN_SCENARIOS, ...REMOTE_SCENARIOS, ...CUSTOM_SCENARIOS];
    rebuildSopData();
}

// 尝试从远程拉取场景配置；失败则静默使用本地数据
async function fetchRemoteScenarios() {
    if (!REMOTE_SCENARIOS_URL) { REMOTE_SCENARIOS = []; return; }
    try {
        const res = await fetch(REMOTE_SCENARIOS_URL);
        if (!res.ok) throw new Error('HTTP ' + res.status);
        const list = await res.json();
        REMOTE_SCENARIOS = Array.isArray(list) ? list : [];
    } catch (e) {
        console.warn('拉取远程场景失败，使用本地数据：', e);
        REMOTE_SCENARIOS = [];
    }
}

// 初始化数据层：加载本地 → 拉取远程 → 合并
async function initScenarios() {
    loadCustomScenarios();
    await fetchRemoteScenarios();
    mergeScenarios();
}

// 新增自定义场景（保存到 localStorage 并刷新）
function addCustomScenario(scenario) {
    // 生成唯一 id
    scenario.id = scenario.id || ('custom_' + Date.now());
    scenario.isCustom = true;
    CUSTOM_SCENARIOS.push(scenario);
    saveCustomScenarios();
    mergeScenarios();
    refreshScenarioUI();
}

// 删除自定义场景
function deleteCustomScenario(id) {
    const idx = CUSTOM_SCENARIOS.findIndex(s => s.id === id);
    if (idx === -1) return;
    if (!confirm('确定要删除该自定义场景吗？')) return;
    CUSTOM_SCENARIOS.splice(idx, 1);
    saveCustomScenarios();
    mergeScenarios();
    refreshScenarioUI();
}

// 刷新场景相关 UI（卡片 + 图表）
function refreshScenarioUI() {
    renderScenarioCards();
    if (typeof refreshCharts === 'function') refreshCharts();
}

// 场景匹配：遍历 SCENARIOS 的 keywords，命中任一关键词即记录；多个场景同时命中时取关键词最长（最具体）的那个；未命中返回 null
function matchScenario(input) {
    const text = input.trim();
    if (!text) return null;
    let bestName = null;
    let bestLen = 0;
    for (const s of SCENARIOS) {
        for (const kw of (s.keywords || [])) {
            if (text.includes(kw) && kw.length > bestLen) {
                bestName = s.name;
                bestLen = kw.length;
            }
        }
    }
    return bestName;
}

