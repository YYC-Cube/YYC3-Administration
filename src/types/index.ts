/**
 * ==========================================
 * YYC³ 言语智能 - TypeScript 类型定义系统
 * YYC³ AI Marketing Automation Terminal - Type Definitions
 * ==========================================
 *
 * 完整的类型安全系统，涵盖：
 * - 组件Props接口
 * - 数据模型和状态类型
 * - API请求/响应类型
 * - 枚举和联合类型
 * - 工具类型和泛型
 *
 * @version 2.0.0
 * @author YYC³ Team
 */

// ==========================================
// 1. 基础类型 & 枚举
// ==========================================

/**
 * 页面标识符
 */
export type PageId =
  | 'dashboard' // 数据驾驶舱
  | 'chat' // AI对话
  | 'clm' // 客户生命周期
  | 'aicall' // AI呼叫中心
  | 'tools' // 智能工具箱
  | 'workflow' // 自动化工作流
  | 'insights' // 数据洞察
  | 'settings' // 系统设置
  | 'logs' // 活动日志
  | 'forms' // 智能表单
  | 'contacts' // 通讯录
  | 'customerCare' // 客户关怀

/**
 * 应用模式
 */
export type AppMode = 'standalone' | 'widget'

/**
 * 主题模式
 */
export type ThemeMode = 'cyberpunk' | 'liquidGlass'

/**
 * 语言代码
 */
export type LanguageCode = 'zh-CN' | 'en-US'

/**
 * 通知类型
 */
export type NotificationType = 'info' | 'success' | 'warning' | 'error'

/**
 * 活动类型
 */
export type ActivityType = 'customer' | 'call' | 'system' | 'ai'

/**
 * 客户生命周期阶段
 */
export type CustomerStage = '获客' | '转化' | '成交' | '服务' | '忠诚'
export type CustomerStageEN = 'acquisition' | 'conversion' | 'closing' | 'service' | 'loyalty'

/**
 * 风险等级
 */
export type RiskLevel = 'low' | 'medium' | 'high'

/**
 * 客户关怀状态
 */
export type CareStatus = 'pending' | 'inProgress' | 'completed' | 'archived'

/**
 * 客户等级
 */
export type CustomerLevel = 'vip' | 'high' | 'normal' | 'low'

/**
 * AI模型类型
 */
export type AIModelType =
  | 'gpt-4'
  | 'gpt-3.5-turbo'
  | 'claude-3-opus'
  | 'claude-3-sonnet'
  | 'gemini-pro'
  | 'deepseek-v3'
  | 'qwen-max'
  | 'moonshot-v1'

/**
 * 表单字段类型
 */
export type FormFieldType =
  | 'text'
  | 'textarea'
  | 'number'
  | 'email'
  | 'phone'
  | 'date'
  | 'select'
  | 'radio'
  | 'checkbox'
  | 'file'
  | 'rating'
  | 'slider'

/**
 * 表单模板类别
 */
export type FormCategory =
  | '客户调研'
  | '满意度评价'
  | '需求收集'
  | '反馈建议'
  | '订单信息'
  | '预约登记'

// ==========================================
// 2. 数据模型
// ==========================================

/**
 * 主题配置
 */
export interface ThemeConfig {
  /** 霓虹光强度 (0-100) */
  neonIntensity: number
  /** 启用扫描线效果 */
  scanlineEnabled: boolean
  /** 启用故障效果 */
  glitchEnabled: boolean
  /** 启用电路网格 */
  circuitGridEnabled: boolean
  /** 启用数据流动画 */
  dataFlowEnabled: boolean
  /** 启用弹簧动画 */
  springAnimEnabled: boolean
  /** 启用模糊效果 */
  blurEnabled: boolean
}

/**
 * 通知项
 */
export interface NotificationItem {
  /** 唯一标识 */
  id: string
  /** 标题 */
  title: string
  /** 消息内容 */
  message: string
  /** 通知类型 */
  type: NotificationType
  /** 主题色 */
  color: string
  /** 时间戳 */
  timestamp: Date
  /** 是否已读 */
  read: boolean
}

/**
 * 活动项
 */
export interface ActivityItem {
  /** 唯一标识 */
  id: string
  /** 操作描述 */
  action: string
  /** 目标对象 */
  target: string
  /** 时间戳 */
  timestamp: Date
  /** 活动类型 */
  type: ActivityType
  /** 主题色 */
  color: string
}

/**
 * 联系人（共享数据模型）
 */
export interface SharedContact {
  /** 唯一标识 */
  id: string
  /** 姓名 */
  name: string
  /** 电话 */
  phone: string
  /** 邮箱 */
  email: string
  /** 公司 */
  company: string
  /** 职位 */
  position: string
  /** 生命周期阶段 */
  stage: CustomerStage
  /** 标签 */
  tags: string[]
  /** AI评分 (0-100) */
  aiScore: number
  /** AI洞察 */
  aiInsights: string[]
  /** 是否星标 */
  starred: boolean
  /** 头像URL */
  avatar?: string
  /** 地址 */
  address: string
  /** 来源渠道 */
  source: string
  /** 创建时间 */
  createdAt: string
  /** 最后联系 */
  lastContact: string
  /** 通话次数 */
  totalCalls: number
  /** 总价值 */
  totalValue: number
  /** 备注 */
  notes: string
  /** 风险等级 */
  riskLevel: RiskLevel
}

/**
 * 客户关怀记录
 */
export interface CustomerCareRecord {
  /** 唯一标识 */
  id: string
  /** 客户姓名 */
  name: string
  /** 公司 */
  company: string
  /** 电话 */
  phone: string
  /** 邮箱 */
  email: string
  /** 当前状态 */
  status: CareStatus
  /** 客户等级 */
  level: CustomerLevel
  /** 最后联系时间 */
  lastContact: string
  /** 下次跟进时间 */
  nextFollowUp: string
  /** 负责人 */
  responsible: string
  /** 标签 */
  tags: string[]
  /** 备注 */
  notes: string
  /** 来源渠道 */
  source: string
  /** 创建时间 */
  createdAt: string
}

/**
 * AI模型配置
 */
export interface AIModelConfig {
  /** 模型标识 */
  id: AIModelType
  /** 显示名称 */
  name: string
  /** 描述 */
  description: string
  /** 提供商 */
  provider: string
  /** 是否可用 */
  available: boolean
  /** 温度 (0-2) */
  temperature: number
  /** 最大令牌数 */
  maxTokens: number
  /** Top P (0-1) */
  topP: number
  /** 频率惩罚 (-2 to 2) */
  frequencyPenalty: number
  /** 存在惩罚 (-2 to 2) */
  presencePenalty: number
  /** 自定义系统提示 */
  systemPrompt?: string
}

/**
 * 表单字段定义
 */
export interface FormField {
  /** 字段ID */
  id: string
  /** 字段类型 */
  type: FormFieldType
  /** 标签 */
  label: string
  /** 占位符 */
  placeholder?: string
  /** 是否必填 */
  required: boolean
  /** 选项（用于select/radio/checkbox） */
  options?: string[]
  /** 验证规则 */
  validation?: {
    min?: number
    max?: number
    pattern?: string
    message?: string
  }
  /** 默认值 */
  defaultValue?: unknown
}

/**
 * 表单模板
 */
export interface FormTemplate {
  /** 模板ID */
  id: string
  /** 模板名称 */
  name: string
  /** 模板描述 */
  description: string
  /** 分类 */
  category: FormCategory
  /** 图标 */
  icon: string
  /** 字段列表 */
  fields: FormField[]
  /** 创建时间 */
  createdAt: string
  /** 提交次数 */
  submissions: number
  /** 是否为系统模板 */
  isSystem: boolean
}

/**
 * 表单提交数据
 */
export interface FormSubmission {
  /** 提交ID */
  id: string
  /** 表单模板ID */
  formId: string
  /** 表单名称 */
  formName: string
  /** 提交数据 */
  data: Record<string, unknown>
  /** 提交时间 */
  timestamp: string
  /** 提交者IP */
  ip?: string
  /** 设备信息 */
  device?: string
}

/**
 * 通话记录
 */
export interface CallRecord {
  /** 记录ID */
  id: string
  /** 联系人ID */
  contactId: string
  /** 客户姓名 */
  customerName: string
  /** 电话号码 */
  phoneNumber: string
  /** 通话时长（秒） */
  duration: number
  /** 通话类型 */
  type: 'inbound' | 'outbound'
  /** 通话状态 */
  status: 'completed' | 'missed' | 'cancelled'
  /** 通话时间 */
  timestamp: string
  /** AI转录文本 */
  transcript?: string
  /** 情感分析 */
  sentiment?: 'positive' | 'neutral' | 'negative'
  /** 关键词 */
  keywords?: string[]
  /** 录音URL */
  recordingUrl?: string
  /** 备注 */
  notes?: string
}

/**
 * 号码数据库记录
 */
export interface NumberRecord {
  /** 号码ID */
  id: string
  /** 电话号码 */
  number: string
  /** 归属地 */
  location: string
  /** 运营商 */
  carrier: string
  /** 标签 */
  tags: string[]
  /** 备注 */
  notes: string
  /** 信任评分 (0-100) */
  trustScore: number
  /** 呼叫次数 */
  callCount: number
  /** 最后呼叫 */
  lastCall: string
  /** 是否加入黑名单 */
  blacklisted: boolean
  /** 创建时间 */
  createdAt: string
}

/**
 * 工作流节点
 */
export interface WorkflowNode {
  /** 节点ID */
  id: string
  /** 节点类型 */
  type: 'trigger' | 'condition' | 'action' | 'delay'
  /** 节点标题 */
  title: string
  /** 节点配置 */
  config: Record<string, unknown>
  /** 位置坐标 */
  position: { x: number; y: number }
  /** 连接的下一个节点 */
  nextNodes?: string[]
}

/**
 * 工作流定义
 */
export interface Workflow {
  /** 工作流ID */
  id: string
  /** 工作流名称 */
  name: string
  /** 描述 */
  description: string
  /** 节点列表 */
  nodes: WorkflowNode[]
  /** 是否启用 */
  enabled: boolean
  /** 创建时间 */
  createdAt: string
  /** 最后执行时间 */
  lastRun?: string
  /** 执行次数 */
  runCount: number
}

// ==========================================
// 3. 状态类型
// ==========================================

/**
 * 应用全局状态
 */
export interface AppState {
  /** 当前页面 */
  activePage: PageId
  /** 应用模式 */
  appMode: AppMode
  /** 侧边栏是否固定 */
  sidebarPinned: boolean
  /** 通知列表 */
  notifications: NotificationItem[]
  /** 最近活动 */
  recentActivities: ActivityItem[]
  /** 主题配置 */
  theme: ThemeConfig
  /** 引导是否完成 */
  onboardingDone: boolean
  /** 移动端侧边栏是否打开 */
  mobileSidebarOpen: boolean
}

/**
 * 联系人状态
 */
export interface ContactsState {
  /** 联系人列表 */
  contacts: SharedContact[]
  /** 搜索查询 */
  searchQuery: string
  /** 筛选标签 */
  selectedTags: string[]
  /** 筛选阶段 */
  selectedStages: CustomerStage[]
  /** 排序方式 */
  sortBy: 'name' | 'company' | 'aiScore' | 'createdAt' | 'lastContact'
  /** 排序方向 */
  sortOrder: 'asc' | 'desc'
  /** 仅显示星标 */
  showStarredOnly: boolean
}

/**
 * 实时KPI数据
 */
export interface LiveKPIData {
  /** 客户总数 */
  customers: number
  /** 今日呼叫数 */
  calls: number
  /** AI任务数 */
  aiTasks: number
  /** 响应时间（毫秒） */
  responseMs: number
  /** 刷新键（用于触发更新） */
  refreshKey: number
}

// ==========================================
// 4. Context类型
// ==========================================

/**
 * 应用Context类型
 */
export interface AppContextType extends AppState {
  /** 设置当前页面 */
  setActivePage: (page: PageId) => void
  /** 设置应用模式 */
  setAppMode: (mode: AppMode) => void
  /** 设置侧边栏固定状态 */
  setSidebarPinned: (pinned: boolean) => void
  /** 添加通知 */
  addNotification: (n: Omit<NotificationItem, 'id' | 'timestamp' | 'read'>) => void
  /** 标记通知为已读 */
  markNotificationRead: (id: string) => void
  /** 清空所有通知 */
  clearNotifications: () => void
  /** 添加活动记录 */
  addActivity: (a: Omit<ActivityItem, 'id' | 'timestamp'>) => void
  /** 未读通知数量 */
  unreadCount: number
  /** 更新主题配置 */
  updateTheme: (partial: Partial<ThemeConfig>) => void
  /** 重置主题配置 */
  resetTheme: () => void
  /** 设置引导完成状态 */
  setOnboardingDone: (done: boolean) => void
  /** 设置移动端侧边栏状态 */
  setMobileSidebarOpen: (open: boolean) => void
  /** 计算霓虹透明度 */
  neonAlpha: (base: number) => number
}

/**
 * 联系人Context类型
 */
export interface ContactsContextType {
  /** 联系人列表 */
  contacts: SharedContact[]
  /** 添加联系人 */
  addContact: (contact: Omit<SharedContact, 'id' | 'createdAt'>) => void
  /** 更新联系人 */
  updateContact: (id: string, updates: Partial<SharedContact>) => void
  /** 删除联系人 */
  deleteContact: (id: string) => void
  /** 批量删除联系人 */
  bulkDelete: (ids: string[]) => void
  /** 恢复已删除联系人 */
  restoreContact: (id: string) => void
  /** 切换星标状态 */
  toggleStar: (id: string) => void
  /** 导出为CSV */
  exportToCSV: () => void
  /** 导入CSV */
  importFromCSV: (csv: string) => void
  /** 已删除联系人列表 */
  deletedContacts: SharedContact[]
}

/**
 * AI模型Context类型
 */
export interface AIModelContextType {
  /** 当前选中的模型 */
  selectedModel: AIModelType
  /** 设置模型 */
  setSelectedModel: (model: AIModelType) => void
  /** 模型配置 */
  modelConfig: AIModelConfig
  /** 更新模型配置 */
  updateModelConfig: (config: Partial<AIModelConfig>) => void
  /** 可用模型列表 */
  availableModels: AIModelConfig[]
}

/**
 * 主题切换Context类型
 */
export interface ThemeSwitcherContextType {
  /** 当前主题 */
  theme: ThemeMode
  /** 切换主题 */
  toggleTheme: () => void
  /** 设置主题 */
  setTheme: (theme: ThemeMode) => void
}

/**
 * 国际化Context类型
 */
export interface I18nContextType {
  /** 当前语言 */
  locale: LanguageCode
  /** 切换语言 */
  setLocale: (locale: LanguageCode) => void
  /** 翻译函数 */
  t: (key: string, params?: Record<string, unknown>) => string
}

// ==========================================
// 5. 组件Props接口
// ==========================================

/**
 * 页面组件通用Props
 */
export interface PageProps {
  /** 页面标题（可选） */
  title?: string
  /** 页面副标题（可选） */
  subtitle?: string
  /** 子元素 */
  children?: React.ReactNode
  /** 自定义类名 */
  className?: string
}

/**
 * 卡片组件Props
 */
export interface NeonCardProps {
  /** 子元素 */
  children: React.ReactNode
  /** 霓虹主题色 */
  color?: string
  /** 是否可悬停 */
  hoverable?: boolean
  /** 自定义类名 */
  className?: string
  /** 点击事件 */
  onClick?: () => void
}

/**
 * 按钮组件Props
 */
export interface ButtonProps {
  /** 按钮文字 */
  children: React.ReactNode
  /** 按钮变体 */
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost'
  /** 按钮尺寸 */
  size?: 'sm' | 'md' | 'lg'
  /** 是否禁用 */
  disabled?: boolean
  /** 是否加载中 */
  loading?: boolean
  /** 点击事件 */
  onClick?: () => void
  /** 自定义类名 */
  className?: string
  /** 图标（左侧） */
  icon?: React.ReactNode
  /** 图标（右侧） */
  iconRight?: React.ReactNode
}

/**
 * 输入框组件Props
 */
export interface InputProps {
  /** 输入框类型 */
  type?: 'text' | 'password' | 'email' | 'number' | 'tel' | 'url'
  /** 当前值 */
  value: string
  /** 值变化回调 */
  onChange: (value: string) => void
  /** 占位符 */
  placeholder?: string
  /** 是否禁用 */
  disabled?: boolean
  /** 是否只读 */
  readOnly?: boolean
  /** 是否必填 */
  required?: boolean
  /** 错误信息 */
  error?: string
  /** 图标 */
  icon?: React.ReactNode
  /** 自定义类名 */
  className?: string
  /** 最大长度 */
  maxLength?: number
  /** 自动聚焦 */
  autoFocus?: boolean
}

/**
 * 模态框组件Props
 */
export interface ModalProps {
  /** 是否显示 */
  open: boolean
  /** 关闭回调 */
  onClose: () => void
  /** 模态框标题 */
  title: string
  /** 子元素 */
  children: React.ReactNode
  /** 自定义类名 */
  className?: string
  /** 尺寸 */
  size?: 'sm' | 'md' | 'lg' | 'xl'
  /** 是否显示关闭按钮 */
  showCloseButton?: boolean
  /** 点击遮罩是否关闭 */
  closeOnOverlayClick?: boolean
}

/**
 * 聊天消息Props
 */
export interface ChatMessageProps {
  /** 消息ID */
  id: string
  /** 消息内容 */
  content: string
  /** 发送者角色 */
  role: 'user' | 'assistant' | 'system'
  /** 时间戳 */
  timestamp: Date
  /** 是否正在输入 */
  isTyping?: boolean
  /** 头像URL */
  avatar?: string
}

/**
 * 表单构建器Props
 */
export interface FormBuilderProps {
  /** 表单模板 */
  template: FormTemplate
  /** 提交回调 */
  onSubmit: (data: Record<string, unknown>) => void
  /** 取消回调 */
  onCancel?: () => void
  /** 初始数据 */
  initialData?: Record<string, unknown>
  /** 是否只读 */
  readOnly?: boolean
}

/**
 * 数据表格Props
 */
export interface DataTableProps<T = unknown> {
  /** 数据列表 */
  data: T[]
  /** 列定义 */
  columns: TableColumn<T>[]
  /** 是否加载中 */
  loading?: boolean
  /** 空数据提示 */
  emptyText?: string
  /** 行点击事件 */
  onRowClick?: (row: T) => void
  /** 自定义类名 */
  className?: string
  /** 是否显示分页 */
  pagination?: boolean
  /** 每页数量 */
  pageSize?: number
}

/**
 * 表格列定义
 */
export interface TableColumn<T = unknown> {
  /** 列标题 */
  title: string
  /** 数据键 */
  key: keyof T | string
  /** 自定义渲染 */
  render?: (value: unknown, row: T, index: number) => React.ReactNode
  /** 列宽 */
  width?: number | string
  /** 是否可排序 */
  sortable?: boolean
  /** 对齐方式 */
  align?: 'left' | 'center' | 'right'
}

/**
 * 图表组件Props
 */
export interface ChartProps {
  /** 图表数据 */
  data: unknown[]
  /** 图表类型 */
  type?: 'line' | 'bar' | 'pie' | 'area' | 'radial'
  /** 图表高度 */
  height?: number
  /** 图表颜色 */
  colors?: string[]
  /** 自定义类名 */
  className?: string
}

/**
 * 通知抽屉Props
 */
export interface NotificationDrawerProps {
  /** 是否打开 */
  open: boolean
  /** 关闭回调 */
  onClose: () => void
  /** 通知列表 */
  notifications: NotificationItem[]
  /** 标记已读回调 */
  onMarkRead: (id: string) => void
  /** 清空所有回调 */
  onClearAll: () => void
}

/**
 * 命令面板Props
 */
export interface CommandPaletteProps {
  /** 是否打开 */
  open: boolean
  /** 关闭回调 */
  onClose: () => void
  /** 命令列表 */
  commands?: Command[]
}

/**
 * 命令定义
 */
export interface Command {
  /** 命令ID */
  id: string
  /** 命令标题 */
  title: string
  /** 命令描述 */
  description?: string
  /** 图标 */
  icon?: React.ReactNode
  /** 快捷键 */
  shortcut?: string[]
  /** 执行回调 */
  onExecute: () => void
  /** 分类 */
  category?: string
}

/**
 * Dashboard页面Props
 */
export interface DashboardPageProps {
  /** 打开导出模态框回调 */
  onOpenExport?: () => void
}

/**
 * 客户关怀页面Props
 */
export interface CustomerCarePageProps {
  /** 自定义类名 */
  className?: string
}

/**
 * 联系人卡片Props
 */
export interface ContactCardProps {
  /** 联系人数据 */
  contact: SharedContact
  /** 点击回调 */
  onClick?: () => void
  /** 星标切换回调 */
  onToggleStar?: (id: string) => void
  /** 删除回调 */
  onDelete?: (id: string) => void
  /** 编辑回调 */
  onEdit?: (id: string) => void
}

// ==========================================
// 6. API类型
// ==========================================

/**
 * API响应基础类型
 */
export interface ApiResponse<T = unknown> {
  /** 是否成功 */
  success: boolean
  /** 响应数据 */
  data: T
  /** 错误信息 */
  error?: ErrorType
  /** 响应消息 */
  message?: string
  /** 时间戳 */
  timestamp?: string
}

/**
 * 分页响应类型
 */
export interface PaginatedResponse<T = unknown> {
  /** 数据列表 */
  items: T[]
  /** 总数 */
  total: number
  /** 当前页 */
  page: number
  /** 每页数量 */
  pageSize: number
  /** 总页数 */
  totalPages: number
  /** 是否有下一页 */
  hasNext: boolean
  /** 是否有上一页 */
  hasPrev: boolean
}

/**
 * 错误类型
 */
export interface ErrorType {
  /** 错误代码 */
  code: string
  /** 错误消息 */
  message: string
  /** 错误详情 */
  details?: Record<string, unknown>
  /** 堆栈信息（仅开发环境） */
  stack?: string
}

/**
 * 登录请求
 */
export interface LoginRequest {
  /** 用户名或邮箱 */
  username: string
  /** 密码 */
  password: string
  /** 记住我 */
  rememberMe?: boolean
}

/**
 * 登录响应
 */
export interface LoginResponse {
  /** 访问令牌 */
  accessToken: string
  /** 刷新令牌 */
  refreshToken: string
  /** 用户信息 */
  user: UserProfile
  /** 过期时间（秒） */
  expiresIn: number
}

/**
 * 用户资料
 */
export interface UserProfile {
  /** 用户ID */
  id: string
  /** 用户名 */
  username: string
  /** 邮箱 */
  email: string
  /** 显示名称 */
  displayName: string
  /** 头像URL */
  avatar?: string
  /** 角色 */
  role: 'admin' | 'manager' | 'agent' | 'viewer'
  /** 权限列表 */
  permissions: string[]
  /** 创建时间 */
  createdAt: string
  /** 最后登录时间 */
  lastLoginAt?: string
}

/**
 * AI对话请求
 */
export interface ChatRequest {
  /** 消息内容 */
  message: string
  /** 对话ID */
  conversationId?: string
  /** 模型类型 */
  model?: AIModelType
  /** 流式响应 */
  stream?: boolean
  /** 上下文 */
  context?: Record<string, unknown>
}

/**
 * AI对话响应
 */
export interface ChatResponse {
  /** 响应ID */
  id: string
  /** 对话ID */
  conversationId: string
  /** 响应内容 */
  content: string
  /** 使用的模型 */
  model: AIModelType
  /** 令牌使用情况 */
  usage: {
    promptTokens: number
    completionTokens: number
    totalTokens: number
  }
  /** 完成原因 */
  finishReason: 'stop' | 'length' | 'content_filter'
}

/**
 * 呼叫请求
 */
export interface CallRequest {
  /** 目标号码 */
  phoneNumber: string
  /** 联系人ID（可选） */
  contactId?: string
  /** 呼叫脚本 */
  script?: string
  /** 录音设置 */
  record?: boolean
}

/**
 * 呼叫响应
 */
export interface CallResponse {
  /** 呼叫ID */
  callId: string
  /** 状态 */
  status: 'initiated' | 'ringing' | 'connected' | 'completed' | 'failed'
  /** 开始时间 */
  startTime: string
  /** 结束时间 */
  endTime?: string
  /** 通话时长（秒） */
  duration?: number
}

/**
 * 数据导出请求
 */
export interface ExportRequest {
  /** 数据类型 */
  dataType: 'contacts' | 'calls' | 'forms' | 'analytics'
  /** 导出格式 */
  format: 'csv' | 'xlsx' | 'json' | 'pdf'
  /** 筛选条件 */
  filters?: Record<string, unknown>
  /** 日期范围 */
  dateRange?: {
    from: string
    to: string
  }
}

/**
 * 数据导出响应
 */
export interface ExportResponse {
  /** 导出ID */
  exportId: string
  /** 文件URL */
  fileUrl: string
  /** 文件大小（字节） */
  fileSize: number
  /** 导出时间 */
  exportedAt: string
  /** 过期时间 */
  expiresAt: string
}

// ==========================================
// 7. 工具类型
// ==========================================

/**
 * 使ID可选
 */
export type WithOptionalId<T extends { id: string }> = Omit<T, 'id'> & { id?: string }

/**
 * 使时间戳可选
 */
export type WithOptionalTimestamp<T extends { createdAt: string }> = Omit<T, 'createdAt'> & {
  createdAt?: string
}

/**
 * 深度只读
 */
export type DeepReadonly<T> = {
  readonly [P in keyof T]: T[P] extends object ? DeepReadonly<T[P]> : T[P]
}

/**
 * 深度部分
 */
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P]
}

/**
 * 提取函数参数类型
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type ExtractFunctionParams<T> = T extends (...args: infer P) => any ? P : never

/**
 * 提取函数返回类型
 */
export type ExtractFunctionReturn<T> = T extends (...args: any[]) => infer R ? R : never

/**
 * Promise包装类型
 */
export type PromiseType<T> = T extends Promise<infer U> ? U : T

/**
 * 数组元素类型
 */
export type ArrayElement<T> = T extends (infer U)[] ? U : never

/**
 * 非空类型
 */
export type NonNullableFields<T> = {
  [P in keyof T]: NonNullable<T[P]>
}

/**
 * 可空字段
 */
export type NullableFields<T, K extends keyof T> = Omit<T, K> & {
  [P in K]: T[P] | null
}

/**
 * 选择性必填
 */
export type RequireFields<T, K extends keyof T> = T & {
  [P in K]-?: T[P]
}

/**
 * 选择性可选
 */
export type OptionalFields<T, K extends keyof T> = Omit<T, K> & {
  [P in K]?: T[P]
}

// ==========================================
// 8. 事件类型
// ==========================================

/**
 * 键盘事件类型
 */
export type KeyboardEventType = React.KeyboardEvent<HTMLElement>

/**
 * 鼠标事件类型
 */
export type MouseEventType = React.MouseEvent<HTMLElement>

/**
 * 表单事件类型
 */
export type FormEventType = React.FormEvent<HTMLFormElement>

/**
 * 输入事件类型
 */
export type InputEventType = React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>

/**
 * 选择事件类型
 */
export type SelectEventType = React.ChangeEvent<HTMLSelectElement>

// ==========================================
// 9. 常量类型
// ==========================================

/**
 * 颜色常量
 */
export const COLORS = {
  CYAN: '#00f0ff',
  MAGENTA: '#ff00ff',
  YELLOW: '#ffff00',
  GREEN: '#00ff41',
  ORANGE: '#ff8c00',
  RED: '#ff0040',
  WHITE: '#ffffff',
  BLACK: '#0a0a0a',
} as const

/**
 * 动画时长
 */
export const ANIMATION_DURATION = {
  FAST: 150,
  NORMAL: 300,
  SLOW: 500,
} as const

/**
 * Z-Index层级
 */
export const Z_INDEX = {
  DROPDOWN: 1000,
  MODAL: 2000,
  TOAST: 3000,
  TOOLTIP: 4000,
} as const

// ==========================================
// 10. 类型导出
// ==========================================

export type {
  FC,
  PropsWithChildren,
  ReactElement,
  // React基础类型
  ReactNode,
} from 'react'
