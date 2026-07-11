/**
 * file en.ts
 * description @yyc3/i18n-core locales/en.ts 模块
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
 * brief @yyc3/i18n-core locales/en.ts 模块
 */
export const en = {
  common: {
    health: 'Health',
    online: 'Online',
    offline: 'Offline',
    welcome: 'Welcome',
    save: 'Save',
    cancel: 'Cancel',
    loading: 'Loading...',
    error: 'Error',
    success: 'Success',
    version: 'v2.0.0',
  },
  nav: {
    home: 'Home',
    about: 'About',
    contact: 'Contact',
    aicall: 'AI Call',
  },
  overview: {
    stats: {
      cronNext: 'Next wake {time}',
    },
  },
  welcome: {
    message: 'Hello {name}',
    title: 'Welcome to YYC³ i18n Core',
  },
  aicall: {
    title: 'AI Intelligent Call',
    totalCalls: 'Total Calls',
    successRate: 'Success Rate',
    avgDuration: 'Avg Duration',
    activeAgents: 'Active Agents',
    callSettings: 'Call Settings',
    callCenter: 'Call Center',
    aiAnalysis: 'AI Call Analysis',
    liveMonitoring: 'Live Monitoring',
    callRecords: 'Call Records',
  },
  clm: {
    title: 'Customer Lifecycle Management',
    addCustomer: 'Add Customer',
    funnel: 'Customer Funnel',
    allCustomers: 'All Customers',
    pipeline: 'Sales Pipeline',
    segments: 'Customer Segments',
    touchpoints: 'Touchpoints',
    health: 'Health',
    stage1: 'Prospects',
    stage2: 'Leads',
    stage3: 'Customers',
    stage4: 'Repeat Customers',
    stage5: 'Loyal Customers',
    customers: 'customers',
    viewDetails: 'View Details',
  },
  workflow: {
    title: 'Workflow Management',
    createWorkflow: 'Create Workflow',
    activeWorkflows: 'Active Workflows',
    completedToday: 'Completed Today',
    avgExecutionTime: 'Avg Execution Time',
    pendingTasks: 'Pending Tasks',
    workflowDesigner: 'Workflow Designer',
    recentExecutions: 'Recent Executions',
    realtimeTasks: 'Realtime Tasks',
    analytics: 'Workflow Analytics',
  },
} as const

export type TranslationMap = typeof en
