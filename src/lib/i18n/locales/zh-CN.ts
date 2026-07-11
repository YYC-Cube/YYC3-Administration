/**
 * file zh-CN.ts
 * description @yyc3/i18n-core locales/zh-CN.ts 模块
 * module @yyc3/i18n-core
 * author YanYuCloudCube Team <admin@0379.email>
 * version 2.3.0
 * created 2026-04-24
 * updated 2026-04-24
 * status active
 * tags [module],[i18n]
 *
 * copyright YanYuCloudCube Team
 * license MIT
 *
 * brief @yyc3/i18n-core locales/zh-CN.ts 模块
 */
export const zh_CN = {
  common: {
    health: '健康状况',
    online: '在线',
    offline: '离线',
    welcome: '欢迎',
    save: '保存',
    cancel: '取消',
    loading: '加载中...',
    error: '错误',
    success: '成功',
    version: 'v2.0.0',
  },
  nav: {
    home: '首页',
    about: '关于',
    contact: '联系我们',
    aicall: 'AI智能呼叫',
  },
  overview: {
    stats: {
      cronNext: '下次唤醒 {time}',
    },
  },
  welcome: {
    message: '你好 {name}',
    title: '欢迎使用 YYC³ i18n Core',
  },
  aicall: {
    title: 'AI智能呼叫',
    totalCalls: '今日通话',
    successRate: '接通率',
    avgDuration: '平均时长',
    activeAgents: '活跃坐席',
    callSettings: '呼叫设置',
    callCenter: '呼叫中心',
    aiAnalysis: 'AI通话分析',
    liveMonitoring: '实时监控',
    callRecords: '通话记录',
  },
  clm: {
    title: '客户全生命周期管理',
    addCustomer: '添加客户',
    funnel: '客户漏斗',
    allCustomers: '全部客户',
    pipeline: '销售管道',
    segments: '客户分群',
    touchpoints: '触点分析',
    health: '健康度',
    stage1: '潜在客户',
    stage2: '意向客户',
    stage3: '成交客户',
    stage4: '复购客户',
    stage5: '忠诚客户',
    customers: '客户',
    viewDetails: '查看详情',
  },
  workflow: {
    title: '工作流管理',
    createWorkflow: '创建工作流',
    activeWorkflows: '运行中工作流',
    completedToday: '今日完成',
    avgExecutionTime: '平均执行时间',
    pendingTasks: '待处理任务',
    workflowDesigner: '工作流设计器',
    recentExecutions: '最近执行',
    realtimeTasks: '实时任务',
    analytics: '工作流分析',
  },
} as const
