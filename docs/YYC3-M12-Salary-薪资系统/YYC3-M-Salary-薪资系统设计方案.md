# 薪资系统设计方案

> **YYC3（YanYu Cloud Cube）**
> **标语**：万象归元于云枢 | 深栈智启新纪元

**创建日期**：2026-06-03
**作者**：YYC3团队
**版本**：1.0.0
**关联文档**：YYC3-M-Finance-财务管理系统设计方案.md、12-智能表单系统增强设计方案.md

---

## 1. 系统概述

### 1.1 定位与目标

YYC3 薪资系统是人力资源管理的核心财务单元，采用单元自治架构，实现从考勤采集到薪资发放的全链路自动化。

**核心目标**：

- **全链路自动化**：考勤 → 计算 → 审核 → 发放 → 财务集成，零手工干预
- **灵活配置**：薪资结构可视化配置，支持多套薪资方案
- **合规保障**：内置个税/社保/公积金计算引擎，自动合规
- **数据安全**：薪资数据加密存储，权限精细化管控

### 1.2 主题色

| 用途 | 色值 | 说明 |
|:-----|:-----|:-----|
| 主色 | `#8b5cf6` | 薪资模块标识色 |
| 辅助色 | `#a78bfa` | 交互态 |
| 收入色 | `#10b981` | 应发/加项 |
| 扣减色 | `#ef4444` | 代扣/减项 |
| 实发色 | `#3b82f6` | 实发金额 |
| 警告色 | `#f59e0b` | 异常预警 |

---

## 2. 系统架构

### 2.1 分层架构

```text
┌───────────────────────────────────────────────────────────────────┐
│                     表现层 (Presentation)                         │
│  薪资看板 │ 薪资核算 │ 薪资方案 │ 考勤管理 │ 个税管理 │ 报表中心   │
├───────────────────────────────────────────────────────────────────┤
│                     智能服务层 (AI Services)                      │
│  智能排班 │ 异常检测 │ 薪资预测 │ 个税优化 │ 合同预警              │
├───────────────────────────────────────────────────────────────────┤
│                     业务逻辑层 (Business)                         │
│  薪资引擎 │ 考勤引擎 │ 个税引擎 │ 社保引擎 │ 审批引擎 │ 集成网关   │
├───────────────────────────────────────────────────────────────────┤
│                     数据层 (Data)                                 │
│  员工档案 │ 薪资方案 │ 考勤数据 │ 薪资台账 │ 个税数据 │ 审计日志   │
└───────────────────────────────────────────────────────────────────┘
```

### 2.2 核心类型定义

```typescript
/** 薪资系统 — 核心类型 */
declare namespace SalarySystem {

  // ---- 薪资方案 ----
  interface SalaryPlan {
    id: string
    name: string
    description: string
    applicableRoles: string[]       // 适用角色
    applicableDepartments: string[] // 适用部门
    components: SalaryComponent[]   // 薪资组成项
    rules: SalaryRule[]             // 计算规则
    taxConfig: TaxConfig            // 个税配置
    insuranceConfig: InsuranceConfig // 社保公积金配置
    status: 'draft' | 'active' | 'archived'
    effectiveFrom: string
    effectiveTo?: string
    version: number
  }

  // ---- 薪资组成项 ----
  interface SalaryComponent {
    id: string
    name: string
    code: string
    type: ComponentType
    category: ComponentCategory
    calculationMode: CalculationMode
    amount?: number                 // 固定金额
    formula?: string                // 计算公式
    taxable: boolean                // 是否计税
    insuranceBase: boolean          // 是否作为社保基数
    attendanceRelated: boolean      // 是否与考勤关联
    sort: number
  }

  type ComponentType = 'addition' | 'deduction'  // 加项/减项

  type ComponentCategory =
    | 'base_salary'       // 基本工资
    | 'post_allowance'    // 岗位津贴
    | 'performance'       // 绩效工资
    | 'overtime'          // 加班费
    | 'bonus'             // 奖金
    | 'commission'        // 提成
    | 'meal_allowance'    // 餐补
    | 'transport'         // 交通补贴
    | 'housing_fund'      // 住房公积金
    | 'social_insurance'  // 社保
    | 'income_tax'        // 个税
    | 'attendance_deduct' // 考勤扣款
    | 'other_add'         // 其他加项
    | 'other_deduct'      // 其他减项

  type CalculationMode =
    | 'fixed'             // 固定金额
    | 'formula'           // 公式计算
    | 'attendance'        // 考勤关联
    | 'performance'       // 绩效关联
    | 'tiered'            // 阶梯计算
    | 'lookup'            // 查表（如税率表）

  // ---- 计算规则 ----
  interface SalaryRule {
    id: string
    name: string
    condition?: string              // 触发条件（表达式）
    formula: string                 // 计算公式
    priority: number                // 执行优先级
    description: string
  }

  // ---- 个税配置 ----
  interface TaxConfig {
    method: 'cumulative' | 'monthly'  // 累计预扣法/按月
    brackets: TaxBracket[]             // 税率表
    deductions: TaxDeduction[]         // 专项扣除
  }

  interface TaxBracket {
    min: number
    max: number
    rate: number                    // 税率 0.03 ~ 0.45
    quickDeduction: number          // 速算扣除数
  }

  interface TaxDeduction {
    type: 'children_education'      // 子女教育
      | 'continuing_education'      // 继续教育
      | 'housing_loan'              // 住房贷款
      | 'housing_rent'              // 住房租金
      | 'elderly_support'           // 赡养老人
      | 'baby_care'                 // 婴幼儿照护
    amount: number
  }

  // ---- 社保公积金配置 ----
  interface InsuranceConfig {
    baseLower: number               // 基数下限
    baseUpper: number               // 基数上限
    items: InsuranceItem[]
  }

  interface InsuranceItem {
    type: 'pension' | 'medical' | 'unemployment' | 'injury' | 'maternity' | 'housing_fund'
    personalRate: number            // 个人比例
    companyRate: number             // 公司比例
    baseRule: 'actual' | 'fixed' | 'average'  // 基数规则
  }

  // ---- 薪资核算 ----
  interface SalaryCalculation {
    id: string
    employeeId: string
    period: string                  // 2026-06
    planId: string
    baseSalary: number              // 基本工资
    additions: SalaryItem[]         // 加项明细
    deductions: SalaryItem[]        // 减项明细
    grossPay: number                // 应发合计
    totalDeductions: number         // 扣减合计
    netPay: number                  // 实发合计
    breakdown: {
      socialInsurance: { personal: number; company: number }
      housingFund: { personal: number; company: number }
      incomeTax: number
      attendance: AttendanceSummary
    }
    status: CalculationStatus
    approvedBy?: string
    paidAt?: string
    voucherId?: string              // 关联财务凭证
    createdAt: string
  }

  interface SalaryItem {
    componentId: string
    componentName: string
    amount: number
    formula?: string
    remark?: string
  }

  type CalculationStatus =
    | 'calculated'    // 已计算
    | 'reviewed'      // 已复核
    | 'approved'      // 已审批
    | 'paid'          // 已发放
    | 'reversed'      // 已冲回

  // ---- 考勤数据 ----
  interface AttendanceSummary {
    workingDays: number             // 应出勤天数
    actualDays: number              // 实出勤天数
    lateCount: number               // 迟到次数
    earlyLeaveCount: number         // 早退次数
    absentDays: number              // 旷工天数
    leaveDays: Record<LeaveType, number>  // 请假天数
    overtimeHours: number           // 加班时长
    overtimePay: number             // 加班费
  }

  type LeaveType =
    | 'annual'       // 年假
    | 'sick'         // 病假
    | 'personal'     // 事假
    | 'maternity'    // 产假
    | 'paternity'    // 陪产假
    | 'marriage'     // 婚假
    | 'bereavement'  // 丧假
    | 'compensatory' // 调休

  // ---- 员工薪资档案 ----
  interface EmployeeSalaryProfile {
    employeeId: string
    planId: string
    baseAmount: number              // 基本工资
    postAllowance: number           // 岗位津贴
    performanceCoefficient: number  // 绩效系数
    taxDeductions: TaxDeduction[]   // 专项附加扣除
    bankAccount: {
      bank: string
      account: string
      name: string
    }
    effectiveFrom: string
    history: SalaryChangeRecord[]
  }

  interface SalaryChangeRecord {
    date: string
    field: string
    oldValue: unknown
    newValue: unknown
    reason: string
    approvedBy: string
  }
}
```

---

## 3. 核心功能模块

### 3.1 薪资计算引擎

```typescript
/** 薪资计算引擎 — 核心流程 */
interface SalaryCalculationEngine {
  /** 月度薪资批量计算 */
  calculateBatch(params: {
    period: string
    departmentIds?: string[]
    employeeIds?: string[]
  }): Promise<BatchCalculationResult>

  /** 单人薪资计算 */
  calculateIndividual(params: {
    employeeId: string
    period: string
    overrides?: Record<string, number>
  }): Promise<SalarySystem.SalaryCalculation>

  /** 试算（不保存） */
  trialCalculate(params: {
    employeeId: string
    planId: string
    customAmounts?: Record<string, number>
  }): Promise<SalarySystem.SalaryCalculation>
}

interface BatchCalculationResult {
  totalEmployees: number
  success: number
  failed: number
  errors: Array<{
    employeeId: string
    employeeName: string
    error: string
  }>
  summary: {
    totalGrossPay: number
    totalDeductions: number
    totalNetPay: number
    totalCompanyCost: number
  }
}
```

**计算流程**：

```text
┌──────────┐   ┌──────────┐   ┌──────────┐   ┌──────────┐   ┌──────────┐
│ 加载员工  │──▶│ 采集考勤  │──▶│ 计算加项  │──▶│ 计算减项  │──▶│ 计算个税  │
│ 薪资档案  │   │ 数据      │   │ (工资+津贴│   │ (社保+公积金│   │ (累计预扣│
│          │   │          │   │  +绩效+加班)│   │  +考勤扣款)│   │  法)     │
└──────────┘   └──────────┘   └──────────┘   └──────────┘   └──────────┘
                                                                   │
                                                                   ▼
              ┌──────────┐   ┌──────────┐   ┌──────────┐   ┌──────────┐
              │ 生成银行  │◀──│ 生成凭证  │◀──│ 审批通过  │◀──│ 汇总实发  │
              │ 打款文件  │   │ (财务集成)│   │          │   │          │
              └──────────┘   └──────────┘   └──────────┘   └──────────┘
```

### 3.2 个税计算引擎

**中国个税累进税率表（综合所得适用）**：

| 级数 | 月应纳税所得额 | 税率 | 速算扣除数 |
|:-----|:---------------|:-----|:-----------|
| 1 | ≤ 3,000 | 3% | 0 |
| 2 | 3,000 ~ 12,000 | 10% | 210 |
| 3 | 12,000 ~ 25,000 | 20% | 1,410 |
| 4 | 25,000 ~ 35,000 | 25% | 2,660 |
| 5 | 35,000 ~ 55,000 | 30% | 4,410 |
| 6 | 55,000 ~ 80,000 | 35% | 7,160 |
| 7 | > 80,000 | 45% | 15,160 |

```typescript
/** 个税计算器 */
interface TaxCalculator {
  /** 累计预扣法计算当月个税 */
  calculateMonthly(params: {
    currentMonthIncome: number       // 当月应税收入
    cumulativeIncome: number         // 累计收入
    cumulativeTaxPaid: number        // 累计已缴税
    specialDeductions: number        // 专项扣除（社保公积金）
    additionalDeductions: number     // 专项附加扣除
    threshold: number                // 免征额（5000）
  }): Promise<TaxResult>
}

interface TaxResult {
  currentMonthTax: number           // 当月应扣税额
  cumulativeTax: number             // 累计应扣税额
  effectiveRate: number             // 实际税率
  marginalRate: number              // 边际税率
  breakdown: {
    taxableIncome: number           // 应纳税所得额
    bracket: number                 // 适用级数
    bracketRate: number             // 适用税率
    quickDeduction: number          // 速算扣除数
  }
}
```

### 3.3 考勤管理

```typescript
/** 考勤数据采集 */
interface AttendanceCollector {
  /** 导入考勤数据 */
  importFromDevice(deviceData: unknown[]): Promise<ImportResult>

  /** 从表单系统获取请假/加班数据 */
  syncFromForms(period: string): Promise<SyncResult>

  /** 计算月度考勤汇总 */
  calculateSummary(employeeId: string, period: string): Promise<SalarySystem.AttendanceSummary>

  /** 异常考勤检测 */
  detectAnomalies(employeeId: string, period: string): Promise<AttendanceAnomaly[]>
}

interface AttendanceAnomaly {
  date: string
  type: 'missing_check_in' | 'missing_check_out' | 'abnormal_hours' | 'excessive_overtime'
  description: string
  severity: 'info' | 'warning' | 'critical'
}
```

### 3.4 薪资方案配置器

```text
┌──────────────────────────────────────────────────────────────┐
│  薪资方案配置器 — [销售部薪资方案 v3]                          │
├──────────────┬───────────────────────────────────────────────┤
│ 加项配置      │  减项配置                                      │
│              │                                               │
│ □ 基本工资    │  □ 养老保险(个人 8%)                            │
│   固定: 8000 │  □ 医疗保险(个人 2%)                            │
│ □ 岗位津贴    │  □ 失业保险(个人 0.5%)                          │
│   固定: 2000 │  □ 住房公积金(个人 12%)                         │
│ □ 绩效工资    │  □ 个人所得税                                   │
│   公式: 基本工资│    计算方式: 累计预扣法                        │
│   × 绩效系数  │  □ 考勤扣款                                    │
│ □ 销售提成    │    公式: 日工资 × 缺勤天数                      │
│   阶梯:      │                                               │
│   0-10万 5%  │                                               │
│   10-30万 8% │                                               │
│   30万+ 12% │                                               │
├──────────────┴───────────────────────────────────────────────┤
│  适用范围: [销售部]  有效期: 2026-01 至 2026-12                │
│                                        [保存] [试算] [发布]   │
└──────────────────────────────────────────────────────────────┘
```

---

## 4. 系统集成

### 4.1 与财务系统集成

```typescript
/** 薪资 → 财务自动凭证 */
interface SalaryFinanceIntegration {
  /** 薪资审批通过 → 自动生成薪资凭证 */
  onSalaryApproved(batchId: string): Promise<{
    accrualVoucher: VoucherEntry[]   // 计提凭证
    paymentVoucher: VoucherEntry[]   // 发放凭证
    insuranceVoucher: VoucherEntry[] // 社保公积金凭证
  }>
}

/** 标准薪资凭证模板 */
interface SalaryVoucherTemplate {
  // 计提工资
  accrual: {
    debit: { account: '6602-工资', summary: '计提X月工资' }
    credit: { account: '2211-应付职工薪酬', summary: '计提X月工资' }
  }
  // 代扣社保
  insuranceDeduct: {
    debit: { account: '2211-应付职工薪酬', summary: '代扣个人社保' }
    credit: { account: '2241-其他应付款-社保', summary: '代扣个人社保' }
  }
  // 发放工资
  payment: {
    debit: { account: '2211-应付职工薪酬', summary: '发放X月工资' }
    credit: { account: '1002-银行存款', summary: '发放X月工资' }
  }
}
```

### 4.2 与智能表单集成

```typescript
/** 表单 → 薪资数据流 */
interface FormSalaryIntegration {
  /** 加班申请审批通过 → 记录加班时长 */
  onOvertimeApproved(form: unknown): Promise<{
    employeeId: string
    overtimeHours: number
    overtimeDate: string
  }>

  /** 请假申请审批通过 → 扣减假期余额 */
  onLeaveApproved(form: unknown): Promise<{
    employeeId: string
    leaveType: string
    days: number
  }>

  /** 绩效评分完成 → 更新绩效系数 */
  onPerformanceScored(form: unknown): Promise<{
    employeeId: string
    score: number
    coefficient: number
  }>
}
```

---

## 5. 数据库设计

### 5.1 核心表结构

```sql
-- 薪资方案表
CREATE TABLE salary_plans (
  id            UUID PRIMARY KEY,
  name          VARCHAR(200) NOT NULL,
  description   TEXT,
  status        VARCHAR(20) NOT NULL DEFAULT 'draft',
  effective_from DATE NOT NULL,
  effective_to   DATE,
  version       INTEGER NOT NULL DEFAULT 1,
  tax_config    JSONB NOT NULL,
  insurance_config JSONB NOT NULL,
  created_at    TIMESTAMP DEFAULT NOW(),
  updated_at    TIMESTAMP DEFAULT NOW()
);

-- 薪资组成项表
CREATE TABLE salary_components (
  id            UUID PRIMARY KEY,
  plan_id       UUID NOT NULL REFERENCES salary_plans(id),
  name          VARCHAR(100) NOT NULL,
  code          VARCHAR(50) NOT NULL,
  type          VARCHAR(20) NOT NULL,
  category      VARCHAR(30) NOT NULL,
  calc_mode     VARCHAR(20) NOT NULL,
  amount        DECIMAL(18, 2),
  formula       TEXT,
  taxable       BOOLEAN NOT NULL DEFAULT TRUE,
  insurance_base BOOLEAN NOT NULL DEFAULT FALSE,
  attendance_related BOOLEAN NOT NULL DEFAULT FALSE,
  sort_order    INTEGER NOT NULL DEFAULT 0
);

-- 员工薪资档案表
CREATE TABLE employee_salary_profiles (
  id                UUID PRIMARY KEY,
  employee_id       UUID NOT NULL,
  plan_id           UUID NOT NULL REFERENCES salary_plans(id),
  base_amount       DECIMAL(18, 2) NOT NULL,
  post_allowance    DECIMAL(18, 2) NOT NULL DEFAULT 0,
  performance_coeff DECIMAL(5, 2) NOT NULL DEFAULT 1.00,
  tax_deductions    JSONB NOT NULL DEFAULT '[]',
  bank_info         JSONB,
  effective_from    DATE NOT NULL,
  created_at        TIMESTAMP DEFAULT NOW()
);

-- 薪资台账表
CREATE TABLE salary_calculations (
  id                UUID PRIMARY KEY,
  employee_id       UUID NOT NULL,
  period            VARCHAR(7) NOT NULL,  -- '2026-06'
  plan_id           UUID NOT NULL,
  base_salary       DECIMAL(18, 2) NOT NULL,
  additions_json    JSONB NOT NULL,
  deductions_json   JSONB NOT NULL,
  gross_pay         DECIMAL(18, 2) NOT NULL,
  total_deductions  DECIMAL(18, 2) NOT NULL,
  net_pay           DECIMAL(18, 2) NOT NULL,
  breakdown_json    JSONB NOT NULL,
  status            VARCHAR(20) NOT NULL DEFAULT 'calculated',
  approved_by       UUID,
  paid_at           TIMESTAMP,
  voucher_id        UUID,
  created_at        TIMESTAMP DEFAULT NOW(),
  UNIQUE(employee_id, period)
);

-- 考勤汇总表
CREATE TABLE attendance_summaries (
  id                UUID PRIMARY KEY,
  employee_id       UUID NOT NULL,
  period            VARCHAR(7) NOT NULL,
  working_days      INTEGER NOT NULL DEFAULT 0,
  actual_days       INTEGER NOT NULL DEFAULT 0,
  late_count        INTEGER NOT NULL DEFAULT 0,
  early_leave_count INTEGER NOT NULL DEFAULT 0,
  absent_days       DECIMAL(5, 1) NOT NULL DEFAULT 0,
  leave_json        JSONB NOT NULL DEFAULT '{}',
  overtime_hours    DECIMAL(8, 2) NOT NULL DEFAULT 0,
  overtime_pay      DECIMAL(18, 2) NOT NULL DEFAULT 0,
  created_at        TIMESTAMP DEFAULT NOW(),
  UNIQUE(employee_id, period)
);
```

---

## 6. API 规范

| 方法 | 路径 | 说明 |
|:-----|:-----|:-----|
| **薪资方案** | | |
| GET | `/api/v1/salary/plans` | 方案列表 |
| POST | `/api/v1/salary/plans` | 创建方案 |
| PUT | `/api/v1/salary/plans/:id` | 更新方案 |
| POST | `/api/v1/salary/plans/:id/trial` | 试算方案 |
| **薪资核算** | | |
| POST | `/api/v1/salary/calculate/batch` | 批量计算 |
| POST | `/api/v1/salary/calculate/individual` | 单人计算 |
| GET | `/api/v1/salary/calculations` | 核算记录 |
| PUT | `/api/v1/salary/calculations/:id/approve` | 审批 |
| POST | `/api/v1/salary/calculations/pay` | 发放 |
| **个税管理** | | |
| GET | `/api/v1/salary/tax/brackets` | 税率表 |
| POST | `/api/v1/salary/tax/calculate` | 个税试算 |
| PUT | `/api/v1/salary/tax/deductions/:employeeId` | 更新专项扣除 |
| **考勤管理** | | |
| GET | `/api/v1/salary/attendance/summary` | 考勤汇总 |
| POST | `/api/v1/salary/attendance/import` | 导入考勤 |
| POST | `/api/v1/salary/attendance/sync-forms` | 同步表单数据 |
| **报表** | | |
| GET | `/api/v1/salary/reports/payroll` | 工资条报表 |
| GET | `/api/v1/salary/reports/cost-analysis` | 人力成本分析 |
| GET | `/api/v1/salary/reports/tax-summary` | 个税汇总 |
| POST | `/api/v1/salary/reports/bank-file` | 生成银行打款文件 |

---

## 7. 页面设计

### 7.1 薪资驾驶舱

```text
┌──────────────────────────────────────────────────────────────────┐
│  薪资驾驶舱 — 2026年6月                           [上月][本月]   │
├──────────────┬──────────────┬──────────────┬────────────────────┤
│  应发总额     │  实发总额     │  公司承担     │  人均薪资          │
│  ¥1,280,000  │  ¥968,000   │  ¥358,400   │  ¥12,800          │
│  ↑ 5.2%      │  ↑ 4.8%     │  ↑ 3.1%     │  ↑ 2.1%           │
├──────────────┴──────────────┴──────────────┴────────────────────┤
│  [薪资构成分析]                │  [部门人力成本]                    │
│  ■ 基本工资 62%               │  ■ 技术部 ¥420,000               │
│  ■ 绩效奖金 18%               │  ■ 销售部 ¥380,000               │
│  ■ 津贴补贴 12%               │  ■ 运营部 ¥280,000               │
│  ■ 加班费   5%                │  ■ 管理层 ¥200,000               │
│  ■ 其他     3%                │                                   │
├───────────────────────────────┼───────────────────────────────────┤
│  [个税/社保趋势]               │  [待办事项]                       │
│  〰〰〰〰                      │  • 6月薪资待核算                  │
│                               │  • 3人专项扣除待更新               │
│                               │  • 社保基数年度调整               │
└───────────────────────────────┴───────────────────────────────────┘
```

### 7.2 核心页面清单

| 页面 | 功能 | 关键交互 |
|:-----|:-----|:---------|
| 薪资驾驶舱 | 全局薪资数据看板 | AI 摘要、趋势预测、成本分析 |
| 薪资核算 | 月度薪资计算 + 审核 | 批量计算、异常标记、审批流 |
| 薪资方案 | 薪资结构可视化配置 | 拖拽组件、公式编辑器、试算 |
| 考勤管理 | 考勤数据 + 汇总 | 设备导入、表单同步、异常检测 |
| 个税管理 | 个税计算 + 专项扣除 | 累计预扣、专项扣除配置 |
| 工资条 | 员工个人工资条 | 加密查看、历史对比、导出 PDF |
| 人力成本 | 人力成本分析报表 | 部门/项目/趋势多维分析 |

---

## 8. 安全与权限

### 8.1 数据安全

| 安全措施 | 说明 |
|:---------|:-----|
| 传输加密 | HTTPS + 端到端加密 |
| 存储加密 | 薪资敏感字段 AES-256 加密 |
| 脱敏显示 | 银行卡号/身份证号掩码显示 |
| 操作审计 | 所有薪资操作完整审计日志 |
| 导出控制 | 导出需审批 + 水印追踪 |

### 8.2 权限矩阵

| 角色 | 查看本人 | 查看部门 | 查看全部 | 核算 | 审批 | 方案配置 |
|:-----|:---------|:---------|:---------|:-----|:-----|:---------|
| 员工 | ✅ | - | - | - | - | - |
| 部门主管 | ✅ | ✅ | - | - | ✅ | - |
| HR 专员 | ✅ | ✅ | ✅ | ✅ | - | - |
| HR 经理 | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| 财务 | - | - | ✅ | - | ✅ | - |
| 超级管理员 | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |

---

## 9. 实施路径

### Phase 1 — 核心基础
- 员工薪资档案管理
- 薪资方案可视化配置器
- 月度薪资计算引擎
- 个税累计预扣法实现
- 工资条查看

### Phase 2 — 考勤与集成
- 考勤数据采集与汇总
- 与智能表单（请假/加班/绩效）集成
- 与财务系统凭证自动生成
- 社保公积金计算

### Phase 3 — 智能进阶
- AI 薪资异常检测
- 人力成本预测分析
- 个税优化建议
- 智能排班建议
- 银行直连打款
