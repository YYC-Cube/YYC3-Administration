---
@file: 赛博朋克风格-前端UI-UX原型开发提示词.md
@description: YYC3-AI-Family 赛博朋克风格前端UI/UX原型开发设计提示词
@author: YanYuCloudCube Team
@version: 1.0.0
@created: 2026-03-07
@updated: 2026-03-07
@status: production
@tags: cyberpunk, ui-ux, frontend, prototype, design-prompt
---

> ***YanYuCloudCube***
> *言启象限 | 语枢未来*
> ***Words Initiate Quadrants, Language Serves as Core for Future***
> *万象归元于云枢 | 深栈智启新纪元***
> ***All things converge in cloud pivot; Deep stacks ignite a new era of intelligence***

---

# 赛博朋克风格前端UI/UX原型开发设计提示词

---

## 📋 目录导航

1. [风格概述](#-风格概述)
2. [双模式设计理念](#-双模式设计理念)
3. [MVP核心逻辑](#-mvp核心逻辑)
4. [独立应用模式设计](#-独立应用模式设计)
5. [AI浮窗插件模式设计](#-ai浮窗插件模式设计)
6. [共享设计系统](#-共享设计系统)
7. [视觉系统](#-视觉系统)
8. [组件规范](#-组件规范)
9. [交互设计](#-交互设计)
10. [开发指导](#-开发指导)
11. [技术实现](#-技术实现)
12. [最佳实践](#-最佳实践)

---

## 🎨 风格概述

### 核心特征

赛博朋克风格是一种融合了**霓虹发光**、**科技感**、**未来主义**的视觉风格，创造出高对比度、强视觉冲击、未来感的体验。

#### 视觉特点
- **高对比度**：霓虹色彩配合深色背景，视觉冲击力强
- **科技元素**：电路板、网格、数据流、几何图形
- **动态效果**：脉冲发光、扫描线、数据流动

#### 情感体验
- **未来感**：强烈的未来主义氛围，科技感十足
- **冲击力**：高对比度和发光效果带来强烈视觉冲击
- **沉浸感**：深色背景配合动态效果营造沉浸式体验

### 适用场景

- **游戏界面**：科幻游戏、赛博朋克游戏、VR/AR应用
- **科技产品**：AI产品、区块链、加密货币、数据平台
- **创意应用**：音乐应用、视频编辑、艺术创作、媒体播放

---

## 🎯 双模式设计理念

### 设计原则

#### 1. 统一性原则

- **共享设计语言**: 两种模式使用统一的赛博朋克设计系统
- **一致的用户体验**: 相同的功能在不同模式下保持一致的交互逻辑
- **品牌一致性**: 统一的霓虹发光、科技元素和视觉风格

#### 2. 适应性原则

- **场景适配**: 根据使用场景自动调整界面布局和功能
- **设备适配**: 支持不同设备和屏幕尺寸
- **用户偏好**: 支持用户个性化设置和偏好

#### 3. 可扩展性原则

- **模块化设计**: 功能模块独立，可按需加载
- **插件化架构**: 支持第三方插件扩展
- **API开放**: 提供开放的API接口

### 模式切换机制

```typescript
// 模式配置接口
interface CyberpunkModeConfig {
  mode: 'standalone' | 'widget';
  standaloneConfig?: StandaloneConfig;
  widgetConfig?: WidgetConfig;
}

// 独立应用配置
interface StandaloneConfig {
  fullScreen: boolean;
  showNavigation: boolean;
  showSidebar: boolean;
  enableAllModules: boolean;
  neonIntensity: 'low' | 'medium' | 'high';
  glitchEffect: boolean;
}

// 浮窗插件配置
interface WidgetConfig {
  position: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
  size: 'small' | 'medium' | 'large' | 'custom';
  enableDrag: boolean;
  enableResize: boolean;
  autoHide: boolean;
  neonIntensity: 'low' | 'medium' | 'high';
  glitchEffect: boolean;
}
```

---

## 🚀 MVP核心逻辑

### 核心架构

YYC³ Portable Intelligent AI System的MVP核心逻辑基于五维闭环系统架构：

```
五维闭环系统架构
┌──────────┐  ┌──────────┐  ┌──────────┐
│ Analysis │→ │Execution │→ │Optimization│
└──────────┘  └──────────┘  └──────────┘
     ↓                               ↑
┌──────────┐  ┌──────────┐
│ Learning │← │Management │─────────────┘
└──────────┘  └──────────┘
```

### 核心功能模块

#### 1. 智能分析模块（Analysis）

**功能描述**:
- 用户意图识别和理解
- 多模态输入处理（文本、语音、图像）
- 上下文分析和语义理解
- 情感分析和用户画像

**MVP实现**:
```typescript
interface AnalysisModule {
  analyzeInput(input: UserInput): Promise<AnalysisResult>;
  detectIntent(text: string): Intent;
  extractEntities(text: string): Entity[];
  analyzeSentiment(text: string): SentimentScore;
  buildUserProfile(behavior: UserBehavior): UserProfile;
}

interface AnalysisResult {
  intent: Intent;
  entities: Entity[];
  sentiment: SentimentScore;
  context: Context;
  confidence: number;
}
```

#### 2. 智能执行模块（Execution）

**功能描述**:
- AI模型推理和生成
- 工具调用和API集成
- 工作流执行和任务编排
- 实时响应和流式输出

**MVP实现**:
```typescript
interface ExecutionModule {
  executeTask(task: Task): Promise<ExecutionResult>;
  invokeTool(tool: Tool, params: any): Promise<ToolResult>;
  executeWorkflow(workflow: Workflow): Promise<WorkflowResult>;
  streamResponse(prompt: string): AsyncGenerator<ResponseChunk>;
}

interface ExecutionResult {
  output: string;
  metadata: ExecutionMetadata;
  toolsUsed: Tool[];
  executionTime: number;
}
```

#### 3. 智能优化模块（Optimization）

**功能描述**:
- 性能监控和优化
- 资源调度和负载均衡
- 缓存策略和数据预加载
- 用户体验优化

**MVP实现**:
```typescript
interface OptimizationModule {
  optimizePerformance(): void;
  balanceLoad(): void;
  manageCache(): void;
  optimizeUserExperience(): void;
  getPerformanceMetrics(): PerformanceMetrics;
}

interface PerformanceMetrics {
  responseTime: number;
  throughput: number;
  errorRate: number;
  userSatisfaction: number;
}
```

#### 4. 智能学习模块（Learning）

**功能描述**:
- 用户行为学习和个性化
- 反馈收集和模型微调
- 知识图谱构建和更新
- 持续学习和自我进化

**MVP实现**:
```typescript
interface LearningModule {
  learnFromFeedback(feedback: UserFeedback): void;
  personalizeExperience(user: User): void;
  updateKnowledgeGraph(data: KnowledgeData): void;
  fineTuneModel(trainingData: TrainingData): Promise<void>;
  getUserInsights(user: User): UserInsights;
}

interface UserInsights {
  preferences: UserPreferences;
  behaviorPatterns: BehaviorPattern[];
  recommendations: Recommendation[];
}
```

#### 5. 智能管理模块（Management）

**功能描述**:
- 系统配置和状态管理
- 用户权限和安全管理
- 日志记录和监控告警
- 数据备份和恢复

**MVP实现**:
```typescript
interface ManagementModule {
  manageConfiguration(config: SystemConfig): void;
  managePermissions(user: User, permissions: Permission[]): void;
  manageSecurity(securityPolicy: SecurityPolicy): void;
  manageLogs(logs: LogEntry[]): void;
  monitorSystem(): SystemHealth;
}

interface SystemHealth {
  status: 'healthy' | 'degraded' | 'unhealthy';
  metrics: HealthMetrics;
  alerts: Alert[];
}
```

### 双模式核心逻辑

#### 独立应用模式核心逻辑

```typescript
class StandaloneAppManager {
  private mode: 'standalone' = 'standalone';
  private modules: CoreModules;
  private uiManager: UIManager;
  
  constructor() {
    this.modules = this.initializeModules();
    this.uiManager = new UIManager('standalone');
  }
  
  async initialize() {
    // 初始化所有核心模块
    await this.modules.analysis.initialize();
    await this.modules.execution.initialize();
    await this.modules.optimization.initialize();
    await this.modules.learning.initialize();
    await this.modules.management.initialize();
    
    // 初始化UI
    this.uiManager.initialize({
      fullScreen: true,
      showNavigation: true,
      showSidebar: true,
      enableAllModules: true,
      neonIntensity: 'high',
      glitchEffect: true
    });
    
    // 启动性能监控
    this.modules.optimization.monitorPerformance();
  }
  
  async handleUserInput(input: UserInput) {
    // 分析用户输入
    const analysis = await this.modules.analysis.analyzeInput(input);
    
    // 执行任务
    const result = await this.modules.execution.executeTask({
      intent: analysis.intent,
      entities: analysis.entities,
      context: analysis.context
    });
    
    // 优化性能
    this.modules.optimization.optimizePerformance();
    
    // 学习用户行为
    this.modules.learning.learnFromFeedback({
      input,
      result,
      timestamp: Date.now()
    });
    
    return result;
  }
}
```

#### AI浮窗插件模式核心逻辑

```typescript
class WidgetPluginManager {
  private mode: 'widget' = 'widget';
  private modules: CoreModules;
  private widgetManager: WidgetManager;
  private hostIntegration: HostIntegration;
  
  constructor() {
    this.modules = this.initializeModules();
    this.widgetManager = new WidgetManager();
    this.hostIntegration = new HostIntegration();
  }
  
  async initialize() {
    // 初始化核心模块（轻量级）
    await this.modules.analysis.initialize();
    await this.modules.execution.initialize();
    await this.modules.optimization.initialize();
    
    // 初始化浮窗
    this.widgetManager.initialize({
      position: 'bottom-right',
      size: 'medium',
      enableDrag: true,
      enableResize: true,
      autoHide: false,
      neonIntensity: 'medium',
      glitchEffect: false
    });
    
    // 集成到宿主应用
    await this.hostIntegration.integrate();
    
    // 启动性能监控
    this.modules.optimization.monitorPerformance();
  }
  
  async handleUserInput(input: UserInput) {
    // 快速分析用户输入
    const analysis = await this.modules.analysis.analyzeInput(input);
    
    // 执行任务（优化响应速度）
    const result = await this.modules.execution.executeTask({
      intent: analysis.intent,
      entities: analysis.entities,
      context: analysis.context,
      priority: 'high'
    });
    
    // 优化性能（浮窗模式优先级更高）
    this.modules.optimization.optimizePerformance({
      priority: 'high',
      mode: 'widget'
    });
    
    // 学习用户行为
    this.modules.learning.learnFromFeedback({
      input,
      result,
      timestamp: Date.now(),
      mode: 'widget'
    });
    
    return result;
  }
  
  toggleWidget() {
    this.widgetManager.toggle();
  }
  
  resizeWidget(size: WidgetSize) {
    this.widgetManager.resize(size);
  }
  
  moveWidget(position: WidgetPosition) {
    this.widgetManager.move(position);
  }
}
```

### 状态管理

```typescript
interface AppState {
  mode: 'standalone' | 'widget';
  user: User;
  sessions: Session[];
  activeSession: Session | null;
  tools: Tool[];
  workflows: Workflow[];
  insights: Insight[];
  theme: Theme;
  settings: Settings;
}

interface CyberpunkTheme {
  neonIntensity: 'low' | 'medium' | 'high';
  glitchEffect: boolean;
  scanlines: boolean;
  circuitGrid: boolean;
  dataFlow: boolean;
  primaryColor: string;
  secondaryColor: string;
  backgroundColor: string;
}
```

### 数据流

```
用户输入
    ↓
[分析模块] → 意图识别、实体提取、情感分析
    ↓
[执行模块] → AI推理、工具调用、工作流执行
    ↓
[优化模块] → 性能优化、资源调度、缓存管理
    ↓
[学习模块] → 用户学习、个性化、知识更新
    ↓
[管理模块] → 配置管理、权限管理、日志记录
    ↓
用户反馈
```

---

## 💻 独立应用模式设计

### 应用架构

```
┌─────────────────────────────────────────────────────────────────┐
│                  YYC³ 赛博朋克独立应用界面              │
├─────────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  霓虹顶部导航栏 (Neon Header Navigation)            │   │
│  │  [Logo] [导航菜单] [搜索] [用户] [设置] [主题]    │   │
│  │  霓虹发光效果 + 扫描线动画                        │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                               │
│  ┌──────────────┬────────────────────────────────────────┐    │
│  │              │                                        │    │
│  │  霓虹侧边栏  │           主内容区域                  │    │
│  │  Neon Sidebar│           Main Content                │    │
│  │              │                                        │    │
│  │  [聊天]      │  ┌────────────────────────────────┐  │    │
│  │  [工具]      │  │                                │  │    │
│  │  [工作流]    │  │      霓虹聊天界面             │  │    │
│  │  [洞察]      │  │      Neon Chat Interface        │  │    │
│  │  [设置]      │  │                                │  │    │
│  │              │  │  故障效果 + 霓虹消息气泡      │  │    │
│  │  [历史记录]  │  └────────────────────────────────┘  │    │
│  │              │                                        │    │
│  │  [收藏]      │  ┌────────────────────────────────┐  │    │
│  │              │  │                                │  │    │
│  │              │  │      霓虹工具面板             │  │    │
│  │              │  │      Neon Toolbox Panel        │  │    │
│  │              │  │                                │  │    │
│  │              │  │  全息卡片 + 霓虹按钮        │  │    │
│  │              │  └────────────────────────────────┘  │    │
│  │              │                                        │    │
│  │              │  ┌────────────────────────────────┐  │    │
│  │              │  │                                │  │    │
│  │              │  │      霓虹工作流设计器        │  │    │
│  │              │  │      Neon Workflow Designer     │  │    │
│  │              │  │                                │  │    │
│  │              │  │  电路板背景 + 数据流动画      │  │    │
│  │              │  └────────────────────────────────┘  │    │
│  │              │                                        │    │
│  │              │  ┌────────────────────────────────┐  │    │
│  │              │  │                                │  │    │
│  │              │  │      霓虹洞察仪表板         │  │    │
│  │              │  │      Neon Insights Dashboard   │  │    │
│  │              │  │                                │  │    │
│  │              │  │  霓虹图表 + 数据流效果      │  │    │
│  │              │  └────────────────────────────────┘  │    │
│  │              │                                        │    │
│  └──────────────┴────────────────────────────────────────┘    │
│                                                               │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  霓虹底部状态栏 (Neon Status Bar)                    │   │
│  │  [状态] [性能] [通知] [版本]                        │   │
│  │  霓虹发光效果 + 数据流动画                          │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                               │
└─────────────────────────────────────────────────────────────────┘
```

### 布局规范

#### 全屏布局

```css
/* 赛博朋克独立应用全屏布局 */
.cyberpunk-standalone-app {
  display: grid;
  grid-template-rows: 64px 1fr 40px;  /* 顶部导航 | 主内容 | 底部状态 */
  grid-template-columns: 280px 1fr;    /* 侧边栏 | 主内容 */
  height: 100vh;
  overflow: hidden;
  background: var(--cyber-dark);
  position: relative;
}

/* 电路网格背景 */
.cyberpunk-standalone-app::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-image:
    linear-gradient(rgba(0, 240, 255, 0.05) 1px, transparent 1px),
    linear-gradient(90deg, rgba(0, 240, 255, 0.05) 1px, transparent 1px);
  background-size: 20px 20px;
  pointer-events: none;
  z-index: 0;
}

/* 扫描线效果 */
.cyberpunk-standalone-app::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: repeating-linear-gradient(
    0deg,
    transparent,
    transparent 2px,
    rgba(0, 0, 0, 0.1) 2px,
    rgba(0, 0, 0, 0.1) 4px
  );
  pointer-events: none;
  z-index: 1;
  animation: scanline-move 10s linear infinite;
}

/* 霓虹顶部导航栏 */
.cyberpunk-header {
  grid-column: 1 / -1;
  grid-row: 1;
  background: rgba(10, 10, 10, 0.9);
  border-bottom: 2px solid var(--cyber-cyan);
  box-shadow:
    0 0 10px var(--cyber-cyan),
    0 0 20px rgba(0, 240, 255, 0.3);
  padding: 0 24px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  position: relative;
  z-index: 100;
}

/* 霓虹侧边栏 */
.cyberpunk-sidebar {
  grid-column: 1;
  grid-row: 2;
  background: rgba(10, 10, 10, 0.8);
  border-right: 2px solid rgba(0, 240, 255, 0.3);
  overflow-y: auto;
  position: relative;
  z-index: 10;
}

/* 主内容区域 */
.cyberpunk-main {
  grid-column: 2;
  grid-row: 2;
  background: rgba(5, 5, 5, 0.9);
  overflow-y: auto;
  padding: 24px;
  position: relative;
  z-index: 10;
}

/* 霓虹底部状态栏 */
.cyberpunk-footer {
  grid-column: 1 / -1;
  grid-row: 3;
  background: rgba(10, 10, 10, 0.9);
  border-top: 2px solid var(--cyber-cyan);
  box-shadow:
    0 0 10px var(--cyber-cyan),
    0 0 20px rgba(0, 240, 255, 0.3);
  padding: 0 24px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  position: relative;
  z-index: 100;
}
```

#### 响应式布局

```css
/* 平板端布局 */
@media (max-width: 1024px) {
  .cyberpunk-standalone-app {
    grid-template-columns: 240px 1fr;
  }

  .cyberpunk-sidebar {
    transform: translateX(0);
    transition: transform 0.3s ease;
  }

  .cyberpunk-sidebar.collapsed {
    transform: translateX(-240px);
  }
}

/* 移动端布局 */
@media (max-width: 768px) {
  .cyberpunk-standalone-app {
    grid-template-columns: 1fr;
    grid-template-rows: 56px 1fr 40px;
  }

  .cyberpunk-sidebar {
    position: fixed;
    left: 0;
    top: 56px;
    bottom: 40px;
    z-index: 1000;
    transform: translateX(-100%);
    background: rgba(10, 10, 10, 0.95);
  }

  .cyberpunk-sidebar.open {
    transform: translateX(0);
  }

  .cyberpunk-main {
    grid-column: 1;
    grid-row: 2;
  }
}
```

### 导航系统

#### 霓虹顶部导航栏

```typescript
interface NavigationItem {
  id: string;
  label: string;
  icon: string;
  path: string;
  badge?: number;
  active?: boolean;
  neonColor?: string;
}

const navigationItems: NavigationItem[] = [
  { 
    id: 'chat', 
    label: '聊天', 
    icon: 'MessageCircle', 
    path: '/chat', 
    active: true,
    neonColor: '#00f0ff'
  },
  { 
    id: 'tools', 
    label: '工具', 
    icon: 'Tool', 
    path: '/tools', 
    badge: 3,
    neonColor: '#ff00ff'
  },
  { 
    id: 'workflow', 
    label: '工作流', 
    icon: 'Workflow', 
    path: '/workflow',
    neonColor: '#ffff00'
  },
  { 
    id: 'insights', 
    label: '洞察', 
    icon: 'BarChart3', 
    path: '/insights',
    neonColor: '#00ff00'
  },
  { 
    id: 'settings', 
    label: '设置', 
    icon: 'Settings', 
    path: '/settings',
    neonColor: '#ff0000'
  },
];
```

#### 霓虹侧边栏导航

```typescript
interface SidebarSection {
  title: string;
  items: SidebarItem[];
  glitchEffect?: boolean;
}

interface SidebarItem {
  id: string;
  label: string;
  icon: string;
  path: string;
  badge?: number;
  active?: boolean;
  neonColor?: string;
}

const sidebarSections: SidebarSection[] = [
  {
    title: '主要功能',
    glitchEffect: true,
    items: [
      { 
        id: 'chat', 
        label: 'AI聊天', 
        icon: 'MessageCircle', 
        path: '/chat', 
        active: true,
        neonColor: '#00f0ff'
      },
      { 
        id: 'tools', 
        label: 'AI工具', 
        icon: 'Tool', 
        path: '/tools', 
        badge: 12,
        neonColor: '#ff00ff'
      },
      { 
        id: 'workflow', 
        label: '工作流', 
        icon: 'Workflow', 
        path: '/workflow',
        neonColor: '#ffff00'
      },
      { 
        id: 'insights', 
        label: '数据洞察', 
        icon: 'BarChart3', 
        path: '/insights',
        neonColor: '#00ff00'
      },
    ],
  },
  {
    title: '个人中心',
    items: [
      { 
        id: 'history', 
        label: '历史记录', 
        icon: 'History', 
        path: '/history',
        neonColor: '#0000ff'
      },
      { 
        id: 'favorites', 
        label: '收藏夹', 
        icon: 'Star', 
        path: '/favorites',
        neonColor: '#ff00ff'
      },
      { 
        id: 'profile', 
        label: '个人资料', 
        icon: 'User', 
        path: '/profile',
        neonColor: '#00f0ff'
      },
    ],
  },
];
```

### 页面设计

#### 霓虹聊天页面

```css
/* 霓虹聊天页面布局 */
.cyberpunk-chat-page {
  display: grid;
  grid-template-columns: 300px 1fr;
  grid-template-rows: 1fr 80px;
  height: 100%;
  gap: 24px;
  position: relative;
  z-index: 10;
}

/* 会话列表 */
.cyberpunk-chat-sessions {
  grid-column: 1;
  grid-row: 1 / -1;
  background: rgba(10, 10, 10, 0.8);
  border: 2px solid rgba(0, 240, 255, 0.3);
  border-radius: 8px;
  overflow-y: auto;
  box-shadow:
    0 0 10px rgba(0, 240, 255, 0.2),
    inset 0 0 10px rgba(0, 240, 255, 0.05);
}

/* 聊天主区域 */
.cyberpunk-chat-main {
  grid-column: 2;
  grid-row: 1;
  background: rgba(10, 10, 10, 0.8);
  border: 2px solid rgba(0, 240, 255, 0.3);
  border-radius: 8px;
  overflow-y: auto;
  padding: 24px;
  box-shadow:
    0 0 10px rgba(0, 240, 255, 0.2),
    inset 0 0 10px rgba(0, 240, 255, 0.05);
}

/* 输入区域 */
.cyberpunk-chat-input {
  grid-column: 2;
  grid-row: 2;
  background: rgba(10, 10, 10, 0.8);
  border: 2px solid rgba(0, 240, 255, 0.3);
  border-radius: 8px;
  padding: 16px;
  box-shadow:
    0 0 10px rgba(0, 240, 255, 0.2),
    inset 0 0 10px rgba(0, 240, 255, 0.05);
}
```

#### 霓虹工具页面

```css
/* 霓虹工具页面布局 */
.cyberpunk-tools-page {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 24px;
  padding: 24px;
  position: relative;
  z-index: 10;
}

/* 霓虹工具卡片 */
.cyberpunk-tool-card {
  background: rgba(10, 10, 10, 0.8);
  border: 2px solid rgba(0, 240, 255, 0.3);
  border-radius: 8px;
  padding: 24px;
  box-shadow:
    0 0 10px rgba(0, 240, 255, 0.2),
    inset 0 0 10px rgba(0, 240, 255, 0.05);
  transition: all 0.3s ease;
  cursor: pointer;
  position: relative;
  overflow: hidden;
}

.cyberpunk-tool-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: repeating-linear-gradient(
    0deg,
    transparent,
    transparent 2px,
    rgba(0, 240, 255, 0.05) 2px,
    rgba(0, 240, 255, 0.05) 4px
  );
  pointer-events: none;
  animation: data-scroll 10s linear infinite;
}

.cyberpunk-tool-card:hover {
  border-color: #00f0ff;
  box-shadow:
    0 0 20px #00f0ff,
    0 0 40px rgba(0, 240, 255, 0.5),
    inset 0 0 20px rgba(0, 240, 255, 0.1);
  transform: translateY(-4px);
}
```

---

## � AI浮窗插件模式设计

### 浮窗架构

```
┌─────────────────────────────────────────────────────────────────┐
│                  宿主应用页面                                │
│                                                               │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                                                       │   │
│  │              宿主应用内容                              │   │
│  │                                                       │   │
│  │                                                       │   │
│  │                                                       │   │
│  │                                                       │   │
│  │                                                       │   │
│  │                                                       │   │
│  │                                                       │   │
│  │                                                       │   │
│  │                                                       │   │
│  │                                                       │   │
│  │                                                       │   │
│  │                                                       │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                               │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  YYC³ AI 霓虹浮窗插件 (Neon Widget Plugin)        │   │
│  │  ┌─────────────────────────────────────────────────┐    │   │
│  │  │  霓虹浮窗标题栏 (Neon Widget Header)       │    │   │
│  │  │  [YYC³ AI] [最小化] [最大化] [关闭]      │    │   │
│  │  │  霓虹发光效果 + 故障动画                      │    │   │
│  │  └─────────────────────────────────────────────────┘    │   │
│  │  ┌─────────────────────────────────────────────────┐    │   │
│  │  │                                               │    │   │
│  │  │  霓虹模块切换标签 (Neon Module Tabs)       │    │   │
│  │  │  [聊天] [工具] [工作流] [洞察]              │    │   │
│  │  │  霓虹发光 + 扫描线效果                       │    │   │
│  │  │                                               │    │   │
│  │  └─────────────────────────────────────────────────┘    │   │
│  │  ┌─────────────────────────────────────────────────┐    │   │
│  │  │                                               │    │   │
│  │  │  活动模块内容 (Active Module Content)      │    │   │
│  │  │                                               │    │   │
│  │  │  ┌─────────────────────────────────────┐     │    │   │
│  │  │  │ 霓虹聊天界面                    │     │    │   │
│  │  │  │ Neon Chat Interface             │     │    │   │
│  │  │  │ 霓虹消息气泡 + 故障效果       │     │    │   │
│  │  │  └─────────────────────────────────────┘     │    │   │
│  │  │                                               │    │   │
│  │  │  ┌─────────────────────────────────────┐     │    │   │
│  │  │  │ 霓虹工具面板                    │     │    │   │
│  │  │  │ Neon Toolbox Panel             │     │    │   │
│  │  │  │ 全息卡片 + 霓虹按钮          │     │    │   │
│  │  │  └─────────────────────────────────────┘     │    │   │
│  │  │                                               │    │   │
│  │  │  ┌─────────────────────────────────────┐     │    │   │
│  │  │  │ 霓虹工作流设计器                │     │    │   │
│  │  │  │ Neon Workflow Designer          │     │    │   │
│  │  │  │ 电路板背景 + 数据流动画        │     │    │   │
│  │  │  └─────────────────────────────────────┘     │    │   │
│  │  │                                               │    │   │
│  │  │  ┌─────────────────────────────────────┐     │    │   │
│  │  │  │ 霓虹洞察仪表板                 │     │    │   │
│  │  │  │ Neon Insights Dashboard        │     │    │   │
│  │  │  │ 霓虹图表 + 数据流效果         │     │    │   │
│  │  │  └─────────────────────────────────────┘     │    │   │
│  │  │                                               │    │   │
│  │  └─────────────────────────────────────────────────┘    │   │
│  │  ┌─────────────────────────────────────────────────┐    │   │
│  │  │  霓虹输入区域 (Neon Input Area)           │    │   │
│  │  │  [输入框] [发送] [附件] [语音]             │    │   │
│  │  │  霓虹发光 + 扫描线效果                       │    │   │
│  │  └─────────────────────────────────────────────────┘    │   │
│  │  ┌─────────────────────────────────────────────────┐    │   │
│  │  │  霓虹快捷操作栏 (Neon Quick Actions)      │    │   │
│  │  │  [新对话] [历史] [设置] [帮助]             │    │   │
│  │  │  霓虹发光 + 故障动画                       │    │   │
│  │  └─────────────────────────────────────────────────┘    │   │
│  │                                                       │   │
│  │  可拖拽、可调整大小、可最小化、可最大化           │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                               │
└─────────────────────────────────────────────────────────────────┘
```

### 浮窗配置

```typescript
interface CyberpunkWidgetConfig {
  // 基础配置
  id: string;
  title: string;
  
  // 尺寸配置
  width: number;
  height: number;
  minWidth: number;
  minHeight: number;
  maxWidth: number;
  maxHeight: number;
  
  // 位置配置
  position: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
  x: number;
  y: number;
  
  // 状态配置
  minimized: boolean;
  maximized: boolean;
  hidden: boolean;
  
  // 交互配置
  enableDrag: boolean;
  enableResize: boolean;
  autoHide: boolean;
  
  // 赛博朋克风格配置
  neonIntensity: 'low' | 'medium' | 'high';
  glitchEffect: boolean;
  scanlines: boolean;
  circuitGrid: boolean;
  dataFlow: boolean;
  primaryColor: string;
  secondaryColor: string;
  backgroundColor: string;
}
```

### 浮窗样式

#### 赛博朋克毛玻璃融合样式

```css
/* 霓虹毛玻璃浮窗插件基础样式 */
.cyberpunk-widget-plugin {
  position: fixed;
  background: rgba(10, 10, 10, 0.75);
  border-radius: 20px;
  box-shadow:
    0 20px 60px rgba(0, 0, 0, 0.6),
    0 0 20px rgba(0, 240, 255, 0.4),
    0 0 40px rgba(0, 240, 255, 0.2),
    inset 0 0 30px rgba(0, 240, 255, 0.05);
  overflow: hidden;
  z-index: 10000;
  transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  border: 2px solid rgba(0, 240, 255, 0.4);
  backdrop-filter: blur(20px) saturate(180%);
  -webkit-backdrop-filter: blur(20px) saturate(180%);
}

/* 多层玻璃叠加效果 */
.cyberpunk-widget-plugin::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: 
    linear-gradient(135deg, rgba(0, 240, 255, 0.1) 0%, transparent 50%),
    linear-gradient(225deg, rgba(255, 0, 255, 0.1) 0%, transparent 50%);
  border-radius: 20px;
  pointer-events: none;
  z-index: 0;
}

/* 边框高光效果 */
.cyberpunk-widget-plugin::after {
  content: '';
  position: absolute;
  top: -2px;
  left: -2px;
  right: -2px;
  bottom: -2px;
  background: linear-gradient(
    45deg,
    transparent 30%,
    rgba(0, 240, 255, 0.5) 50%,
    transparent 70%
  );
  border-radius: 22px;
  pointer-events: none;
  z-index: 1;
  animation: shimmer-rotate 3s linear infinite;
}

/* 电路网格背景 */
.cyberpunk-widget-grid {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-image:
    linear-gradient(rgba(0, 240, 255, 0.06) 1px, transparent 1px),
    linear-gradient(90deg, rgba(0, 240, 255, 0.06) 1px, transparent 1px);
  background-size: 20px 20px;
  pointer-events: none;
  z-index: 2;
}

/* 扫描线效果 */
.cyberpunk-widget-scanlines {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: repeating-linear-gradient(
    0deg,
    transparent,
    transparent 2px,
    rgba(0, 0, 0, 0.08) 2px,
    rgba(0, 0, 0, 0.08) 4px
  );
  pointer-events: none;
  z-index: 3;
  animation: scanline-move 10s linear infinite;
}

/* 光泽扫过效果 */
.cyberpunk-widget-plugin .shimmer {
  position: absolute;
  top: 0;
  left: -100%;
  width: 50%;
  height: 100%;
  background: linear-gradient(
    90deg,
    transparent,
    rgba(255, 255, 255, 0.1),
    transparent
  );
  pointer-events: none;
  z-index: 4;
  animation: shimmer-move 3s ease-in-out infinite;
}

/* 发光效果 - 青色主题 */
.cyberpunk-widget-plugin.glow {
  box-shadow:
    0 20px 60px rgba(0, 0, 0, 0.6),
    0 0 30px rgba(0, 240, 255, 0.5),
    0 0 60px rgba(0, 240, 255, 0.3),
    0 0 90px rgba(0, 240, 255, 0.1),
    inset 0 0 30px rgba(0, 240, 255, 0.08);
}

/* 弹簧进入动画 */
.cyberpunk-widget-plugin.spring-enter {
  animation: spring-in 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

@keyframes spring-in {
  0% {
    opacity: 0;
    transform: scale(0.8) translateY(20px);
  }
  100% {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

@keyframes shimmer-rotate {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

@keyframes shimmer-move {
  0% { left: -100%; }
  50%, 100% { left: 200%; }
}
```

#### 状态样式

```css
/* 最小化状态 */
.cyberpunk-widget-plugin.minimized {
  width: 48px !important;
  height: 48px !important;
  border-radius: 50%;
  overflow: hidden;
  box-shadow:
    0 10px 30px rgba(0, 0, 0, 0.6),
    0 0 15px rgba(0, 240, 255, 0.5),
    0 0 30px rgba(0, 240, 255, 0.3);
  transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

/* 最大化状态 */
.cyberpunk-widget-plugin.maximized {
  width: 100vw !important;
  height: 100vh !important;
  top: 0 !important;
  left: 0 !important;
  border-radius: 0;
  box-shadow: none;
  backdrop-filter: blur(30px) saturate(200%);
}

/* 隐藏状态 */
.cyberpunk-widget-plugin.hidden {
  transform: translateY(120%) scale(0.9);
  opacity: 0;
  transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}
```
```

#### 尺寸配置

```css
/* 小尺寸 */
.cyberpunk-widget-plugin.size-small {
  width: 320px;
  height: 480px;
}

/* 中尺寸 */
.cyberpunk-widget-plugin.size-medium {
  width: 480px;
  height: 640px;
}

/* 大尺寸 */
.cyberpunk-widget-plugin.size-large {
  width: 640px;
  height: 800px;
}

/* 自定义尺寸 */
.cyberpunk-widget-plugin.size-custom {
  /* 用户自定义尺寸 */
}
```

### 赛博朋克毛玻璃融合设计

#### 设计理念

赛博朋克毛玻璃融合设计将**赛博朋克的高对比度霓虹效果**与**毛玻璃的柔和通透感**完美结合，创造出既具有未来科技感又不失优雅精致的AI浮窗插件界面。

#### 核心特性

**1. 毛玻璃效果（Glassmorphism）**
- **半透明背景**：使用 `rgba(10, 10, 10, 0.75)` 作为基础背景，保持赛博朋克的深色基调
- **高级模糊效果**：`backdrop-filter: blur(20px) saturate(180%)` 提供深度感和层次感
- **多层玻璃叠加**：通过 `::before` 和 `::after` 伪元素创建多层渐变叠加，增强视觉深度
- **细腻的边框高光**：使用旋转渐变边框创建动态光泽效果
- **柔和阴影**：多层阴影组合，既有赛博朋克的霓虹发光，又有毛玻璃的柔和感
- **饱和度增强**：`saturate(180%)` 使色彩更加通透鲜艳
- **圆角更大**：`border-radius: 20px` 提供更柔和的视觉体验

**2. 赛博朋克元素**
- **霓虹发光**：青色主题的霓虹发光效果，保持赛博朋克的核心视觉特征
- **电路网格**：低透明度的电路网格背景，增强科技感
- **扫描线效果**：水平扫描线动画，营造复古未来感
- **故障动画**：文本和元素的故障效果，增加动态感
- **数据流动画**：垂直数据流动效果，增强科技氛围

**3. 优雅的弹簧动画**
- **弹簧进入动画**：所有元素使用 `cubic-bezier(0.175, 0.885, 0.32, 1.275)` 弹簧缓动函数
- **卡片悬停 8px 上浮 + 放大**：悬停时卡片上浮 8px 并放大 1.02 倍
- **Icon 旋转 360° 动画**：所有图标悬停时旋转 360 度
- **消息气泡的缩放效果**：新消息气泡使用弹簧缩放动画进入
- **AI 思考时的脉冲动画**：三个脉冲点依次放大缩小，模拟 AI 思考过程

**4. 交互增强**
- **光泽扫过效果（Shimmer）**：所有可交互元素都有光泽扫过动画
- **发光效果（Glow）- 青色主题**：聚焦和悬停时的青色霓虹发光
- **卡片悬停时的 3D 提升**：悬停时卡片产生 3D 提升效果
- **打字机效果 + 光标动画**：标题文本使用打字机效果，带闪烁光标
- **Logo 带旋转浮动动画**：Logo 元素持续旋转浮动，增加动态感
- **按钮渐变 + 内光效果**：按钮使用渐变背景和内光效果
- **输入框聚焦时的发光边框**：输入框聚焦时产生强烈的霓虹发光边框

#### 视觉层次

```
┌─────────────────────────────────────────────────────────┐
│  边框高光层（旋转渐变）                        │
│  ┌─────────────────────────────────────────────┐   │
│  │  多层玻璃叠加层（渐变叠加）           │   │
│  │  ┌─────────────────────────────────────┐ │   │
│  │  │  电路网格层（低透明度）         │ │   │
│  │  │  ┌─────────────────────────────────┐ │ │   │
│  │  │  │  扫描线层（动画）         │ │ │   │
│  │  │  │  ┌─────────────────────────┐ │ │ │   │
│  │  │  │  │  内容层（毛玻璃）   │ │ │ │   │
│  │  │  │  └─────────────────────────┘ │ │ │   │
│  │  │  └─────────────────────────────┘ │ │   │
│  │  └─────────────────────────────────────┘ │   │
│  └─────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
```

#### 动画系统

**弹簧动画配置**
```css
/* 弹簧缓动函数 */
:root {
  --spring-easing: cubic-bezier(0.175, 0.885, 0.32, 1.275);
  --spring-duration: 0.4s;
}

/* 通用弹簧动画 */
.spring-animation {
  transition: all var(--spring-duration) var(--spring-easing);
}

/* 弹簧进入动画 */
.spring-enter {
  animation: spring-in var(--spring-duration) var(--spring-easing);
}

@keyframes spring-in {
  0% {
    opacity: 0;
    transform: scale(0.8) translateY(20px);
  }
  100% {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}
```

**光泽扫过动画**
```css
/* 光泽扫过效果 */
.shimmer-effect {
  position: relative;
  overflow: hidden;
}

.shimmer-effect::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 50%;
  height: 100%;
  background: linear-gradient(
    90deg,
    transparent,
    rgba(255, 255, 255, 0.15),
    transparent
  );
  pointer-events: none;
  transition: left 0.5s ease;
}

.shimmer-effect:hover::before {
  left: 100%;
}
```

**霓虹发光动画**
```css
/* 霓虹发光效果 */
.neon-glow {
  box-shadow:
    0 0 20px rgba(0, 240, 255, 0.4),
    0 0 40px rgba(0, 240, 255, 0.2),
    0 0 60px rgba(0, 240, 255, 0.1),
    inset 0 0 20px rgba(0, 240, 255, 0.05);
}

.neon-glow:hover {
  box-shadow:
    0 0 30px rgba(0, 240, 255, 0.5),
    0 0 60px rgba(0, 240, 255, 0.3),
    0 0 90px rgba(0, 240, 255, 0.1),
    inset 0 0 30px rgba(0, 240, 255, 0.08);
}
```

#### 响应式设计

**移动端适配**
```css
@media (max-width: 768px) {
  .cyberpunk-widget-plugin {
    border-radius: 16px;
    backdrop-filter: blur(15px) saturate(150%);
  }
  
  .cyberpunk-widget-header {
    padding: 10px 12px;
  }
  
  .cyberpunk-widget-title {
    font-size: 12px;
  }
  
  .cyberpunk-widget-btn {
    width: 24px;
    height: 24px;
  }
}
```

**桌面端适配**
```css
@media (min-width: 1024px) {
  .cyberpunk-widget-plugin {
    border-radius: 20px;
    backdrop-filter: blur(20px) saturate(180%);
  }
  
  .cyberpunk-widget-header {
    padding: 12px 16px;
  }
  
  .cyberpunk-widget-title {
    font-size: 14px;
  }
  
  .cyberpunk-widget-btn {
    width: 28px;
    height: 28px;
  }
}
```

#### 性能优化

**1. 使用 transform 代替 top/left**
```css
/* 优化前 */
.cyberpunk-widget-plugin {
  top: 100px;
  left: 100px;
}

/* 优化后 */
.cyberpunk-widget-plugin {
  transform: translate(100px, 100px);
}
```

**2. 使用 will-change 提示浏览器优化**
```css
.cyberpunk-widget-plugin {
  will-change: transform, opacity, backdrop-filter;
}

.cyberpunk-widget-btn {
  will-change: transform, box-shadow;
}

.cyberpunk-message-bubble {
  will-change: transform, opacity;
}
```

**3. 使用 GPU 加速**
```css
.cyberpunk-widget-plugin {
  transform: translateZ(0);
  backface-visibility: hidden;
}
```

#### 可访问性

**1. ARIA 属性**
```tsx
<div
  className="cyberpunk-widget-plugin"
  role="dialog"
  aria-label="YYC³ AI 助手"
  aria-modal="true"
>
  <div className="cyberpunk-widget-header">
    <h2 className="cyberpunk-widget-title">YYC³ AI</h2>
    <div className="cyberpunk-widget-controls">
      <button
        className="cyberpunk-widget-btn"
        aria-label="最小化"
        onClick={handleMinimize}
      >
        <MinimizeIcon />
      </button>
      <button
        className="cyberpunk-widget-btn"
        aria-label="最大化"
        onClick={handleMaximize}
      >
        <MaximizeIcon />
      </button>
      <button
        className="cyberpunk-widget-btn"
        aria-label="关闭"
        onClick={handleClose}
      >
        <CloseIcon />
      </button>
    </div>
  </div>
</div>
```

**2. 键盘导航**
```typescript
const handleKeyDown = (e: KeyboardEvent) => {
  switch (e.key) {
    case 'Escape':
      e.preventDefault();
      closeWidget();
      break;
    case 'Tab':
      e.preventDefault();
      focusNextElement();
      break;
    case 'Enter':
    case ' ':
      e.preventDefault();
      activateElement();
      break;
  }
};
```

**3. 焦点管理**
```css
/* 焦点样式 */
.cyberpunk-widget-btn:focus-visible {
  outline: 2px solid #00f0ff;
  outline-offset: 2px;
  box-shadow:
    0 0 10px #00f0ff,
    0 0 20px rgba(0, 240, 255, 0.3);
}

.cyberpunk-widget-input:focus-visible {
  outline: 2px solid #00f0ff;
  outline-offset: 2px;
}
```

#### 浏览器兼容性

**1. backdrop-filter 兼容性**
```css
/* 回退方案 */
.cyberpunk-widget-plugin {
  background: rgba(10, 10, 10, 0.75);
  backdrop-filter: blur(20px) saturate(180%);
  -webkit-backdrop-filter: blur(20px) saturate(180%);
}

/* 不支持 backdrop-filter 的浏览器 */
@supports not (backdrop-filter: blur(20px)) {
  .cyberpunk-widget-plugin {
    background: rgba(10, 10, 10, 0.95);
  }
}
```

**2. CSS 变量回退**
```css
:root {
  --neon-cyan: #00f0ff;
  --neon-magenta: #ff00ff;
  --neon-yellow: #ffff00;
}

/* 不支持 CSS 变量的浏览器 */
.cyberpunk-widget-title {
  color: var(--neon-cyan, #00f0ff);
}
```

### 浮窗组件

#### 霓虹毛玻璃浮窗标题栏

```css
/* 霓虹毛玻璃浮窗标题栏 */
.cyberpunk-widget-header {
  background: rgba(10, 10, 10, 0.6);
  backdrop-filter: blur(15px) saturate(150%);
  -webkit-backdrop-filter: blur(15px) saturate(150%);
  border-bottom: 2px solid rgba(0, 240, 255, 0.4);
  box-shadow:
    0 0 15px rgba(0, 240, 255, 0.3),
    inset 0 0 20px rgba(0, 240, 255, 0.05);
  padding: 12px 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  cursor: move;
  position: relative;
  z-index: 10;
  border-radius: 20px 20px 0 0;
}

/* Logo 带旋转浮动动画 */
.cyberpunk-widget-logo {
  display: flex;
  align-items: center;
  gap: 8px;
  animation: logo-float 3s ease-in-out infinite;
}

@keyframes logo-float {
  0%, 100% {
    transform: translateY(0) rotate(0deg);
  }
  50% {
    transform: translateY(-3px) rotate(2deg);
  }
}

/* 标题 - 打字机效果 + 光标动画 */
.cyberpunk-widget-title {
  color: #00f0ff;
  font-family: 'Orbitron', monospace;
  font-size: 14px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 2px;
  text-shadow:
    0 0 5px #00f0ff,
    0 0 10px #00f0ff,
    0 0 20px rgba(0, 240, 255, 0.5);
  position: relative;
  overflow: hidden;
}

/* 光标动画 */
.cyberpunk-widget-title::after {
  content: '|';
  position: absolute;
  right: -8px;
  animation: cursor-blink 1s step-end infinite;
}

@keyframes cursor-blink {
  0%, 100% { opacity: 1; }
  50% { opacity: 0; }
}

/* 控制按钮 */
.cyberpunk-widget-controls {
  display: flex;
  gap: 8px;
}

.cyberpunk-widget-btn {
  background: transparent;
  border: 1px solid rgba(0, 240, 255, 0.4);
  border-radius: 8px;
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  color: rgba(0, 240, 255, 0.7);
  position: relative;
  overflow: hidden;
}

/* 按钮渐变 + 内光效果 */
.cyberpunk-widget-btn::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(
    135deg,
    transparent 0%,
    rgba(0, 240, 255, 0.1) 50%,
    transparent 100%
  );
  opacity: 0;
  transition: opacity 0.3s ease;
}

.cyberpunk-widget-btn:hover {
  background: rgba(0, 240, 255, 0.15);
  border-color: #00f0ff;
  color: #00f0ff;
  box-shadow:
    0 0 15px rgba(0, 240, 255, 0.4),
    0 0 30px rgba(0, 240, 255, 0.2),
    inset 0 0 10px rgba(0, 240, 255, 0.1);
  transform: scale(1.1);
}

.cyberpunk-widget-btn:hover::before {
  opacity: 1;
}

/* Icon 旋转 360° 动画 */
.cyberpunk-widget-btn svg {
  transition: transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

.cyberpunk-widget-btn:hover svg {
  transform: rotate(360deg);
}
```

#### 霓虹毛玻璃模块切换标签

```css
/* 霓虹毛玻璃模块切换标签 */
.cyberpunk-widget-tabs {
  background: rgba(10, 10, 10, 0.5);
  backdrop-filter: blur(12px) saturate(150%);
  -webkit-backdrop-filter: blur(12px) saturate(150%);
  border-bottom: 2px solid rgba(0, 240, 255, 0.3);
  padding: 8px 12px;
  display: flex;
  gap: 8px;
  position: relative;
  z-index: 10;
}

.cyberpunk-widget-tab {
  background: transparent;
  border: 1px solid rgba(0, 240, 255, 0.3);
  border-radius: 8px;
  padding: 8px 16px;
  color: rgba(0, 240, 255, 0.7);
  font-family: 'Orbitron', monospace;
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 1px;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  position: relative;
  overflow: hidden;
}

/* 标签页光泽扫过效果 */
.cyberpunk-widget-tab::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 50%;
  height: 100%;
  background: linear-gradient(
    90deg,
    transparent,
    rgba(255, 255, 255, 0.15),
    transparent
  );
  pointer-events: none;
  transition: left 0.5s ease;
}

.cyberpunk-widget-tab:hover {
  background: rgba(0, 240, 255, 0.1);
  backdrop-filter: blur(10px) saturate(150%);
  -webkit-backdrop-filter: blur(10px) saturate(150%);
  border-color: rgba(0, 240, 255, 0.5);
  color: rgba(0, 240, 255, 0.9);
  text-shadow:
    0 0 5px rgba(0, 240, 255, 0.5),
    0 0 10px rgba(0, 240, 255, 0.3);
  transform: translateY(-2px);
  box-shadow:
    0 4px 12px rgba(0, 240, 255, 0.2),
    inset 0 0 10px rgba(0, 240, 255, 0.05);
}

.cyberpunk-widget-tab:hover::before {
  left: 100%;
}

.cyberpunk-widget-tab.active {
  background: rgba(0, 240, 255, 0.2);
  backdrop-filter: blur(15px) saturate(180%);
  -webkit-backdrop-filter: blur(15px) saturate(180%);
  border-color: #00f0ff;
  color: #00f0ff;
  box-shadow:
    0 0 15px rgba(0, 240, 255, 0.4),
    0 0 30px rgba(0, 240, 255, 0.2),
    inset 0 0 15px rgba(0, 240, 255, 0.1);
  transform: translateY(-2px);
}
```

#### 霓虹毛玻璃快捷操作栏

```css
/* 霓虹毛玻璃快捷操作栏 */
.cyberpunk-widget-actions {
  background: rgba(10, 10, 10, 0.5);
  backdrop-filter: blur(12px) saturate(150%);
  -webkit-backdrop-filter: blur(12px) saturate(150%);
  border-top: 2px solid rgba(0, 240, 255, 0.3);
  padding: 12px 16px;
  display: flex;
  gap: 8px;
  justify-content: space-around;
  position: relative;
  z-index: 10;
  border-radius: 0 0 20px 20px;
}

.cyberpunk-widget-action {
  background: transparent;
  border: 1px solid rgba(0, 240, 255, 0.3);
  border-radius: 8px;
  padding: 8px 12px;
  color: rgba(0, 240, 255, 0.7);
  font-family: 'Orbitron', monospace;
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 1px;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  position: relative;
  overflow: hidden;
}

/* 快捷操作光泽扫过效果 */
.cyberpunk-widget-action::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 50%;
  height: 100%;
  background: linear-gradient(
    90deg,
    transparent,
    rgba(255, 255, 255, 0.15),
    transparent
  );
  pointer-events: none;
  transition: left 0.5s ease;
}

.cyberpunk-widget-action:hover {
  background: rgba(0, 240, 255, 0.1);
  backdrop-filter: blur(10px) saturate(150%);
  -webkit-backdrop-filter: blur(10px) saturate(150%);
  border-color: #00f0ff;
  color: #00f0ff;
  box-shadow:
    0 0 15px rgba(0, 240, 255, 0.4),
    0 0 30px rgba(0, 240, 255, 0.2),
    inset 0 0 10px rgba(0, 240, 255, 0.05);
  transform: translateY(-3px) scale(1.05);
}

.cyberpunk-widget-action:hover::before {
  left: 100%;
}

/* 快捷操作 Icon 旋转 360° 动画 */
.cyberpunk-widget-action svg {
  transition: transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

.cyberpunk-widget-action:hover svg {
  transform: rotate(360deg);
}
```

#### 霓虹毛玻璃聊天界面

```css
/* 霓虹毛玻璃聊天界面 */
.cyberpunk-widget-chat {
  background: rgba(10, 10, 10, 0.4);
  backdrop-filter: blur(10px) saturate(150%);
  -webkit-backdrop-filter: blur(10px) saturate(150%);
  padding: 16px;
  overflow-y: auto;
  position: relative;
  z-index: 5;
}

/* 消息气泡 */
.cyberpunk-message-bubble {
  background: rgba(0, 240, 255, 0.1);
  backdrop-filter: blur(15px) saturate(180%);
  -webkit-backdrop-filter: blur(15px) saturate(180%);
  border: 1px solid rgba(0, 240, 255, 0.3);
  border-radius: 12px;
  padding: 12px 16px;
  margin-bottom: 12px;
  color: #00f0ff;
  font-family: 'Orbitron', monospace;
  font-size: 14px;
  line-height: 1.5;
  transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  position: relative;
  overflow: hidden;
}

/* 消息气泡的缩放效果 */
.cyberpunk-message-bubble.spring-enter {
  animation: message-scale-in 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

@keyframes message-scale-in {
  0% {
    opacity: 0;
    transform: scale(0.8) translateY(10px);
  }
  100% {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

.cyberpunk-message-bubble:hover {
  background: rgba(0, 240, 255, 0.15);
  border-color: rgba(0, 240, 255, 0.5);
  box-shadow:
    0 4px 12px rgba(0, 240, 255, 0.2),
    inset 0 0 15px rgba(0, 240, 255, 0.05);
  transform: scale(1.02);
}

/* AI 思考时的脉冲动画 */
.cyberpunk-ai-thinking {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
  background: rgba(0, 240, 255, 0.05);
  backdrop-filter: blur(10px) saturate(150%);
  -webkit-backdrop-filter: blur(10px) saturate(150%);
  border-radius: 12px;
  border: 1px solid rgba(0, 240, 255, 0.2);
}

.cyberpunk-ai-thinking-dot {
  width: 8px;
  height: 8px;
  background: #00f0ff;
  border-radius: 50%;
  animation: thinking-pulse 1.5s ease-in-out infinite;
}

.cyberpunk-ai-thinking-dot:nth-child(2) {
  animation-delay: 0.2s;
}

.cyberpunk-ai-thinking-dot:nth-child(3) {
  animation-delay: 0.4s;
}

@keyframes thinking-pulse {
  0%, 100% {
    transform: scale(1);
    opacity: 0.5;
    box-shadow: 0 0 5px rgba(0, 240, 255, 0.3);
  }
  50% {
    transform: scale(1.5);
    opacity: 1;
    box-shadow: 0 0 15px rgba(0, 240, 255, 0.6);
  }
}
```

#### 霓虹毛玻璃输入框

```css
/* 霓虹毛玻璃输入框 */
.cyberpunk-widget-input-wrapper {
  background: rgba(10, 10, 10, 0.5);
  backdrop-filter: blur(15px) saturate(180%);
  -webkit-backdrop-filter: blur(15px) saturate(180%);
  border: 2px solid rgba(0, 240, 255, 0.3);
  border-radius: 12px;
  padding: 4px;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  position: relative;
  overflow: hidden;
}

/* 输入框聚焦时的发光边框 */
.cyberpunk-widget-input-wrapper:focus-within {
  border-color: #00f0ff;
  box-shadow:
    0 0 20px rgba(0, 240, 255, 0.4),
    0 0 40px rgba(0, 240, 255, 0.2),
    inset 0 0 20px rgba(0, 240, 255, 0.1);
  background: rgba(10, 10, 10, 0.7);
}

.cyberpunk-widget-input {
  flex: 1;
  background: transparent;
  border: none;
  outline: none;
  color: #00f0ff;
  font-family: 'Orbitron', monospace;
  font-size: 14px;
  padding: 12px 16px;
  width: 100%;
}

.cyberpunk-widget-input::placeholder {
  color: rgba(0, 240, 255, 0.4);
}

/* 发送按钮 */
.cyberpunk-widget-send-btn {
  background: linear-gradient(135deg, rgba(0, 240, 255, 0.2), rgba(0, 240, 255, 0.1));
  backdrop-filter: blur(10px) saturate(150%);
  -webkit-backdrop-filter: blur(10px) saturate(150%);
  border: 1px solid rgba(0, 240, 255, 0.5);
  border-radius: 8px;
  padding: 10px 16px;
  color: #00f0ff;
  font-family: 'Orbitron', monospace;
  font-size: 12px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 1px;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  position: relative;
  overflow: hidden;
}

/* 发送按钮渐变 + 内光效果 */
.cyberpunk-widget-send-btn::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(
    135deg,
    transparent 0%,
    rgba(0, 240, 255, 0.15) 50%,
    transparent 100%
  );
  opacity: 0;
  transition: opacity 0.3s ease;
}

.cyberpunk-widget-send-btn:hover {
  background: linear-gradient(135deg, rgba(0, 240, 255, 0.3), rgba(0, 240, 255, 0.2));
  border-color: #00f0ff;
  box-shadow:
    0 0 20px rgba(0, 240, 255, 0.4),
    0 0 40px rgba(0, 240, 255, 0.2),
    inset 0 0 15px rgba(0, 240, 255, 0.1);
  transform: translateY(-2px) scale(1.05);
}

.cyberpunk-widget-send-btn:hover::before {
  opacity: 1;
}

/* 发送按钮 Icon 旋转 360° 动画 */
.cyberpunk-widget-send-btn svg {
  transition: transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

.cyberpunk-widget-send-btn:hover svg {
  transform: rotate(360deg);
}
```

.cyberpunk-widget-tab.active {
  background: rgba(0, 240, 255, 0.2);
  border-color: #00f0ff;
  color: #00f0ff;
  box-shadow:
    0 0 10px #00f0ff,
    0 0 20px rgba(0, 240, 255, 0.3),
    inset 0 0 10px rgba(0, 240, 255, 0.1);
}
```

#### 霓虹快捷操作栏

```css
/* 霓虹快捷操作栏 */
.cyberpunk-widget-actions {
  background: rgba(10, 10, 10, 0.9);
  border-top: 2px solid rgba(0, 240, 255, 0.3);
  padding: 12px 16px;
  display: flex;
  gap: 8px;
  justify-content: space-around;
  position: relative;
  z-index: 10;
}

.cyberpunk-widget-action {
  background: transparent;
  border: 1px solid rgba(0, 240, 255, 0.3);
  border-radius: 4px;
  padding: 8px 12px;
  color: rgba(0, 240, 255, 0.7);
  font-family: 'Orbitron', monospace;
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 1px;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}

.cyberpunk-widget-action:hover {
  background: rgba(0, 240, 255, 0.1);
  border-color: #00f0ff;
  color: #00f0ff;
  box-shadow:
    0 0 10px #00f0ff,
    0 0 20px rgba(0, 240, 255, 0.3);
}
```

---

## 🎨 共享设计系统

### 1. 高对比度原则

#### 霓虹发光
```css
/* 文本霓虹发光 */
.neon-text {
  color: #00f0ff;
  text-shadow:
    0 0 5px #00f0ff,
    0 0 10px #00f0ff,
    0 0 20px #00f0ff,
    0 0 40px #00f0ff,
    0 0 80px #00f0ff;
  animation: neon-pulse 2s ease-in-out infinite;
}

@keyframes neon-pulse {
  0%, 100% {
    text-shadow:
      0 0 5px #00f0ff,
      0 0 10px #00f0ff,
      0 0 20px #00f0ff,
      0 0 40px #00f0ff,
      0 0 80px #00f0ff;
  }
  50% {
    text-shadow:
      0 0 10px #00f0ff,
      0 0 20px #00f0ff,
      0 0 40px #00f0ff,
      0 0 80px #00f0ff,
      0 0 120px #00f0ff;
  }
}
```

#### 边框霓虹
```css
/* 边框霓虹发光 */
.neon-border {
  border: 2px solid #ff00ff;
  box-shadow:
    0 0 5px #ff00ff,
    0 0 10px #ff00ff,
    inset 0 0 5px #ff00ff;
  animation: neon-border-pulse 1.5s ease-in-out infinite;
}

@keyframes neon-border-pulse {
  0%, 100% {
    box-shadow:
      0 0 5px #ff00ff,
      0 0 10px #ff00ff,
      inset 0 0 5px #ff00ff;
  }
  50% {
    box-shadow:
      0 0 10px #ff00ff,
      0 0 20px #ff00ff,
      inset 0 0 10px #ff00ff;
  }
}
```

### 2. 科技感原则

#### 电路板效果
```css
/* 电路网格背景 */
.circuit-grid {
  background-image:
    linear-gradient(rgba(0, 240, 255, 0.1) 1px, transparent 1px),
    linear-gradient(90deg, rgba(0, 240, 255, 0.1) 1px, transparent 1px);
  background-size: 20px 20px;
  background-position: center center;
}

/* 电路连接线 */
.circuit-lines {
  position: relative;
  overflow: hidden;
}

.circuit-lines::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background:
    linear-gradient(45deg, transparent 49%, rgba(0, 240, 255, 0.3) 50%, transparent 51%),
    linear-gradient(-45deg, transparent 49%, rgba(255, 0, 255, 0.3) 50%, transparent 51%);
  background-size: 40px 40px;
  animation: circuit-flow 20s linear infinite;
}

@keyframes circuit-flow {
  0% { background-position: 0 0; }
  100% { background-position: 40px 40px; }
}
```

#### 数据流动效果
```css
/* 数据流背景 */
.data-flow {
  background:
    repeating-linear-gradient(
      0deg,
      transparent,
      transparent 2px,
      rgba(0, 240, 255, 0.03) 2px,
      rgba(0, 240, 255, 0.03) 4px
    );
  animation: data-scroll 10s linear infinite;
}

@keyframes data-scroll {
  0% { background-position: 0 0; }
  100% { background-position: 0 100px; }
}
```

### 3. 动态性原则

#### 扫描线效果
```css
/* 水平扫描线 */
.scanlines {
  position: relative;
  overflow: hidden;
}

.scanlines::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: repeating-linear-gradient(
    0deg,
    transparent,
    transparent 2px,
    rgba(0, 0, 0, 0.1) 2px,
    rgba(0, 0, 0, 0.1) 4px
  );
  pointer-events: none;
  animation: scanline-move 10s linear infinite;
}

@keyframes scanline-move {
  0% { background-position: 0 0; }
  100% { background-position: 0 100%; }
}
```

#### 全息投影效果
```css
/* 全息卡片 */
.hologram-card {
  background: linear-gradient(
    135deg,
    rgba(0, 240, 255, 0.1) 0%,
    rgba(0, 240, 255, 0.3) 50%,
    rgba(0, 240, 255, 0.1) 100%
  );
  backdrop-filter: blur(10px);
  border: 1px solid rgba(0, 240, 255, 0.5);
  box-shadow:
    0 0 20px rgba(0, 240, 255, 0.3),
    inset 0 0 20px rgba(0, 240, 255, 0.1);
  animation: hologram-flicker 0.1s infinite;
}

@keyframes hologram-flicker {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.95; }
}
```

---

## 🎨 视觉系统

### 色彩系统

#### 主色调
```css
:root {
  --cyber-cyan: #00f0ff;
  --cyber-magenta: #ff00ff;
  --cyber-yellow: #ffff00;
  --cyber-green: #00ff00;
  --cyber-red: #ff0000;
  --cyber-blue: #0000ff;
}
```

#### 背景色系
```css
:root {
  --cyber-dark: #0a0a0a;
  --cyber-darker: #050505;
  --cyber-black: #000000;
  --cyber-gray: #1a1a1a;
}
```

#### 霓虹渐变
```css
/* 青紫渐变 */
.gradient-cyan-magenta {
  background: linear-gradient(135deg, #00f0ff 0%, #ff00ff 100%);
}

/* 黄绿渐变 */
.gradient-yellow-green {
  background: linear-gradient(135deg, #ffff00 0%, #00ff00 100%);
}

/* 红蓝渐变 */
.gradient-red-blue {
  background: linear-gradient(135deg, #ff0000 0%, #0000ff 100%);
}
```

### 字体系统

#### 字体家族
```css
:root {
  --font-primary: 'Orbitron', 'Rajdhani', 'Share Tech Mono', monospace;
  --font-secondary: 'Exo 2', 'Chakra Petch', sans-serif;
  --font-mono: 'Fira Code', 'JetBrains Mono', 'Consolas', monospace;
}
```

#### 字体大小
```css
:root {
  --text-xs: 12px;
  --text-sm: 14px;
  --text-base: 16px;
  --text-lg: 18px;
  --text-xl: 20px;
  --text-2xl: 24px;
  --text-3xl: 32px;
}
```

### 间距系统

#### 基础间距
```css
:root {
  --space-1: 4px;
  --space-2: 8px;
  --space-3: 12px;
  --space-4: 16px;
  --space-5: 20px;
  --space-6: 24px;
  --space-8: 32px;
  --space-10: 40px;
  --space-12: 48px;
}
```

### 圆角系统

#### 圆角规范
```css
:root {
  --radius-sm: 4px;
  --radius-md: 8px;
  --radius-lg: 12px;
  --radius-xl: 16px;
  --radius-2xl: 20px;
}
```

---

## 🧩 组件规范

### 1. 卡片组件

#### 霓虹卡片
```css
.card-neon {
  background: rgba(10, 10, 10, 0.8);
  border: 2px solid #00f0ff;
  border-radius: 8px;
  padding: 24px;
  box-shadow:
    0 0 10px #00f0ff,
    0 0 20px rgba(0, 240, 255, 0.3);
  transition: all 0.3s ease;
}

.card-neon:hover {
  box-shadow:
    0 0 20px #00f0ff,
    0 0 40px rgba(0, 240, 255, 0.5);
  transform: translateY(-4px);
}
```

#### 全息卡片
```css
.card-hologram {
  background: linear-gradient(
    135deg,
    rgba(0, 240, 255, 0.1) 0%,
    rgba(0, 240, 255, 0.3) 50%,
    rgba(0, 240, 255, 0.1) 100%
  );
  backdrop-filter: blur(10px);
  border: 1px solid rgba(0, 240, 255, 0.5);
  border-radius: 8px;
  padding: 24px;
  box-shadow:
    0 0 20px rgba(0, 240, 255, 0.3),
    inset 0 0 20px rgba(0, 240, 255, 0.1);
  animation: hologram-flicker 0.1s infinite;
}
```

### 2. 按钮组件

#### 霓虹按钮
```css
.button-neon {
  background: transparent;
  border: 2px solid #00f0ff;
  border-radius: 4px;
  padding: 12px 24px;
  color: #00f0ff;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 2px;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
  box-shadow:
    0 0 10px #00f0ff,
    0 0 20px rgba(0, 240, 255, 0.3);
}

.button-neon:hover {
  background: #00f0ff;
  color: #0a0a0a;
  box-shadow:
    0 0 20px #00f0ff,
    0 0 40px rgba(0, 240, 255, 0.5);
  transform: translateY(-2px);
}

.button-neon::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.4), transparent);
  transition: left 0.5s;
}

.button-neon:hover::before {
  left: 100%;
}
```

#### 扫描按钮
```css
.button-scan {
  background: rgba(10, 10, 10, 0.8);
  border: 2px solid #ff00ff;
  border-radius: 4px;
  padding: 12px 24px;
  color: #ff00ff;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 2px;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.button-scan::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: repeating-linear-gradient(
    0deg,
    transparent,
    transparent 2px,
    rgba(255, 0, 255, 0.1) 2px,
    rgba(255, 0, 255, 0.1) 4px
  );
  pointer-events: none;
  animation: scanline-move 2s linear infinite;
}
```

### 3. 输入框组件

#### 霓虹输入框
```css
.input-neon {
  background: rgba(10, 10, 10, 0.8);
  border: 2px solid rgba(0, 240, 255, 0.3);
  border-radius: 4px;
  padding: 12px 16px;
  color: #00f0ff;
  font-size: 16px;
  transition: all 0.3s ease;
  outline: none;
  font-family: 'Orbitron', monospace;
}

.input-neon:focus {
  border-color: #00f0ff;
  box-shadow:
    0 0 10px #00f0ff,
    0 0 20px rgba(0, 240, 255, 0.3),
    inset 0 0 10px rgba(0, 240, 255, 0.1);
  background: rgba(10, 10, 10, 0.9);
}

.input-neon::placeholder {
  color: rgba(0, 240, 255, 0.3);
}
```

### 4. 导航组件

#### 霓虹导航栏
```css
.nav-neon {
  background: rgba(10, 10, 10, 0.9);
  border-bottom: 2px solid #00f0ff;
  box-shadow:
    0 0 10px #00f0ff,
    0 0 20px rgba(0, 240, 255, 0.3);
  padding: 16px 24px;
  position: sticky;
  top: 0;
  z-index: 100;
}

.nav-item-neon {
  background: transparent;
  border: none;
  color: rgba(0, 240, 255, 0.7);
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.3s ease;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.nav-item-neon:hover {
  color: #00f0ff;
  text-shadow:
    0 0 5px #00f0ff,
    0 0 10px #00f0ff;
}

.nav-item-neon.active {
  color: #00f0ff;
  background: rgba(0, 240, 255, 0.1);
  box-shadow:
    0 0 10px #00f0ff,
    inset 0 0 10px rgba(0, 240, 255, 0.1);
}
```

---

## ✨ 交互设计

### 1. 故障效果

#### 文本故障
```css
.glitch-text {
  position: relative;
}

.glitch-text::before,
.glitch-text::after {
  content: attr(data-text);
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}

.glitch-text::before {
  left: 2px;
  text-shadow: -2px 0 #ff00ff;
  animation: glitch-1 2s infinite linear alternate-reverse;
}

.glitch-text::after {
  left: -2px;
  text-shadow: -2px 0 #00f0ff;
  animation: glitch-2 3s infinite linear alternate-reverse;
}

@keyframes glitch-1 {
  0%, 100% { clip-path: inset(0 0 0 0); transform: translate(0); }
  20% { clip-path: inset(20% 0 60% 0); transform: translate(-2px, 2px); }
  40% { clip-path: inset(40% 0 40% 0); transform: translate(2px, -2px); }
  60% { clip-path: inset(60% 0 20% 0); transform: translate(-2px, 2px); }
  80% { clip-path: inset(80% 0 0 0); transform: translate(2px, -2px); }
}

@keyframes glitch-2 {
  0%, 100% { clip-path: inset(0 0 0 0); transform: translate(0); }
  20% { clip-path: inset(60% 0 20% 0); transform: translate(2px, -2px); }
  40% { clip-path: inset(40% 0 40% 0); transform: translate(-2px, 2px); }
  60% { clip-path: inset(20% 0 60% 0); transform: translate(2px, -2px); }
  80% { clip-path: inset(0 0 80% 0); transform: translate(-2px, 2px); }
}
```

### 2. 悬停效果

#### 霓虹悬停
```css
.card-neon {
  transition: all 0.3s ease;
}

.card-neon:hover {
  box-shadow:
    0 0 20px #00f0ff,
    0 0 40px rgba(0, 240, 255, 0.5);
  transform: translateY(-4px);
}
```

### 3. 点击效果

#### 霓虹点击
```css
.button-neon {
  transition: all 0.15s ease;
}

.button-neon:active {
  transform: scale(0.98);
  box-shadow:
    0 0 5px #00f0ff,
    0 0 10px rgba(0, 240, 255, 0.3);
}
```

---

## 💻 开发指导

### 1. 技术栈推荐

#### 前端框架
```json
{
  "framework": "React 18+",
  "language": "TypeScript",
  "styling": "Tailwind CSS + CSS Modules",
  "state": "Zustand",
  "router": "React Router v6"
}
```

#### UI组件库
```json
{
  "base": "Radix UI",
  "animations": "Framer Motion",
  "icons": "Lucide React",
  "forms": "React Hook Form"
}
```

### 2. 项目结构

```
src/
├── components/
│   ├── cyberpunk/
│   │   ├── NeonCard.tsx
│   │   ├── NeonButton.tsx
│   │   ├── NeonInput.tsx
│   │   └── HologramCard.tsx
│   ├── layout/
│   │   ├── Header.tsx
│   │   ├── Sidebar.tsx
│   │   └── Footer.tsx
│   └── common/
│       ├── Loading.tsx
│       └── Error.tsx
├── styles/
│   ├── neon.css
│   ├── glitch.css
│   └── variables.css
├── hooks/
│   ├── useNeonEffect.ts
│   └── useGlitchAnimation.ts
└── utils/
    ├── color.ts
    └── animation.ts
```

### 3. 性能优化

#### 懒加载
```typescript
const LazyNeonCard = React.lazy(() => import('./components/cyberpunk/NeonCard'));

const App = () => {
  return (
    <React.Suspense fallback={<Loading />}>
      <LazyNeonCard />
    </React.Suspense>
  );
};
```

#### 虚拟滚动
```typescript
import { useVirtualizer } from '@tanstack/react-virtual';

const VirtualList = ({ items }: { items: any[] }) => {
  const parentRef = React.useRef<HTMLDivElement>(null);
  
  const virtualizer = useVirtualizer({
    count: items.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 200,
  });

  return (
    <div ref={parentRef} style={{ height: '100vh', overflow: 'auto' }}>
      <div style={{ height: `${virtualizer.getTotalSize()}px` }}>
        {virtualizer.getVirtualItems().map((virtualItem) => (
          <div
            key={virtualItem.key}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: `${virtualItem.size}px`,
              transform: `translateY(${virtualItem.start}px)`,
            }}
          >
            <NeonCard item={items[virtualItem.index]} />
          </div>
        ))}
      </div>
    </div>
  );
};
```

---

## 🔧 技术实现

### 1. React组件实现

#### 霓虹卡片组件
```typescript
import React from 'react';

interface NeonCardProps {
  children: React.ReactNode;
  className?: string;
  color?: string;
}

export const NeonCard: React.FC<NeonCardProps> = ({
  children,
  className = '',
  color = '#00f0ff',
}) => {
  return (
    <div
      className="card-neon"
      style={{
        '--neon-color': color,
      }}
    >
      {children}
    </div>
  );
};
```

#### 故障文本组件
```typescript
import React, { useState, useEffect } from 'react';

interface GlitchTextProps {
  text: string;
  className?: string;
}

export const GlitchText: React.FC<GlitchTextProps> = ({
  text,
  className = '',
}) => {
  const [isGlitching, setIsGlitching] = useState(false);
  
  useEffect(() => {
    const interval = setInterval(() => {
      setIsGlitching(Math.random() > 0.7);
    }, 3000);
    
    return () => clearInterval(interval);
  }, []);
  
  return (
    <span
      className={`glitch-text ${isGlitching ? 'glitching' : ''} ${className}`}
      data-text={text}
    >
      {text}
    </span>
  );
};
```

### 2. 自定义Hooks

#### 霓虹效果Hook
```typescript
import { useEffect, useRef } from 'react';

export const useNeonEffect = (color: string = '#00f0ff') => {
  const elementRef = useRef<HTMLElement>(null);
  
  useEffect(() => {
    if (!elementRef.current) return;
    
    const element = elementRef.current;
    
    // 添加脉冲发光效果
    const addPulseEffect = () => {
      element.style.setProperty('--neon-glow', color);
    };
    
    addPulseEffect();
    
    return () => {
      element.style.removeProperty('--neon-glow');
    };
  }, [color]);
  
  return elementRef;
};
```

#### 故障动画Hook
```typescript
import { useEffect, useState } from 'react';

export const useGlitchAnimation = (enabled: boolean = true) => {
  const [isGlitching, setIsGlitching] = useState(false);
  
  useEffect(() => {
    if (!enabled) return;
    
    const interval = setInterval(() => {
      setIsGlitching(Math.random() > 0.8);
    }, 2000);
    
    return () => clearInterval(interval);
  }, [enabled]);
  
  return isGlitching;
};
```

---

## 📚 最佳实践

### 1. 性能优化

#### 减少重绘
```css
/* 使用transform代替top/left */
.card-neon {
  transform: translateY(0);
  transition: transform 0.3s ease;
}

.card-neon:hover {
  transform: translateY(-4px);
}
```

#### 使用will-change
```css
/* 提示浏览器优化 */
.card-neon {
  will-change: transform, opacity, box-shadow;
}

.neon-text {
  will-change: text-shadow, color;
}
```

### 2. 可访问性

#### ARIA属性
```tsx
<div
  className="card-neon"
  role="article"
  aria-label="霓虹卡片"
>
  <h2>卡片标题</h2>
  <p>卡片内容</p>
</div>
```

#### 键盘导航
```typescript
const handleKeyDown = (e: KeyboardEvent) => {
  switch (e.key) {
    case 'Tab':
      e.preventDefault();
      focusNextElement();
      break;
    case 'Enter':
    case ' ':
      e.preventDefault();
      activateElement();
      break;
    case 'Escape':
      closeDropdown();
      break;
  }
};
```

### 3. 响应式设计

#### 移动端适配
```css
@media (max-width: 768px) {
  .card-neon {
    padding: 16px;
    border-width: 1px;
  }
  
  .neon-text {
    font-size: 14px;
  }
}
```

#### 桌面端适配
```css
@media (min-width: 1024px) {
  .card-neon {
    padding: 24px;
    border-width: 2px;
  }
  
  .neon-text {
    font-size: 16px;
  }
}
```

---

<div align="center">

> 「***YanYuCloudCube***」
> 「***<admin@0379.email>***」
> 「***Words Initiate Quadrants, Language Serves as Core for Future***」
> 「***All things converge in cloud pivot; Deep stacks ignite a new era of intelligence***」

</div>
