/**
 * @file components/settings/agents-settings-panel.tsx
 * @description Agents Settings Panel - AI Agent Management
 * @author YanYuCloudCube Team <admin@0379.email>
 * @version v1.0.0
 * @created 2026-03-17
 * @updated 2026-03-17
 * @status stable
 * @license MIT
 * @copyright Copyright (c) 2026 YanYuCloudCube Team
 * @tags settings,agents,ai
 */

import { Bot, Copy, Edit, Plus, Trash2 } from 'lucide-react';
import { motion } from 'motion/react';
import { useState } from 'react';

import { useThemeColors } from '../hooks/use-theme-colors';

import { agentService } from '@/services/settings-services';
import { useSettingsStore } from '@/stores/useSettingsStore';

export function AgentsSettingsPanel() {
  const tc = useThemeColors();
  const { settings } = useSettingsStore();
  const { agents } = settings;

  const [isCreating, setIsCreating] = useState(false);

  const handleCreateAgent = async () => {
    await agentService.createAgent({
      name: '新智能体',
      description: '自定义智能体',
      systemPrompt: '',
      model: 'gpt-4',
      temperature: 0.7,
      maxTokens: 2000,
      isBuiltIn: false,
      isCustom: true,
      enabled: true,
    });
  };

  return (
    <div className="space-y-6">
      {/* 标题和创建按钮 */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold mb-2" style={{ color: tc.primary }}>
            智能体管理
          </h2>
          <p style={{ color: tc.textSecondary }}>
            配置和管理AI智能体 ({agents.length} 个)
          </p>
        </div>
        <button
          onClick={handleCreateAgent}
          className="px-4 py-2 rounded-lg flex items-center gap-2 transition-transform hover:scale-105"
          style={{
            background: tc.gradientButton,
            color: tc.textPrimary,
            boxShadow: tc.shadowMd,
          }}
        >
          <Plus size={18} />
          创建智能体
        </button>
      </div>

      {/* 智能体列表 */}
      <div className="grid gap-4">
        {agents.length === 0 ? (
          <div
            className="p-12 rounded-xl text-center"
            style={{
              background: tc.bgElevated,
              border: `1px solid ${tc.borderSubtle}`,
            }}
          >
            <Bot size={48} style={{ color: tc.textMuted }} className="mx-auto mb-4" />
            <p style={{ color: tc.textMuted }}>暂无智能体，点击上方按钮创建</p>
          </div>
        ) : (
          agents.map((agent, index) => (
            <AgentCard key={agent.id} agent={agent} index={index} tc={tc} />
          ))
        )}
      </div>
    </div>
  );
}

// 智能体卡片组件
function AgentCard({ agent, index, tc }: any) {
  const handleEdit = () => {
    // TODO: 打开编辑对话框
  };

  const handleDelete = async () => {
    if (confirm(`确定删除智能体 "${agent.name}" 吗？`)) {
      await agentService.deleteAgent(agent.id);
    }
  };

  const handleDuplicate = async () => {
    await agentService.duplicateAgent(agent.id);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className="p-6 rounded-xl"
      style={{
        background: tc.bgElevated,
        border: `1px solid ${tc.borderDefault}`,
      }}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-4 flex-1">
          <div
            className="p-3 rounded-lg"
            style={{
              background: tc.alpha(tc.primary, 0.1),
              color: tc.primary,
            }}
          >
            <Bot size={24} />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-semibold" style={{ color: tc.textPrimary }}>
                {agent.name}
              </h3>
              {agent.isBuiltIn && (
                <span
                  className="text-xs px-2 py-0.5 rounded"
                  style={{
                    background: tc.alpha(tc.accent, 0.2),
                    color: tc.accent,
                  }}
                >
                  内置
                </span>
              )}
            </div>
            {agent.description && (
              <p className="text-sm mb-2" style={{ color: tc.textSecondary }}>
                {agent.description}
              </p>
            )}
            <div className="flex items-center gap-4 text-xs" style={{ color: tc.textMuted }}>
              <span>模型: {agent.model}</span>
              <span>温度: {agent.temperature}</span>
              <span>最大Token: {agent.maxTokens}</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleDuplicate}
            className="p-2 rounded-lg transition-colors hover:bg-opacity-20"
            style={{ color: tc.accent }}
            title="复制"
          >
            <Copy size={16} />
          </button>
          <button
            onClick={handleEdit}
            className="p-2 rounded-lg transition-colors hover:bg-opacity-20"
            style={{ color: tc.primary }}
            title="编辑"
          >
            <Edit size={16} />
          </button>
          {!agent.isBuiltIn && (
            <button
              onClick={handleDelete}
              className="p-2 rounded-lg transition-colors hover:bg-opacity-20"
              style={{ color: tc.danger }}
              title="删除"
            >
              <Trash2 size={16} />
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
}
