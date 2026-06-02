/**
 * Preload Fix for Dynamic Import Issues
 * This file ensures all critical components are imported synchronously
 * to prevent "Failed to fetch dynamically imported module" errors
 */

// Preload all critical components
import { ActivityLogPage } from './activity-log'
import { AIToolsPage } from './ai-tools-page'
import { AppOverviewPage } from './app-overview-page'
import { BrandManagementPage } from './brand-management-page'
import { CampaignExecutionPage } from './campaign-execution-page'
import { ChannelCenterPage } from './channel-center-page'
import { CustomerAcquisitionPage } from './customer-acquisition-page'
import { CustomerCarePage } from './customer-care-page'
import { DashboardPage } from './dashboard-page'
import { DataIntegrationPage } from './data-integration-page'
import { DecisionSupportPage } from './decision-support-page'
import { FormHistory } from './form-history'
import { FormTemplateBuilder } from './form-template-builder'
import { InsightsEnhancedPage } from './insights-enhanced'
import { LeftPanelPage } from './left-panel-page'
import { MarketingAnalyticsPage } from './marketing-analytics-page'
import { MarketingAssetsPage } from './marketing-assets-page'
import { MarketingStrategyPage } from './marketing-strategy-page'
import { ModelSettings } from './model-settings'
import { NLPProcessingPage } from './nlp-processing-page'
import { NumberDatabasePage } from './number-database'
import { ParameterSettingsPage } from './parameter-settings-page'
import { PlatformIntegrationPage } from './platform-integration-page'
import { PlatformSettingsPage } from './platform-settings-page'
import { ProfilePage } from './profile-page'
import { QuickActionsPage } from './quick-actions-page'
import { SmartCreationPage } from './smart-creation-page'
import { SmartFormPage } from './smart-form-system'
import { SmartMarketingEnginePage } from './smart-marketing-engine-page'
import { SmartOperationsPage } from './smart-operations-page'
import { TaskBoardPage } from './task-board-page'
import { ThemeConfigPage } from './theme-config'
import { WechatConfigPage } from './wechat-config-page'

// Export them all to ensure they're bundled
export {
  AIToolsPage,
  ActivityLogPage,
  AppOverviewPage,
  BrandManagementPage,
  CampaignExecutionPage,
  ChannelCenterPage,
  CustomerAcquisitionPage,
  CustomerCarePage,
  DashboardPage,
  DataIntegrationPage,
  DecisionSupportPage,
  FormHistory,
  FormTemplateBuilder,
  InsightsEnhancedPage,
  LeftPanelPage,
  MarketingAnalyticsPage,
  MarketingAssetsPage,
  // AI Marketing
  MarketingStrategyPage,
  ModelSettings,
  NLPProcessingPage,
  NumberDatabasePage,
  // Platform Integration
  ParameterSettingsPage,
  PlatformIntegrationPage,
  PlatformSettingsPage,
  ProfilePage,
  QuickActionsPage,
  SmartCreationPage,
  SmartFormPage,
  SmartMarketingEnginePage,
  SmartOperationsPage,
  TaskBoardPage,
  ThemeConfigPage,
  WechatConfigPage,
}

// This ensures all dependencies are loaded
/** Sentinel flag confirming all lazy-loaded component modules are resolved. */
export const COMPONENTS_LOADED = true
