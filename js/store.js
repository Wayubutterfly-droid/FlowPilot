// ========== 全局状态 ==========
// 所有跨模块共享的可变状态集中在此，便于后续接入状态管理

let CUSTOM_SCENARIOS = [];   // 用户在页面上创建的场景，持久化到 localStorage
let REMOTE_SCENARIOS = [];   // 从远程 JSON 拉取的场景
let SCENARIOS = [];          // 最终合并后的场景列表（内置 + 远程 + 自定义）

// 由 SCENARIOS 派生 name -> data 的映射，供匹配与渲染逻辑使用
let sopData = {};

// 当前正在查看/执行的 SOP 数据（标准结构：{ title, summary, steps[], warnings[] }）
let currentData = null;
let currentTaskName = '';

// 迭代记录
let iterationHistory = [];

// 存储每一步的状态: 'pending' | 'in-progress' | 'completed'
let stepStates = [];

// 图表实例（供 refreshCharts 复用 / 销毁重建）
let chart1, chart2, chart3;
