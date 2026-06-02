/**
 * @file components/settings/conversation-settings-panel.tsx
 * @description Conversation Settings Panel - Dialog Flow Configuration
 * @author YanYuCloudCube Team <admin@0379.email>
 * @version v1.0.0
 * @created 2026-03-17
 * @updated 2026-03-17
 * @status stable
 * @license MIT
 * @copyright Copyright (c) 2026 YanYuCloudCube Team
 * @tags settings,conversation,dialog
 */

import { MessageSquare } from 'lucide-react';

import { useThemeColors } from '../hooks/use-theme-colors';

export function ConversationSettingsPanel() {
  const tc = useThemeColors();
  
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2" style={{ color: tc.primary }}>
          对话流设置
        </h2>
        <p style={{ color: tc.textSecondary }}>
          配置对话行为和通知
        </p>
      </div>
      <div className="p-12 rounded-xl text-center" style={{ background: tc.bgElevated, border: `1px solid ${tc.borderSubtle}` }}>
        <MessageSquare size={48} style={{ color: tc.textMuted }} className="mx-auto mb-4" />
        <p style={{ color: tc.textMuted }}>对话流设置面板</p>
      </div>
    </div>
  );
}
