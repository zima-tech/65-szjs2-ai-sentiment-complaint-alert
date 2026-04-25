// 舆情记录视图
export type SentimentRecordView = {
  id: string;
  code: string;
  source: string;
  sourceUrl: string | null;
  content: string;
  sentiment: string;
  sentimentScore: number;
  category: string;
  keywords: string;
  projectName: string | null;
  alertLevel: string | null;
  suggestion: string | null;
  status: string;
  handler: string | null;
  handlerDept: string | null;
  processedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

// 舆情过程记录视图
export type SentimentEventView = {
  id: string;
  recordId: string;
  sourceType: string;
  sourceTitle: string;
  action: string;
  actor: string;
  content: string;
  createdAt: string;
};

// 预警记录视图
export type AlertRecordView = {
  id: string;
  recordId: string | null;
  alertLevel: string;
  alertType: string;
  source: string;
  content: string;
  suggestion: string;
  status: string;
  handler: string | null;
  handlerDept: string | null;
  resolvedAt: string | null;
  resolvedNote: string | null;
  createdAt: string;
  updatedAt: string;
};

// 预警规则视图
export type AlertRuleView = {
  id: string;
  name: string;
  type: string;
  condition: string;
  alertLevel: string;
  enabled: boolean;
  priority: number;
  description: string | null;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
};

// 数据来源视图
export type DataSourceView = {
  id: string;
  name: string;
  type: string;
  url: string;
  keywords: string;
  enabled: boolean;
  interval: number;
  lastFetchAt: string | null;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
};

// 业务洞察视图
export type InsightView = {
  id: string;
  title: string;
  value: string;
  trend: string;
  level: string;
};

// 集成日志视图
export type IntegrationLogView = {
  id: string;
  service: string;
  status: string;
  batch: string;
  quality: string;
  detail: string;
  createdAt: string;
};

// AI草稿视图
export type AiDraftView = {
  id: string;
  conversationId: string;
  turnIndex: number;
  topic: string;
  prompt: string;
  result: string;
  status: string;
  resultType: string;
  sourceSummary: string;
  businessObjectId: string;
  businessObjectType: string;
  businessObjectTitle: string;
  sourceMode: "glm" | "local";
  saveStatus: string;
  saveSummary: string | null;
  savedAt: string | null;
  createdAt: string;
};

// AI对话视图
export type AiConversationView = {
  id: string;
  topic: string;
  businessObjectId: string;
  businessObjectType: string;
  businessObjectTitle: string;
  resultType: string;
  sourceSummary: string;
  latestStatus: string;
  saveStatus: string;
  lastPrompt: string;
  turnCount: number;
  updatedAt: string;
};

// 系统用户视图
export type SystemUserView = {
  id: string;
  username: string;
  displayName: string;
  department: string;
  role: string;
  status: string;
  lastLoginAt: string | null;
  createdAt: string;
  updatedAt: string;
};

// 审计日志视图
export type AuditLogView = {
  id: string;
  module: string;
  action: string;
  targetType: string;
  targetName: string;
  result: string;
  actor: string;
  summary: string;
  ipAddress: string | null;
  userAgent: string | null;
  createdAt: string;
};

// 系统设置视图
export type SystemSettingView = {
  id: string;
  group: string;
  key: string;
  label: string;
  value: string;
  valueType: string;
  enabled: boolean;
  description: string;
  updatedBy: string;
  createdAt: string;
  updatedAt: string;
};

// 仪表板快照
export type DashboardSnapshot = {
  records: SentimentRecordView[];
  events: SentimentEventView[];
  alerts: AlertRecordView[];
  alertRules: AlertRuleView[];
  dataSources: DataSourceView[];
  insights: InsightView[];
  integrations: IntegrationLogView[];
  aiDrafts: AiDraftView[];
  aiConversations: AiConversationView[];
  systemUsers: SystemUserView[];
  auditLogs: AuditLogView[];
  systemSettings: SystemSettingView[];
};

// 舆情记录输入
export type SentimentRecordInput = {
  source: string;
  content: string;
  sentiment: string;
  sentimentScore: number;
  category: string;
  keywords: string;
  projectName?: string;
  alertLevel?: string;
  suggestion?: string;
};

// 预警记录输入
export type AlertRecordInput = {
  recordId?: string;
  alertLevel: string;
  alertType: string;
  source: string;
  content: string;
  suggestion: string;
  status?: string;
  handler?: string;
  handlerDept?: string;
};

// 预警规则输入
export type AlertRuleInput = {
  name: string;
  type: string;
  condition: string;
  alertLevel: string;
  enabled: boolean;
  priority: number;
  description?: string;
};

// 数据来源输入
export type DataSourceInput = {
  name: string;
  type: string;
  url: string;
  keywords: string;
  enabled: boolean;
  interval: number;
};

// 系统用户输入
export type SystemUserInput = {
  username: string;
  displayName: string;
  department: string;
  role: string;
  status: string;
};

// 系统设置输入
export type SystemSettingInput = {
  value: string;
  enabled: boolean;
  updatedBy: string;
};

// AI生成输入
export type GenerateAiDraftInput = {
  prompt: string;
  businessObjectId: string;
  conversationId?: string | null;
};

// AI保存输入
export type SaveAiDraftInput = {
  draftId: string;
};

// 控制台路由类型
export type ConsoleRouteKind = "dashboard" | "workspace" | "analysis" | "assistant" | "users" | "auditLogs" | "settings";

// 控制台路由
export type ConsoleRoute = {
  key: string;
  slug: string;
  path: string;
  title: string;
  description: string;
  kind: ConsoleRouteKind;
};

// 路由指标
export type RouteMetric = {
  label: string;
  value: string | number;
  helper?: string;
  tone?: "default" | "success" | "warning" | "danger";
};

// 路由时间线项
export type RouteTimelineItem = {
  title: string;
  description: string;
  tag?: string;
};

// 工作区列
export type WorkspaceColumn = {
  key: string;
  label: string;
  width?: number;
  kind?: "text" | "tag" | "badge" | "summary";
};

// 工作区操作
export type WorkspaceAction = {
  key: "advance" | "delete";
  label: string;
  danger?: boolean;
  confirmTitle?: string;
  confirmText?: string;
  disabledWhenFinal?: boolean;
};

// 工作区字段
export type WorkspaceField = {
  key: string;
  label: string;
  type?: "text" | "textarea" | "select";
  placeholder?: string;
  options?: readonly string[];
  required?: boolean;
};

// 工作区视图
export type WorkspaceView = {
  title: string;
  description: string;
  metrics: RouteMetric[];
  formTitle?: string;
  submitLabel?: string;
  fields?: WorkspaceField[];
  columns: WorkspaceColumn[];
  rows: Record<string, unknown>[];
  emptyDescription: string;
  actions?: WorkspaceAction[];
  timelineTitle?: string;
  timeline?: RouteTimelineItem[];
};

// 分析表格
export type AnalysisTable = {
  title: string;
  columns: Array<{
    key: string;
    label: string;
  }>;
  rows: Array<Record<string, string>>;
};

// 分析视图
export type AnalysisView = {
  title: string;
  description: string;
  metrics: RouteMetric[];
  highlights: string[];
  tables: AnalysisTable[];
};
