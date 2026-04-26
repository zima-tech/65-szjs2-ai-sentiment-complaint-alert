"use client";

import {
  AlertOutlined,
  CheckCircleOutlined,
  DeleteOutlined,
  EditOutlined,
  ExclamationCircleOutlined,
  FileAddOutlined,
  PlusOutlined,
  ReloadOutlined,
  WarningOutlined,
} from "@ant-design/icons";
import {
  App,
  Button,
  Card,
  Col,
  Empty,
  Form,
  Input,
  Modal,
  Progress,
  Row,
  Select,
  Space,
  Statistic,
  Switch,
  Table,
  Tag,
  Timeline,
  Typography,
} from "antd";
import type { ColumnsType } from "antd/es/table";
import { useState, useTransition, useEffect } from "react";
import {
  advanceSentimentRecord,
  createSystemUser,
  createSentimentRecord,
  deleteSentimentRecord,
  resolveAlertRecord,
  toggleSystemSetting,
  toggleSystemUserStatus,
  updateSystemSetting,
  updateSystemUser,
} from "@/app/actions";
import { AgentWorkbench } from "@/components/agent-workbench";
import { ConsoleShell } from "@/components/console-shell";
import {
  appMeta,
  consoleRoutes,
  getAnalysisView,
  getRouteByKey,
  getWorkspaceView,
  seedInsights,
} from "@/lib/domain";
import type {
  AlertRecordView,
  InsightView,
  SentimentRecordView,
  SystemSettingView,
  SystemUserView,
  WorkspaceView,
} from "@/lib/types";
import { advanceFeedback, createFeedback, deleteFeedback } from "@/lib/feedback";
import type {
  AlertRecordInput,
  AnalysisView,
  AuditLogView,
  DashboardSnapshot,
  SentimentRecordInput,
  SystemSettingInput,
  SystemUserInput,
  WorkspaceField,
} from "@/lib/types";

const alertLevelColors: Record<string, string> = {
  红: "red",
  橙: "orange",
  黄: "yellow",
};

const sentimentColors: Record<string, string> = {
  正面: "green",
  中性: "blue",
  负面: "red",
};

const statusColors: Record<string, string> = {
  待处理: "orange",
  处理中: "blue",
  已解决: "green",
  已归档: "default",
};

function buildRecordColumns(view: WorkspaceView): ColumnsType<SentimentRecordView> {
  const columns: ColumnsType<SentimentRecordView> = view.columns.map((column) => {
    if (column.key === "content") {
      return {
        title: column.label,
        dataIndex: "content",
        width: column.width,
        render: (value: string) => (
          <Typography.Text ellipsis={{ tooltip: value }}>{value}</Typography.Text>
        ),
      };
    }
    return {
      title: column.label,
      dataIndex: column.key,
      width: column.width,
      render: (value: string | null, record: SentimentRecordView) => {
        const val = value ?? "";
        if (column.key === "sentiment") {
          return <Tag color={sentimentColors[val as keyof typeof sentimentColors] ?? "default"}>{val}</Tag>;
        }
        if (column.key === "alertLevel") {
          if (!value) return <Typography.Text type="secondary">-</Typography.Text>;
          return <Tag color={alertLevelColors[val as keyof typeof alertLevelColors] ?? "default"}>{val}</Tag>;
        }
        if (column.key === "status") {
          return <Tag color={statusColors[val as keyof typeof statusColors] ?? "default"}>{val}</Tag>;
        }
        if (column.key === "category") {
          return <Tag color="blue">{val}</Tag>;
        }
        return <Typography.Text>{val}</Typography.Text>;
      },
    };
  });

  return columns;
}

function buildAlertColumns(onResolve: (alert: AlertRecordView) => void): ColumnsType<AlertRecordView> {
  return [
    { title: "预警等级", dataIndex: "alertLevel", width: 80, render: (value: string) => <Tag color={alertLevelColors[value] ?? "default"}>{value}</Tag> },
    { title: "预警类型", dataIndex: "alertType", width: 120 },
    { title: "来源", dataIndex: "source", width: 120 },
    { title: "内容摘要", dataIndex: "content", width: 200, render: (value: string) => <Typography.Text ellipsis={{ tooltip: value }}>{value}</Typography.Text> },
    { title: "建议措施", dataIndex: "suggestion", width: 160, render: (value: string) => <Typography.Text ellipsis={{ tooltip: value }}>{value}</Typography.Text> },
    { title: "状态", dataIndex: "status", width: 80, render: (value: string) => <Tag color={statusColors[value] ?? "default"}>{value}</Tag> },
    { title: "处理人", dataIndex: "handler", width: 80 },
    {
      title: "操作",
      key: "action",
      width: 100,
      render: (_, record) => (
        record.status !== "已解决" && (
          <Button size="small" type="primary" onClick={() => onResolve(record)}>
            确认解决
          </Button>
        )
      ),
    },
  ];
}

function renderWorkspaceField(field: WorkspaceField) {
  if (field.type === "select") {
    return <Select options={(field.options ?? []).map((option) => ({ label: option, value: option }))} placeholder={field.placeholder} />;
  }
  if (field.type === "textarea") {
    return <Input.TextArea rows={4} placeholder={field.placeholder} />;
  }
  return <Input placeholder={field.placeholder} />;
}

function renderInsightTile(insight: InsightView, index: number) {
  return (
    <Col xs={24} md={12} xl={8} key={`${insight.title}-${index}`}>
      <div className="insight-tile">
        <Typography.Text strong>{insight.title}</Typography.Text>
        <Typography.Title level={4}>{insight.value}</Typography.Title>
        <Tag color={insight.level === "success" ? "green" : insight.level === "warning" ? "orange" : insight.level === "danger" ? "red" : "blue"}>
          {insight.trend === "up" ? "上升" : insight.trend === "down" ? "下降" : "平稳"}
        </Tag>
      </div>
    </Col>
  );
}

function formatDate(value: string | null) {
  return value ? new Date(value).toLocaleString("zh-CN", { hour12: false }) : "未登录";
}

export function DashboardClient({
  initialSnapshot,
  routeKey,
  currentPath,
}: {
  initialSnapshot: DashboardSnapshot;
  routeKey: string;
  currentPath: string;
}) {
  const { message, modal } = App.useApp();
  const [snapshot, setSnapshot] = useState(initialSnapshot);
  const [pending, startTransition] = useTransition();
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [userModalOpen, setUserModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<SystemUserView | null>(null);
  const [settingModalOpen, setSettingModalOpen] = useState(false);
  const [editingSetting, setEditingSetting] = useState<SystemSettingView | null>(null);
  const [selectedLog, setSelectedLog] = useState<AuditLogView | null>(null);
  const [selectedRecord, setSelectedRecord] = useState<SentimentRecordView | null>(null);
  const [recordDetailOpen, setRecordDetailOpen] = useState(false);
  const [logKeyword, setLogKeyword] = useState("");
  const [logModule, setLogModule] = useState<string | undefined>();
  const [settingGroup, setSettingGroup] = useState<string | undefined>();
  const [form] = Form.useForm<Record<string, string>>();
  const [userForm] = Form.useForm<SystemUserInput>();
  const [settingForm] = Form.useForm<SystemSettingInput>();

  useEffect(() => {
    if (userModalOpen && editingUser) {
      userForm.setFieldsValue({
        username: editingUser.username,
        displayName: editingUser.displayName,
        department: editingUser.department,
        role: editingUser.role,
        status: editingUser.status,
      });
    } else if (userModalOpen && !editingUser) {
      userForm.setFieldsValue({
        username: "",
        displayName: "",
        department: appMeta.department,
        role: "业务人员",
        status: "启用",
      });
    }
  }, [userModalOpen, editingUser, userForm]);

  const route = getRouteByKey(routeKey);
  const workspaceView = route?.kind === "workspace" ? getWorkspaceView(routeKey, snapshot) : null;
  const analysisView = route?.kind === "analysis" ? getAnalysisView(snapshot) : null;

  const negativeCount = snapshot.records.filter((r) => r.sentiment === "负面").length;
  const redAlertCount = snapshot.records.filter((r) => r.alertLevel === "红").length;
  const completionRate = Math.round(
    (snapshot.records.filter((r) => r.status === "已解决" || r.status === "已归档").length / Math.max(snapshot.records.length, 1)) * 100,
  );

  const recordColumns = workspaceView ? buildRecordColumns(workspaceView) : [];
  const alertColumns = buildAlertColumns(handleResolveAlert);

  const logRows = snapshot.auditLogs.filter((log) => {
    const keyword = logKeyword.trim();
    const keywordHit = !keyword || [log.module, log.action, log.targetName, log.actor, log.summary].some((value) => value.includes(keyword));
    const moduleHit = !logModule || log.module === logModule;
    return keywordHit && moduleHit;
  });

  const settingRows = snapshot.systemSettings.filter((setting) => !settingGroup || setting.group === settingGroup);

  function refreshWith(action: Promise<DashboardSnapshot>, successText: string, afterSuccess?: () => void) {
    startTransition(async () => {
      try {
        const nextSnapshot = await action;
        setSnapshot(nextSnapshot);
        afterSuccess?.();
        message.success(successText);
      } catch (error) {
        message.error(error instanceof Error ? error.message : "操作失败，请重试");
      }
    });
  }

  function handleCreateRecord(values: Record<string, string>) {
    const payload: SentimentRecordInput = {
      source: values.source || "未知来源",
      content: values.content || "待补充内容",
      sentiment: values.sentiment || "中性",
      sentimentScore: parseFloat(values.sentimentScore) || 0,
      category: values.category || "询问/建议",
      keywords: values.keywords || "",
      projectName: values.projectName,
      alertLevel: values.alertLevel,
      suggestion: values.suggestion,
    };
    refreshWith(createSentimentRecord(payload), createFeedback(values.category || "舆情"), () => {
      setCreateModalOpen(false);
      form.resetFields();
    });
  }

  function handleAdvanceRecord(record: SentimentRecordView) {
    modal.confirm({
      title: "确认推进状态？",
      icon: <ExclamationCircleOutlined />,
      content: `当前舆情：${record.code}，将从${record.status}推进至下一状态。`,
      okText: "确认推进",
      cancelText: "取消",
      onOk: () => refreshWith(advanceSentimentRecord(record.id), advanceFeedback(nextStatus(record.status))),
    });
  }

  function handleDeleteRecord(record: SentimentRecordView) {
    modal.confirm({
      title: "确认删除该舆情记录？",
      icon: <ExclamationCircleOutlined />,
      content: `删除后将同步移除关联过程记录：${record.code}`,
      okText: "确认删除",
      okButtonProps: { danger: true },
      cancelText: "取消",
      onOk: () => refreshWith(deleteSentimentRecord(record.id), deleteFeedback("舆情")),
    });
  }

  function nextStatus(current: string) {
    const index = appMeta.statuses.indexOf(current as typeof appMeta.statuses[number]);
    return appMeta.statuses[Math.min(index + 1, appMeta.statuses.length - 1)] ?? current;
  }

  function handleResolveAlert(alert: AlertRecordView) {
    modal.confirm({
      title: "确认解决该预警？",
      icon: <CheckCircleOutlined />,
      content: `${alert.alertLevel}级预警：${alert.alertType}，确定已处理完成？`,
      okText: "确认解决",
      cancelText: "取消",
      onOk: () => {
        startTransition(async () => {
          try {
            const next = await resolveAlertRecord(alert.id);
            setSnapshot(next);
            message.success("预警已解决");
          } catch (error) {
            message.error(error instanceof Error ? error.message : "操作失败");
          }
        });
      },
    });
  }

  function openCreateUser() {
    setEditingUser(null);
    userForm.setFieldsValue({
      username: "",
      displayName: "",
      department: appMeta.department,
      role: "业务人员",
      status: "启用",
    });
    setUserModalOpen(true);
  }

  function openEditUser(user: SystemUserView) {
    setEditingUser(user);
    setUserModalOpen(true);
  }

  function handleUserSubmit(values: SystemUserInput) {
    const action = editingUser ? updateSystemUser(editingUser.id, values) : createSystemUser(values);
    refreshWith(action, editingUser ? "用户信息已更新" : "用户已新增", () => {
      setUserModalOpen(false);
      setEditingUser(null);
      userForm.resetFields();
    });
  }

  function handleToggleUser(user: SystemUserView) {
    modal.confirm({
      title: `确认${user.status === "启用" ? "停用" : "启用"}该用户？`,
      icon: <ExclamationCircleOutlined />,
      content: `${user.displayName}（${user.role}）的账号状态将被调整。`,
      okText: "确认",
      cancelText: "取消",
      onOk: () => refreshWith(toggleSystemUserStatus(user.id), "用户状态已更新"),
    });
  }

  function openEditSetting(setting: SystemSettingView) {
    setEditingSetting(setting);
    settingForm.setFieldsValue({
      value: setting.value,
      enabled: setting.enabled,
      updatedBy: "演示管理员",
    });
    setSettingModalOpen(true);
  }

  function handleSettingSubmit(values: SystemSettingInput) {
    if (!editingSetting) return;
    refreshWith(updateSystemSetting(editingSetting.id, values), "系统设置已更新", () => {
      setSettingModalOpen(false);
      setEditingSetting(null);
      settingForm.resetFields();
    });
  }

  function handleToggleSetting(setting: SystemSettingView) {
    modal.confirm({
      title: `确认${setting.enabled ? "停用" : "启用"}该设置？`,
      icon: <ExclamationCircleOutlined />,
      content: `${setting.label}会影响${setting.group}中的相关业务规则。`,
      okText: "确认",
      cancelText: "取消",
      onOk: () => refreshWith(toggleSystemSetting(setting.id), "设置状态已更新"),
    });
  }

  function renderDashboard() {
    return (
      <Space direction="vertical" size={16} className="full-width">
        <Row gutter={[16, 16]}>
          <Col xs={24} md={8}>
            <Card>
              <Statistic title="舆情总数" value={snapshot.records.length} suffix="条" prefix={<FileAddOutlined />} />
            </Card>
          </Col>
          <Col xs={24} md={8}>
            <Card>
              <Statistic title="负面舆情" value={negativeCount} suffix="条" valueStyle={{ color: negativeCount > 0 ? "#d93026" : "#3d9100" }} />
            </Card>
          </Col>
          <Col xs={24} md={8}>
            <Card>
              <Statistic title="红色预警" value={redAlertCount} suffix="条" valueStyle={{ color: redAlertCount > 0 ? "#d93026" : "#3d9100" }} prefix={<WarningOutlined />} />
            </Card>
          </Col>
        </Row>
        <Row gutter={[16, 16]}>
          <Col xs={24} lg={15}>
            <Card
              title="业务洞察"
              extra={
                <Button icon={<ReloadOutlined />} onClick={() => message.info("首页数据已刷新")}>
                  刷新
                </Button>
              }
            >
              <Row gutter={[12, 12]}>
                {seedInsights.map((insight, index) => renderInsightTile(insight, index))}
              </Row>
            </Card>
          </Col>
          <Col xs={24} lg={9}>
            <Card title="处理留痕">
              {snapshot.events.length === 0 ? (
                <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="暂无处理留痕" />
              ) : (
                <Timeline
                  items={snapshot.events.slice(0, 6).map((event) => ({
                    children: (
                      <Space direction="vertical" size={2}>
                        <Typography.Text strong>{event.action}</Typography.Text>
                        <Typography.Text type="secondary">{event.content}</Typography.Text>
                        <Tag color="blue">{event.sourceTitle}</Tag>
                      </Space>
                    ),
                  }))}
                />
              )}
            </Card>
          </Col>
        </Row>
        <Row gutter={[16, 16]}>
          <Col xs={24} lg={12}>
            <Card title="最新舆情">
              <Table
                rowKey="id"
                loading={pending}
                columns={recordColumns.slice(0, 5)}
                dataSource={snapshot.records.slice(0, 5)}
                pagination={false}
                scroll={{ x: 600 }}
                size="small"
              />
            </Card>
          </Col>
          <Col xs={24} lg={12}>
            <Card title="预警记录">
              <Table
                rowKey="id"
                loading={pending}
                columns={alertColumns.slice(0, 5)}
                dataSource={snapshot.alerts.slice(0, 5)}
                pagination={false}
                scroll={{ x: 600 }}
                size="small"
              />
            </Card>
          </Col>
        </Row>
      </Space>
    );
  }

  function renderWorkspace(view: WorkspaceView, isAlertView = false) {
    if (isAlertView) {
      return (
        <Space direction="vertical" size={16} className="full-width">
          <Row gutter={[16, 16]}>
            {view.metrics.map((metric) => (
              <Col xs={24} md={12} xl={6} key={metric.label}>
                <Card>
                  <Statistic title={metric.label} value={metric.value} />
                  {metric.helper ? <Typography.Text type="secondary">{metric.helper}</Typography.Text> : null}
                </Card>
              </Col>
            ))}
          </Row>
          <Card title={view.title} extra={<Typography.Text type="secondary">{view.description}</Typography.Text>}>
            <Table
              rowKey="id"
              loading={pending}
              columns={alertColumns}
              dataSource={view.rows as AlertRecordView[]}
              locale={{ emptyText: view.emptyDescription }}
              scroll={{ x: 1180 }}
              pagination={{ pageSize: 8, showSizeChanger: false }}
            />
          </Card>
          {view.timeline?.length ? (
            <Card title={view.timelineTitle}>
              <Timeline
                items={view.timeline.map((item) => ({
                  children: (
                    <Space direction="vertical" size={2}>
                      <Typography.Text strong>{item.title}</Typography.Text>
                      <Typography.Text type="secondary">{item.description}</Typography.Text>
                      {item.tag ? <Tag color="blue">{item.tag}</Tag> : null}
                    </Space>
                  ),
                }))}
              />
            </Card>
          ) : null}
        </Space>
      );
    }

    return (
      <>
        <Space direction="vertical" size={16} className="full-width">
          <Row gutter={[16, 16]}>
            {view.metrics.map((metric) => (
              <Col xs={24} md={12} xl={6} key={metric.label}>
                <Card>
                  <Statistic title={metric.label} value={metric.value} />
                  {metric.helper ? <Typography.Text type="secondary">{metric.helper}</Typography.Text> : null}
                </Card>
              </Col>
            ))}
          </Row>

          <Card
            title={view.title}
            extra={
              <Space>
                <Typography.Text type="secondary">{view.description}</Typography.Text>
                <Button type="primary" icon={<PlusOutlined />} onClick={() => setCreateModalOpen(true)}>
                  新增舆情
                </Button>
              </Space>
            }
          >
            <Table
              rowKey="id"
              loading={pending}
              columns={recordColumns}
              dataSource={view.rows as SentimentRecordView[]}
              locale={{ emptyText: view.emptyDescription }}
              scroll={{ x: 1180 }}
              pagination={{ pageSize: 8, showSizeChanger: false }}
              onRow={(record) => ({
                onClick: () => {
                  setSelectedRecord(record);
                  setRecordDetailOpen(true);
                },
                style: { cursor: "pointer" },
              })}
            />
          </Card>

          {view.timeline?.length ? (
            <Card title={view.timelineTitle}>
              <Timeline
                items={view.timeline.map((item) => ({
                  children: (
                    <Space direction="vertical" size={2}>
                      <Typography.Text strong>{item.title}</Typography.Text>
                      <Typography.Text type="secondary">{item.description}</Typography.Text>
                    </Space>
                  ),
                }))}
              />
            </Card>
          ) : null}
        </Space>

        <Modal
          title={view.formTitle ?? "新增舆情"}
          open={createModalOpen}
          onCancel={() => setCreateModalOpen(false)}
          okText="提交"
          cancelText="取消"
          confirmLoading={pending}
          onOk={() => form.submit()}
          destroyOnHidden
        >
          <Form form={form} layout="vertical" onFinish={handleCreateRecord} preserve={false}>
            <Form.Item name="source" label="来源" rules={[{ required: true, message: "请输入来源" }]}>
              <Input placeholder="例如：清江社区论坛" />
            </Form.Item>
            <Form.Item name="content" label="舆情内容" rules={[{ required: true, message: "请输入舆情内容" }]}>
              <Input.TextArea rows={3} placeholder="请输入舆情内容" />
            </Form.Item>
            <Form.Item name="category" label="舆情分类" rules={[{ required: true, message: "请选择分类" }]}>
              <Select options={appMeta.categories.map((c) => ({ label: c, value: c }))} />
            </Form.Item>
            <Form.Item name="sentiment" label="情感倾向" rules={[{ required: true, message: "请选择情感" }]}>
              <Select options={appMeta.sentiments.map((s) => ({ label: s, value: s }))} />
            </Form.Item>
            <Form.Item name="sentimentScore" label="情感得分" initialValue="-0.5">
              <Input type="number" step="0.1" min="-1" max="1" placeholder="-1.0 ~ 1.0" />
            </Form.Item>
            <Form.Item name="alertLevel" label="预警等级">
              <Select allowClear options={appMeta.alertLevels.map((a) => ({ label: a, value: a }))} placeholder="可选择预警等级" />
            </Form.Item>
            <Form.Item name="keywords" label="关键词">
              <Input placeholder="多个关键词用逗号分隔" />
            </Form.Item>
            <Form.Item name="projectName" label="涉及项目">
              <Input placeholder="例如：清江路工程" />
            </Form.Item>
            <Form.Item name="suggestion" label="建议措施">
              <Input.TextArea rows={2} placeholder="可输入建议措施" />
            </Form.Item>
          </Form>
        </Modal>

        <Modal
          title={`舆情详情 - ${selectedRecord?.code ?? ""}`}
          open={recordDetailOpen}
          onCancel={() => setRecordDetailOpen(false)}
          footer={[
            <Button key="close" onClick={() => setRecordDetailOpen(false)}>
              关闭
            </Button>,
            <Button
              key="advance"
              type="primary"
              loading={pending}
              onClick={() => {
                if (selectedRecord) {
                  handleAdvanceRecord(selectedRecord);
                  setRecordDetailOpen(false);
                }
              }}
            >
              推进状态
            </Button>,
          ]}
          width={600}
          destroyOnHidden
        >
          {selectedRecord && (
            <Space direction="vertical" size={16} className="full-width">
              <Row gutter={[16, 8]}>
                <Col span={12}>
                  <Typography.Text type="secondary">来源</Typography.Text>
                  <Typography.Paragraph style={{ marginBottom: 0 }}>{selectedRecord.source}</Typography.Paragraph>
                </Col>
                <Col span={12}>
                  <Typography.Text type="secondary">舆情分类</Typography.Text>
                  <Typography.Paragraph style={{ marginBottom: 0 }}>
                    <Tag color="blue">{selectedRecord.category}</Tag>
                  </Typography.Paragraph>
                </Col>
              </Row>
              <div>
                <Typography.Text type="secondary">舆情内容</Typography.Text>
                <Typography.Paragraph style={{ marginBottom: 0 }}>{selectedRecord.content}</Typography.Paragraph>
              </div>
              <Row gutter={[16, 8]}>
                <Col span={8}>
                  <Typography.Text type="secondary">情感倾向</Typography.Text>
                  <Typography.Paragraph style={{ marginBottom: 0 }}>
                    <Tag color={sentimentColors[selectedRecord.sentiment] ?? "default"}>{selectedRecord.sentiment}</Tag>
                  </Typography.Paragraph>
                </Col>
                <Col span={8}>
                  <Typography.Text type="secondary">情感强度</Typography.Text>
                  <Typography.Paragraph style={{ marginBottom: 0 }}>{selectedRecord.sentimentScore}</Typography.Paragraph>
                </Col>
                <Col span={8}>
                  <Typography.Text type="secondary">预警等级</Typography.Text>
                  <Typography.Paragraph style={{ marginBottom: 0 }}>
                    {selectedRecord.alertLevel ? (
                      <Tag color={alertLevelColors[selectedRecord.alertLevel] ?? "default"}>{selectedRecord.alertLevel}</Tag>
                    ) : (
                      <Typography.Text type="secondary">-</Typography.Text>
                    )}
                  </Typography.Paragraph>
                </Col>
              </Row>
              <Row gutter={[16, 8]}>
                <Col span={12}>
                  <Typography.Text type="secondary">处理状态</Typography.Text>
                  <Typography.Paragraph style={{ marginBottom: 0 }}>
                    <Tag color={statusColors[selectedRecord.status] ?? "default"}>{selectedRecord.status}</Tag>
                  </Typography.Paragraph>
                </Col>
                <Col span={12}>
                  <Typography.Text type="secondary">涉及项目</Typography.Text>
                  <Typography.Paragraph style={{ marginBottom: 0 }}>
                    {selectedRecord.projectName || <Typography.Text type="secondary">-</Typography.Text>}
                  </Typography.Paragraph>
                </Col>
              </Row>
              {selectedRecord.keywords && (
                <div>
                  <Typography.Text type="secondary">关键词</Typography.Text>
                  <Typography.Paragraph style={{ marginBottom: 0 }}>
                    {selectedRecord.keywords.split(",").map((kw) => kw.trim()).filter(Boolean).map((kw) => (
                      <Tag key={kw} style={{ marginRight: 4 }}>{kw}</Tag>
                    ))}
                  </Typography.Paragraph>
                </div>
              )}
              {selectedRecord.suggestion && (
                <div>
                  <Typography.Text type="secondary">建议措施</Typography.Text>
                  <Typography.Paragraph style={{ marginBottom: 0 }}>{selectedRecord.suggestion}</Typography.Paragraph>
                </div>
              )}
            </Space>
          )}
        </Modal>
      </>
    );
  }

  function renderAnalysis(view: AnalysisView) {
    return (
      <Space direction="vertical" size={16} className="full-width">
        <Row gutter={[16, 16]}>
          {view.metrics.map((metric) => (
            <Col xs={24} md={12} xl={6} key={metric.label}>
              <Card>
                <Statistic title={metric.label} value={metric.value} />
                {metric.helper ? <Typography.Text type="secondary">{metric.helper}</Typography.Text> : null}
              </Card>
            </Col>
          ))}
        </Row>
        <Card title={view.title}>
          <Space direction="vertical" size={10} className="full-width">
            <Typography.Text type="secondary">{view.description}</Typography.Text>
            {view.highlights.map((highlight) => (
              <Tag key={highlight} color="blue">
                {highlight}
              </Tag>
            ))}
          </Space>
        </Card>
        {view.tables.map((table) => (
          <Card key={table.title} title={table.title}>
            <Table
              rowKey={(row) => JSON.stringify(row)}
              pagination={false}
              dataSource={table.rows}
              columns={table.columns.map((column) => ({
                title: column.label,
                dataIndex: column.key,
                key: column.key,
                render: (value: string) => <Typography.Text>{value}</Typography.Text>,
              }))}
            />
          </Card>
        ))}
      </Space>
    );
  }

  function renderUsers() {
    const columns: ColumnsType<SystemUserView> = [
      { title: "账号", dataIndex: "username", width: 150 },
      { title: "姓名", dataIndex: "displayName", width: 150 },
      { title: "部门", dataIndex: "department", width: 180 },
      { title: "角色", dataIndex: "role", width: 140, render: (value) => <Tag color="blue">{value}</Tag> },
      { title: "状态", dataIndex: "status", width: 100, render: (value) => <Tag color={value === "启用" ? "green" : "default"}>{value}</Tag> },
      { title: "最近登录", dataIndex: "lastLoginAt", width: 180, render: formatDate },
      {
        title: "操作",
        key: "action",
        width: 180,
        render: (_, record) => (
          <Space>
            <Button size="small" icon={<EditOutlined />} onClick={() => openEditUser(record)}>
              编辑
            </Button>
            <Button size="small" danger={record.status === "启用"} onClick={() => handleToggleUser(record)}>
              {record.status === "启用" ? "停用" : "启用"}
            </Button>
          </Space>
        ),
      },
    ];

    return (
      <>
        <Card
          title="用户管理"
          extra={
            <Button type="primary" icon={<PlusOutlined />} onClick={openCreateUser}>
              新增用户
            </Button>
          }
        >
          <Table
            rowKey="id"
            loading={pending}
            columns={columns}
            dataSource={snapshot.systemUsers}
            locale={{ emptyText: "暂无用户，请新增管理账号" }}
            scroll={{ x: 980 }}
            pagination={{ pageSize: 8, showSizeChanger: false }}
          />
        </Card>
        <Modal
          title={editingUser ? "编辑用户" : "新增用户"}
          open={userModalOpen}
          onCancel={() => setUserModalOpen(false)}
          okText="保存"
          cancelText="取消"
          confirmLoading={pending}
          onOk={() => userForm.submit()}
          destroyOnHidden
        >
          <Form<SystemUserInput> key={editingUser?.id || 'new'} form={userForm} layout="vertical" onFinish={handleUserSubmit} preserve={false}>
            <Form.Item name="username" label="登录账号" rules={[{ required: true, message: "请输入登录账号" }]}>
              <Input placeholder="例如：admin" />
            </Form.Item>
            <Form.Item name="displayName" label="用户姓名" rules={[{ required: true, message: "请输入用户姓名" }]}>
              <Input placeholder="例如：业务管理员" />
            </Form.Item>
            <Form.Item name="department" label="所属部门" rules={[{ required: true, message: "请输入所属部门" }]}>
              <Input />
            </Form.Item>
            <Form.Item name="role" label="角色" rules={[{ required: true, message: "请选择角色" }]}>
              <Select options={["系统管理员", "业务负责人", "业务人员", "审计员"].map((value) => ({ label: value, value }))} />
            </Form.Item>
            <Form.Item name="status" label="账号状态" rules={[{ required: true, message: "请选择账号状态" }]}>
              <Select options={["启用", "停用"].map((value) => ({ label: value, value }))} />
            </Form.Item>
          </Form>
        </Modal>
      </>
    );
  }

  function renderAuditLogs() {
    const modules = Array.from(new Set(snapshot.auditLogs.map((log) => log.module)));
    const columns: ColumnsType<AuditLogView> = [
      { title: "时间", dataIndex: "createdAt", width: 180, render: formatDate },
      { title: "模块", dataIndex: "module", width: 130, render: (value) => <Tag color="blue">{value}</Tag> },
      { title: "动作", dataIndex: "action", width: 150 },
      { title: "对象", dataIndex: "targetName", width: 220 },
      { title: "结果", dataIndex: "result", width: 100, render: (value) => <Tag color={value === "成功" ? "green" : "orange"}>{value}</Tag> },
      { title: "操作人", dataIndex: "actor", width: 130 },
      {
        title: "操作",
        key: "action",
        width: 100,
        render: (_, record) => (
          <Button size="small" onClick={() => setSelectedLog(record)}>
            详情
          </Button>
        ),
      },
    ];

    return (
      <>
        <Card
          title="日志审计"
          extra={
            <Space wrap>
              <Input.Search allowClear placeholder="搜索对象、操作人或摘要" onSearch={setLogKeyword} onChange={(event) => setLogKeyword(event.target.value)} style={{ width: 240 }} />
              <Select
                allowClear
                placeholder="筛选模块"
                value={logModule}
                onChange={setLogModule}
                style={{ width: 180 }}
                options={modules.map((module) => ({ label: module, value: module }))}
              />
            </Space>
          }
        >
          <Table
            rowKey="id"
            columns={columns}
            dataSource={logRows}
            locale={{ emptyText: "暂无匹配的审计日志" }}
            scroll={{ x: 1080 }}
            pagination={{ pageSize: 10, showSizeChanger: false }}
          />
        </Card>
        <Modal title="日志详情" open={Boolean(selectedLog)} onCancel={() => setSelectedLog(null)} footer={null} destroyOnHidden>
          {selectedLog ? (
            <Space direction="vertical" size={10} className="full-width">
              <Typography.Text strong>{selectedLog.action}</Typography.Text>
              <Typography.Text>模块：{selectedLog.module}</Typography.Text>
              <Typography.Text>对象：{selectedLog.targetType} / {selectedLog.targetName}</Typography.Text>
              <Typography.Text>操作人：{selectedLog.actor}</Typography.Text>
              <Typography.Text>结果：{selectedLog.result}</Typography.Text>
              <Typography.Text type="secondary">{selectedLog.summary}</Typography.Text>
            </Space>
          ) : null}
        </Modal>
      </>
    );
  }

  function renderSettings() {
    const groups = Array.from(new Set(snapshot.systemSettings.map((setting) => setting.group)));
    const columns: ColumnsType<SystemSettingView> = [
      { title: "分组", dataIndex: "group", width: 120, render: (value) => <Tag color="blue">{value}</Tag> },
      { title: "设置项", dataIndex: "label", width: 180 },
      { title: "当前值", dataIndex: "value", width: 160 },
      { title: "状态", dataIndex: "enabled", width: 100, render: (value) => <Tag color={value ? "green" : "default"}>{value ? "启用" : "停用"}</Tag> },
      { title: "说明", dataIndex: "description", width: 320 },
      { title: "更新人", dataIndex: "updatedBy", width: 130 },
      {
        title: "操作",
        key: "action",
        width: 180,
        render: (_, record) => (
          <Space>
            <Button size="small" icon={<EditOutlined />} onClick={() => openEditSetting(record)}>
              编辑
            </Button>
            <Button size="small" danger={record.enabled} onClick={() => handleToggleSetting(record)}>
              {record.enabled ? "停用" : "启用"}
            </Button>
          </Space>
        ),
      },
    ];

    return (
      <>
        <Card
          title="系统设置"
          extra={
            <Select
              allowClear
              placeholder="筛选分组"
              value={settingGroup}
              onChange={setSettingGroup}
              style={{ width: 180 }}
              options={groups.map((group) => ({ label: group, value: group }))}
            />
          }
        >
          <Table
            rowKey="id"
            loading={pending}
            columns={columns}
            dataSource={settingRows}
            locale={{ emptyText: "暂无匹配的系统设置" }}
            scroll={{ x: 1180 }}
            pagination={{ pageSize: 8, showSizeChanger: false }}
          />
        </Card>
        <Modal
          title={editingSetting?.label ?? "编辑设置"}
          open={settingModalOpen}
          onCancel={() => setSettingModalOpen(false)}
          okText="保存"
          cancelText="取消"
          confirmLoading={pending}
          onOk={() => settingForm.submit()}
          destroyOnHidden
        >
          <Form<SystemSettingInput> form={settingForm} layout="vertical" onFinish={handleSettingSubmit} preserve={false}>
            <Form.Item name="value" label="设置值" rules={[{ required: true, message: "请输入设置值" }]}>
              <Input />
            </Form.Item>
            <Form.Item name="enabled" label="启用状态" valuePropName="checked">
              <Switch checkedChildren="启用" unCheckedChildren="停用" />
            </Form.Item>
            <Form.Item name="updatedBy" label="更新人" initialValue="演示管理员" rules={[{ required: true, message: "请输入更新人" }]}>
              <Input />
            </Form.Item>
          </Form>
        </Modal>
      </>
    );
  }

  return (
    <ConsoleShell currentPath={currentPath}>
      {!route || route.kind === "dashboard"
        ? renderDashboard()
        : route.kind === "users"
          ? renderUsers()
          : route.kind === "auditLogs"
            ? renderAuditLogs()
            : route.kind === "settings"
              ? renderSettings()
              : route.kind === "assistant"
                ? <AgentWorkbench snapshot={snapshot} disabled={pending} onSnapshotChange={setSnapshot} />
                : route.kind === "analysis" && analysisView
                  ? renderAnalysis(analysisView)
                  : workspaceView
                    ? renderWorkspace(workspaceView, routeKey === "alert")
                    : null}
    </ConsoleShell>
  );
}
