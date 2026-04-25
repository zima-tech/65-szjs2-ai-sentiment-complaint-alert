export function getMockIntegrationHealth() {
  const now = new Date();
  return [
    {
      service: "清江社区论坛",
      status: "running",
      batch: "批次-2026-001",
      quality: "98%",
      detail: "数据采集中断，已自动重连",
      createdAt: now,
    },
    {
      service: "文二西路业主群",
      status: "running",
      batch: "批次-2026-001",
      quality: "95%",
      detail: "实时监控中，新增12条舆情",
      createdAt: new Date(now.getTime() - 5 * 60 * 1000),
    },
    {
      service: "12345政府投诉热线",
      status: "running",
      batch: "批次-2026-001",
      quality: "100%",
      detail: "数据同步正常",
      createdAt: new Date(now.getTime() - 10 * 60 * 1000),
    },
    {
      service: "城西资讯公众号",
      status: "paused",
      batch: "批次-2026-001",
      quality: "92%",
      detail: "暂停采集，等待人工确认",
      createdAt: new Date(now.getTime() - 30 * 60 * 1000),
    },
  ];
}
