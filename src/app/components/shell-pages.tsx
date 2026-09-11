/**
 * @file shell-pages.tsx
 * @description 应用壳内嵌页面包装:Chat 直出与 Forms 三标签容器
 *   (P2-③ 拆分,自 cyberpunk-standalone.tsx 抽出)
 * @author YanYuCloudCube Team <admin@0379.email>
 * @tags shell,pages,wrapper
 */

import { useState } from 'react'

import { useI18n } from '@/app/components/i18n-context'
import { ChatInterface } from '@/features/conversation/pages/chat-interface'
import { FormHistory } from '@/features/supply-chain/pages/form-history'
import { FormTemplateBuilder } from '@/features/supply-chain/pages/form-template-builder'
import { SmartFormPage } from '@/features/supply-chain/pages/smart-form-system'
import { useThemeColors } from '@/shared/hooks/use-theme-colors'

function ChatPage() {
  return (
    <div className="h-full flex flex-col">
      <ChatInterface />
    </div>
  )
}

function FormsTabPage() {
  const [formTab, setFormTab] = useState<'builder' | 'history' | 'smart'>('builder')
  const { t } = useI18n()
  const tc = useThemeColors()
  return (
    <div className="h-full flex flex-col">
      <div className="flex gap-2 px-6 pt-4">
        {(['builder', 'history', 'smart'] as const).map((id) => (
          <button
            key={id}
            onClick={() => setFormTab(id)}
            className="px-4 py-2 rounded-lg text-sm font-medium transition-all"
            style={{
              background: formTab === id ? tc.alpha(tc.primary, 0.15) : 'transparent',
              color: formTab === id ? tc.primary : tc.muted,
              border: `1px solid ${formTab === id ? tc.primary : 'transparent'}`,
            }}
          >
            {t(`forms.tab.${id}`)}
          </button>
        ))}
      </div>
      <div className="flex-1 overflow-auto p-6">
        {formTab === 'builder' && <FormTemplateBuilder />}
        {formTab === 'history' && <FormHistory />}
        {formTab === 'smart' && <SmartFormPage />}
      </div>
    </div>
  )
}

export { ChatPage, FormsTabPage }
