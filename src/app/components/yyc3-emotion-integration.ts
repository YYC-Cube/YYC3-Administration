/**
 * @file yyc3-emotion-integration.ts
 * @description YYC³ 情感引擎集成 — 将 @yyc3/emotion 1.0.0 接入员工关怀模块
 * 
 * 功能：
 * - 多模态情感识别（文本/语音/视觉）
 * - 情感状态追踪与分析
 * - 情绪音乐桥接推荐
 * - 员工关怀智能触发
 */

// ==========================================
// 情感类型定义
// ==========================================

export type EmotionType = 
  | 'happy'       // 开心
  | 'sad'         // 悲伤
  | 'angry'       // 愤怒
  | 'fearful'     // 恐惧
  | 'surprised'   // 惊讶
  | 'disgusted'   // 厌恶
  | 'neutral'     // 中性
  | 'anxious';    // 焦虑

export type EmotionIntensity = 'low' | 'medium' | 'high' | 'extreme';

export interface EmotionState {
  primary: EmotionType;
  secondary?: EmotionType;
  intensity: EmotionIntensity;
  confidence: number; // 0-1
  timestamp: Date;
  source: 'text' | 'voice' | 'facial' | 'behavioral' | 'physiological';
  context?: string;
}

export interface EmployeeEmotionProfile {
  employeeId: string;
  baselineEmotion: EmotionType;
  emotionHistory: EmotionState[];
  currentMood: MoodIndicator;
  riskLevel: 'normal' | 'attention' | 'warning' | 'critical';
  careRecommendations: CareRecommendation[];
}

export interface MoodIndicator {
  score: number; // -100 (极度消极) to +100 (极度积极)
  trend: 'improving' | 'stable' | 'declining';
  volatility: number; // 0-1, 情绪波动程度
  lastUpdated: Date;
}

export interface CareRecommendation {
  type: 'immediate' | 'scheduled' | 'preventive';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  category: 'family' | 'health' | 'career' | 'social' | 'financial';
  title: string;
  description: string;
  suggestedActions: string[];
  resources?: string[];
  estimatedImpact: string;
}

// ==========================================
// 情感分析引擎（模拟 @yyc3/emotion 接口）
// ==========================================

export class Yyc3EmotionEngine {
  private static instance: Yyc3EmotionEngine;
  
  private constructor() {}
  
  public static getInstance(): Yyc3EmotionEngine {
    if (!Yyc3EmotionEngine.instance) {
      Yyc3EmotionEngine.instance = new Yyc3EmotionEngine();
    }
    return Yyc3EmotionEngine.instance;
  }

  /**
   * 分析文本中的情感
   */
  async analyzeTextEmotion(text: string): Promise<EmotionState> {
    // 这里应该调用 @yyc3/emotion 的实际API
    // 目前为模拟实现
    
    const emotionKeywords: Record<EmotionType, string[]> = {
      happy: ['开心', '高兴', '棒', '好', '优秀', '满意', '喜欢', '感谢'],
      sad: ['难过', '伤心', '失落', '沮丧', '郁闷', '不开心', '累'],
      angry: ['生气', '愤怒', '烦', '火大', '不满', '抱怨'],
      fearful: ['担心', '害怕', '焦虑', '紧张', '不安', '恐惧'],
      surprised: ['惊讶', '意外', '没想到', '震惊', '吃惊'],
      disgusted: ['讨厌', '恶心', '烦躁', '厌烦', '受不了'],
      neutral: ['一般', '还好', '正常', '普通', '可以'],
      anxious: ['压力', '焦虑', '失眠', '疲惫', '透支', '崩溃'],
    };

    let detectedEmotion: EmotionType = 'neutral';
    let maxMatches = 0;
    let totalIntensity = 0;

    for (const [emotion, keywords] of Object.entries(emotionKeywords)) {
      const matches = keywords.filter(keyword => text.includes(keyword)).length;
      if (matches > maxMatches) {
        maxMatches = matches;
        detectedEmotion = emotion as EmotionType;
      }
      totalIntensity += matches;
    }

    const intensity: EmotionIntensity = 
      totalIntensity >= 4 ? 'extreme' :
      totalIntensity >= 3 ? 'high' :
      totalIntensity >= 2 ? 'medium' : 'low';

    return {
      primary: detectedEmotion,
      intensity,
      confidence: Math.min(0.9, 0.5 + maxMatches * 0.1),
      timestamp: new Date(),
      source: 'text',
      context: text.slice(0, 100),
    };
  }

  /**
   * 更新员工情感档案
   */
  async updateEmployeeEmotionProfile(
    employeeId: string, 
    newState: EmotionState
  ): Promise<EmployeeEmotionProfile> {
    const existingProfile = await this.getEmployeeProfile(employeeId);
    
    const updatedHistory = [...existingProfile.emotionHistory, newState].slice(-50); // 保留最近50条

    const moodScore = this.calculateMoodScore(updatedHistory);
    const riskLevel = this.assessRiskLevel(newState, moodScore);
    const recommendations = await this.generateCareRecommendations(employeeId, newState, riskLevel);

    return {
      employeeId,
      baselineEmotion: existingProfile.baselineEmotion,
      emotionHistory: updatedHistory,
      currentMood: moodScore,
      riskLevel,
      careRecommendations: recommendations,
    };
  }

  /**
   * 计算情绪指数
   */
  private calculateMoodScore(history: EmotionState[]): MoodIndicator {
    if (history.length === 0) {
      return {
        score: 0,
        trend: 'stable',
        volatility: 0,
        lastUpdated: new Date(),
      };
    }

    const emotionScores: Record<EmotionType, number> = {
      happy: 80,
      sad: -60,
      angry: -70,
      fearful: -50,
      surprised: 10,
      disgusted: -40,
      neutral: 0,
      anxious: -55,
    };

    const recentScores = history.slice(-10).map(state => ({
      score: emotionScores[state.primary] * (state.intensity === 'extreme' ? 1.5 : state.intensity === 'high' ? 1.2 : 1),
      timestamp: state.timestamp,
    }));

    const avgScore = recentScores.reduce((sum, s) => sum + s.score, 0) / recentScores.length;

    let trend: 'improving' | 'stable' | 'declining' = 'stable';
    if (recentScores.length >= 2) {
      const recentAvg = recentScores.slice(-3).reduce((sum, s) => sum + s.score, 0) / 3;
      const olderAvg = recentScores.slice(0, -3).reduce((sum, s) => sum + s.score, 0) / Math.max(1, recentScores.length - 3);
      
      if (recentAvg > olderAvg + 10) trend = 'improving';
      else if (recentAvg < olderAvg - 10) trend = 'declining';
    }

    const variance = recentScores.reduce((sum, s) => sum + Math.pow(s.score - avgScore, 2), 0) / recentScores.length;
    const volatility = Math.min(1, variance / 5000);

    return {
      score: Math.round(avgScore),
      trend,
      volatility: Math.round(volatility * 100) / 100,
      lastUpdated: new Date(),
    };
  }

  /**
   * 评估风险等级
   */
  private assessRiskLevel(emotion: EmotionState, mood: MoodIndicator): 'normal' | 'attention' | 'warning' | 'critical' {
    const negativeEmotions: EmotionType[] = ['sad', 'angry', 'fearful', 'anxious'];
    
    if (negativeEmotions.includes(emotion.primary) && emotion.intensity === 'extreme') {
      return 'critical';
    }
    
    if (negativeEmotions.includes(emotion.primary) && emotion.intensity === 'high') {
      return 'warning';
    }
    
    if (mood.score < -30 || mood.volatility > 0.7) {
      return 'attention';
    }
    
    return 'normal';
  }

  /**
   * 生成关怀建议
   */
  private async generateCareRecommendations(
    employeeId: string,
    emotion: EmotionState,
    riskLevel: 'normal' | 'attention' | 'warning' | 'critical'
  ): Promise<CareRecommendation[]> {
    const recommendations: CareRecommendation[] = [];

    if (riskLevel === 'critical' || riskLevel === 'warning') {
      recommendations.push({
        type: 'immediate',
        priority: 'urgent',
        category: 'health',
        title: '心理健康紧急关注',
        description: `检测到员工情绪状态异常（${emotion.primary}），需要立即介入`,
        suggestedActions: [
          '安排HR或管理者进行一对一沟通',
          '提供EAP心理咨询服务',
          '评估工作负荷并临时调整',
          '联系紧急联系人（如需要）',
        ],
        resources: [
          '心理援助热线：400-XXX-XXXX',
          'EAP服务预约系统',
        ],
        estimatedImpact: '预防潜在危机事件',
      });
    }

    if (emotion.primary === 'anxious' || emotion.primary === 'fearful') {
      recommendations.push({
        type: 'scheduled',
        priority: 'high',
        category: 'career',
        title: '职业压力缓解计划',
        description: '检测到较高程度的焦虑情绪，可能与工作压力相关',
        suggestedActions: [
          '安排职业发展辅导',
          '提供时间管理培训',
          '考虑工作内容调整',
          '组织团队建设活动',
        ],
        estimatedImpact: '提升工作满意度和效率30%+',
      });
    }

    if (emotion.primary === 'sad' && emotion.intensity !== 'low') {
      recommendations.push({
        type: 'scheduled',
        priority: 'medium',
        category: 'family',
        title: '家庭关爱跟进',
        description: '检测到持续的负面情绪，可能涉及家庭因素',
        suggestedActions: [
          '了解家庭情况（在适当范围内）',
          '提供弹性工作时间',
          '推送家庭关怀资源',
          '安排定期回访',
        ],
        estimatedImpact: '增强员工归属感和忠诚度',
      });
    }

    if (recommendations.length === 0 && emotion.primary === 'happy') {
      recommendations.push({
        type: 'preventive',
        priority: 'low',
        category: 'social',
        title: '正向激励强化',
        description: '员工当前情绪良好，适合进行正向激励',
        suggestedActions: [
          '公开表扬或表彰',
          '提供发展机会',
          '邀请分享经验',
          '考虑晋升或加薪',
        ],
        estimatedImpact: '巩固积极情绪，提升团队氛围',
      });
    }

    return recommendations;
  }

  private async getEmployeeProfile(employeeId: string): Promise<EmployeeEmotionProfile> {
    // 实际应用中应从数据库获取
    return {
      employeeId,
      baselineEmotion: 'neutral',
      emotionHistory: [],
      currentMood: {
        score: 0,
        trend: 'stable',
        volatility: 0,
        lastUpdated: new Date(),
      },
      riskLevel: 'normal',
      careRecommendations: [],
    };
  }

  /**
   * 批量分析团队情绪
   */
  async analyzeTeamEmotion(teamMemberIds: string[]): Promise<{
    teamMood: MoodIndicator;
    individualProfiles: Map<string, EmployeeEmotionProfile>;
    teamDynamics: TeamDynamicsReport;
  }> {
    const individualProfiles = new Map<string, EmployeeEmotionProfile>();
    
    for (const id of teamMemberIds) {
      const profile = await this.getEmployeeProfile(id);
      individualProfiles.set(id, profile);
    }

    const allMoods = Array.from(individualProfiles.values()).map(p => p.currentMood);
    const avgScore = allMoods.reduce((sum, m) => sum + m.score, 0) / allMoods.length;
    
    const teamMood: MoodIndicator = {
      score: Math.round(avgScore),
      trend: this.determineTeamTrend(allMoods),
      volatility: this.calculateTeamVolatility(allMoods),
      lastUpdated: new Date(),
    };

    return {
      teamMood,
      individualProfiles,
      teamDynamics: this.generateTeamDynamicsReport(individualProfiles),
    };
  }

  private determineTeamTrend(moods: MoodIndicator[]): 'improving' | 'stable' | 'declining' {
    // 简化的团队趋势判断逻辑
    const improvingCount = moods.filter(m => m.trend === 'improving').length;
    const decliningCount = moods.filter(m => m.trend === 'declining').length;
    
    if (improvingCount > decliningCount + 2) return 'improving';
    if (decliningCount > improvingCount + 2) return 'declining';
    return 'stable';
  }

  private calculateTeamVolatility(moods: MoodIndicator[]): number {
    const avgVolatility = moods.reduce((sum, m) => sum + m.volatility, 0) / moods.length;
    return Math.round(avgVolatility * 100) / 100;
  }

  private generateTeamDynamicsReport(profiles: Map<string, EmployeeEmotionProfile>): TeamDynamicsReport {
    const atRiskMembers = Array.from(profiles.entries())
      .filter(([_, profile]) => profile.riskLevel !== 'normal')
      .map(([id, _]) => id);

    const positiveMembers = Array.from(profiles.values())
      .filter(p => p.currentMood.score > 50).length;

    return {
      totalMembers: profiles.size,
      atRiskMemberCount: atRiskMembers.length,
      positiveMemberRatio: positiveMembers / profiles.size,
      recommendedActions: this.generateTeamActions(atRiskMembers.length, positiveMembers / profiles.size),
    };
  }

  private generateTeamActions(atRiskCount: number, positiveRatio: number): string[] {
    const actions: string[] = [];
    
    if (atRiskCount > 0) {
      actions.push(`立即关注 ${atRiskCount} 名高风险成员`);
    }
    
    if (positiveRatio < 0.3) {
      actions.push('团队整体士气偏低，建议组织团建活动');
    } else if (positiveRatio > 0.7) {
      actions.push('团队士气高涨，可考虑启动挑战性项目');
    }
    
    if (actions.length === 0) {
      actions.push('团队状态良好，继续保持');
    }
    
    return actions;
  }
}

interface TeamDynamicsReport {
  totalMembers: number;
  atRiskMemberCount: number;
  positiveMemberRatio: number;
  recommendedActions: string[];
}

// ==========================================
// 导出单例实例
// ==========================================

export const yyc3EmotionEngine = Yyc3EmotionEngine.getInstance();

export default Yyc3EmotionEngine;
