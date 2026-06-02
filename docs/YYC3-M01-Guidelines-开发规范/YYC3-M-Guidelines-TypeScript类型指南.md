# YYC³ TypeScript类型系统完整指南

## 📚 概述

YYC³ AI营销自动化终端的完整TypeScript类型定义系统，提供超过**100+**精确类型定义，涵盖所有核心功能模块。

### 类型定义位置
```
/src/types/index.ts
```

---

## 🎯 类型分类

### 1. 基础类型 & 枚举 (22个)

#### 页面类型
```typescript
type PageId = 
  | "dashboard"     // 数据驾驶舱
  | "chat"          // AI对话
  | "clm"           // 客户生命周期
  | "aicall"        // AI呼叫中心
  | "tools"         // 智能工具箱
  | "workflow"      // 自动化工作流
  | "insights"      // 数据洞察
  | "settings"      // 系统设置
  | "logs"          // 活动日志
  | "forms"         // 智能表单
  | "contacts"      // 通讯录
  | "customerCare"; // 客户关怀
```

#### 主题类型
```typescript
type ThemeMode = "cyberpunk" | "liquidGlass";
type LanguageCode = "zh-CN" | "en-US";
```

#### 业务枚举
```typescript
// 客户生命周期阶段
type CustomerStage = "获客" | "转化" | "成交" | "服务" | "忠诚";

// 风险等级
type RiskLevel = "low" | "medium" | "high";

// 客户关怀状态
type CareStatus = "pending" | "inProgress" | "completed" | "archived";

// 客户等级
type CustomerLevel = "vip" | "high" | "normal" | "low";
```

#### AI模型类型
```typescript
type AIModelType =
  | "gpt-4"
  | "gpt-3.5-turbo"
  | "claude-3-opus"
  | "claude-3-sonnet"
  | "gemini-pro"
  | "deepseek-v3"
  | "qwen-max"
  | "moonshot-v1";
```

---

### 2. 数据模型 (20个核心接口)

#### 主题配置
```typescript
interface ThemeConfig {
  neonIntensity: number;        // 霓虹光强度 (0-100)
  scanlineEnabled: boolean;      // 扫描线效果
  glitchEnabled: boolean;        // 故障效果
  circuitGridEnabled: boolean;   // 电路网格
  dataFlowEnabled: boolean;      // 数据流动画
  springAnimEnabled: boolean;    // 弹簧动画
  blurEnabled: boolean;          // 模糊效果
}
```

#### 联系人模型
```typescript
interface SharedContact {
  id: string;
  name: string;
  phone: string;
  email: string;
  company: string;
  position: string;
  stage: CustomerStage;
  tags: string[];
  aiScore: number;               // AI评分 (0-100)
  aiInsights: string[];          // AI洞察
  starred: boolean;
  avatar?: string;
  address: string;
  source: string;
  createdAt: string;
  lastContact: string;
  totalCalls: number;
  totalValue: number;
  notes: string;
  riskLevel: RiskLevel;
}
```

#### 客户关怀记录
```typescript
interface CustomerCareRecord {
  id: string;
  name: string;
  company: string;
  phone: string;
  email: string;
  status: CareStatus;
  level: CustomerLevel;
  lastContact: string;
  nextFollowUp: string;
  responsible: string;
  tags: string[];
  notes: string;
  source: string;
  createdAt: string;
}
```

#### 表单模板
```typescript
interface FormTemplate {
  id: string;
  name: string;
  description: string;
  category: FormCategory;
  icon: string;
  fields: FormField[];          // 字段列表
  createdAt: string;
  submissions: number;
  isSystem: boolean;
}

interface FormField {
  id: string;
  type: FormFieldType;
  label: string;
  placeholder?: string;
  required: boolean;
  options?: string[];
  validation?: {
    min?: number;
    max?: number;
    pattern?: string;
    message?: string;
  };
  defaultValue?: any;
}
```

#### 通话记录
```typescript
interface CallRecord {
  id: string;
  contactId: string;
  customerName: string;
  phoneNumber: string;
  duration: number;              // 通话时长（秒）
  type: "inbound" | "outbound";
  status: "completed" | "missed" | "cancelled";
  timestamp: string;
  transcript?: string;           // AI转录文本
  sentiment?: "positive" | "neutral" | "negative";
  keywords?: string[];
  recordingUrl?: string;
  notes?: string;
}
```

#### 工作流定义
```typescript
interface Workflow {
  id: string;
  name: string;
  description: string;
  nodes: WorkflowNode[];
  enabled: boolean;
  createdAt: string;
  lastRun?: string;
  runCount: number;
}

interface WorkflowNode {
  id: string;
  type: "trigger" | "condition" | "action" | "delay";
  title: string;
  config: Record<string, any>;
  position: { x: number; y: number };
  nextNodes?: string[];
}
```

---

### 3. Context类型 (6个)

#### 应用Context
```typescript
interface AppContextType extends AppState {
  setActivePage: (page: PageId) => void;
  setAppMode: (mode: AppMode) => void;
  setSidebarPinned: (pinned: boolean) => void;
  addNotification: (n: Omit<NotificationItem, "id" | "timestamp" | "read">) => void;
  markNotificationRead: (id: string) => void;
  clearNotifications: () => void;
  addActivity: (a: Omit<ActivityItem, "id" | "timestamp">) => void;
  unreadCount: number;
  updateTheme: (partial: Partial<ThemeConfig>) => void;
  resetTheme: () => void;
  setOnboardingDone: (done: boolean) => void;
  setMobileSidebarOpen: (open: boolean) => void;
  neonAlpha: (base: number) => number;
}
```

#### 联系人Context
```typescript
interface ContactsContextType {
  contacts: SharedContact[];
  addContact: (contact: Omit<SharedContact, "id" | "createdAt">) => void;
  updateContact: (id: string, updates: Partial<SharedContact>) => void;
  deleteContact: (id: string) => void;
  bulkDelete: (ids: string[]) => void;
  restoreContact: (id: string) => void;
  toggleStar: (id: string) => void;
  exportToCSV: () => void;
  importFromCSV: (csv: string) => void;
  deletedContacts: SharedContact[];
}
```

#### 国际化Context
```typescript
interface I18nContextType {
  locale: LanguageCode;
  setLocale: (locale: LanguageCode) => void;
  t: (key: string, params?: Record<string, any>) => string;
}
```

---

### 4. 组件Props接口 (15+个)

#### 通用组件Props

**卡片组件**
```typescript
interface NeonCardProps {
  children: React.ReactNode;
  color?: string;               // 霓虹主题色
  hoverable?: boolean;          // 是否可悬停
  className?: string;
  onClick?: () => void;
}
```

**按钮组件**
```typescript
interface ButtonProps {
  children: React.ReactNode;
  variant?: "primary" | "secondary" | "danger" | "ghost";
  size?: "sm" | "md" | "lg";
  disabled?: boolean;
  loading?: boolean;
  onClick?: () => void;
  className?: string;
  icon?: React.ReactNode;
  iconRight?: React.ReactNode;
}
```

**输入框组件**
```typescript
interface InputProps {
  type?: "text" | "password" | "email" | "number" | "tel" | "url";
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  readOnly?: boolean;
  required?: boolean;
  error?: string;
  icon?: React.ReactNode;
  className?: string;
  maxLength?: number;
  autoFocus?: boolean;
}
```

**模态框组件**
```typescript
interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  className?: string;
  size?: "sm" | "md" | "lg" | "xl";
  showCloseButton?: boolean;
  closeOnOverlayClick?: boolean;
}
```

#### 业务组件Props

**数据表格**
```typescript
interface DataTableProps<T = any> {
  data: T[];
  columns: TableColumn<T>[];
  loading?: boolean;
  emptyText?: string;
  onRowClick?: (row: T) => void;
  className?: string;
  pagination?: boolean;
  pageSize?: number;
}

interface TableColumn<T = any> {
  title: string;
  key: keyof T | string;
  render?: (value: any, row: T, index: number) => React.ReactNode;
  width?: number | string;
  sortable?: boolean;
  align?: "left" | "center" | "right";
}
```

**表单构建器**
```typescript
interface FormBuilderProps {
  template: FormTemplate;
  onSubmit: (data: Record<string, any>) => void;
  onCancel?: () => void;
  initialData?: Record<string, any>;
  readOnly?: boolean;
}
```

**联系人卡片**
```typescript
interface ContactCardProps {
  contact: SharedContact;
  onClick?: () => void;
  onToggleStar?: (id: string) => void;
  onDelete?: (id: string) => void;
  onEdit?: (id: string) => void;
}
```

---

### 5. API类型 (15个)

#### 基础API类型
```typescript
interface ApiResponse<T = any> {
  success: boolean;
  data: T;
  error?: ErrorType;
  message?: string;
  timestamp?: string;
}

interface PaginatedResponse<T = any> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

interface ErrorType {
  code: string;
  message: string;
  details?: Record<string, any>;
  stack?: string;
}
```

#### 认证API
```typescript
interface LoginRequest {
  username: string;
  password: string;
  rememberMe?: boolean;
}

interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  user: UserProfile;
  expiresIn: number;
}

interface UserProfile {
  id: string;
  username: string;
  email: string;
  displayName: string;
  avatar?: string;
  role: "admin" | "manager" | "agent" | "viewer";
  permissions: string[];
  createdAt: string;
  lastLoginAt?: string;
}
```

#### AI对话API
```typescript
interface ChatRequest {
  message: string;
  conversationId?: string;
  model?: AIModelType;
  stream?: boolean;
  context?: Record<string, any>;
}

interface ChatResponse {
  id: string;
  conversationId: string;
  content: string;
  model: AIModelType;
  usage: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
  finishReason: "stop" | "length" | "content_filter";
}
```

#### 呼叫API
```typescript
interface CallRequest {
  phoneNumber: string;
  contactId?: string;
  script?: string;
  record?: boolean;
}

interface CallResponse {
  callId: string;
  status: "initiated" | "ringing" | "connected" | "completed" | "failed";
  startTime: string;
  endTime?: string;
  duration?: number;
}
```

#### 数据导出API
```typescript
interface ExportRequest {
  dataType: "contacts" | "calls" | "forms" | "analytics";
  format: "csv" | "xlsx" | "json" | "pdf";
  filters?: Record<string, any>;
  dateRange?: {
    from: string;
    to: string;
  };
}

interface ExportResponse {
  exportId: string;
  fileUrl: string;
  fileSize: number;
  exportedAt: string;
  expiresAt: string;
}
```

---

### 6. 工具类型 (15个)

```typescript
// 使ID可选
type WithOptionalId<T extends { id: string }> = Omit<T, "id"> & { id?: string };

// 使时间戳可选
type WithOptionalTimestamp<T extends { createdAt: string }> = 
  Omit<T, "createdAt"> & { createdAt?: string };

// 深度只读
type DeepReadonly<T> = {
  readonly [P in keyof T]: T[P] extends object ? DeepReadonly<T[P]> : T[P];
};

// 深度部分
type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

// 选择性必填
type RequireFields<T, K extends keyof T> = T & {
  [P in K]-?: T[P];
};

// 选择性可选
type OptionalFields<T, K extends keyof T> = Omit<T, K> & {
  [P in K]?: T[P];
};
```

---

## 💡 使用示例

### 1. 组件中使用Props类型

```typescript
import type { NeonCardProps } from '@/types';

export function NeonCard({ children, color = "#00f0ff", hoverable = true }: NeonCardProps) {
  return (
    <div className="neon-card" style={{ borderColor: color }}>
      {children}
    </div>
  );
}
```

### 2. 使用Context类型

```typescript
import type { AppContextType } from '@/types';
import { useContext } from 'react';

const AppContext = createContext<AppContextType | null>(null);

export function useApp(): AppContextType {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
}
```

### 3. 使用API类型

```typescript
import type { ApiResponse, ChatRequest, ChatResponse } from '@/types';

async function sendMessage(request: ChatRequest): Promise<ApiResponse<ChatResponse>> {
  const response = await fetch('/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(request),
  });
  
  return response.json();
}
```

### 4. 使用工具类型

```typescript
import type { WithOptionalId, DeepPartial, SharedContact } from '@/types';

// 创建联系人时ID可选
type NewContact = WithOptionalId<SharedContact>;

const newContact: NewContact = {
  name: "张三",
  phone: "138-0001-2345",
  // ... 其他必填字段
  // id 可选
};

// 更新联系人时所有字段可选
type ContactUpdate = DeepPartial<SharedContact>;

const update: ContactUpdate = {
  phone: "139-0001-2345",  // 只更新电话
};
```

### 5. 使用泛型类型

```typescript
import type { DataTableProps, SharedContact } from '@/types';

function ContactTable() {
  const columns: TableColumn<SharedContact>[] = [
    {
      title: "姓名",
      key: "name",
      render: (value, contact) => (
        <div className="flex items-center gap-2">
          {contact.starred && <Star className="w-4 h-4" />}
          {value}
        </div>
      ),
    },
    {
      title: "公司",
      key: "company",
    },
  ];
  
  return <DataTable<SharedContact> data={contacts} columns={columns} />;
}
```

---

## 📊 类型统计

| 分类 | 数量 | 说明 |
|------|------|------|
| 基础枚举 | 22 | PageId, ThemeMode, CustomerStage等 |
| 数据模型 | 20 | SharedContact, FormTemplate, CallRecord等 |
| Context类型 | 6 | AppContext, ContactsContext等 |
| 组件Props | 15+ | NeonCard, Button, Input, Modal等 |
| API类型 | 15 | Request/Response, Error等 |
| 工具类型 | 15 | DeepPartial, RequireFields等 |
| **总计** | **90+** | 完整类型定义系统 |

---

## ✅ 类型检查清单

### 组件开发
- [ ] 定义Props接口
- [ ] 使用TypeScript严格模式
- [ ] 避免使用`any`类型
- [ ] 为回调函数定义参数类型
- [ ] 使用可选链操作符`?.`

### 状态管理
- [ ] 定义State接口
- [ ] 定义Context类型
- [ ] 类型化useState和useReducer
- [ ] 使用`as const`固定常量类型

### API调用
- [ ] 定义Request接口
- [ ] 定义Response接口
- [ ] 使用泛型包装ApiResponse
- [ ] 正确处理错误类型

### 工具函数
- [ ] 定义输入参数类型
- [ ] 定义返回值类型
- [ ] 使用类型守卫
- [ ] 避免类型断言`as`

---

## 🔧 配置建议

### tsconfig.json
```json
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "strictFunctionTypes": true,
    "strictBindCallApply": true,
    "strictPropertyInitialization": true,
    "noImplicitThis": true,
    "alwaysStrict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
    "paths": {
      "@/types": ["./src/types"],
      "@/types/*": ["./src/types/*"]
    }
  }
}
```

### VS Code设置
```json
{
  "typescript.preferences.importModuleSpecifier": "relative",
  "typescript.suggest.autoImports": true,
  "typescript.updateImportsOnFileMove.enabled": "always",
  "editor.codeActionsOnSave": {
    "source.organizeImports": true
  }
}
```

---

## 🚀 最佳实践

### 1. 类型导入
```typescript
// ✅ 推荐：使用type导入
import type { SharedContact, CustomerStage } from '@/types';

// ❌ 不推荐：混合导入
import { SharedContact, CustomerStage } from '@/types';
```

### 2. 类型定义位置
```typescript
// ✅ 推荐：全局类型放在 /src/types/index.ts
// ✅ 推荐：组件特有类型放在组件文件中

// component.tsx
interface ComponentSpecificType {
  // 仅此组件使用的类型
}

export function Component() {
  // ...
}
```

### 3. 避免类型断言
```typescript
// ❌ 不推荐
const contact = data as SharedContact;

// ✅ 推荐：使用类型守卫
function isSharedContact(data: any): data is SharedContact {
  return data && typeof data.id === 'string' && typeof data.name === 'string';
}

if (isSharedContact(data)) {
  const contact = data;  // 类型安全
}
```

### 4. 使用泛型
```typescript
// ✅ 推荐：灵活的泛型组件
function DataList<T>({ items, renderItem }: {
  items: T[];
  renderItem: (item: T) => React.ReactNode;
}) {
  return <>{items.map(renderItem)}</>;
}

// 使用时自动推断类型
<DataList<SharedContact>
  items={contacts}
  renderItem={(contact) => <ContactCard contact={contact} />}
/>
```

### 5. 联合类型vs枚举
```typescript
// ✅ 推荐：简单情况使用联合类型
type Status = "pending" | "completed" | "failed";

// ✅ 推荐：需要数值或复杂逻辑时使用枚举
enum Priority {
  Low = 0,
  Medium = 1,
  High = 2,
  Critical = 3,
}
```

---

## 📖 参考资料

- [TypeScript官方文档](https://www.typescriptlang.org/docs/)
- [React TypeScript Cheatsheet](https://react-typescript-cheatsheet.netlify.app/)
- [TypeScript Deep Dive](https://basarat.gitbook.io/typescript/)

---

<div align="center">

**✨ YYC³ TypeScript类型系统 v2.0 ✨**

完整、类型安全、可扩展的企业级类型定义

---

**创建日期**: 2026-03-14  
**版本**: v2.0  
**状态**: ✅ 生产就绪

</div>
