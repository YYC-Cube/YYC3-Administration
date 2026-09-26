/**
 * @file number-database-tabs.tsx
 * @description 号牌库八大标签页(F-11 拆分后统一出口)
 *   各标签页实现移至 ./tabs/,本文件仅做 re-export,
 *   消费方(number-database.tsx)导入路径不变。
 * @author YanYuCloudCube Team <admin@0379.email>
 * @tags customer,tabs,barrel
 */

export { OverviewTab } from './tabs/ndb-overview-tab'
export { ContactsTab } from './tabs/ndb-contacts-tab'
export { AnalyticsTab } from './tabs/ndb-analytics-tab'
export { CollaborationTab } from './tabs/ndb-collaboration-tab'
export { ValueTab } from './tabs/ndb-value-tab'
export { ServiceTab } from './tabs/ndb-service-tab'
export { KnowledgeTab } from './tabs/ndb-knowledge-tab'
export { MonitorTab } from './tabs/ndb-monitor-tab'
