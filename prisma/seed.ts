import { PrismaClient } from "@prisma/client";
import { appMeta, seedAlertRules, seedDataSources, seedInsights, seedRecords } from "../lib/domain";
import { getMockIntegrationHealth } from "../lib/mock-integrations";

const prisma = new PrismaClient();

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

async function main() {
  // 清理旧数据
  await prisma.auditLog.deleteMany();
  await prisma.systemSetting.deleteMany();
  await prisma.systemUser.deleteMany();
  await prisma.sentimentEvent.deleteMany();
  await prisma.aiDraft.deleteMany();
  await prisma.integrationLog.deleteMany();
  await prisma.insight.deleteMany();
  await prisma.alertRule.deleteMany();
  await prisma.dataSource.deleteMany();
  await prisma.sentimentRecord.deleteMany();
  await prisma.alertRecord.deleteMany();

  const now = new Date();
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

  console.log("开始创建舆情记录...");

  // 创建舆情记录
  for (const record of seedRecords) {
    const item = await prisma.sentimentRecord.create({
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
    await prisma.sentimentEvent.createMany({
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

    console.log(`已创建: ${item.code}`);
  }

  console.log("创建预警规则...");

  // 创建预警规则
  for (const rule of seedAlertRules) {
    await prisma.alertRule.create({
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

  console.log("创建数据来源...");

  // 创建数据来源
  for (const ds of seedDataSources) {
    await prisma.dataSource.create({
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

  console.log("创建业务洞察...");

  await prisma.insight.createMany({ data: [...seedInsights] });
  await prisma.integrationLog.createMany({ data: getMockIntegrationHealth() });

  console.log("创建AI对话草稿...");

  // 创建AI草稿
  await prisma.aiDraft.createMany({
    data: createdRecords.slice(0, 3).flatMap((record, index) => {
      const conversationId = `seed-${appMeta.seq}-conversation-${index + 1}`;
      const base = {
        conversationId,
        topic: `舆情分析 - ${record.code} · ${appMeta.aiExperience.resultType}`.slice(0, 48),
        resultType: appMeta.aiExperience.resultType,
        sourceSummary: `已读取${record.source}，当前情感${record.sentiment}，分类${record.category}。`,
        businessObjectId: record.id,
        businessObjectType: appMeta.sourceObjectName,
        businessObjectTitle: record.code,
        sourceMode: "local",
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
    }),
  });

  console.log("创建系统用户...");

  await prisma.systemUser.createMany({ data: governanceUsers(now) });
  await prisma.systemSetting.createMany({ data: governanceSettings() });
  await prisma.auditLog.createMany({
    data: [
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
    ],
  });

  console.log("种子数据创建完成！");
  console.log(`- 舆情记录: ${createdRecords.length} 条`);
  console.log(`- 预警规则: ${seedAlertRules.length} 条`);
  console.log(`- 数据来源: ${seedDataSources.length} 条`);
  console.log(`- 业务洞察: ${seedInsights.length} 条`);
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
