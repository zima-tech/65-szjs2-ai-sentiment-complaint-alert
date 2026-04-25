import { prisma } from "@/lib/prisma";
import { appMeta, seedAlertRules, seedDataSources, seedInsights, seedRecords } from "@/lib/domain";
import { getMockIntegrationHealth } from "@/lib/mock-integrations";
import type { AiConversationView, DashboardSnapshot } from "@/lib/types";

function toIso(value: Date | null) {
  return value ? value.toISOString() : null;
}

function createSeedAiDrafts(records: Array<{ id: string; code: string; source: string; sentiment: string; category: string; status: string; alertLevel: string | null; suggestion: string | null }>) {
  return records.slice(0, 3).flatMap((record, index) => {
    const conversationId = `seed-${appMeta.seq}-conversation-${index + 1}`;
    const topic = `舆情分析 - ${record.code} · ${appMeta.aiExperience.resultType}`.slice(0, 48);
    const base = {
      conversationId,
      topic,
      resultType: appMeta.aiExperience.resultType,
      sourceSummary: `已读取${record.source}，当前情感${record.sentiment}，分类${record.category}。`,
      businessObjectId: record.id,
      businessObjectType: appMeta.sourceObjectName,
      businessObjectTitle: record.code,
      sourceMode: "local" as const,
      saveStatus: index === 0 ? appMeta.aiExperience.savedStatusLabel : "待采纳",
      saveSummary: index === 0 ? appMeta.aiExperience.savedSuccessText : null,
      savedAt: index === 0 ? new Date() : null,
    };

    return [
      {
        ...base,
        turnIndex: 0,
        prompt: appMeta.aiExperience.quickPrompts[index] ?? appMeta.aiPrompt,
        result: [
          `处理对象：${record.code}`,
          `${appMeta.aiExperience.focusAreas[0]}：情感倾向${record.sentiment}，建议重点关注。`,
          `${appMeta.aiExperience.focusAreas[1]}：当前预警等级${record.alertLevel || "无"}，需${record.status}阶段的过程留痕。`,
          `${appMeta.aiExperience.focusAreas[2]}：应对建议${record.suggestion || "待生成"}。`,
        ].join("\n"),
        status: index === 0 ? "已保存" : "已形成初稿",
      },
      {
        ...base,
        turnIndex: 1,
        prompt: `请继续补充${appMeta.aiExperience.focusAreas[3]}与后续动作。`,
        result: [
          `后续动作：继续围绕${record.code}完善${appMeta.aiExperience.focusAreas[3]}。`,
          `执行建议：同步更新处理状态、责任部门和需协调的措施。`,
          `保存提醒：确认后可直接采纳，刷新页面仍可恢复当前会话。`,
        ].join("\n"),
        status: "已形成初稿",
      },
    ];
  });
}

function governanceUsers(now: Date) {
  return [
    {
      username: "admin",
      displayName: "演示管理员",
      department: appMeta.department,
      role: "系统管理员",
      status: "启用",
      lastLoginAt: now,
    },
    {
      username: `${appMeta.seq}-manager`,
      displayName: `${appMeta.shortName}负责人`,
      department: appMeta.department,
      role: "业务负责人",
      status: "启用",
      lastLoginAt: new Date(now.getTime() - 2 * 60 * 60 * 1000),
    },
    {
      username: `${appMeta.seq}-auditor`,
      displayName: "审计复核岗",
      department: appMeta.department,
      role: "审计员",
      status: "停用",
      lastLoginAt: null,
    },
  ];
}

function governanceSettings() {
  return [
    {
      group: "预警设置",
      key: `${appMeta.seq}.alert.red.threshold`,
      label: "红色预警阈值",
      value: "-0.8",
      valueType: "number",
      enabled: true,
      description: `${appMeta.title}情感得分低于此值时触发红色预警。`,
      updatedBy: "演示管理员",
    },
    {
      group: "预警设置",
      key: `${appMeta.seq}.alert.orange.threshold`,
      label: "橙色预警阈值",
      value: "-0.6",
      valueType: "number",
      enabled: true,
      description: `${appMeta.title}情感得分低于此值时触发橙色预警。`,
      updatedBy: "演示管理员",
    },
    {
      group: "通知设置",
      key: `${appMeta.seq}.notice.owner`,
      label: "责任部门提醒",
      value: "开启",
      valueType: "select",
      enabled: true,
      description: "预警触发后提醒责任部门处理。",
      updatedBy: "演示管理员",
    },
    {
      group: "智能分析",
      key: `${appMeta.seq}.ai.enabled`,
      label: "智能分析工作台",
      value: "开启",
      valueType: "boolean",
      enabled: true,
      description: `允许在${appMeta.aiTitle}中发起业务化智能分析和结果采纳。`,
      updatedBy: "演示管理员",
    },
    {
      group: "数据采集",
      key: `${appMeta.seq}.fetch.interval`,
      label: "默认采集间隔",
      value: "3600",
      valueType: "number",
      enabled: true,
      description: "舆情数据采集的默认时间间隔（秒）。",
      updatedBy: "演示管理员",
    },
  ];
}

function governanceAuditLogs(now: Date) {
  return [
    {
      module: "用户管理",
      action: "初始化用户",
      targetType: "管理用户",
      targetName: `${appMeta.shortName}负责人`,
      result: "成功",
      actor: "演示管理员",
      summary: `${appMeta.department}已初始化业务负责人和审计复核岗。`,
      createdAt: now,
    },
    {
      module: "系统设置",
      action: "初始化设置",
      targetType: "业务参数",
      targetName: "预警阈值配置",
      result: "成功",
      actor: "演示管理员",
      summary: `${appMeta.title}预警阈值、提醒规则和智能分析开关已就绪。`,
      createdAt: new Date(now.getTime() - 30 * 60 * 1000),
    },
  ];
}

async function ensureGovernanceData() {
  const now = new Date();
  const [userCount, settingCount, auditCount] = await Promise.all([
    prisma.systemUser.count(),
    prisma.systemSetting.count(),
    prisma.auditLog.count(),
  ]);

  if (userCount === 0) {
    await prisma.systemUser.createMany({ data: governanceUsers(now) });
  }
  if (settingCount === 0) {
    await prisma.systemSetting.createMany({ data: governanceSettings() });
  }
  if (auditCount === 0) {
    await prisma.auditLog.createMany({ data: governanceAuditLogs(now) });
  }
}

export async function ensureSeedData() {
  const recordCount = await prisma.sentimentRecord.count();
  if (recordCount === 0) {
    const now = new Date();
    await prisma.$transaction(async (tx) => {
      const createdRecords: Array<{
        id: string;
        code: string;
        source: string;
        sentiment: string;
        category: string;
        status: string;
        alertLevel: string | null;
        suggestion: string | null;
      }> = [];

      // 创建舆情记录
      for (const record of seedRecords) {
        const item = await tx.sentimentRecord.create({
          data: {
            code: record.code,
            source: record.source,
            sourceUrl: record.sourceUrl,
            content: record.content,
            sentiment: record.sentiment,
            sentimentScore: record.sentimentScore,
            category: record.category,
            keywords: record.keywords,
            projectName: record.projectName,
            alertLevel: record.alertLevel,
            suggestion: record.suggestion,
            status: record.status,
            handler: record.handler,
            handlerDept: record.handlerDept,
          },
        });

        // 创建关联事件
        await tx.sentimentEvent.createMany({
          data: [
            {
              recordId: item.id,
              sourceType: "舆情数据",
              sourceTitle: record.code,
              action: "创建记录",
              actor: record.handler || "系统管理员",
              content: `来自${record.source}的舆情已采集：${record.content.slice(0, 50)}...`,
            },
            {
              recordId: item.id,
              sourceType: "舆情数据",
              sourceTitle: record.code,
              action: "情感分析",
              actor: "AI情感分析",
              content: `情感判断为${record.sentiment}，得分${record.sentimentScore}，分类${record.category}。`,
            },
          ],
        });

        createdRecords.push({
          id: item.id,
          code: item.code,
          source: item.source,
          sentiment: item.sentiment,
          category: item.category,
          status: item.status,
          alertLevel: item.alertLevel,
          suggestion: item.suggestion,
        });
      }

      // 创建预警规则
      for (const rule of seedAlertRules) {
        await tx.alertRule.create({
          data: {
            name: rule.name,
            type: rule.type,
            condition: rule.condition,
            alertLevel: rule.alertLevel,
            enabled: rule.enabled,
            priority: rule.priority,
            description: rule.description,
            createdBy: "演示管理员",
          },
        });
      }

      // 创建数据来源
      for (const ds of seedDataSources) {
        await tx.dataSource.create({
          data: {
            name: ds.name,
            type: ds.type,
            url: ds.url,
            keywords: ds.keywords,
            enabled: ds.enabled,
            interval: ds.interval,
            createdBy: "演示管理员",
          },
        });
      }

      await tx.insight.createMany({ data: [...seedInsights] });
      await tx.integrationLog.createMany({ data: getMockIntegrationHealth() });
      await tx.aiDraft.createMany({
        data: createSeedAiDrafts(createdRecords),
      });
    });
  }

  await ensureGovernanceData();
}

export async function getDashboardSnapshot(): Promise<DashboardSnapshot> {
  await ensureSeedData();

  const [records, events, alerts, alertRules, dataSources, insights, integrations, aiDrafts, systemUsers, auditLogs, systemSettings] = await Promise.all([
    prisma.sentimentRecord.findMany({ orderBy: [{ updatedAt: "desc" }] }),
    prisma.sentimentEvent.findMany({ orderBy: [{ createdAt: "desc" }], take: 12 }),
    prisma.alertRecord.findMany({ orderBy: [{ updatedAt: "desc" }] }),
    prisma.alertRule.findMany({ orderBy: [{ priority: "asc" }] }),
    prisma.dataSource.findMany({ orderBy: [{ updatedAt: "desc" }] }),
    prisma.insight.findMany({ orderBy: [{ createdAt: "desc" }] }),
    prisma.integrationLog.findMany({ orderBy: [{ createdAt: "desc" }] }),
    prisma.aiDraft.findMany({ orderBy: [{ createdAt: "desc" }], take: 24 }),
    prisma.systemUser.findMany({ orderBy: [{ updatedAt: "desc" }] }),
    prisma.auditLog.findMany({ orderBy: [{ createdAt: "desc" }], take: 80 }),
    prisma.systemSetting.findMany({ orderBy: [{ group: "asc" }, { updatedAt: "desc" }] }),
  ]);

  const aiDraftViews = aiDrafts.map((draft) => ({
    ...draft,
    sourceMode: draft.sourceMode as "glm" | "local",
    savedAt: toIso(draft.savedAt),
    createdAt: draft.createdAt.toISOString(),
  }));

  const conversationAccumulator = new Map<string, AiConversationView>();
  for (const draft of aiDraftViews) {
    const existing = conversationAccumulator.get(draft.conversationId);
    if (!existing) {
      conversationAccumulator.set(draft.conversationId, {
        id: draft.conversationId,
        topic: draft.topic,
        businessObjectId: draft.businessObjectId,
        businessObjectType: draft.businessObjectType,
        businessObjectTitle: draft.businessObjectTitle,
        resultType: draft.resultType,
        sourceSummary: draft.sourceSummary,
        latestStatus: draft.status,
        saveStatus: draft.saveStatus,
        lastPrompt: draft.prompt,
        turnCount: 1,
        updatedAt: draft.createdAt,
      });
      continue;
    }

    existing.turnCount += 1;
  }

  return {
    records: records.map((record) => ({
      ...record,
      processedAt: toIso(record.processedAt),
      createdAt: record.createdAt.toISOString(),
      updatedAt: record.updatedAt.toISOString(),
    })),
    events: events.map((event) => ({
      ...event,
      createdAt: event.createdAt.toISOString(),
    })),
    alerts: alerts.map((alert) => ({
      ...alert,
      resolvedAt: toIso(alert.resolvedAt),
      createdAt: alert.createdAt.toISOString(),
      updatedAt: alert.updatedAt.toISOString(),
    })),
    alertRules: alertRules.map((rule) => ({
      ...rule,
      description: rule.description ?? null,
      createdAt: rule.createdAt.toISOString(),
      updatedAt: rule.updatedAt.toISOString(),
    })),
    dataSources: dataSources.map((ds) => ({
      ...ds,
      lastFetchAt: toIso(ds.lastFetchAt),
      createdAt: ds.createdAt.toISOString(),
      updatedAt: ds.updatedAt.toISOString(),
    })),
    insights,
    integrations: integrations.map((log) => ({
      ...log,
      createdAt: log.createdAt.toISOString(),
    })),
    aiDrafts: aiDraftViews,
    aiConversations: Array.from(conversationAccumulator.values()).sort((left, right) => right.updatedAt.localeCompare(left.updatedAt)),
    systemUsers: systemUsers.map((user) => ({
      ...user,
      lastLoginAt: toIso(user.lastLoginAt),
      createdAt: user.createdAt.toISOString(),
      updatedAt: user.updatedAt.toISOString(),
    })),
    auditLogs: auditLogs.map((log) => ({
      ...log,
      createdAt: log.createdAt.toISOString(),
    })),
    systemSettings: systemSettings.map((setting) => ({
      ...setting,
      createdAt: setting.createdAt.toISOString(),
      updatedAt: setting.updatedAt.toISOString(),
    })),
  };
}

export async function getRouteSnapshot(): Promise<DashboardSnapshot> {
  return getDashboardSnapshot();
}
