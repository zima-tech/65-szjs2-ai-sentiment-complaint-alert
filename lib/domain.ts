import type { AnalysisView, ConsoleRoute, DashboardSnapshot, RouteMetric, WorkspaceView } from "@/lib/types";

export const appMeta = {
  "seq": "65",
  "title": "AI舆情分析与投诉预警",
  "department": "市政建设第二指挥部",
  "shortName": "舆情预警中枢",
  "description": "实时抓取清江路或文二西路周边社区论坛、社交媒体及政府投诉平台关于项目的信息，利用自然语言处理技术进行情感分析和舆情分类。当出现'夜间施工'、'扬尘投诉'等负面舆情苗头时，系统自动预警并建议采取相应措施。",
  "modules": [
    "舆情分析首页",
    "舆情监控",
    "情感分析",
    "预警管理",
    "用户管理",
    "日志审计",
    "系统设置"
  ],
  "statuses": [
    "待处理",
    "处理中",
    "已解决",
    "已归档"
  ],
  "aiTitle": "智能舆情分析与预警辅助",
  "aiPrompt": "请基于舆情内容生成分类、预警等级和应对建议。",
  "alertLevels": ["红", "橙", "黄"],
  "sentiments": ["正面", "中性", "负面"],
  "categories": ["表扬/感谢", "询问/建议", "夜间施工投诉", "扬尘投诉", "噪音投诉", "交通影响投诉"],
  "sourceTypes": ["社区论坛", "社交媒体", "政府投诉平台", "新闻媒体"],
  "integrations": [
    "社区论坛数据源",
    "社交媒体监控",
    "政府投诉平台",
    "新闻媒体采集"
  ],
  "sourceObjectName": "舆情记录",
  "dataSourceTitle": "舆情数据来源",
  "aiExperience": {
    "panelTag": "舆情分析 / 情感判断 / 预警生成",
    "objectLabel": "当前舆情记录",
    "emptyTitle": "请选择舆情记录后发起智能分析",
    "emptyDescription": "系统会结合来源、内容和情感得分，输出分类建议、预警等级和应对措施。",
    "resultType": "分类与预警方案",
    "savedStatusLabel": "已采纳",
    "saveActionLabel": "采纳分析结果",
    "saveEventAction": "采纳智能分析结果",
    "generateEventAction": "生成舆情分析",
    "savedSuccessText": "舆情分类、预警等级和应对措施已同步。",
    "stepTitles": [
      "读取舆情内容与来源信息",
      "判断情感倾向与预警等级",
      "形成应对建议与责任推送",
      "等待采纳并写入处置留痕"
    ],
    "focusAreas": [
      "舆情分类",
      "情感判断",
      "预警等级",
      "应对措施"
    ],
    "quickPrompts": [
      "请判断该舆情的情感倾向、分类和预警等级。",
      "请给出应对建议，列出三项需要立即处理的动作。",
      "请生成预警通知，明确责任部门和处置时限。"
    ],
    "resultFields": [
      { "label": "情感倾向", "source": "sentiment" },
      { "label": "预警等级", "source": "alertLevel" },
      { "label": "应对建议", "source": "suggestion" }
    ]
  },
  "prd": "65_市政建设第二指挥部_AI舆情分析与投诉预警_PRD.md"
} as const;

export const seedRecords = [
  {
    "code": "YX-2026-001",
    "source": "清江社区论坛",
    "sourceUrl": "https://qj.forum.example.com/post/1234",
    "content": "清江路施工现场扬尘太大，影响居民生活，希望施工方加强降尘措施。",
    "sentiment": "负面",
    "sentimentScore": -0.72,
    "category": "扬尘投诉",
    "keywords": "扬尘,施工,降尘",
    "projectName": "清江路工程",
    "alertLevel": "橙",
    "suggestion": "加强洒水降尘频率，调整作业时间避免大风天气施工",
    "status": "待处理",
    "handler": "环保专员",
    "handlerDept": "施工现场管理部",
    "dueDateOffsetDays": 1
  },
  {
    "code": "YX-2026-002",
    "source": "文二西路业主群",
    "sourceUrl": "https://weq.group.example.com/thread/5678",
    "content": "晚上十点还在施工，噪音严重影响孩子休息，投诉多次无效。",
    "sentiment": "负面",
    "sentimentScore": -0.88,
    "category": "夜间施工投诉",
    "keywords": "夜间施工,噪音,影响休息",
    "projectName": "文二西路工程",
    "alertLevel": "红",
    "suggestion": "立即核实夜间施工审批情况，调整作业时间，加强与居民沟通",
    "status": "处理中",
    "handler": "夜班管理员",
    "handlerDept": "施工调度部",
    "dueDateOffsetDays": 0
  },
  {
    "code": "YX-2026-003",
    "source": "政府投诉热线12345",
    "sourceUrl": "https://gov.example.com/complaint/9012",
    "content": "建议在施工现场设置隔音屏障，减少对周边居民的影响。",
    "sentiment": "中性",
    "sentimentScore": 0.15,
    "category": "询问/建议",
    "keywords": "隔音屏障,建议,减少影响",
    "projectName": "清江路工程",
    "alertLevel": "黄",
    "suggestion": "研究隔音屏障可行性，纳入下次施工方案优化",
    "status": "待处理",
    "handler": "方案工程师",
    "handlerDept": "技术设计部",
    "dueDateOffsetDays": 3
  },
  {
    "code": "YX-2026-004",
    "source": "清江社区论坛",
    "sourceUrl": "https://qj.forum.example.com/post/3456",
    "content": "感谢施工方及时处理扬尘问题，现在好多了！希望能继续保持。",
    "sentiment": "正面",
    "sentimentScore": 0.92,
    "category": "表扬/感谢",
    "keywords": "感谢,表扬,及时处理",
    "projectName": "清江路工程",
    "alertLevel": null,
    "suggestion": "继续保持当前环保措施，形成优秀案例推广",
    "status": "已解决",
    "handler": "环保专员",
    "handlerDept": "施工现场管理部",
    "dueDateOffsetDays": 2
  },
  {
    "code": "YX-2026-005",
    "source": "微信公众号-城西资讯",
    "sourceUrl": "https://mp.weixin.example.com/article/7890",
    "content": "文二西路施工造成交通拥堵，上下班高峰期尤为严重，建议错峰施工。",
    "sentiment": "负面",
    "sentimentScore": -0.65,
    "category": "交通影响投诉",
    "keywords": "交通拥堵,建议,错峰施工",
    "projectName": "文二西路工程",
    "alertLevel": "橙",
    "suggestion": "协调交通管理部门，优化施工时间段，避开高峰期",
    "status": "待处理",
    "handler": "交通协调员",
    "handlerDept": "公共关系部",
    "dueDateOffsetDays": 2
  },
  {
    "code": "YX-2026-006",
    "source": "清江社区论坛",
    "sourceUrl": "https://qj.forum.example.com/post/4567",
    "content": "请问清江路工程什么时候完工？工期会不会延期？",
    "sentiment": "中性",
    "sentimentScore": 0.05,
    "category": "询问/建议",
    "keywords": "工期,完工时间,咨询",
    "projectName": "清江路工程",
    "alertLevel": null,
    "suggestion": "回复工程进度，预计完工时间及延期风险说明",
    "status": "处理中",
    "handler": "项目协调员",
    "handlerDept": "项目管理部",
    "dueDateOffsetDays": 1
  },
  {
    "code": "YX-2026-007",
    "source": "政府投诉平台",
    "sourceUrl": "https://gov.example.com/complaint/3456",
    "content": "施工车辆进出造成路面损坏，存在安全隐患，请尽快修复。",
    "sentiment": "负面",
    "sentimentScore": -0.78,
    "category": "噪音投诉",
    "keywords": "路面损坏,安全隐患,施工车辆",
    "projectName": "清江路工程",
    "alertLevel": "橙",
    "suggestion": "修复损坏路面，加强车辆管理，设置警示标志",
    "status": "待处理",
    "handler": "安全专员",
    "handlerDept": "安全管理部",
    "dueDateOffsetDays": 1
  },
  {
    "code": "YX-2026-008",
    "source": "文二西路业主群",
    "sourceUrl": "https://weq.group.example.com/thread/6789",
    "content": "工人师傅们辛苦了！希望工程能按时完工，早日方便大家出行。",
    "sentiment": "正面",
    "sentimentScore": 0.85,
    "category": "表扬/感谢",
    "keywords": "感谢,支持,辛苦",
    "projectName": "文二西路工程",
    "alertLevel": null,
    "suggestion": "传达居民问候，激励施工团队士气",
    "status": "已解决",
    "handler": "项目协调员",
    "handlerDept": "项目管理部",
    "dueDateOffsetDays": 5
  },
  {
    "code": "YX-2026-009",
    "source": "清江社区论坛",
    "sourceUrl": "https://qj.forum.example.com/post/5678",
    "content": "连续三天夜间施工，噪音让人无法入睡，严重影响身体健康。",
    "sentiment": "负面",
    "sentimentScore": -0.95,
    "category": "夜间施工投诉",
    "keywords": "夜间施工,噪音,健康影响",
    "projectName": "清江路工程",
    "alertLevel": "红",
    "suggestion": "立即暂停夜间施工，核实审批手续，与居民协商解决方案",
    "status": "待处理",
    "handler": "夜班管理员",
    "handlerDept": "施工调度部",
    "dueDateOffsetDays": 0
  },
  {
    "code": "YX-2026-010",
    "source": "新闻媒体-杭州日报",
    "sourceUrl": "https://hzrb.example.com/news/12345",
    "content": "清江路工程文明施工获市民点赞，施工现场整洁有序。",
    "sentiment": "正面",
    "sentimentScore": 0.88,
    "category": "表扬/感谢",
    "keywords": "文明施工,整洁,获赞",
    "projectName": "清江路工程",
    "alertLevel": null,
    "suggestion": "继续保持文明施工标准，形成宣传素材",
    "status": "已归档",
    "handler": "宣传专员",
    "handlerDept": "公共关系部",
    "dueDateOffsetDays": 7
  },
  {
    "code": "YX-2026-011",
    "source": "政府投诉热线12345",
    "sourceUrl": "https://gov.example.com/complaint/4567",
    "content": "施工扬尘导致晾晒衣物沾满灰尘，影响正常生活。",
    "sentiment": "负面",
    "sentimentScore": -0.68,
    "category": "扬尘投诉",
    "keywords": "扬尘,晾晒,生活影响",
    "projectName": "清江路工程",
    "alertLevel": "黄",
    "suggestion": "增加洒水频次，协调居民晾晒时间段",
    "status": "处理中",
    "handler": "环保专员",
    "handlerDept": "施工现场管理部",
    "dueDateOffsetDays": 2
  },
  {
    "code": "YX-2026-012",
    "source": "文二西路业主群",
    "sourceUrl": "https://weq.group.example.com/thread/7890",
    "content": "建议增加施工围挡透明度，让居民能实时了解工程进度。",
    "sentiment": "中性",
    "sentimentScore": 0.25,
    "category": "询问/建议",
    "keywords": "建议,围挡,工程进度",
    "projectName": "文二西路工程",
    "alertLevel": null,
    "suggestion": "评估透明围挡可行性，优化信息公示方式",
    "status": "待处理",
    "handler": "方案工程师",
    "handlerDept": "技术设计部",
    "dueDateOffsetDays": 4
  },
  {
    "code": "YX-2026-013",
    "source": "清江社区论坛",
    "sourceUrl": "https://qj.forum.example.com/post/6789",
    "content": "施工噪音超标投诉：大型机械作业噪音超过85分贝，严重扰民。",
    "sentiment": "负面",
    "sentimentScore": -0.82,
    "category": "噪音投诉",
    "keywords": "噪音超标,机械作业,扰民",
    "projectName": "清江路工程",
    "alertLevel": "红",
    "suggestion": "联系环保部门检测噪音，限制高噪音设备作业时间",
    "status": "待处理",
    "handler": "环保专员",
    "handlerDept": "施工现场管理部",
    "dueDateOffsetDays": 0
  },
  {
    "code": "YX-2026-014",
    "source": "微信公众号-城西资讯",
    "sourceUrl": "https://mp.weixin.example.com/article/8901",
    "content": "文二西路工程进展顺利，预计提前一个月完工，市民出行指日可待。",
    "sentiment": "正面",
    "sentimentScore": 0.78,
    "category": "表扬/感谢",
    "keywords": "进展顺利,提前完工,好消息",
    "projectName": "文二西路工程",
    "alertLevel": null,
    "suggestion": "继续保持施工进度，强化正面宣传",
    "status": "已归档",
    "handler": "宣传专员",
    "handlerDept": "公共关系部",
    "dueDateOffsetDays": 10
  },
  {
    "code": "YX-2026-015",
    "source": "政府投诉平台",
    "sourceUrl": "https://gov.example.com/complaint/5678",
    "content": "施工期间交通疏导不到位，早高峰造成严重拥堵，引发多起交通事故。",
    "sentiment": "负面",
    "sentimentScore": -0.85,
    "category": "交通影响投诉",
    "keywords": "交通拥堵,事故,疏导不到位",
    "projectName": "文二西路工程",
    "alertLevel": "红",
    "suggestion": "联合交通管理部门优化疏导方案，增设临时信号灯和协管人员",
    "status": "处理中",
    "handler": "交通协调员",
    "handlerDept": "公共关系部",
    "dueDateOffsetDays": 1
  },
  {
    "code": "YX-2026-016",
    "source": "清江社区论坛",
    "sourceUrl": "https://qj.forum.example.com/post/7890",
    "content": "感谢项目经理张工耐心解答工程进度问题，态度很好！",
    "sentiment": "正面",
    "sentimentScore": 0.90,
    "category": "表扬/感谢",
    "keywords": "感谢,项目经理,态度好",
    "projectName": "清江路工程",
    "alertLevel": null,
    "suggestion": "表扬项目经理，形成服务案例",
    "status": "已解决",
    "handler": "项目协调员",
    "handlerDept": "项目管理部",
    "dueDateOffsetDays": 3
  },
  {
    "code": "YX-2026-017",
    "source": "文二西路业主群",
    "sourceUrl": "https://weq.group.example.com/thread/8901",
    "content": "凌晨三点还在施工，严重影响睡眠，第二天无法正常工作。",
    "sentiment": "负面",
    "sentimentScore": -0.92,
    "category": "夜间施工投诉",
    "keywords": "凌晨施工,噪音,影响工作",
    "projectName": "文二西路工程",
    "alertLevel": "红",
    "suggestion": "严格禁止凌晨施工，核实是否有夜间施工许可，加强监管",
    "status": "待处理",
    "handler": "夜班管理员",
    "handlerDept": "施工调度部",
    "dueDateOffsetDays": 0
  },
  {
    "code": "YX-2026-018",
    "source": "政府投诉热线12345",
    "sourceUrl": "https://gov.example.com/complaint/6789",
    "content": "咨询：清江路工程是否会影响周边学校上下学接送？",
    "sentiment": "中性",
    "sentimentScore": 0.08,
    "category": "询问/建议",
    "keywords": "咨询,学校,上下学",
    "projectName": "清江路工程",
    "alertLevel": null,
    "suggestion": "提供交通疏导方案，协调学校错峰接送时间",
    "status": "已解决",
    "handler": "交通协调员",
    "handlerDept": "公共关系部",
    "dueDateOffsetDays": 2
  },
  {
    "code": "YX-2026-019",
    "source": "清江社区论坛",
    "sourceUrl": "https://qj.forum.example.com/post/8901",
    "content": "施工方扬尘处理措施到位，每天定时洒水，灰尘明显减少，支持工程！",
    "sentiment": "正面",
    "sentimentScore": 0.86,
    "category": "表扬/感谢",
    "keywords": "表扬,扬尘处理,支持",
    "projectName": "清江路工程",
    "alertLevel": null,
    "suggestion": "继续保持环保措施，形成标杆案例",
    "status": "已归档",
    "handler": "环保专员",
    "handlerDept": "施工现场管理部",
    "dueDateOffsetDays": 5
  },
  {
    "code": "YX-2026-020",
    "source": "新闻媒体-钱江晚报",
    "sourceUrl": "https://qjwb.example.com/news/23456",
    "content": "文二西路施工噪音投诉激增，相关部门介入调查。",
    "sentiment": "负面",
    "sentimentScore": -0.75,
    "category": "噪音投诉",
    "keywords": "噪音投诉,媒体,调查",
    "projectName": "文二西路工程",
    "alertLevel": "橙",
    "suggestion": "主动联系媒体说明情况，积极整改并及时反馈",
    "status": "处理中",
    "handler": "公共关系专员",
    "handlerDept": "公共关系部",
    "dueDateOffsetDays": 1
  },
  {
    "code": "YX-2026-021",
    "source": "政府投诉平台",
    "sourceUrl": "https://gov.example.com/complaint/7890",
    "content": "施工围挡占用人行道，行人只能走机动车道，存在安全隐患。",
    "sentiment": "负面",
    "sentimentScore": -0.72,
    "category": "交通影响投诉",
    "keywords": "围挡,人行道,安全隐患",
    "projectName": "清江路工程",
    "alertLevel": "橙",
    "suggestion": "调整围挡位置，保留人行道宽度，设置引导标志",
    "status": "待处理",
    "handler": "安全专员",
    "handlerDept": "安全管理部",
    "dueDateOffsetDays": 1
  },
  {
    "code": "YX-2026-022",
    "source": "文二西路业主群",
    "sourceUrl": "https://weq.group.example.com/thread/9012",
    "content": "建议在施工现场设置居民接待日，定期听取居民意见。",
    "sentiment": "中性",
    "sentimentScore": 0.35,
    "category": "询问/建议",
    "keywords": "建议,居民接待日,听取意见",
    "projectName": "文二西路工程",
    "alertLevel": null,
    "suggestion": "研究设立居民接待日可行性，纳入社区沟通机制",
    "status": "待处理",
    "handler": "社区协调员",
    "handlerDept": "公共关系部",
    "dueDateOffsetDays": 5
  },
  {
    "code": "YX-2026-023",
    "source": "清江社区论坛",
    "sourceUrl": "https://qj.forum.example.com/post/9012",
    "content": "夜间施工终于停了，这几天终于能睡个好觉了，感谢投诉处理！",
    "sentiment": "正面",
    "sentimentScore": 0.88,
    "category": "表扬/感谢",
    "keywords": "感谢,夜间施工,问题解决",
    "projectName": "清江路工程",
    "alertLevel": null,
    "suggestion": "继续保持静音施工标准，巩固整改成果",
    "status": "已解决",
    "handler": "夜班管理员",
    "handlerDept": "施工调度部",
    "dueDateOffsetDays": 3
  },
  {
    "code": "YX-2026-024",
    "source": "政府投诉热线12345",
    "sourceUrl": "https://gov.example.com/complaint/8901",
    "content": "施工车辆扬起的灰尘导致周边商铺无法正常营业，生意受损严重。",
    "sentiment": "负面",
    "sentimentScore": -0.80,
    "category": "扬尘投诉",
    "keywords": "扬尘,商铺,生意受损",
    "projectName": "清江路工程",
    "alertLevel": "橙",
    "suggestion": "加强出入口清洗，增加洒水频次，与商户沟通补偿方案",
    "status": "待处理",
    "handler": "环保专员",
    "handlerDept": "施工现场管理部",
    "dueDateOffsetDays": 2
  },
  {
    "code": "YX-2026-025",
    "source": "微信公众号-城西资讯",
    "sourceUrl": "https://mp.weixin.example.com/article/9012",
    "content": "清江路工程引入智能降尘系统，打造绿色工地示范点。",
    "sentiment": "正面",
    "sentimentScore": 0.82,
    "category": "表扬/感谢",
    "keywords": "智能降尘,绿色工地,示范",
    "projectName": "清江路工程",
    "alertLevel": null,
    "suggestion": "推广智能降尘系统应用，打造行业标杆",
    "status": "已归档",
    "handler": "技术总监",
    "handlerDept": "技术设计部",
    "dueDateOffsetDays": 8
  },
  {
    "code": "YX-2026-026",
    "source": "文二西路业主群",
    "sourceUrl": "https://weq.group.example.com/thread/9012",
    "content": "交通管制时间太长，公交车绕行给老年人出行带来很大不便。",
    "sentiment": "负面",
    "sentimentScore": -0.68,
    "category": "交通影响投诉",
    "keywords": "交通管制,老年人,不便",
    "projectName": "文二西路工程",
    "alertLevel": "黄",
    "suggestion": "协调公交公司临时调整路线，增设招呼站方便老年人",
    "status": "处理中",
    "handler": "交通协调员",
    "handlerDept": "公共关系部",
    "dueDateOffsetDays": 2
  },
  {
    "code": "YX-2026-027",
    "source": "清江社区论坛",
    "sourceUrl": "https://qj.forum.example.com/post/9012",
    "content": "咨询工程竣工后是否会重新铺设路面，提升行车舒适度？",
    "sentiment": "中性",
    "sentimentScore": 0.12,
    "category": "询问/建议",
    "keywords": "咨询,路面,竣工",
    "projectName": "清江路工程",
    "alertLevel": null,
    "suggestion": "回复路面恢复方案，纳入工程验收标准",
    "status": "已解决",
    "handler": "项目协调员",
    "handlerDept": "项目管理部",
    "dueDateOffsetDays": 3
  },
  {
    "code": "YX-2026-028",
    "source": "政府投诉平台",
    "sourceUrl": "https://gov.example.com/complaint/9012",
    "content": "施工噪音和扬尘双重影响，家里老人呼吸道不适，需要就医。",
    "sentiment": "负面",
    "sentimentScore": -0.90,
    "category": "噪音投诉",
    "keywords": "噪音,扬尘,健康,就医",
    "projectName": "文二西路工程",
    "alertLevel": "红",
    "suggestion": "立即停工整改，协调居民医疗费用，加强综合降噪降尘措施",
    "status": "待处理",
    "handler": "安全专员",
    "handlerDept": "安全管理部",
    "dueDateOffsetDays": 0
  },
  {
    "code": "YX-2026-029",
    "source": "新闻媒体-都市快报",
    "sourceUrl": "https://dskb.example.com/news/34567",
    "content": "市政建设部门回应清江路施工投诉：已制定整改措施，确保文明施工。",
    "sentiment": "中性",
    "sentimentScore": 0.20,
    "category": "询问/建议",
    "keywords": "官方回应,整改措施,文明施工",
    "projectName": "清江路工程",
    "alertLevel": null,
    "suggestion": "持续跟进整改落实情况，定期发布施工进度公告",
    "status": "处理中",
    "handler": "公共关系专员",
    "handlerDept": "公共关系部",
    "dueDateOffsetDays": 3
  },
  {
    "code": "YX-2026-030",
    "source": "清江社区论坛",
    "sourceUrl": "https://qj.forum.example.com/post/0123",
    "content": "为辛苦工作的建筑工人们点赞！城市发展离不开你们的付出。",
    "sentiment": "正面",
    "sentimentScore": 0.95,
    "category": "表扬/感谢",
    "keywords": "感谢,建筑工人,点赞",
    "projectName": "清江路工程",
    "alertLevel": null,
    "suggestion": "传达居民问候到施工团队，激励士气",
    "status": "已归档",
    "handler": "项目协调员",
    "handlerDept": "项目管理部",
    "dueDateOffsetDays": 10
  },
  {
    "code": "YX-2026-031",
    "source": "文二西路业主群",
    "sourceUrl": "https://weq.group.example.com/thread/0123",
    "content": "施工造成地下管网损坏，导致小区停水两天，严重影响居民生活。",
    "sentiment": "负面",
    "sentimentScore": -0.88,
    "category": "交通影响投诉",
    "keywords": "地下管网,停水,影响生活",
    "projectName": "文二西路工程",
    "alertLevel": "红",
    "suggestion": "紧急抢修管网，优先恢复供水，建立管网保护机制",
    "status": "待处理",
    "handler": "工程抢修队",
    "handlerDept": "工程管理部",
    "dueDateOffsetDays": 0
  },
  {
    "code": "YX-2026-032",
    "source": "政府投诉热线12345",
    "sourceUrl": "https://gov.example.com/complaint/0123",
    "content": "建议在施工围挡外设置休息区，为过往行人提供遮阳避雨的地方。",
    "sentiment": "中性",
    "sentimentScore": 0.30,
    "category": "询问/建议",
    "keywords": "建议,休息区,遮阳",
    "projectName": "清江路工程",
    "alertLevel": null,
    "suggestion": "评估休息区设置可行性，提升人文关怀形象",
    "status": "待处理",
    "handler": "方案工程师",
    "handlerDept": "技术设计部",
    "dueDateOffsetDays": 5
  },
  {
    "code": "YX-2026-033",
    "source": "清江社区论坛",
    "sourceUrl": "https://qj.forum.example.com/post/1122",
    "content": "连续一周夜间施工投诉无人处理，居民已向媒体求助。",
    "sentiment": "负面",
    "sentimentScore": -0.92,
    "category": "夜间施工投诉",
    "keywords": "夜间施工,媒体,投诉无果",
    "projectName": "清江路工程",
    "alertLevel": "红",
    "suggestion": "紧急处理，联系媒体澄清，与居民代表面对面沟通解决方案",
    "status": "处理中",
    "handler": "项目经理",
    "handlerDept": "项目管理部",
    "dueDateOffsetDays": 0
  },
  {
    "code": "YX-2026-034",
    "source": "微信公众号-城西资讯",
    "sourceUrl": "https://mp.weixin.example.com/article/1122",
    "content": "清江路工程获评市级文明工地称号，环保施工成行业标杆。",
    "sentiment": "正面",
    "sentimentScore": 0.90,
    "category": "表扬/感谢",
    "keywords": "文明工地,荣誉,行业标杆",
    "projectName": "清江路工程",
    "alertLevel": null,
    "suggestion": "继续保持荣誉，加强宣传推广",
    "status": "已归档",
    "handler": "宣传专员",
    "handlerDept": "公共关系部",
    "dueDateOffsetDays": 15
  },
  {
    "code": "YX-2026-035",
    "source": "政府投诉平台",
    "sourceUrl": "https://gov.example.com/complaint/1122",
    "content": "施工震动导致周边房屋墙体出现裂缝，居民担心房屋安全。",
    "sentiment": "负面",
    "sentimentScore": -0.85,
    "category": "噪音投诉",
    "keywords": "震动,裂缝,房屋安全",
    "projectName": "文二西路工程",
    "alertLevel": "红",
    "suggestion": "立即委托专业机构检测房屋，制定减震方案，必要时搬迁居民",
    "status": "待处理",
    "handler": "安全专员",
    "handlerDept": "安全管理部",
    "dueDateOffsetDays": 0
  }
] as const;

export const seedInsights = [
  {
    "title": "本周负面舆情占比",
    "value": "58%",
    "trend": "down",
    "level": "warning"
  },
  {
    "title": "红色预警平均响应时长",
    "value": "2.3h",
    "trend": "steady",
    "level": "success"
  },
  {
    "title": "舆情解决率",
    "value": "87%",
    "trend": "up",
    "level": "success"
  },
  {
    "title": "夜间施工投诉本月新增",
    "value": "12",
    "trend": "up",
    "level": "danger"
  },
  {
    "title": "居民满意度",
    "value": "78%",
    "trend": "up",
    "level": "processing"
  }
] as const;

export const seedAlertRules = [
  {
    "name": "夜间施工关键词预警",
    "type": "关键词匹配",
    "condition": "夜间施工 OR 半夜施工 OR 凌晨施工",
    "alertLevel": "橙",
    "enabled": true,
    "priority": 10,
    "description": "当舆情内容包含夜间施工相关关键词时触发橙色预警"
  },
  {
    "name": "高强度负面舆情预警",
    "type": "情感阈值",
    "condition": "sentimentScore < -0.8",
    "alertLevel": "红",
    "enabled": true,
    "priority": 20,
    "description": "当情感得分低于-0.8时触发红色预警"
  },
  {
    "name": "扬尘投诉自动预警",
    "type": "舆情类别",
    "condition": "category = 扬尘投诉",
    "alertLevel": "橙",
    "enabled": true,
    "priority": 15,
    "description": "扬尘类投诉自动触发橙色预警"
  },
  {
    "name": "噪音超标预警",
    "type": "关键词匹配",
    "condition": "噪音超标 OR 无法入睡 OR 严重影响",
    "alertLevel": "红",
    "enabled": true,
    "priority": 5,
    "description": "噪音相关强烈投诉触发红色预警"
  },
  {
    "name": "交通影响预警",
    "type": "舆情类别",
    "condition": "category = 交通影响投诉",
    "alertLevel": "黄",
    "enabled": true,
    "priority": 25,
    "description": "交通影响类投诉触发黄色预警"
  }
] as const;

export const seedDataSources = [
  {
    "name": "清江社区论坛",
    "type": "社区论坛",
    "url": "https://qj.forum.example.com",
    "keywords": "清江路,施工,工程",
    "enabled": true,
    "interval": 3600
  },
  {
    "name": "文二西路业主微信群",
    "type": "社交媒体",
    "url": "https://weq.group.example.com",
    "keywords": "文二西路,施工,噪音",
    "enabled": true,
    "interval": 1800
  },
  {
    "name": "12345政府投诉热线",
    "type": "政府投诉平台",
    "url": "https://gov.example.com/complaint",
    "keywords": "施工投诉,噪音,扬尘",
    "enabled": true,
    "interval": 900
  },
  {
    "name": "城西资讯公众号",
    "type": "新闻媒体",
    "url": "https://mp.weixin.example.com/user/cxzx",
    "keywords": "城西,工程,施工",
    "enabled": true,
    "interval": 7200
  }
] as const;

export const consoleRoutes: ConsoleRoute[] = [
  {
    key: "dashboard",
    slug: "dashboard",
    path: "/dashboard",
    title: "舆情分析首页",
    description: "聚合舆情概览、预警提示和处置留痕。",
    kind: "dashboard",
  },
  {
    key: "monitor",
    slug: "monitor",
    path: "/monitor",
    title: "舆情监控",
    description: "监控数据来源和实时舆情采集情况。",
    kind: "workspace",
  },
  {
    key: "sentiment",
    slug: "sentiment",
    path: "/sentiment",
    title: "情感分析",
    description: "查看舆情情感分布和趋势变化。",
    kind: "analysis",
  },
  {
    key: "alert",
    slug: "alert",
    path: "/alert",
    title: "预警管理",
    description: "配置预警规则和管理预警记录。",
    kind: "workspace",
  },
  {
    key: "user-management",
    slug: "users",
    path: "/users",
    title: "用户管理",
    description: "维护后台用户、部门角色和账号状态。",
    kind: "users",
  },
  {
    key: "audit-logs",
    slug: "audit-logs",
    path: "/audit-logs",
    title: "日志审计",
    description: "查看业务操作、设置变更和智能分析留痕。",
    kind: "auditLogs",
  },
  {
    key: "system-settings",
    slug: "settings",
    path: "/settings",
    title: "系统设置",
    description: "维护流程阈值、通知偏好和智能分析开关。",
    kind: "settings",
  },
  {
    key: "assistant",
    slug: "assistant",
    path: "/assistant",
    title: appMeta.aiTitle,
    description: "调用智能舆情分析与预警辅助生成分类和预警建议。",
    kind: "assistant",
  },
] as const;

export const sentimentRecordColumns = [
  { key: "code", label: "舆情编号", width: 140 },
  { key: "source", label: "来源", width: 120 },
  { key: "content", label: "内容摘要", width: 280, kind: "summary" },
  { key: "sentiment", label: "情感倾向", width: 100, kind: "tag" },
  { key: "sentimentScore", label: "情感强度", width: 100, kind: "tag" },
  { key: "category", label: "舆情分类", width: 120, kind: "tag" },
  { key: "alertLevel", label: "预警等级", width: 100, kind: "tag" },
  { key: "status", label: "处理状态", width: 100, kind: "badge" },
  { key: "handler", label: "处理人", width: 100 },
] as const;

export const alertRecordColumns = [
  { key: "alertLevel", label: "预警等级", width: 100, kind: "tag" },
  { key: "alertType", label: "预警类型", width: 140 },
  { key: "source", label: "来源", width: 140 },
  { key: "content", label: "内容摘要", width: 280, kind: "summary" },
  { key: "suggestion", label: "建议措施", width: 200 },
  { key: "status", label: "状态", width: 100, kind: "badge" },
  { key: "handler", label: "处理人", width: 120 },
] as const;

function routeMetrics(snapshot: DashboardSnapshot, rows: Record<string, unknown>[] = snapshot.records) {
  const totalCount = rows.length;
  const negativeCount = rows.filter((r) => (r as { sentiment: string }).sentiment === "负面").length;
  const pendingCount = rows.filter((r) => (r as { status: string }).status === "待处理").length;
  const redAlertCount = rows.filter((r) => (r as { alertLevel: string | null }).alertLevel === "红").length;

  return [
    { label: "舆情总数", value: totalCount, helper: "已纳入监控的舆情记录", tone: "default" },
    { label: "负面舆情", value: negativeCount, helper: "需关注的负面情感记录", tone: negativeCount > 0 ? "warning" : "success" },
    { label: "待处理", value: pendingCount, helper: "等待处理的舆情", tone: pendingCount > 0 ? "warning" : "success" },
    { label: "红色预警", value: redAlertCount, helper: "需立即处理的红色预警", tone: redAlertCount > 0 ? "danger" : "success" },
  ];
}

function sortedRows(rows: Record<string, unknown>[]) {
  return [...rows].sort((left, right) => {
    const leftDate = (left as { updatedAt: string }).updatedAt || "";
    const rightDate = (right as { updatedAt: string }).updatedAt || "";
    return rightDate.localeCompare(leftDate);
  });
}

export function getRouteBySlug(slug?: string) {
  const target = slug?.trim() ? slug : "dashboard";
  return consoleRoutes.find((route) => route.slug === target);
}

export function getRouteByKey(key: string) {
  return consoleRoutes.find((route) => route.key === key);
}

export function getWorkspaceView(routeKey: string, snapshot: DashboardSnapshot): WorkspaceView {
  const allRecords = snapshot.records;

  if (routeKey === "monitor") {
    const rows = sortedRows(allRecords).slice(0, 15);
    return {
      title: "舆情监控",
      description: "监控舆情数据来源和实时采集情况",
      metrics: routeMetrics(snapshot, rows),
      columns: [...sentimentRecordColumns],
      rows,
      emptyDescription: "暂无舆情监控记录，请从数据来源配置开始导入。",
      timelineTitle: "采集流程",
      timeline: [
        { title: "配置数据源", description: "添加需要监控的社区论坛、社交媒体等数据来源。" },
        { title: "关键词设置", description: "配置抓取关键词，如项目名称、施工相关词汇。" },
        { title: "实时爬取", description: "系统按配置间隔自动抓取舆情数据。" },
      ],
    };
  }

  if (routeKey === "alert") {
    const alertRows = sortedRows(snapshot.alerts).slice(0, 15);
    return {
      title: "预警管理",
      description: "配置预警规则并管理预警记录",
      metrics: [
        { label: "预警总数", value: snapshot.alerts.length, helper: "已触发的预警记录", tone: "default" },
        { label: "待处理", value: snapshot.alerts.filter((a) => a.status === "待处理").length, helper: "等待处理的预警", tone: "warning" },
        { label: "已解决", value: snapshot.alerts.filter((a) => a.status === "已解决").length, helper: "已处置完成的预警", tone: "success" },
        { label: "红色预警", value: snapshot.alerts.filter((a) => a.alertLevel === "红").length, helper: "需立即处理", tone: "danger" },
      ],
      columns: [...alertRecordColumns],
      rows: alertRows as Record<string, unknown>[],
      emptyDescription: "暂无预警记录，系统将自动根据规则生成预警。",
      timelineTitle: "处置流程",
      timeline: [
        { title: "触发预警", description: "舆情满足预警规则条件时自动生成预警。" },
        { title: "分派处理", description: "将预警分派给责任部门或处理人员。" },
        { title: "处置反馈", description: "处理完成后记录处置结果和解决备注。" },
      ],
    };
  }

  const rows = sortedRows(allRecords).slice(0, 12);
  return {
    title: "舆情列表",
    description: "查看和管理舆情记录",
    metrics: routeMetrics(snapshot, rows),
    columns: [...sentimentRecordColumns],
    rows,
    emptyDescription: "暂无舆情记录",
    timelineTitle: "处理流程",
    timeline: [
      { title: "舆情采集", description: "从各数据来源实时抓取舆情信息。" },
      { title: "情感分析", description: "判断舆情情感倾向和强度。" },
      { title: "预警生成", description: "根据规则自动生成预警等级。" },
      { title: "措施建议", description: "生成应对建议并推送责任部门。" },
    ],
  };
}

export function getAnalysisView(snapshot: DashboardSnapshot): AnalysisView {
  const records = snapshot.records;

  const sentimentDistribution = appMeta.sentiments.map((s) => ({
    sentiment: s,
    count: records.filter((r) => r.sentiment === s).length,
  }));

  const categoryDistribution = appMeta.categories.map((c) => ({
    category: c,
    count: records.filter((r) => r.category === c).length,
  }));

  const trendData = seedInsights.map((insight, index) => ({
    period: `2026-0${index + 1}`,
    metric: insight.value,
    trend: insight.trend === "up" ? "上升" : insight.trend === "down" ? "下降" : "平稳",
  }));

  return {
    title: "情感分析",
    description: "从舆情情感分布和趋势变化维度复盘舆情处置效果。",
    metrics: routeMetrics(snapshot),
    highlights: [
      "负面舆情主要集中在夜间施工和扬尘投诉两类。",
      "红色预警需要在2小时内完成首次响应。",
      "建议加强夜间施工管理和扬尘控制措施。",
    ],
    tables: [
      {
        title: "情感分布",
        columns: [
          { key: "sentiment", label: "情感倾向" },
          { key: "count", label: "数量" },
        ],
        rows: sentimentDistribution.map((d) => ({
          sentiment: d.sentiment,
          count: String(d.count),
        })),
      },
      {
        title: "分类统计",
        columns: [
          { key: "category", label: "舆情分类" },
          { key: "count", label: "数量" },
        ],
        rows: categoryDistribution.map((d) => ({
          category: d.category,
          count: String(d.count),
        })),
      },
      {
        title: "趋势变化",
        columns: [
          { key: "period", label: "统计周期" },
          { key: "metric", label: "核心指标" },
          { key: "trend", label: "趋势" },
        ],
        rows: trendData,
      },
    ],
  };
}
