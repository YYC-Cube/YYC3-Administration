/**
 * @file services/settings-services.ts
 * @description YYC³ Settings Services - Business Logic for Settings Management
 * @author YanYuCloudCube Team <admin@0379.email>
 * @version v1.0.0
 * @created 2026-03-17
 * @updated 2026-03-17
 * @status stable
 * @license MIT
 * @copyright Copyright (c) 2026 YanYuCloudCube Team
 * @tags settings,services,business-logic
 */

import { useSettingsStore } from '../stores/useSettingsStore';

import type { AgentConfig, MCPConfig, ModelConfig, RuleConfig, SkillConfig } from '../types/settings';

/**
 * 账号服务类
 */
export class AccountService {
  /**
   * 更新用户信息
   */
  async updateProfile(profile: {
    username?: string;
    email?: string;
    avatar?: string;
    bio?: string;
    role?: string;
    location?: string;
    website?: string;
  }): Promise<void> {
    const { updateUserProfile } = useSettingsStore.getState();
    updateUserProfile(profile);
  }

  /**
   * 上传头像 (Mock implementation)
   */
  async uploadAvatar(file: File): Promise<string> {
    // Mock 实现 - 实际项目中应该调用真实的上传 API
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        resolve(reader.result as string);
      };
      reader.readAsDataURL(file);
    });
  }

  /**
   * 获取用户信息
   */
  getProfile() {
    const { settings } = useSettingsStore.getState();
    return settings.userProfile;
  }
}

/**
 * 智能体服务类
 */
export class AgentService {
  /**
   * 创建智能体
   */
  async createAgent(agent: Omit<AgentConfig, 'id'>): Promise<AgentConfig> {
    const { addAgent } = useSettingsStore.getState();
    const newAgent: AgentConfig = {
      ...agent,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    addAgent(newAgent);
    return newAgent;
  }

  /**
   * 更新智能体
   */
  async updateAgent(id: string, updates: Partial<AgentConfig>): Promise<void> {
    const { updateAgent } = useSettingsStore.getState();
    updateAgent(id, updates);
  }

  /**
   * 删除智能体
   */
  async deleteAgent(id: string): Promise<void> {
    const { removeAgent } = useSettingsStore.getState();
    removeAgent(id);
  }

  /**
   * 获取所有智能体
   */
  getAgents(): AgentConfig[] {
    const { settings } = useSettingsStore.getState();
    return settings.agents;
  }

  /**
   * 获取内置智能体
   */
  getBuiltInAgents(): AgentConfig[] {
    const { settings } = useSettingsStore.getState();
    return settings.agents.filter((agent) => agent.isBuiltIn);
  }

  /**
   * 获取自定义智能体
   */
  getCustomAgents(): AgentConfig[] {
    const { settings } = useSettingsStore.getState();
    return settings.agents.filter((agent) => agent.isCustom);
  }

  /**
   * 复制智能体
   */
  async duplicateAgent(id: string): Promise<AgentConfig | null> {
    const agents = this.getAgents();
    const original = agents.find((a) => a.id === id);
    if (!original) return null;

    const duplicate: AgentConfig = {
      ...original,
      id: crypto.randomUUID(),
      name: `${original.name} (副本)`,
      isBuiltIn: false,
      isCustom: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const { addAgent } = useSettingsStore.getState();
    addAgent(duplicate);
    return duplicate;
  }
}

/**
 * MCP 服务类
 */
export class MCPService {
  /**
   * 添加 MCP
   */
  async addMCP(mcp: Omit<MCPConfig, 'id'>): Promise<MCPConfig> {
    const { addMCP } = useSettingsStore.getState();
    const newMCP: MCPConfig = {
      ...mcp,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
    };
    addMCP(newMCP);
    return newMCP;
  }

  /**
   * 更新 MCP
   */
  async updateMCP(id: string, updates: Partial<MCPConfig>): Promise<void> {
    const { updateMCP } = useSettingsStore.getState();
    updateMCP(id, updates);
  }

  /**
   * 删除 MCP
   */
  async deleteMCP(id: string): Promise<void> {
    const { removeMCP } = useSettingsStore.getState();
    removeMCP(id);
  }

  /**
   * 获取所有 MCP
   */
  getMCPs(): MCPConfig[] {
    const { settings } = useSettingsStore.getState();
    return settings.mcpConfigs;
  }

  /**
   * 获取项目级 MCP
   */
  getProjectMCPs(): MCPConfig[] {
    const { settings } = useSettingsStore.getState();
    return settings.mcpConfigs.filter((mcp) => mcp.projectLevel);
  }

  /**
   * 从市场添加 MCP (Mock)
   */
  async addFromMarket(marketId: string): Promise<MCPConfig> {
    // Mock 实现
    const mockMCP: Omit<MCPConfig, 'id'> = {
      name: `Market MCP ${marketId}`,
      type: 'market',
      enabled: true,
      projectLevel: false,
      description: '从市场添加的 MCP',
      version: '1.0.0',
    };
    return this.addMCP(mockMCP);
  }
}

/**
 * 模型服务类
 */
export class ModelService {
  /**
   * 添加模型
   */
  async addModel(model: Omit<ModelConfig, 'id'>): Promise<ModelConfig> {
    const { addModel } = useSettingsStore.getState();
    const newModel: ModelConfig = {
      ...model,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
    };
    addModel(newModel);
    return newModel;
  }

  /**
   * 更新模型
   */
  async updateModel(id: string, updates: Partial<ModelConfig>): Promise<void> {
    const { updateModel } = useSettingsStore.getState();
    updateModel(id, updates);
  }

  /**
   * 删除模型
   */
  async deleteModel(id: string): Promise<void> {
    const { removeModel } = useSettingsStore.getState();
    removeModel(id);
  }

  /**
   * 获取所有模型
   */
  getModels(): ModelConfig[] {
    const { settings } = useSettingsStore.getState();
    return settings.models;
  }

  /**
   * 测试模型连接 (Mock)
   */
  async testConnection(id: string): Promise<{ success: boolean; message: string }> {
    // Mock 实现
    await new Promise((resolve) => setTimeout(resolve, 1000));
    return {
      success: true,
      message: '连接成功',
    };
  }
}

/**
 * 规则服务类
 */
export class RuleService {
  /**
   * 创建规则
   */
  async createRule(rule: Omit<RuleConfig, 'id'>): Promise<RuleConfig> {
    const { addRule } = useSettingsStore.getState();
    const newRule: RuleConfig = {
      ...rule,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    addRule(newRule);
    return newRule;
  }

  /**
   * 更新规则
   */
  async updateRule(id: string, updates: Partial<RuleConfig>): Promise<void> {
    const { updateRule } = useSettingsStore.getState();
    updateRule(id, updates);
  }

  /**
   * 删除规则
   */
  async deleteRule(id: string): Promise<void> {
    const { removeRule } = useSettingsStore.getState();
    removeRule(id);
  }

  /**
   * 获取所有规则
   */
  getRules(): RuleConfig[] {
    const { settings } = useSettingsStore.getState();
    return settings.rules;
  }
}

/**
 * 技能服务类
 */
export class SkillService {
  /**
   * 创建技能
   */
  async createSkill(skill: Omit<SkillConfig, 'id'>): Promise<SkillConfig> {
    const { addSkill } = useSettingsStore.getState();
    const newSkill: SkillConfig = {
      ...skill,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    addSkill(newSkill);
    return newSkill;
  }

  /**
   * 更新技能
   */
  async updateSkill(id: string, updates: Partial<SkillConfig>): Promise<void> {
    const { updateSkill } = useSettingsStore.getState();
    updateSkill(id, updates);
  }

  /**
   * 删除技能
   */
  async deleteSkill(id: string): Promise<void> {
    const { removeSkill } = useSettingsStore.getState();
    removeSkill(id);
  }

  /**
   * 获取所有技能
   */
  getSkills(): SkillConfig[] {
    const { settings } = useSettingsStore.getState();
    return settings.skills;
  }
}

// 导出服务实例
export const accountService = new AccountService();
export const agentService = new AgentService();
export const mcpService = new MCPService();
export const modelService = new ModelService();
export const ruleService = new RuleService();
export const skillService = new SkillService();
