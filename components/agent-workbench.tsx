"use client";

import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  DeleteOutlined,
  FileTextOutlined,
  LoadingOutlined,
  PlusOutlined,
  RobotOutlined,
  SendOutlined,
} from "@ant-design/icons";
import { App, Button, Card, Empty, Input, List, Space, Spin, Tag, Typography } from "antd";
import { useState, useTransition } from "react";
import { generateAiDraft, saveAiDraft } from "@/app/actions";
import { appMeta } from "@/lib/domain";
import type { AiConversationView, DashboardSnapshot } from "@/lib/types";

interface AgentWorkbenchProps {
  snapshot: DashboardSnapshot;
  disabled: boolean;
  onSnapshotChange: (snapshot: DashboardSnapshot) => void;
}

export function AgentWorkbench({ snapshot, disabled, onSnapshotChange }: AgentWorkbenchProps) {
  const { message } = App.useApp();
  const [pending, startTransition] = useTransition();
  const [prompt, setPrompt] = useState("");
  const [generating, setGenerating] = useState(false);
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null);

  const records = snapshot.records;
  const aiConversations = snapshot.aiConversations;
  const aiDrafts = snapshot.aiDrafts.filter(
    (draft) => !currentConversationId || draft.conversationId === currentConversationId
  );

  function handleGenerate() {
    if (!prompt.trim()) {
      message.warning("请先输入需要分析的舆情问题");
      return;
    }

    if (records.length === 0) {
      message.warning("暂无舆情记录可关联，请先添加舆情数据");
      return;
    }

    setGenerating(true);
    startTransition(async () => {
      try {
        const record = records[0];
        const result = await generateAiDraft({
          prompt,
          businessObjectId: record.id,
          conversationId: currentConversationId,
        });
        setCurrentConversationId(result.conversationId);
        onSnapshotChange(result.snapshot);
        setPrompt("");
        message.success("智能分析已完成");
      } catch (error) {
        message.error(error instanceof Error ? error.message : "智能分析失败");
      } finally {
        setGenerating(false);
      }
    });
  }

  function handleSave(draftId: string) {
    startTransition(async () => {
      try {
        const result = await saveAiDraft({ draftId });
        onSnapshotChange(result.snapshot);
        message.success("分析结果已采纳并同步");
      } catch (error) {
        message.error(error instanceof Error ? error.message : "结果采纳失败");
      }
    });
  }

  function handleNewConversation() {
    setCurrentConversationId(null);
    setPrompt("");
  }

  function handleBackToHistory() {
    setCurrentConversationId(null);
  }

  return (
    <Space direction="vertical" size={16} className="full-width">
      <Card
        title={
          <Space>
            <RobotOutlined />
            <span>{appMeta.aiTitle}</span>
          </Space>
        }
        extra={
          <Space>
            <Button size="small" icon={<PlusOutlined />} onClick={handleNewConversation} disabled={pending}>
              新建对话
            </Button>
          </Space>
        }
      >
        <Space direction="vertical" size={12} className="full-width">
          <Typography.Text type="secondary">{appMeta.aiExperience.emptyDescription}</Typography.Text>
          <Space.Compact className="full-width">
            <Input.TextArea
              placeholder="输入舆情分析问题，例如：请判断该舆情的情感倾向、分类和预警等级..."
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              rows={2}
              disabled={disabled || generating}
            />
            <Button
              type="primary"
              icon={<SendOutlined />}
              loading={generating || pending}
              onClick={handleGenerate}
              disabled={disabled || !prompt.trim()}
              style={{ height: "auto" }}
            >
              分析
            </Button>
          </Space.Compact>
        </Space>
      </Card>

      {aiConversations.length > 0 && !currentConversationId && (
        <Card title="历史对话" size="small">
          <List
            size="small"
            dataSource={aiConversations.slice(0, 5)}
            renderItem={(conversation) => (
              <List.Item
                key={conversation.id}
                onClick={() => setCurrentConversationId(conversation.id)}
                style={{ cursor: "pointer" }}
              >
                <Space>
                  <FileTextOutlined />
                  <Typography.Text>{conversation.topic}</Typography.Text>
                  <Tag color={conversation.saveStatus === appMeta.aiExperience.savedStatusLabel ? "green" : "blue"}>
                    {conversation.saveStatus}
                  </Tag>
                </Space>
              </List.Item>
            )}
          />
        </Card>
      )}

      {currentConversationId && (
        <Card title="分析结果" size="small" extra={
          <Button size="small" icon={<FileTextOutlined />} onClick={handleBackToHistory}>
            返回历史对话
          </Button>
        }>
          {aiDrafts.length === 0 ? (
            <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="暂无分析结果" />
          ) : (
            <List
              size="small"
              dataSource={aiDrafts}
              renderItem={(draft) => (
                <List.Item
                  key={draft.id}
                  extra={
                    draft.saveStatus !== appMeta.aiExperience.savedStatusLabel && (
                      <Button
                        type="primary"
                        size="small"
                        icon={<CheckCircleOutlined />}
                        onClick={() => handleSave(draft.id)}
                        loading={pending}
                      >
                        采纳
                      </Button>
                    )
                  }
                >
                  <Space direction="vertical" size={4} className="full-width">
                    <Space>
                      <Tag color={draft.sourceMode === "glm" ? "green" : "blue"}>
                        {draft.sourceMode === "glm" ? "AI生成" : "本地分析"}
                      </Tag>
                      <Tag color={draft.saveStatus === appMeta.aiExperience.savedStatusLabel ? "green" : "orange"}>
                        {draft.saveStatus}
                      </Tag>
                    </Space>
                    <Typography.Text code style={{ whiteSpace: "pre-wrap" }}>
                      {draft.prompt}
                    </Typography.Text>
                    <Typography.Paragraph style={{ marginBottom: 0 }}>{draft.result}</Typography.Paragraph>
                  </Space>
                </List.Item>
              )}
            />
          )}
        </Card>
      )}

      <Card title="快速提示" size="small">
        <Space wrap>
          {appMeta.aiExperience.quickPrompts.map((qp, index) => (
            <Tag
              key={index}
              style={{ cursor: "pointer" }}
              onClick={() => setPrompt(qp)}
            >
              {qp}
            </Tag>
          ))}
        </Space>
      </Card>
    </Space>
  );
}
