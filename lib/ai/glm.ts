export function runGlmAssistant(params: {
  prompt: string;
  item: {
    title: string;
    category: string;
    status: string;
    riskLevel: string;
    owner: string;
    description: string;
    sourceBatch: string;
  };
  history: Array<{ prompt: string; result: string }>;
}): { result: string; topic: string; source: "glm" | "local" } {
  // 本地模拟AI响应，实际环境应连接GLM API
  const { item } = params;
  return {
    result: [
      `处理对象：${item.title}`,
      `分类建议：该舆情应归类为${item.category}。`,
      `情感判断：当前情感倾向${item.riskLevel}，建议持续关注。`,
      `预警等级：建议设为${item.riskLevel === "高" ? "红" : item.riskLevel === "中" ? "橙" : "黄"}色预警。`,
      `应对措施：建议${item.owner}牵头处理，及时响应舆情关切。`,
    ].join("\n"),
    topic: `${item.title} · 分析方案`,
    source: "local",
  };
}
