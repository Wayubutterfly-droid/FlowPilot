// ========== 场景配置（数据驱动） ==========
// 新增场景只需往此数组追加一项，场景卡片、匹配逻辑、图表会自动同步
// 字段说明：
//   id        - 唯一标识
//   name      - 场景全名（用作 sopData 映射键与结果标题）
//   cardTitle - 卡片显示标题
//   cardDesc  - 卡片副标题
//   icon      - FontAwesome 图标类名
//   color     - 主题色（blue/purple/green/...），用于卡片边框与图标底色
//   keywords  - 匹配关键词数组，输入包含任一关键词即命中该场景
//   data      - SOP 数据（goal/role/time/timeline/template/messages/risks/review）
const BUILTIN_SCENARIOS = [
    {
        id: 'onboarding',
        name: '新员工入职准备',
        cardTitle: '新员工入职',
        cardDesc: '材料准备、流程安排',
        icon: 'fa-user-plus',
        color: 'blue',
        keywords: ['入职', '新人', '到岗', '报到'],
        data: {
            goal: '确保新人入职当天顺利到岗并快速融入',
            role: '人事/行政助理',
            time: '3-5天筹备',
            timeline: [
                { title: '确认入职信息', delivery: '入职确认邮件', desc: '确认入职日期、岗位、部门、汇报人' },
                { title: '准备物资设备', delivery: '物资准备清单', desc: '准备工位、电脑、账号、门禁、办公用品' },
                { title: '发送入职通知', delivery: '入职通知邮件模板', desc: '发送入职通知并同步相关部门' },
                { title: '准备入职资料', delivery: '员工手册、保密协议', desc: '准备入职资料与制度介绍内容' },
                { title: '入职当天引导', delivery: '签到表、入职流程表', desc: '入职当天完成签到、资料收集与引导' },
                { title: '入职后跟进', delivery: '新人首周反馈表', desc: '入职后一周进行跟进' }
            ],
            template: [
                { name: '姓名', type: '文本', required: '是', desc: '新员工真实姓名' },
                { name: '部门', type: '下拉选择', required: '是', desc: '所属部门' },
                { name: '岗位', type: '文本', required: '是', desc: '职位名称' },
                { name: '入职日期', type: '日期', required: '是', desc: '预计入职时间' },
                { name: '工位准备', type: '下拉选择', required: '是', desc: '工位是否准备好' },
                { name: '设备准备', type: '下拉选择', required: '是', desc: '电脑设备是否到位' }
            ],
            messages: [
                { title: '【入职通知】', content: '各位好，XX将于X月X日入职XX部门，烦请相关同事协助提前准备工位、设备及账号，谢谢。' }
            ],
            risks: ['账号未提前开通', '工位或设备未到位', '入职资料缺失', '汇报人未同步'],
            review: '入职流程是否顺畅、新人反馈、设备账号是否齐全'
        }
    },
    {
        id: 'recruitment',
        name: '基础岗位招聘',
        cardTitle: '基础岗位招聘',
        cardDesc: '业务对接、邀约面试',
        icon: 'fa-user-plus',
        color: 'sky',
        keywords: ['招聘', '招人', '招工', '简历筛选', '面试邀约', '普工', '技术工', '基础岗位', '业务助理', '行政文员', '招募'],
        data: {
            goal: '快速完成基础岗位（普工/技术工/业务助理/行政文员等）的招聘全流程，减少需求不清、简历水分和 Offer 被鸽的风险',
            role: '招聘助理 / 人事行政助理',
            time: '10-14 天全流程',
            timeline: [
                { title: '业务需求对接与确认', delivery: '《岗位需求确认表》', desc: '与业务部门对齐岗位名称、核心职责、硬性/软性要求、薪资区间、到岗时间、紧急程度。关键提示：不同薪资区间对应不同人群，提前摸清楚才能定准薪资' },
                { title: '需求复核与 JD 生成', delivery: '岗位 JD（普工版/技术工版）', desc: '结合所在城市市场行情和招聘进度，动态调整招聘要求（如在职年限、经验匹配度）。提炼招聘核心关键词，撰写区分普工/技术工的 JD 文案' },
                { title: '招聘平台发布', delivery: '发布渠道记录', desc: '在 BOSS 直聘、58、智联、当地招工群等渠道发布岗位，记录每条渠道的发布日期与当前状态' },
                { title: '简历筛选', delivery: '初筛通过名单、《简历筛选表》', desc: '基础岗位看基本条件（年龄/学历/在职状态），技术岗位对照关键词库精准匹配项目经验。重点看简历提及的关键词及经验体现，不同薪资区间对应不同候选人画像' },
                { title: '面试邀约与安排', delivery: '面试安排表', desc: '打招呼索要最新简历、了解候选人核心诉求；发送面试位置与时间；提前与面试官沟通可约时段；打印简历备用' },
                { title: '初面评估与跟进', delivery: '初面评估表、Offer 发送记录', desc: '① 经验初步验真（描述工作内容看人是否做过）；② 帮候选人算薪资，看长期发展空间；③ 对齐规划，考察思维逻辑性与谈吐；④ 送别时观察表情和反馈；⑤ 通过后立即发信息确认入职时间，切忌"问一嘴"不了了之；⑥ 发送入职通知书并告知入职材料清单' },
                { title: '入职办理与资料收集', delivery: '入职材料清单、员工档案', desc: '准备办公用品、资料填写表；引导入职并让其阅读员工手册；打印银行卡/身份证双面复印件，要求员工写上"仅作发放工资使用"并签名、日期、按手印' }
            ],
            template: [
                { name: '岗位名称', type: '文本', required: '是', desc: '具体职位名称，如"行政文员""数控操作工""销售业务助理"' },
                { name: '招聘类型', type: '下拉选择', required: '是', desc: '基础岗位 / 技术岗位' },
                { name: '核心职责', type: '多行文本', required: '是', desc: '岗位最核心的产出，建议 3-5 条' },
                { name: '硬性要求', type: '多行文本', required: '是', desc: '年龄/学历/经验/技能等必须满足的条件' },
                { name: '软性要求', type: '多行文本', required: '否', desc: '沟通能力/学习能力/团队配合等加分项' },
                { name: '薪资区间', type: '文本', required: '是', desc: '如 4500-6000 元/月，注意不同薪资对应不同人群' },
                { name: '对标人物画像', type: '多行文本', required: '是', desc: '期望候选人的典型特征，如"25-35 岁、有 2 年操作经验、稳定性好"' },
                { name: '紧急程度', type: '下拉选择', required: '是', desc: '非常紧急 / 一般紧急 / 常规招聘' },
                { name: '招聘渠道', type: '多选', required: '是', desc: 'BOSS 直聘 / 58 / 智联 / 招工群 / 内部推荐' },
                { name: '简历筛选关键词', type: '多选', required: '是', desc: '从 JD 中提炼，用于匹配候选人简历' }
            ],
            messages: [
                { title: '【业务沟通话术】微信/钉钉版', content: 'XX 经理您好～为了尽快帮您招到合适的人，我这边想跟您对齐几个核心问题，大概 5 分钟哈：\n\n1. 这个岗位最核心的产出是什么？也就是招进来主要帮您解决什么问题？\n2. 您期望的人物画像是什么样的？比如年龄、经验、技能、性格这些？\n3. 薪资区间的上限和底线大概是多少？不同薪资对应不同人群，这个定准了我们才能精准筛选\n4. 到岗时间大概希望什么时候？紧急程度我好配合\n5. 还有没有其他硬性要求？比如证件、倒班、加班这些？\n\n您先把能确定的告诉我，不确定的我们可以后面再对齐～' },
                { title: '【基础岗候选人打招呼话术】', content: '您好，看到您的简历很符合我们【岗位名称】的要求，薪资【XX-XX 元】，【包吃住/提供住宿/有餐补】，工作地点在【XX】，请问您近期考虑换工作吗？' },
                { title: '【技术岗候选人打招呼话术】', content: '您好，我是【公司名称】的 HR，看到您做过【某具体项目/技能】，与我们目前招聘的【岗位名称】（核心关键词：【关键词 1】【关键词 2】）非常匹配。请问您方便发一份最新简历，我们详细沟通一下吗？' },
                { title: '【面试邀约 & 入职通知书模板】', content: '▸ 面试邀约：\n您好 XX，您的简历已通过初筛，邀请您于 X 月 X 日 X 时到 XX 地址参加面试，请携带身份证原件。面试官是 XX，预计面试时长约 30 分钟。请准时参加，如有变动请提前告知。\n\n▸ 入职通知书：\nXX 您好，恭喜您通过面试！请于 X 月 X 日 X 时携带以下材料到 XX 地址办理入职：① 身份证原件及复印件 ② 银行卡复印件 ③ 学历证复印件。届时会有同事引导您完成入职手续，期待您的加入！' }
            ],
            risks: ['业务部门需求不明确导致反复招人', '技术岗位简历水分大、经验验真不足', '初面未明确入职时间导致 Offer 被鸽', '入职材料未注明"仅作发放工资使用"存在法律合规风险'],
            review: '统计各渠道简历初筛通过率与面试到场率；记录不同薪资区间对应人群特征，优化关键词筛选库；定期与业务部门复盘人物画像精准度，调整招聘策略；整理入职材料模板，提升新人入职体验'
        }
    },
    {
        id: 'training',
        name: '培训活动组织',
        cardTitle: '培训活动',
        cardDesc: '课程设计、场地安排',
        icon: 'fa-chalkboard-teacher',
        color: 'purple',
        keywords: ['培训', '课程', '讲座', '训练营'],
        data: {
            goal: '完成一场有反馈、有沉淀的内部培训',
            role: '培训助理/行政',
            time: '7-10天筹备',
            timeline: [
                { title: '明确培训需求', delivery: '培训需求确认单', desc: '明确培训目标、主题、对象' },
                { title: '确认资源安排', delivery: '场地预约单、物料清单', desc: '确认时间、场地、讲师与物料' },
                { title: '发布培训通知', delivery: '培训通知、报名统计表', desc: '发送培训通知并收集报名信息' },
                { title: '现场执行', delivery: '签到表、现场照片', desc: '现场签到与过程支持' },
                { title: '收集反馈', delivery: '培训反馈表', desc: '收集反馈并整理复盘' },
                { title: '输出总结', delivery: '培训总结报告', desc: '输出培训记录与改进建议' }
            ],
            template: [
                { name: '培训主题', type: '文本', required: '是', desc: '培训课程名称' },
                { name: '对象', type: '文本', required: '是', desc: '参训人员范围' },
                { name: '讲师', type: '文本', required: '是', desc: '培训讲师姓名' },
                { name: '时间', type: '日期时间', required: '是', desc: '培训开始时间' },
                { name: '场地', type: '文本', required: '是', desc: '培训场所' },
                { name: '参训人数', type: '数字', required: '是', desc: '预计参训人数' }
            ],
            messages: [
                { title: '【培训通知】', content: '各位同事，定于X月X日开展《XXX》培训，请准时参加。谢谢！' }
            ],
            risks: ['场地冲突', '讲师临时变动', '设备故障', '报名率低'],
            review: '培训目标达成度、学员反馈、讲师与场地问题'
        }
    },
    {
        id: 'care',
        name: '员工关怀活动',
        cardTitle: '员工关怀',
        cardDesc: '名单预算、物料通知',
        icon: 'fa-heart',
        color: 'red',
        keywords: ['员工关怀', '关怀活动', '生日会', '团建', '慰问', '员工福利', '茶话会'],
        data: {
            goal: '增强员工参与感，营造关怀氛围，促进团队交流，提升组织凝聚力',
            role: '人事/行政专员',
            time: '5-7天筹备',
            timeline: [
                { title: '明确活动目标与关怀对象', delivery: '活动目标与对象说明', desc: '明确本次关怀活动的目标，确定关怀对象范围' },
                { title: '确定活动形式与时间安排', delivery: '活动方案', desc: '确定活动形式，并敲定具体时间安排' },
                { title: '统计参与人数并确认名单', delivery: '参与名单', desc: '统计参与人数，确认最终参与名单' },
                { title: '准备活动物料与现场布置', delivery: '物料清单、现场布置', desc: '准备活动物料，完成现场布置' },
                { title: '发布内部通知并提醒参与', delivery: '内部通知', desc: '发布活动内部通知，并提醒相关员工参与' },
                { title: '组织现场签到、互动与拍照记录', delivery: '签到表、现场照片', desc: '组织现场签到，开展互动环节并拍照记录' },
                { title: '收集员工反馈，整理活动复盘', delivery: '反馈记录、活动复盘', desc: '收集员工反馈，整理形成活动复盘' }
            ],
            template: [
                { name: '活动名称', type: '文本', required: '是', desc: '活动名称' },
                { name: '活动主题', type: '文本', required: '是', desc: '活动主题' },
                { name: '活动时间', type: '日期时间', required: '是', desc: '活动时间' },
                { name: '活动地点', type: '文本', required: '是', desc: '活动地点' },
                { name: '参与对象', type: '文本', required: '是', desc: '参与对象范围' },
                { name: '参与人数', type: '数字', required: '是', desc: '参与人数' },
                { name: '预算金额', type: '货币', required: '是', desc: '活动预算金额' },
                { name: '负责人', type: '文本', required: '是', desc: '活动负责人' },
                { name: '物料清单', type: '多行文本', required: '是', desc: '所需物料明细清单' },
                { name: '备注事项', type: '多行文本', required: '否', desc: '其他需说明的事项' }
            ],
            messages: [
                { title: '【员工关怀活动通知】', content: '各位同事：为增进团队交流、营造轻松愉快的工作氛围，公司将于近期组织员工关怀活动，欢迎大家积极参与。活动具体时间、地点及安排将另行通知，请大家留意后续消息。期待与大家一起度过轻松愉快的时光！' }
            ],
            risks: ['时间安排与工作冲突', '参与率不足', '物料准备不充分', '现场秩序与流程混乱'],
            review: '收集员工对活动形式的反馈；统计参与率与满意度；记录活动中出现的问题；优化下次活动主题与流程'
        }
    },
    {
        id: 'procurement',
        name: '行政采购申请',
        cardTitle: '行政采购',
        cardDesc: '需求确认、比价验收',
        icon: 'fa-shopping-cart',
        color: 'green',
        keywords: ['采购', '买', '物资', '申购'],
        data: {
            goal: '按预算、按时、按质完成物资采购',
            role: '行政助理',
            time: '5-15天',
            timeline: [
                { title: '确认采购需求', delivery: '采购需求单', desc: '确认采购需求与用途' },
                { title: '明确预算', delivery: '预算审批单', desc: '明确预算范围与交付时间' },
                { title: '收集供应商信息', delivery: '比价表', desc: '收集供应商信息并比价' },
                { title: '提交采购申请', delivery: '采购申请单', desc: '提交采购申请' },
                { title: '跟进订单', delivery: '订单跟踪表', desc: '跟进审批、下单与到货' },
                { title: '验收入库', delivery: '验收单、入库单', desc: '到货验收并记录' }
            ],
            template: [
                { name: '物品名称', type: '文本', required: '是', desc: '采购物品名称' },
                { name: '规格', type: '文本', required: '是', desc: '物品规格型号' },
                { name: '数量', type: '数字', required: '是', desc: '采购数量' },
                { name: '用途', type: '多行文本', required: '是', desc: '采购原因和用途' },
                { name: '预算', type: '货币', required: '是', desc: '预算金额' },
                { name: '供应商', type: '文本', required: '是', desc: '供应商名称' }
            ],
            messages: [
                { title: '【询价函】', content: '您好，我司需采购XXX，规格如下：XXX。烦请报价，谢谢！' }
            ],
            risks: ['预算超支', '交期延误', '质量不达标', '发票问题'],
            review: '预算执行率、供应商表现、到货质量与时效'
        }
    },
    {
        id: 'meeting',
        name: '会议组织',
        cardTitle: '会议组织',
        cardDesc: '议题准备、纪要跟进',
        icon: 'fa-users',
        color: 'indigo',
        keywords: ['会议', '开会', '例会', '研讨', '评审'],
        data: {
            goal: '确保会议高效、有结论、有跟进',
            role: '会议组织者/行政',
            time: '1-3天筹备',
            timeline: [
                { title: '明确会议议题', delivery: '议题清单', desc: '确认会议目标、议题与决策事项' },
                { title: '预约场地与资源', delivery: '场地预约单', desc: '预约会议室、设备、视频会议链接' },
                { title: '发送会议通知', delivery: '会议通知', desc: '发送通知并确认参会人' },
                { title: '会议主持与记录', delivery: '会议纪要', desc: '主持议程、记录决议与行动项' },
                { title: '分发纪要', delivery: '纪要邮件', desc: '会后 24h 内分发纪要' },
                { title: '跟进决议', delivery: '行动项跟踪表', desc: '跟踪决议执行情况' }
            ],
            template: [
                { name: '会议主题', type: '文本', required: '是', desc: '会议名称' },
                { name: '时间', type: '日期时间', required: '是', desc: '会议开始时间' },
                { name: '地点', type: '文本', required: '是', desc: '会议室/线上链接' },
                { name: '参会人', type: '多行文本', required: '是', desc: '参会人员名单' },
                { name: '议题', type: '多行文本', required: '是', desc: '讨论议题' },
                { name: '主持人', type: '文本', required: '是', desc: '会议主持人' }
            ],
            messages: [
                { title: '【会议通知】', content: '各位好，定于X月X日召开《XXX》会议，请准时参加，议程如下：XXX。' }
            ],
            risks: ['议题不清晰', '关键参会人缺席', '会议超时', '决议无人跟进'],
            review: '会议效率、决议完成率、参会人反馈'
        }
    },
    {
        id: 'travel',
        name: '差旅申请',
        cardTitle: '差旅申请',
        cardDesc: '申请审批、报销归档',
        icon: 'fa-plane',
        color: 'teal',
        keywords: ['差旅', '出差', '报销', '旅行', '差旅申请'],
        data: {
            goal: '合规、高效完成差旅申请与费用报销',
            role: '申请人/行政',
            time: '3-7天',
            timeline: [
                { title: '提交差旅申请', delivery: '差旅申请单', desc: '填写事由、目的地、时间、预算' },
                { title: '审批', delivery: '审批记录', desc: '按流程完成审批' },
                { title: '预订机酒', delivery: '预订确认单', desc: '预订机票、酒店、接送' },
                { title: '出差执行', delivery: '行程记录', desc: '按计划出差并保留票据' },
                { title: '费用报销', delivery: '报销单', desc: '整理票据提交报销' },
                { title: '归档', delivery: '归档记录', desc: '报销完成后归档' }
            ],
            template: [
                { name: '出差事由', type: '文本', required: '是', desc: '出差原因' },
                { name: '目的地', type: '文本', required: '是', desc: '出差城市' },
                { name: '起止日期', type: '日期', required: '是', desc: '出差时间范围' },
                { name: '交通方式', type: '下拉选择', required: '是', desc: '飞机/高铁/其他' },
                { name: '预算', type: '货币', required: '是', desc: '差旅预算' },
                { name: '同行人', type: '文本', required: '否', desc: '同行人员' }
            ],
            messages: [
                { title: '【差旅申请】', content: '您好，本人因XXX需出差至XX，时间X月X日-X月X日，预算XXX元，请审批。' }
            ],
            risks: ['审批延误', '预订超预算', '票据缺失', '行程变更'],
            review: '预算执行率、审批时效、报销合规性'
        }
    },
    {
        id: 'project',
        name: '项目启动',
        cardTitle: '项目启动',
        cardDesc: '目标对齐、分工明确',
        icon: 'fa-rocket',
        color: 'orange',
        keywords: ['项目', '启动', '立项', 'kickoff', '项目启动'],
        data: {
            goal: '明确项目目标、范围与分工，确保项目顺利启动',
            role: '项目经理',
            time: '5-10天',
            timeline: [
                { title: '明确项目目标', delivery: '项目章程', desc: '确认项目目标、范围与成功标准' },
                { title: '组建项目团队', delivery: '团队名单', desc: '明确成员、角色与职责' },
                { title: '制定项目计划', delivery: '项目计划', desc: '拆解任务、排期、里程碑' },
                { title: '配置资源', delivery: '资源清单', desc: '确认预算、工具、环境' },
                { title: '召开 Kickoff', delivery: 'kickoff 纪要', desc: '对齐目标、分工、节奏' },
                { title: '风险评估', delivery: '风险登记册', desc: '识别风险并制定应对' }
            ],
            template: [
                { name: '项目名称', type: '文本', required: '是', desc: '项目名称' },
                { name: '负责人', type: '文本', required: '是', desc: '项目经理' },
                { name: '项目目标', type: '多行文本', required: '是', desc: '项目目标' },
                { name: '起止时间', type: '日期', required: '是', desc: '项目周期' },
                { name: '预算', type: '货币', required: '是', desc: '项目预算' },
                { name: '里程碑', type: '多行文本', required: '否', desc: '关键里程碑' }
            ],
            messages: [
                { title: '【项目启动通知】', content: '各位好，《XXX》项目正式启动，目标XXX，团队分工如下，请大家按计划推进。' }
            ],
            risks: ['目标不清', '资源不足', '范围蔓延', '角色冲突'],
            review: '目标达成度、团队协作、风险应对效果'
        }
    },
    {
        id: 'performance',
        name: '绩效面谈',
        cardTitle: '绩效面谈',
        cardDesc: '客观评估、明确改进',
        icon: 'fa-comments',
        color: 'pink',
        keywords: ['绩效', '面谈', '考核', 'review', '绩效面谈'],
        data: {
            goal: '客观评估员工绩效，明确改进方向',
            role: '直属主管/HR',
            time: '1-2周',
            timeline: [
                { title: '收集评估资料', delivery: '绩效数据', desc: '收集 KPI、项目、反馈等资料' },
                { title: '预约面谈', delivery: '面谈通知', desc: '预约时间与地点' },
                { title: '面谈沟通', delivery: '面谈记录', desc: '沟通评价、亮点、待改进' },
                { title: '确认评估结果', delivery: '评估表', desc: '双方确认评级与评价' },
                { title: '制定改进计划', delivery: 'PIP/改进计划', desc: '明确改进项与时间节点' },
                { title: '跟进落实', delivery: '跟进记录', desc: '定期跟进改进情况' }
            ],
            template: [
                { name: '员工姓名', type: '文本', required: '是', desc: '被评估人' },
                { name: '岗位', type: '文本', required: '是', desc: '员工岗位' },
                { name: '考核周期', type: '文本', required: '是', desc: '考核时间段' },
                { name: '评级', type: '下拉选择', required: '是', desc: 'S/A/B/C/D' },
                { name: '面谈人', type: '文本', required: '是', desc: '直属主管' },
                { name: '改进项', type: '多行文本', required: '否', desc: '待改进事项' }
            ],
            messages: [
                { title: '【绩效面谈通知】', content: '你好，定于X月X日进行绩效面谈，请提前准备本周期工作回顾。' }
            ],
            risks: ['评价主观', '员工抵触', '改进计划空泛', '记录不全'],
            review: '面谈质量、员工接受度、改进落实情况'
        }
    }
];

// 颜色 -> 十六进制映射，供图表按场景主题色取色
const COLOR_MAP = {
    blue: '#3b82f6', purple: '#9333ea', green: '#22c55e',
    red: '#ef4444', yellow: '#f59e0b', indigo: '#6366f1',
    pink: '#ec4899', teal: '#14b8a6', orange: '#f97316', gray: '#9ca3af',
    sky: '#0ea5e9'
};

// 远程场景配置地址（设为 null 则不请求远程，仅使用内置 + 本地自定义）
// 实际项目中可指向后端接口，如 '/api/scenarios'
const REMOTE_SCENARIOS_URL = null;
