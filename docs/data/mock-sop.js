// ========== mock 数据（后端接口未就绪时用于前端预览效果） ==========
// 结构严格遵循标准 SOP：{ title, summary, steps:[{step,name,type,description,risk,prompts}], warnings }

const MOCK_SOPS = {
    onboarding: {
        summary: '把新员工入职从「临时救火」变成标准流程，确保到岗当天一切就绪。',
        steps: [
            {
                step: 1,
                name: '收集入职资料',
                type: 'ai',
                description: '根据岗位与部门自动生成资料清单，并整理候选人已提交的证件与学历信息。',
                risk: '资料缺失会导致入职当天无法签署合同、无法办理门禁。',
                prompts: [
                    '请根据岗位【岗位名称】和入职日期【入职日期】生成一份入职资料清单，包含身份证、学历证、银行卡、体检报告等，并标注哪些材料可后补。'
                ]
            },
            {
                step: 2,
                name: '生成入职通知与部门同步函',
                type: 'ai',
                description: '自动生成发给新员工的通知文案，以及同步给行政、IT、直属主管的协作函。',
                risk: '文案信息与实际入职安排不一致，会造成多方误解。',
                prompts: [
                    '请以 HR 口吻写一封入职通知邮件，包含报到时间、地点、联系人、需携带材料，语气友好且信息完整。',
                    '请写一段同步给 IT 与行政的协作消息，说明需要提前准备工位、电脑、账号、门禁的具体时间点。'
                ]
            },
            {
                step: 3,
                name: '主管确认入职时间与岗位',
                type: 'confirm',
                description: '由直属主管在系统中确认入职日期、岗位名称、汇报关系，确认后才进入后续准备。',
                risk: '主管未确认就推进，可能出现岗位变更或入职时间调整，导致准备作废。',
                prompts: [
                    '请把以下入职信息整理成一段请确认的摘要：姓名、岗位、部门、直属主管、入职日期、试用期时长。'
                ]
            },
            {
                step: 4,
                name: '准备工位与设备',
                type: 'human',
                description: '行政线下完成工位清理、电脑发放、办公用品与门禁卡准备，并拍照留档。',
                risk: '设备未到位是最常见的入职事故，务必在入职前一天完成并拍照确认。',
                prompts: []
            },
            {
                step: 5,
                name: '签署劳动合同与保密协议',
                type: 'human',
                description: '现场引导新员工阅读并签署劳动合同、保密协议、员工手册确认页。',
                risk: '合同条款未解释清楚、签署页缺失，存在劳动合规风险。',
                prompts: [
                    '请列出劳动合同签署环节需要向新员工口头说明的 5 个要点（薪资结构、试用期、工时、保密义务、离职流程）。'
                ]
            },
            {
                step: 6,
                name: '开通账号与门禁权限',
                type: 'confirm',
                description: 'IT 开通邮箱、办公系统、企业微信账号，行政开通门禁；由 HR 复核权限是否正确。',
                risk: '权限开错或漏开，导致新人入职当天无法正常工作。',
                prompts: [
                    '请生成一份新员工账号开通核对清单，包含邮箱、企业微信、OA、门禁、VPN，并留出确认人签字栏。'
                ]
            },
            {
                step: 7,
                name: '入职当天引导与制度培训',
                type: 'human',
                description: '带领新人熟悉环境、介绍团队成员、讲解考勤与报销等基础制度。',
                risk: '缺少引导会让新人首日体验很差，影响留存。',
                prompts: [
                    '请生成一份 2 小时的新员工首日引导议程，包含环境熟悉、团队介绍、制度讲解、答疑四个环节。'
                ]
            },
            {
                step: 8,
                name: '首周跟进与反馈收集',
                type: 'ai',
                description: '生成首周跟进问卷，汇总新人反馈与主管评价，输出改进建议。',
                risk: '不做首周跟进，问题会被拖到试用期结束才暴露。',
                prompts: [
                    '请设计一份新员工首周反馈问卷，包含工作环境、团队协作、任务清晰度、困难与建议五个维度。'
                ]
            }
        ],
        warnings: [
            '入职前 3 天完成资料收集与设备准备，预留缓冲时间。',
            '所有线下环节需留存照片或签字记录，便于后续追溯。'
        ]
    },
    reimbursement: {
        summary: '规范费用报销流程，明确 AI 可代劳的部分与必须人工把关的环节。',
        steps: [
            {
                step: 1,
                name: '识别费用类型与报销标准',
                type: 'ai',
                description: '根据用户描述判断费用类别（差旅/办公/招待），并匹配对应报销标准与额度上限。',
                risk: '费用类型判断错误会导致按错误标准审核，产生超标或退单。',
                prompts: [
                    '请判断以下费用属于哪类报销科目，并给出对应的额度上限与所需凭证清单：【费用描述】。'
                ]
            },
            {
                step: 2,
                name: '生成报销单与凭证清单',
                type: 'ai',
                description: '自动整理发票信息，生成报销单草稿，并列出缺失的凭证。',
                risk: '发票抬头或税号错误会导致无法入账。',
                prompts: [
                    '请根据以下发票信息生成报销单明细，包含日期、金额、科目、事由，并标注缺少哪些凭证。'
                ]
            },
            {
                step: 3,
                name: '直属主管审批',
                type: 'confirm',
                description: '主管核对事由与金额是否合理，确认后流转至财务。',
                risk: '主管未核对就通过，财务退单会造成反复沟通。',
                prompts: [
                    '请把这张报销单整理成给主管的 30 字摘要，突出金额、事由与是否有超标项。'
                ]
            },
            {
                step: 4,
                name: '财务复核与打款',
                type: 'human',
                description: '财务线下核对发票真伪、入账并完成打款。',
                risk: '发票异常或重复报销存在合规风险。',
                prompts: []
            },
            {
                step: 5,
                name: '归档与费用分析',
                type: 'ai',
                description: '归档报销记录，按部门与科目汇总月度费用趋势，输出异常提示。',
                risk: '不归档会导致后续审计无法追溯。',
                prompts: [
                    '请对本月报销数据按部门与科目做汇总，并指出金额异常增长的科目。'
                ]
            }
        ],
        warnings: [
            '单笔超过 5000 元的报销必须附主管书面说明。',
            '发票抬头与税号需在提交前二次核对。'
        ]
    },
    generic: {
        summary: '把任务拆成可执行步骤，并明确每一步由谁来做。',
        steps: [
            {
                step: 1,
                name: '明确目标与交付标准',
                type: 'ai',
                description: '把用户输入整理成结构化任务描述：目标、范围、交付物、验收标准。',
                risk: '目标模糊会导致后续所有步骤返工。',
                prompts: [
                    '请把以下任务描述整理成结构化任务卡：目标、范围、交付物、验收标准、截止时间。'
                ]
            },
            {
                step: 2,
                name: '拆解执行步骤与责任人',
                type: 'ai',
                description: '按时间顺序拆解步骤，标注每一步的负责人与前置依赖。',
                risk: '步骤间依赖关系未理清，容易卡在中间环节。',
                prompts: [
                    '请把以下任务拆成 6-8 个步骤，输出步骤名称、责任人、前置依赖、预计耗时。'
                ]
            },
            {
                step: 3,
                name: '关键节点确认',
                type: 'confirm',
                description: '由任务负责人确认步骤拆解与排期，确认后才开始执行。',
                risk: '排期未经确认，执行中容易出现资源冲突。',
                prompts: [
                    '请把排期整理成一段请确认的摘要，突出关键里程碑与需要协调的资源。'
                ]
            },
            {
                step: 4,
                name: '执行与过程记录',
                type: 'human',
                description: '按计划推进线下工作，记录关键节点、遇到的问题与决策。',
                risk: '过程无记录，复盘时无法定位问题。',
                prompts: []
            },
            {
                step: 5,
                name: '验收与交付',
                type: 'human',
                description: '对照验收标准逐项检查，完成交付并取得确认。',
                risk: '验收标准未对齐，交付后可能被反复打回。',
                prompts: [
                    '请生成一份验收检查表，覆盖交付物完整性、质量、时效三项，并留出确认签字位。'
                ]
            },
            {
                step: 6,
                name: '复盘与沉淀',
                type: 'ai',
                description: '汇总执行记录，输出亮点、问题与下次可改进的点，沉淀为可复用模板。',
                risk: '不沉淀经验，下次同类任务仍从零开始。',
                prompts: [
                    '请根据以下执行记录做复盘，输出：完成情况、亮点、待改进项、下次优化建议。'
                ]
            }
        ],
        warnings: ['建议在开始执行前完成一次目标对齐确认。']
    }
};

// 根据用户任务挑一份最贴近的 mock，并把标题替换成贴近输入的标题
function getMockSOP(task, feedback) {
    const text = String(task || '').trim();
    let key = 'generic';
    if (/入职|新人|报到|到岗/.test(text)) key = 'onboarding';
    else if (/报销|发票|费用|差旅/.test(text)) key = 'reimbursement';

    const base = JSON.parse(JSON.stringify(MOCK_SOPS[key]));

    if (key === 'onboarding') base.title = '新员工入职 SOP';
    else if (key === 'reimbursement') base.title = '费用报销 SOP';
    else base.title = (/sop$/i.test(text) ? text : text + ' SOP');

    if (feedback) {
        base.warnings = [...base.warnings, `本次为模拟数据，反馈「${feedback}」将在接入后端后生效。`];
    }
    return base;
}
