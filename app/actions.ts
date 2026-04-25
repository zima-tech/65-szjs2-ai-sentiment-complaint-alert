"use server";

import { randomUUID } from "node:crypto";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { signInDemo, signOutDemo } from "@/lib/auth";
import { appMeta } from "@/lib/domain";
import { runGlmAssistant } from "@/lib/ai/glm";
import { getDashboardSnapshot } from "@/lib/service";
import type { DemoLoginInput, DemoLoginResult } from "@/lib/demo-auth-config";
import type { GenerateAiDraftInput, SaveAiDraftInput, SentimentRecordInput, SystemSettingInput, SystemUserInput } from "@/lib/types";

const statusFlow: string[] = [...appMeta.statuses];

type AuditInput = {
  module: string;
  action: string;
  targetType: string;
  targetName: string;
  result?: string;
  actor?: string;
  summary: string;
};

function nextStatus(current: string) {
  const index = statusFlow.indexOf(current);
  return statusFlow[Math.min(index + 1, statusFlow.length - 1)] ?? current;
}

async function recordAuditLog(input: AuditInput) {
  try {
    await prisma.auditLog.create({
      data: {
        module: input.module,
        action: input.action,
        targetType: input.targetType,
        targetName: input.targetName,
        result: input.result ?? "成功",
        actor: input.actor ?? "演示管理员",
        summary: input.summary,
      },
    });
  } catch {
    // 审计补写失败不阻断主业务，避免用户重复提交。
  }
}

export async function loginDemoAccount(input: DemoLoginInput): Promise<DemoLoginResult> {
  const ok = await signInDemo(input);
  if (!ok) {
    return { ok: false, message: "用户名或密码错误" };
  }
  await recordAuditLog({
    module: "登录",
    action: "账号登录",
    targetType: "管理后台",
    targetName: appMeta.shortName,
    actor: input.username,
    summary: `${input.username} 登录${appMeta.shortName}。`,
  });
  revalidatePath("/");
  return { ok: true };
}

export async function logoutDemoAccount() {
  await signOutDemo();
  revalidatePath("/");
  return { ok: true };
}

export async function createSentimentRecord(input: SentimentRecordInput) {
  const code = `YX-${new Date().getFullYear()}-${Date.now().toString().slice(-6)}`;
  const item = await prisma.sentimentRecord.create({
    data: {
      code,
      source: input.source,
      content: input.content,
      sentiment: input.sentiment,
      sentimentScore: input.sentimentScore,
      category: input.category,
      keywords: input.keywords,
      projectName: input.projectName || null,
      alertLevel: input.alertLevel || null,
      suggestion: input.suggestion || null,
      status: statusFlow[0] ?? "待处理",
    },
  });

  await prisma.sentimentEvent.create({
    data: {
      recordId: item.id,
      sourceType: "舆情采集",
      sourceTitle: code,
      action: "创建记录",
      actor: "演示管理员",
      content: `舆情已采集：${input.content.slice(0, 50)}...，情感判断为${input.sentiment}。`,
    },
  });

  // 自动生成预警：负面舆情且为投诉类分类
  const alertCategories = ["夜间施工投诉", "扬尘投诉", "噪音投诉", "交通影响投诉"];
  if (input.sentiment === "负面" && alertCategories.includes(input.category)) {
    // 根据情感得分确定预警等级
    let alertLevel = "黄";
    if (input.sentimentScore <= -0.9) {
      alertLevel = "红";
    } else if (input.sentimentScore <= -0.7) {
      alertLevel = "橙";
    }

    await prisma.alertRecord.create({
      data: {
        recordId: item.id,
        alertLevel,
        alertType: input.category,
        source: input.source,
        content: input.content.slice(0, 200),
        suggestion: input.suggestion || `建议关注${input.category}舆情，及时响应处理。`,
        status: "待处理",
        handler: null,
      },
    });

    await recordAuditLog({
      module: "预警管理",
      action: "生成预警",
      targetType: "预警记录",
      targetName: `预警-${input.category}`,
      actor: "系统",
      summary: `${alertLevel}级预警已生成：${input.category}。`,
    });
  }

  await recordAuditLog({
    module: "舆情监控",
    action: "新增舆情",
    targetType: appMeta.sourceObjectName,
    targetName: code,
    actor: "演示管理员",
    summary: `来自${input.source}的舆情已登记。`,
  });

  revalidatePath("/");
  return getDashboardSnapshot();
}

export async function advanceSentimentRecord(id: string) {
  const record = await prisma.sentimentRecord.findUniqueOrThrow({ where: { id } });
  const status = nextStatus(record.status);
  await prisma.sentimentRecord.update({ where: { id }, data: { status } });
  await prisma.sentimentEvent.create({
    data: {
      recordId: id,
      sourceType: "舆情数据",
      sourceTitle: record.code,
      action: "状态流转",
      actor: record.handler || "演示管理员",
      content: `舆情状态由${record.status}推进至${status}。`,
    },
  });

  await recordAuditLog({
    module: "舆情监控",
    action: "状态流转",
    targetType: appMeta.sourceObjectName,
    targetName: record.code,
    actor: record.handler || "演示管理员",
    summary: `状态由${record.status}推进至${status}。`,
  });

  revalidatePath("/");
  return getDashboardSnapshot();
}

export async function deleteSentimentRecord(id: string) {
  const record = await prisma.sentimentRecord.findUniqueOrThrow({ where: { id } });
  await prisma.sentimentRecord.delete({ where: { id } });
  await recordAuditLog({
    module: "舆情监控",
    action: "删除记录",
    targetType: appMeta.sourceObjectName,
    targetName: record.code,
    actor: "演示管理员",
    summary: `${record.code}舆情记录已删除。`,
  });
  revalidatePath("/");
  return getDashboardSnapshot();
}

export async function createAlertRecord(input: {
  recordId?: string;
  alertLevel: string;
  alertType: string;
  source: string;
  content: string;
  suggestion: string;
  handler?: string;
  handlerDept?: string;
}) {
  const item = await prisma.alertRecord.create({
    data: {
      recordId: input.recordId || null,
      alertLevel: input.alertLevel,
      alertType: input.alertType,
      source: input.source,
      content: input.content,
      suggestion: input.suggestion,
      status: statusFlow[0] ?? "待处理",
      handler: input.handler || null,
      handlerDept: input.handlerDept || null,
    },
  });

  await recordAuditLog({
    module: "预警管理",
    action: "生成预警",
    targetType: "预警记录",
    targetName: `预警-${item.id.slice(-6)}`,
    actor: "演示管理员",
    summary: `${input.alertLevel}级预警已生成：${input.alertType}。`,
  });

  revalidatePath("/");
  return getDashboardSnapshot();
}

export async function resolveAlertRecord(id: string, note?: string) {
  const alert = await prisma.alertRecord.findUniqueOrThrow({ where: { id } });
  await prisma.alertRecord.update({
    where: { id },
    data: {
      status: "已解决",
      resolvedAt: new Date(),
      resolvedNote: note || null,
    },
  });

  await recordAuditLog({
    module: "预警管理",
    action: "解决预警",
    targetType: "预警记录",
    targetName: `预警-${alert.id.slice(-6)}`,
    actor: "演示管理员",
    summary: `${alert.alertLevel}级预警已解决。`,
  });

  revalidatePath("/");
  return getDashboardSnapshot();
}

function buildSourceSummary(item: { source: string; sentiment: string; category: string }) {
  return `已读取${item.source}，情感${item.sentiment}，分类${item.category}。`;
}

function buildSaveSummary(result: string) {
  const firstLine = result
    .split("\n")
    .map((line) => line.trim())
    .find(Boolean);

  return firstLine ? `${appMeta.aiExperience.savedSuccessText} ${firstLine}`.slice(0, 160) : appMeta.aiExperience.savedSuccessText;
}

export async function generateAiDraft(input: GenerateAiDraftInput) {
  const prompt = input.prompt.trim();
  if (!prompt) {
    throw new Error("请先输入需要分析的舆情问题");
  }

  try {
    const record = await prisma.sentimentRecord.findUnique({
      where: { id: input.businessObjectId },
    });

    if (!record) {
      throw new Error(`未找到关联的${appMeta.sourceObjectName}，请重新选择后再试`);
    }

    const existingTurns = input.conversationId
      ? await prisma.aiDraft.findMany({
          where: { conversationId: input.conversationId },
          orderBy: [{ turnIndex: "asc" }],
        })
      : [];

    const conversationId = input.conversationId || randomUUID();
    const response = await runGlmAssistant({
      prompt,
      item: {
        title: record.code,
        category: record.category,
        status: record.status,
        riskLevel: record.alertLevel || "中",
        owner: record.handler || "待分配",
        description: record.content,
        sourceBatch: record.source,
      },
      history: existingTurns.map((turn) => ({
        prompt: turn.prompt,
        result: turn.result,
      })),
    });

    const turnIndex = existingTurns.length > 0 ? existingTurns[existingTurns.length - 1]!.turnIndex + 1 : 0;
    const topic = existingTurns[0]?.topic ?? response.topic;

    await prisma.aiDraft.create({
      data: {
        conversationId,
        turnIndex,
        topic,
        prompt,
        result: response.result,
        status: response.source === "glm" ? "已生成" : "已形成初稿",
        resultType: appMeta.aiExperience.resultType,
        sourceSummary: buildSourceSummary(record),
        businessObjectId: record.id,
        businessObjectType: appMeta.sourceObjectName,
        businessObjectTitle: record.code,
        sourceMode: response.source,
        saveStatus: "待采纳",
      },
    });

    await prisma.sentimentEvent.create({
      data: {
        recordId: record.id,
        sourceType: "舆情数据",
        sourceTitle: record.code,
        action: appMeta.aiExperience.generateEventAction,
        actor: appMeta.shortName,
        content: `已生成${appMeta.aiExperience.resultType}，可继续追问或直接采纳。`,
      },
    });

    await recordAuditLog({
      module: appMeta.aiTitle,
      action: appMeta.aiExperience.generateEventAction,
      targetType: appMeta.sourceObjectName,
      targetName: record.code,
      actor: appMeta.shortName,
      summary: response.source === "glm" ? "已完成智能分析并保存会话结果。" : "已基于当前舆情数据形成分析初稿。",
    });

    revalidatePath("/");
    return { snapshot: await getDashboardSnapshot(), source: response.source, conversationId };
  } catch {
    throw new Error("本次智能分析未能完成，请稍后重试或更换当前舆情对象后再发起。");
  }
}

export async function saveAiDraft(input: SaveAiDraftInput) {
  try {
    const draft = await prisma.aiDraft.findUnique({
      where: { id: input.draftId },
    });

    if (!draft) {
      throw new Error("未找到可采纳的智能结果");
    }

    if (draft.saveStatus === appMeta.aiExperience.savedStatusLabel) {
      return { snapshot: await getDashboardSnapshot(), message: "当前结果已采纳并同步" };
    }

    const record = await prisma.sentimentRecord.findUnique({
      where: { id: draft.businessObjectId },
    });

    if (!record) {
      throw new Error(`关联的${appMeta.sourceObjectName}不存在，无法写入当前结果`);
    }

    const summary = buildSaveSummary(draft.result);

    await prisma.$transaction([
      prisma.sentimentRecord.update({
        where: { id: record.id },
        data: {
          suggestion: summary,
        },
      }),
      prisma.aiDraft.update({
        where: { id: draft.id },
        data: {
          status: "已保存",
          saveStatus: appMeta.aiExperience.savedStatusLabel,
          saveSummary: summary,
          savedAt: new Date(),
        },
      }),
      prisma.sentimentEvent.create({
        data: {
          recordId: record.id,
          sourceType: "舆情数据",
          sourceTitle: record.code,
          action: appMeta.aiExperience.saveEventAction,
          actor: appMeta.shortName,
          content: summary,
        },
      }),
    ]);

    await recordAuditLog({
      module: appMeta.aiTitle,
      action: appMeta.aiExperience.saveEventAction,
      targetType: appMeta.sourceObjectName,
      targetName: record.code,
      actor: appMeta.shortName,
      summary,
    });

    revalidatePath("/");
    return { snapshot: await getDashboardSnapshot(), message: appMeta.aiExperience.savedSuccessText };
  } catch {
    throw new Error("结果采纳未完成，请稍后重试或先核对当前舆情对象。");
  }
}

export async function createSystemUser(input: SystemUserInput) {
  const user = await prisma.systemUser.create({
    data: {
      username: input.username.trim(),
      displayName: input.displayName.trim(),
      department: input.department.trim(),
      role: input.role,
      status: input.status,
      lastLoginAt: null,
    },
  });
  await recordAuditLog({
    module: "用户管理",
    action: "新增用户",
    targetType: "管理用户",
    targetName: user.displayName,
    summary: `${user.displayName}已加入${user.department}，角色为${user.role}。`,
  });
  revalidatePath("/users");
  return getDashboardSnapshot();
}

export async function updateSystemUser(id: string, input: SystemUserInput) {
  const user = await prisma.systemUser.update({
    where: { id },
    data: {
      username: input.username.trim(),
      displayName: input.displayName.trim(),
      department: input.department.trim(),
      role: input.role,
      status: input.status,
    },
  });
  await recordAuditLog({
    module: "用户管理",
    action: "编辑用户",
    targetType: "管理用户",
    targetName: user.displayName,
    summary: `${user.displayName}的部门、角色或状态已更新。`,
  });
  revalidatePath("/users");
  return getDashboardSnapshot();
}

export async function toggleSystemUserStatus(id: string) {
  const user = await prisma.systemUser.findUniqueOrThrow({ where: { id } });
  const status = user.status === "启用" ? "停用" : "启用";
  const next = await prisma.systemUser.update({ where: { id }, data: { status } });
  await recordAuditLog({
    module: "用户管理",
    action: status === "启用" ? "启用用户" : "停用用户",
    targetType: "管理用户",
    targetName: next.displayName,
    summary: `${next.displayName}账号状态已调整为${status}。`,
  });
  revalidatePath("/users");
  return getDashboardSnapshot();
}

export async function updateSystemSetting(id: string, input: SystemSettingInput) {
  const setting = await prisma.systemSetting.update({
    where: { id },
    data: {
      value: input.value.trim(),
      enabled: input.enabled,
      updatedBy: input.updatedBy.trim() || "演示管理员",
    },
  });
  await recordAuditLog({
    module: "系统设置",
    action: "编辑设置",
    targetType: "业务参数",
    targetName: setting.label,
    actor: setting.updatedBy,
    summary: `${setting.group}中的${setting.label}已更新。`,
  });
  revalidatePath("/settings");
  return getDashboardSnapshot();
}

export async function toggleSystemSetting(id: string) {
  const setting = await prisma.systemSetting.findUniqueOrThrow({ where: { id } });
  const next = await prisma.systemSetting.update({
    where: { id },
    data: {
      enabled: !setting.enabled,
      updatedBy: "演示管理员",
    },
  });
  await recordAuditLog({
    module: "系统设置",
    action: next.enabled ? "启用设置" : "停用设置",
    targetType: "业务参数",
    targetName: next.label,
    summary: `${next.label}已${next.enabled ? "启用" : "停用"}。`,
  });
  revalidatePath("/settings");
  return getDashboardSnapshot();
}
