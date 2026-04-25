export function createFeedback(category: string) {
  return `${category}已登记，等待下一步处理。`;
}

export function advanceFeedback(nextStatus: string) {
  return `状态已更新为${nextStatus}`;
}

export function deleteFeedback(category: string) {
  return `${category}记录已删除`;
}
