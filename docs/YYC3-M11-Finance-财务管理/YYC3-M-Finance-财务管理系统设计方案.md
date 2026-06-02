# 财务管理系统设计方案

> **YYC3（YanYu Cloud Cube）**
> **标语**：万象归元于云枢 | 深栈智启新纪元

**创建日期**：2026-06-03
**作者**：YYC3团队
**版本**：1.0.0
**关联文档**：05-经营管理智能化.md、08-全局类型定义与架构契约.md

---

## 1. 系统概述

### 1.1 定位与目标

YYC3 财务管理系统是智能转型平台的核心业务单元之一，采用单元自治架构，实现从传统财务核算到智能财务管理的全面升级。

**核心目标**：

- **实时化**：业务发生即记账，告别 T+1 延迟
- **智能化**：AI 驱动的凭证生成、风险识别、预测分析
- **合规化**：内置税务规则引擎，自动合规检查
- **集成化**：与表单、薪资、CRM 系统无缝联动

### 1.2 主题色

| 用途 | 色值 | 说明 |
|:-----|:-----|:-----|
| 主色 | `#06b6d4` | 财务数据服务色 |
| 辅助色 | `#22d3ee` | 交互态 |
| 收入色 | `#10b981` | 收入/盈利 |
| 支出色 | `#ef4444` | 支出/亏损 |
| 警告色 | `#f59e0b` | 预算预警 |
| 中性色 | `#6b7280` | 辅助信息 |

---

## 2. 系统架构

### 2.1 分层架构

```text
┌───────────────────────────────────────────────────────────────────┐
│                     表现层 (Presentation)                         │
│  财务看板 │ 凭证管理 │ 报销中心 │ 预算管理 │ 报表中心 │ 税务管理   │
├───────────────────────────────────────────────────────────────────┤
│                     智能服务层 (AI Services)                      │
│  智能记账 │ OCR 识别 │ 风险预警 │ 预测分析 │ 税务计算 │ 合规检查   │
├───────────────────────────────────────────────────────────────────┤
│                     业务逻辑层 (Business)                         │
│  会计引擎 │ 预算引擎 │ 成本引擎 │ 结算引擎 │ 审计引擎 │ 集成网关   │
├───────────────────────────────────────────────────────────────────┤
│                     数据层 (Data)                                 │
│  科目体系 │ 凭证库 │ 账簿 │ 报表数据 │ 预算数据 │ 审计日志        │
└───────────────────────────────────────────────────────────────────┘
```

### 2.2 核心类型定义

```typescript
/** 财务管理系统 — 核心类型 */
declare namespace FinanceSystem {

  // ---- 会计科目 ----
  interface AccountItem {
    id: string
    code: string                    // 科目编码: 1001, 2001, 6001...
    name: string                    // 科目名称
    level: 1 | 2 | 3 | 4           // 科目级次
    parentId: string | null
    category: AccountCategory
    direction: 'debit' | 'credit'   // 借贷方向
    balance: number
    status: 'active' | 'inactive'
    auxiliary?: AuxiliaryAccounting[] // 辅助核算
  }

  type AccountCategory =
    | 'asset'        // 资产类
    | 'liability'    // 负债类
    | 'equity'       // 所有者权益类
    | 'cost'         // 成本类
    | 'profit_loss'  // 损益类

  interface AuxiliaryAccounting {
    type: 'department' | 'project' | 'employee' | 'customer' | 'supplier'
    required: boolean
    options: string[]
  }

  // ---- 会计凭证 ----
  interface Voucher {
    id: string
    number: string                  // 凭证号
    date: string                    // 凭证日期
    type: VoucherType
    entries: VoucherEntry[]
    attachments: Attachment[]
    status: VoucherStatus
    source: VoucherSource           // 来源
    auditTrail: AuditRecord[]
    createdBy: string
    approvedBy?: string
    createdAt: string
    updatedAt: string
  }

  type VoucherType =
    | 'receipt'     // 收款凭证
    | 'payment'     // 付款凭证
    | 'transfer'    // 转账凭证
    | 'auto'        // 系统自动生成

  type VoucherStatus =
    | 'draft'       // 草稿
    | 'pending'     // 待审核
    | 'approved'    // 已审核
    | 'posted'      // 已过账
    | 'reversed'    // 已冲销

  type VoucherSource =
    | 'manual'          // 手工录入
    | 'form_submit'     // 表单提交
    | 'salary_import'   // 薪资导入
    | 'bank_sync'       // 银行同步
    | 'auto_recurring'  // 自动摊销

  interface VoucherEntry {
    id: string
    accountId: string               // 科目 ID
    accountCode: string             // 科目编码
    accountName: string             // 科目名称
    direction: 'debit' | 'credit'
    amount: number
    summary: string                 // 摘要
    auxiliary?: Record<string, string>  // 辅助核算值
  }

  // ---- 报销管理 ----
  interface ExpenseClaim {
    id: string
    applicantId: string
    departmentId: string
    type: ExpenseType
    items: ExpenseItem[]
    totalAmount: number
    status: ClaimStatus
    workflowInstanceId: string
    voucherId?: string              // 关联凭证
    createdAt: string
  }

  type ExpenseType =
    | 'travel'        // 差旅报销
    | 'office'        // 办公费用
    | 'marketing'     // 营销费用
    | 'procurement'   // 采购报销
    | 'other'         // 其他

  interface ExpenseItem {
    id: string
    date: string
    category: string
    description: string
    amount: number
    invoiceType: 'vat_special' | 'vat_normal' | 'receipt' | 'other'
    invoiceCode?: string
    taxRate: number
    taxAmount: number
    attachments: Attachment[]
  }

  type ClaimStatus =
    | 'draft' | 'submitted' | 'approved' | 'rejected' | 'paid' | 'cancelled'

  // ---- 预算管理 ----
  interface Budget {
    id: string
    name: string
    period: BudgetPeriod
    fiscalYear: number
    items: BudgetItem[]
    status: 'draft' | 'active' | 'closed'
    approvalWorkflow?: string
    totalBudget: number
    totalUsed: number
    totalRemaining: number
  }

  type BudgetPeriod = 'annual' | 'quarterly' | 'monthly'

  interface BudgetItem {
    id: string
    accountId: string
    departmentId?: string
    projectId?: string
    plannedAmount: number
    usedAmount: number
    frozenAmount: number
    remainingAmount: number
    alertThreshold: number          // 预警阈值百分比
    alertTriggered: boolean
  }

  // ---- 财务报表 ----
  interface FinancialReport {
    id: string
    type: ReportType
    period: ReportPeriod
    generatedAt: string
    data: Record<string, unknown>
    aiAnalysis?: AIAnalysis
  }

  type ReportType =
    | 'balance_sheet'         // 资产负债表
    | 'income_statement'      // 利润表
    | 'cash_flow'             // 现金流量表
    | 'trial_balance'         // 试算平衡表
    | 'general_ledger'        // 总账
    | 'sub_ledger'            // 明细账
    | 'aging_analysis'        // 账龄分析
    | 'cost_analysis'         // 成本分析
    | 'budget_variance'       // 预算差异分析

  interface ReportPeriod {
    startDate: string
    endDate: string
    type: 'daily' | 'monthly' | 'quarterly' | 'annual' | 'custom'
  }

  interface AIAnalysis {
    summary: string
    keyMetrics: Array<{
      name: string
      value: number
      trend: 'up' | 'down' | 'stable'
      changeRate: number
    }>
    risks: string[]
    suggestions: string[]
    forecast?: Record<string, number[]>
  }
}
```

---

## 3. 核心功能模块

### 3.1 智能会计引擎

| 功能 | 说明 | AI 能力 |
|:-----|:-----|:--------|
| 自动凭证生成 | 业务单据自动生成会计凭证 | 智能科目匹配（准确率 > 95%） |
| 智能摘要 | 自动生成凭证摘要 | NLP 语义理解 |
| 借贷平衡校验 | 实时校验凭证借贷平衡 | 规则 + AI 双重校验 |
| 多币种核算 | 支持多币种自动折算 | 汇率自动获取 |

### 3.2 报销管理中心

```text
报销流程：
┌──────┐    ┌──────┐    ┌──────┐    ┌──────┐    ┌──────┐    ┌──────┐
│ 填写  │───▶│ 提交  │───▶│主管审│───▶│财务审│───▶│ 出纳  │───▶│ 完成  │
│ 报销单│    │      │    │批    │    │核    │    │ 付款  │    │      │
└──────┘    └──────┘    └──────┘    └──────┘    └──────┘    └──────┘
  │                                                  │
  │  OCR 自动识别发票                                 │  自动生成凭证
  │  AI 校验金额合理性                                │  更新预算占用
  ▼                                                  ▼
┌──────────┐                                   ┌──────────┐
│ 发票识别  │                                   │ 凭证生成  │
│ 金额校验  │                                   │ 预算更新  │
└──────────┘                                   └──────────┘
```

**OCR 发票识别能力**：

| 发票类型 | 识别字段 | 准确率 |
|:---------|:---------|:-------|
| 增值税专用发票 | 代码、号码、金额、税额、销/购方 | > 98% |
| 增值税普通发票 | 代码、号码、金额、税额 | > 97% |
| 火车票 | 日期、车次、金额、座位 | > 96% |
| 机票行程单 | 日期、航班、金额 | > 96% |
| 酒店发票 | 日期、金额、酒店名 | > 95% |

### 3.3 预算管理

```typescript
/** 预算控制引擎 */
interface BudgetControlEngine {
  /** 预算占用检查 */
  checkBudget(params: {
    accountId: string
    departmentId?: string
    projectId?: string
    amount: number
  }): Promise<BudgetCheckResult>

  /** 预算占用（提交报销时） */
  freezeBudget(params: {
    sourceId: string
    sourceType: 'expense' | 'purchase' | 'contract'
    items: Array<{ accountId: string; amount: number }>
  }): Promise<FreezeResult>

  /** 预算释放（报销驳回时） */
  releaseBudget(freezeId: string): Promise<void>

  /** 预算预警 */
  getAlerts(departmentId?: string): Promise<BudgetAlert[]>
}

interface BudgetCheckResult {
  allowed: boolean
  remaining: number
  overBudget: boolean
  warningLevel: 'normal' | 'warning' | 'critical' | 'exceeded'
  message: string
}
```

### 3.4 财务报表与 AI 分析

**AI 分析能力矩阵**：

| 分析维度 | AI 能力 | 输出 |
|:---------|:--------|:-----|
| 趋势分析 | 基于历史数据的时间序列预测 | 收入/支出趋势图 |
| 异常检测 | 基于统计模型的异常交易识别 | 风险预警报告 |
| 成本优化 | 成本结构分析 + 优化建议 | 成本优化方案 |
| 现金流预测 | 基于应收应付的现金流预测 | 现金流预测表 |
| 税务优化 | 基于业务数据的税务筹划建议 | 税务优化建议 |

---

## 4. 系统集成

### 4.1 与智能表单集成

```typescript
/** 表单触发 → 财务自动处理 */
interface FormFinanceBridge {
  /** 报销表单审批通过 → 自动生成凭证 */
  onExpenseApproved(claim: FinanceSystem.ExpenseClaim): Promise<{
    voucherId: string
    budgetUpdated: boolean
  }>

  /** 采购表单审批通过 → 占用预算 */
  onPurchaseApproved(purchaseOrder: unknown): Promise<{
    budgetFrozen: boolean
    freezeId: string
  }>
}
```

### 4.2 与薪资系统集成

```typescript
/** 薪资 → 财务数据流 */
interface SalaryFinanceBridge {
  /** 月度薪资发放 → 生成薪资凭证 */
  onSalaryPaid(salaryBatch: unknown): Promise<{
    voucherId: string
    entries: FinanceSystem.VoucherEntry[]
  }>

  /** 社保公积金 → 自动计提 */
  onInsuranceCalculated(data: unknown): Promise<{
    accrualVoucherId: string
    paymentVoucherId: string
  }>
}
```

### 4.3 银行对接

```typescript
/** 银行集成接口 */
interface BankIntegration {
  /** 银行流水同步 */
  syncTransactions(accountId: string, dateRange: DateRange): Promise<BankTransaction[]>

  /** 自动对账 */
  autoReconcile(transactions: BankTransaction[]): Promise<ReconciliationResult>

  /** 发起付款 */
  initiatePayment(params: PaymentParams): Promise<PaymentResult>

  /** 余额查询 */
  getBalance(accountId: string): Promise<AccountBalance>
}
```

---

## 5. 数据库设计

### 5.1 核心表结构

```sql
-- 会计科目表
CREATE TABLE finance_accounts (
  id          UUID PRIMARY KEY,
  code        VARCHAR(20) NOT NULL UNIQUE,
  name        VARCHAR(100) NOT NULL,
  level       SMALLINT NOT NULL DEFAULT 1,
  parent_id   UUID REFERENCES finance_accounts(id),
  category    VARCHAR(20) NOT NULL,
  direction   VARCHAR(10) NOT NULL,
  status      VARCHAR(20) NOT NULL DEFAULT 'active',
  created_at  TIMESTAMP DEFAULT NOW(),
  updated_at  TIMESTAMP DEFAULT NOW()
);

-- 会计凭证表
CREATE TABLE finance_vouchers (
  id          UUID PRIMARY KEY,
  number      VARCHAR(30) NOT NULL UNIQUE,
  date        DATE NOT NULL,
  type        VARCHAR(20) NOT NULL,
  status      VARCHAR(20) NOT NULL DEFAULT 'draft',
  source      VARCHAR(30) NOT NULL DEFAULT 'manual',
  source_id   UUID,
  created_by  UUID NOT NULL,
  approved_by UUID,
  created_at  TIMESTAMP DEFAULT NOW(),
  updated_at  TIMESTAMP DEFAULT NOW()
);

-- 凭证分录表
CREATE TABLE finance_voucher_entries (
  id            UUID PRIMARY KEY,
  voucher_id    UUID NOT NULL REFERENCES finance_vouchers(id),
  account_id    UUID NOT NULL REFERENCES finance_accounts(id),
  direction     VARCHAR(10) NOT NULL,
  amount        DECIMAL(18, 2) NOT NULL,
  summary       VARCHAR(500),
  auxiliary     JSONB,
  sort_order    INTEGER NOT NULL DEFAULT 0
);

-- 报销单表
CREATE TABLE finance_expense_claims (
  id                    UUID PRIMARY KEY,
  applicant_id          UUID NOT NULL,
  department_id         UUID NOT NULL,
  type                  VARCHAR(30) NOT NULL,
  total_amount          DECIMAL(18, 2) NOT NULL,
  status                VARCHAR(20) NOT NULL DEFAULT 'draft',
  workflow_instance_id  UUID,
  voucher_id            UUID,
  created_at            TIMESTAMP DEFAULT NOW(),
  updated_at            TIMESTAMP DEFAULT NOW()
);

-- 预算表
CREATE TABLE finance_budgets (
  id            UUID PRIMARY KEY,
  name          VARCHAR(200) NOT NULL,
  period        VARCHAR(20) NOT NULL,
  fiscal_year   INTEGER NOT NULL,
  status        VARCHAR(20) NOT NULL DEFAULT 'draft',
  total_budget  DECIMAL(18, 2) NOT NULL DEFAULT 0,
  created_at    TIMESTAMP DEFAULT NOW()
);

-- 预算明细表
CREATE TABLE finance_budget_items (
  id                UUID PRIMARY KEY,
  budget_id         UUID NOT NULL REFERENCES finance_budgets(id),
  account_id        UUID NOT NULL REFERENCES finance_accounts(id),
  department_id     UUID,
  project_id        UUID,
  planned_amount    DECIMAL(18, 2) NOT NULL,
  used_amount       DECIMAL(18, 2) NOT NULL DEFAULT 0,
  frozen_amount     DECIMAL(18, 2) NOT NULL DEFAULT 0,
  alert_threshold   DECIMAL(5, 2) NOT NULL DEFAULT 80.00,
  alert_triggered   BOOLEAN NOT NULL DEFAULT FALSE
);
```

---

## 6. API 规范

| 方法 | 路径 | 说明 |
|:-----|:-----|:-----|
| **凭证管理** | | |
| GET | `/api/v1/finance/vouchers` | 凭证列表 |
| POST | `/api/v1/finance/vouchers` | 创建凭证 |
| POST | `/api/v1/finance/vouchers/auto-generate` | AI 自动生成凭证 |
| PUT | `/api/v1/finance/vouchers/:id/approve` | 审核凭证 |
| POST | `/api/v1/finance/vouchers/:id/post` | 过账 |
| **报销管理** | | |
| GET | `/api/v1/finance/expenses` | 报销单列表 |
| POST | `/api/v1/finance/expenses` | 创建报销单 |
| POST | `/api/v1/finance/expenses/ocr` | OCR 发票识别 |
| PUT | `/api/v1/finance/expenses/:id/approve` | 审批报销 |
| **预算管理** | | |
| GET | `/api/v1/finance/budgets` | 预算列表 |
| POST | `/api/v1/finance/budgets` | 创建预算 |
| GET | `/api/v1/finance/budgets/:id/usage` | 预算使用情况 |
| POST | `/api/v1/finance/budgets/check` | 预算占用检查 |
| **报表** | | |
| POST | `/api/v1/finance/reports/generate` | 生成报表 |
| POST | `/api/v1/finance/reports/ai-analysis` | AI 财务分析 |
| **银行** | | |
| GET | `/api/v1/finance/bank/accounts` | 银行账户列表 |
| POST | `/api/v1/finance/bank/sync` | 同步银行流水 |
| POST | `/api/v1/finance/bank/reconcile` | 自动对账 |

---

## 7. 页面设计

### 7.1 财务驾驶舱

```text
┌──────────────────────────────────────────────────────────────────┐
│  财务驾驶舱                                        [月度][季度]  │
├──────────────┬──────────────┬──────────────┬────────────────────┤
│  本月收入     │  本月支出     │  净利润      │  现金余额          │
│  ¥ 1,280,000 │  ¥ 856,000  │  ¥ 424,000  │  ¥ 3,560,000      │
│  ↑ 12.3%     │  ↓ 3.2%     │  ↑ 28.5%    │  ↑ 5.1%           │
├──────────────┴──────────────┴──────────────┴────────────────────┤
│  [收入支出趋势图]              │  [预算执行进度]                    │
│  〰〰〰〰〰〰〰                 │  ████████░░ 80%                   │
│                               │  ██████░░░░ 60%                   │
├───────────────────────────────┼───────────────────────────────────┤
│  [应收账款账龄]                │  [待办事项]                       │
│  ■ 30天内  ¥230,000          │  • 3 笔报销待审批                 │
│  ■ 30-60天 ¥85,000           │  • 本月凭证未结转                 │
│  ■ 60天+   ¥12,000 ⚠️       │  • 税务申报截止: 6/15             │
└───────────────────────────────┴───────────────────────────────────┘
```

### 7.2 核心页面清单

| 页面 | 功能 | 关键交互 |
|:-----|:-----|:---------|
| 财务驾驶舱 | 全局财务数据看板 | AI 摘要、异常预警、趋势预测 |
| 凭证管理 | 凭证 CRUD + 审核 | AI 辅助科目匹配、批量操作 |
| 报销中心 | 报销申请 + 审批 | OCR 识别、预算检查、审批流 |
| 预算管理 | 预算编制 + 控制 | 预算预警、占用/释放、差异分析 |
| 报表中心 | 财务报表生成 | AI 分析、一键导出、定期生成 |
| 税务管理 | 税务计算 + 申报 | 自动计税、合规检查、税务日历 |
| 银行对账 | 银行流水 + 对账 | 自动对账、差异标记 |

---

## 8. 实施路径

### Phase 1 — 核心基础
- 会计科目体系搭建
- 凭证管理（手工 + AI 辅助）
- 报销中心 + OCR 发票识别
- 基础财务报表

### Phase 2 — 管控增强
- 预算管理 + 预算控制引擎
- 银行对接 + 自动对账
- 税务管理模块
- 审计日志

### Phase 3 — 智能进阶
- AI 财务分析驾驶舱
- 现金流预测
- 成本优化建议引擎
- 税务筹划建议
