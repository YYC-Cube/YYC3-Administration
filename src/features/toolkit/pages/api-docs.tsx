'use client'

import {
  BookOpen,
  Check,
  ChevronDown,
  ChevronRight,
  Copy,
  Database,
  FileText,
  Shield,
} from 'lucide-react'
import { useState } from 'react'

import { useI18n } from '@/app/components/i18n-context'
import { NeonCard } from '@/app/components/neon-card'
import { useThemeColors } from '@/shared/hooks/use-theme-colors'

interface ApiEndpoint {
  id: string
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH'
  path: string
  description: string
  tags: string[]
  request?: Record<string, { type: string; required: boolean; description?: string }>
  response?: Record<string, { type: string; description?: string }>
}

const apiEndpoints: ApiEndpoint[] = [
  {
    id: 'auth-login',
    method: 'POST',
    path: '/api/auth/login',
    description: 'apd.ep.authLogin.desc',
    tags: ['apd.tag.auth'],
    request: {
      username: { type: 'string', required: true, description: 'apd.field.usernameOrEmail' },
      password: { type: 'string', required: true, description: 'apd.field.password' },
      rememberMe: { type: 'boolean', required: false, description: 'apd.field.rememberMe' },
    },
    response: {
      accessToken: { type: 'string', description: 'apd.field.accessToken' },
      refreshToken: { type: 'string', description: 'apd.field.refreshToken' },
      user: { type: 'UserProfile', description: 'apd.field.userInfo' },
      expiresIn: { type: 'number', description: 'apd.field.expiresIn' },
    },
  },
  {
    id: 'auth-refresh',
    method: 'POST',
    path: '/api/auth/refresh',
    description: 'apd.ep.authRefresh.desc',
    tags: ['apd.tag.auth'],
    request: {
      refreshToken: { type: 'string', required: true, description: 'apd.field.refreshToken' },
    },
    response: {
      accessToken: { type: 'string', description: 'apd.field.newAccessToken' },
      expiresIn: { type: 'number', description: 'apd.field.expiresIn' },
    },
  },
  {
    id: 'auth-logout',
    method: 'POST',
    path: '/api/auth/logout',
    description: 'apd.ep.authLogout.desc',
    tags: ['apd.tag.auth'],
  },
  {
    id: 'chat-send',
    method: 'POST',
    path: '/api/chat',
    description: 'apd.ep.chatSend.desc',
    tags: ['apd.tag.chat'],
    request: {
      message: { type: 'string', required: true, description: 'apd.field.messageContent' },
      conversationId: { type: 'string', required: false, description: 'apd.field.conversationId' },
      model: { type: 'AIModelType', required: false, description: 'apd.field.modelType' },
      stream: { type: 'boolean', required: false, description: 'apd.field.stream' },
    },
    response: {
      id: { type: 'string', description: 'apd.field.responseId' },
      conversationId: { type: 'string', description: 'apd.field.conversationId' },
      content: { type: 'string', description: 'apd.field.responseContent' },
      model: { type: 'AIModelType', description: 'apd.field.usedModel' },
      usage: {
        type: '{ promptTokens, completionTokens, totalTokens }',
        description: 'apd.field.tokenUsage',
      },
    },
  },
  {
    id: 'chat-history',
    method: 'GET',
    path: '/api/chat/history',
    description: 'apd.ep.chatHistory.desc',
    tags: ['apd.tag.chat'],
    response: {
      conversations: { type: 'Conversation[]', description: 'apd.field.conversationList' },
      total: { type: 'number', description: 'apd.field.total' },
    },
  },
  {
    id: 'contacts-list',
    method: 'GET',
    path: '/api/contacts',
    description: 'apd.ep.contactsList.desc',
    tags: ['apd.tag.contacts'],
    response: {
      items: { type: 'SharedContact[]', description: 'apd.field.contactsList' },
      total: { type: 'number', description: 'apd.field.total' },
      page: { type: 'number', description: 'apd.field.page' },
      pageSize: { type: 'number', description: 'apd.field.pageSize' },
    },
  },
  {
    id: 'contacts-create',
    method: 'POST',
    path: '/api/contacts',
    description: 'apd.ep.contactsCreate.desc',
    tags: ['apd.tag.contacts'],
    request: {
      name: { type: 'string', required: true, description: 'apd.field.name' },
      phone: { type: 'string', required: true, description: 'apd.field.phone' },
      email: { type: 'string', required: false, description: 'apd.field.email' },
      company: { type: 'string', required: false, description: 'apd.field.company' },
      stage: { type: 'CustomerStage', required: false, description: 'apd.field.stage' },
      tags: { type: 'string[]', required: false, description: 'apd.field.tags' },
    },
    response: {
      id: { type: 'string', description: 'apd.field.contactId' },
      ...{ name: { type: 'string' }, phone: { type: 'string' }, email: { type: 'string' } },
    },
  },
  {
    id: 'contacts-update',
    method: 'PUT',
    path: '/api/contacts/{id}',
    description: 'apd.ep.contactsUpdate.desc',
    tags: ['apd.tag.contacts'],
    request: {
      name: { type: 'string', required: false, description: 'apd.field.name' },
      phone: { type: 'string', required: false, description: 'apd.field.phone' },
      email: { type: 'string', required: false, description: 'apd.field.email' },
      stage: { type: 'CustomerStage', required: false, description: 'apd.field.stage' },
    },
  },
  {
    id: 'contacts-delete',
    method: 'DELETE',
    path: '/api/contacts/{id}',
    description: 'apd.ep.contactsDelete.desc',
    tags: ['apd.tag.contacts'],
  },
  {
    id: 'calls-initiate',
    method: 'POST',
    path: '/api/calls',
    description: 'apd.ep.callsInitiate.desc',
    tags: ['apd.tag.calls'],
    request: {
      phoneNumber: { type: 'string', required: true, description: 'apd.field.phoneNumber' },
      contactId: { type: 'string', required: false, description: 'apd.field.contactId' },
      script: { type: 'string', required: false, description: 'apd.field.script' },
      record: { type: 'boolean', required: false, description: 'apd.field.record' },
    },
    response: {
      callId: { type: 'string', description: 'apd.field.callId' },
      status: { type: 'string', description: 'apd.field.status' },
      startTime: { type: 'string', description: 'apd.field.startTime' },
    },
  },
  {
    id: 'calls-list',
    method: 'GET',
    path: '/api/calls',
    description: 'apd.ep.callsList.desc',
    tags: ['apd.tag.calls'],
    response: {
      items: { type: 'CallRecord[]', description: 'apd.field.callsList' },
      total: { type: 'number', description: 'apd.field.total' },
    },
  },
  {
    id: 'export-data',
    method: 'POST',
    path: '/api/export',
    description: 'apd.ep.exportData.desc',
    tags: ['apd.tag.export'],
    request: {
      dataType: { type: 'string', required: true, description: 'apd.field.dataType' },
      format: { type: 'string', required: true, description: 'apd.field.format' },
      filters: {
        type: 'Record<string, unknown>',
        required: false,
        description: 'apd.field.filters',
      },
      dateRange: { type: '{ from, to }', required: false, description: 'apd.field.dateRange' },
    },
    response: {
      exportId: { type: 'string', description: 'apd.field.exportId' },
      fileUrl: { type: 'string', description: 'apd.field.fileUrl' },
      fileSize: { type: 'number', description: 'apd.field.fileSize' },
    },
  },
  {
    id: 'models-list',
    method: 'GET',
    path: '/api/models',
    description: 'apd.ep.modelsList.desc',
    tags: ['apd.tag.models'],
    response: {
      models: { type: 'AIModelConfig[]', description: 'apd.field.modelsList' },
    },
  },
  {
    id: 'models-config',
    method: 'PUT',
    path: '/api/models/{id}',
    description: 'apd.ep.modelsConfig.desc',
    tags: ['apd.tag.models'],
    request: {
      temperature: { type: 'number', required: false, description: 'apd.field.temperature' },
      maxTokens: { type: 'number', required: false, description: 'apd.field.maxTokens' },
      systemPrompt: { type: 'string', required: false, description: 'apd.field.systemPrompt' },
    },
  },
]

const methodColors: Record<string, string> = {
  GET: '#10b981',
  POST: '#3b82f6',
  PUT: '#f59e0b',
  DELETE: '#ef4444',
  PATCH: '#8b5cf6',
}

export function ApiDocs() {
  const tc = useThemeColors()
  const { t } = useI18n()
  const [expandedId, setExpandedId] = useState<string | null>('auth-login')
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [selectedTag, setSelectedTag] = useState<string | null>(null)

  const allTags = [...new Set(apiEndpoints.flatMap((e) => e.tags))]

  const filteredEndpoints = selectedTag
    ? apiEndpoints.filter((e) => e.tags.includes(selectedTag))
    : apiEndpoints

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  return (
    <div className="h-full overflow-y-auto p-6" style={{ scrollbarWidth: 'none' }}>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{
              background: tc.alpha(tc.primary, 0.1),
              border: `1px solid ${tc.alpha(tc.primary, 0.25)}`,
            }}
          >
            <BookOpen className="w-5 h-5" style={{ color: tc.primary }} />
          </div>
          <div>
            <h2
              className="text-lg font-medium"
              style={{ color: tc.primary, textShadow: `0 0 15px ${tc.alpha(tc.primary, 0.5)}` }}
            >
              {t('apiDocs.title')}
            </h2>
            <p className="text-xs" style={{ color: tc.textMuted }}>
              {t('apiDocs.subtitle')}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2" style={{ color: tc.textMuted }}>
            <Database className="w-4 h-4" />
            <span className="text-xs">RESTful API</span>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 mb-6">
        <button
          onClick={() => setSelectedTag(null)}
          className={`px-3 py-1.5 rounded-lg text-xs transition-all ${selectedTag === null ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:bg-accent'}`}
        >
          {t('apiDocs.all')}
        </button>
        {allTags.map((tag) => (
          <button
            key={tag}
            onClick={() => setSelectedTag(selectedTag === tag ? null : tag)}
            className={`px-3 py-1.5 rounded-lg text-xs transition-all ${selectedTag === tag ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:bg-accent'}`}
          >
            {t(tag)}
          </button>
        ))}
      </div>

      <div className="space-y-4">
        {filteredEndpoints.map((endpoint) => (
          <NeonCard key={endpoint.id} color={methodColors[endpoint.method]} hoverable={false}>
            <div
              className="flex items-center justify-between cursor-pointer"
              onClick={() => setExpandedId(expandedId === endpoint.id ? null : endpoint.id)}
            >
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-3">
                  <span
                    className="px-3 py-1 rounded-lg text-xs font-medium"
                    style={{
                      background: `${methodColors[endpoint.method]}15`,
                      color: methodColors[endpoint.method],
                    }}
                  >
                    {endpoint.method}
                  </span>
                  <span className="text-sm font-medium" style={{ color: tc.foreground }}>
                    {endpoint.path}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  {endpoint.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-2 py-0.5 rounded text-[10px]"
                      style={{ background: tc.muted + '20', color: tc.textMuted }}
                    >
                      {t(tag)}
                    </span>
                  ))}
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs" style={{ color: tc.textMuted }}>
                  {t(endpoint.description)}
                </span>
                {expandedId === endpoint.id ? (
                  <ChevronDown className="w-4 h-4" style={{ color: tc.textMuted }} />
                ) : (
                  <ChevronRight className="w-4 h-4" style={{ color: tc.textMuted }} />
                )}
              </div>
            </div>

            {expandedId === endpoint.id && (
              <div
                className="mt-4 pt-4 space-y-4"
                style={{ borderTop: `1px solid ${tc.borderSubtle}` }}
              >
                {endpoint.request && Object.keys(endpoint.request).length > 0 && (
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <FileText className="w-4 h-4" style={{ color: tc.accent }} />
                      <h3 className="text-xs font-medium" style={{ color: tc.textSecondary }}>
                        {t('apiDocs.requestParams')}
                      </h3>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full text-xs">
                        <thead>
                          <tr style={{ borderBottom: `1px solid ${tc.borderSubtle}` }}>
                            <th className="text-left py-2 px-3" style={{ color: tc.textMuted }}>
                              {t('apiDocs.paramName')}
                            </th>
                            <th className="text-left py-2 px-3" style={{ color: tc.textMuted }}>
                              {t('apiDocs.type')}
                            </th>
                            <th className="text-left py-2 px-3" style={{ color: tc.textMuted }}>
                              {t('apiDocs.required')}
                            </th>
                            <th className="text-left py-2 px-3" style={{ color: tc.textMuted }}>
                              {t('apiDocs.description')}
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {Object.entries(endpoint.request).map(([name, field]) => (
                            <tr key={name} style={{ borderBottom: `1px solid ${tc.borderSubtle}` }}>
                              <td
                                className="py-2 px-3 font-medium"
                                style={{ color: tc.foreground }}
                              >
                                {name}
                              </td>
                              <td className="py-2 px-3" style={{ color: tc.textSecondary }}>
                                {field.type}
                              </td>
                              <td className="py-2 px-3">
                                {field.required ? (
                                  <span
                                    className="px-1.5 py-0.5 rounded text-[9px]"
                                    style={{ background: tc.danger + '20', color: tc.danger }}
                                  >
                                    {t('apiDocs.yes')}
                                  </span>
                                ) : (
                                  <span
                                    className="px-1.5 py-0.5 rounded text-[9px]"
                                    style={{ background: tc.muted + '20', color: tc.textMuted }}
                                  >
                                    {t('apiDocs.no')}
                                  </span>
                                )}
                              </td>
                              <td className="py-2 px-3" style={{ color: tc.textMuted }}>
                                {field.description ? t(field.description) : '-'}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {endpoint.response && Object.keys(endpoint.response).length > 0 && (
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <Shield className="w-4 h-4" style={{ color: tc.success }} />
                      <h3 className="text-xs font-medium" style={{ color: tc.textSecondary }}>
                        {t('apiDocs.responseFields')}
                      </h3>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full text-xs">
                        <thead>
                          <tr style={{ borderBottom: `1px solid ${tc.borderSubtle}` }}>
                            <th className="text-left py-2 px-3" style={{ color: tc.textMuted }}>
                              {t('apiDocs.fieldName')}
                            </th>
                            <th className="text-left py-2 px-3" style={{ color: tc.textMuted }}>
                              {t('apiDocs.type')}
                            </th>
                            <th className="text-left py-2 px-3" style={{ color: tc.textMuted }}>
                              {t('apiDocs.description')}
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {Object.entries(endpoint.response).map(([name, field]) => (
                            <tr key={name} style={{ borderBottom: `1px solid ${tc.borderSubtle}` }}>
                              <td
                                className="py-2 px-3 font-medium"
                                style={{ color: tc.foreground }}
                              >
                                {name}
                              </td>
                              <td className="py-2 px-3" style={{ color: tc.textSecondary }}>
                                {field.type}
                              </td>
                              <td className="py-2 px-3" style={{ color: tc.textMuted }}>
                                {field.description ? t(field.description) : '-'}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                <div className="flex justify-end">
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      copyToClipboard(`${endpoint.method} ${endpoint.path}`, endpoint.id)
                    }}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs transition-all"
                    style={{
                      background: tc.alpha(tc.primary, 0.06),
                      border: `1px solid ${tc.alpha(tc.primary, 0.2)}`,
                      color: tc.primary,
                    }}
                  >
                    {copiedId === endpoint.id ? (
                      <Check className="w-3 h-3" />
                    ) : (
                      <Copy className="w-3 h-3" />
                    )}
                    {copiedId === endpoint.id ? t('apiDocs.copied') : t('apiDocs.copyPath')}
                  </button>
                </div>
              </div>
            )}
          </NeonCard>
        ))}
      </div>

      <div
        className="mt-8 p-4 rounded-xl"
        style={{ background: tc.bgElevated, border: `1px solid ${tc.borderSubtle}` }}
      >
        <h3 className="text-xs font-medium mb-3" style={{ color: tc.textSecondary }}>
          {t('apiDocs.responseFormat')}
        </h3>
        <pre className="text-xs overflow-x-auto" style={{ color: tc.textMuted }}>
          {`{
  "success": true,
  "data": {},
  "message": "${t('apiDocs.successMsg')}",
  "timestamp": "2024-01-01T12:00:00Z"
}`}
        </pre>
      </div>

      <div
        className="mt-4 p-4 rounded-xl"
        style={{ background: tc.bgElevated, border: `1px solid ${tc.borderSubtle}` }}
      >
        <h3 className="text-xs font-medium mb-3" style={{ color: tc.textSecondary }}>
          {t('apiDocs.errorResponse')}
        </h3>
        <pre className="text-xs overflow-x-auto" style={{ color: tc.textMuted }}>
          {`{
  "success": false,
  "data": null,
  "error": {
    "code": "ERR_001",
    "message": "${t('apiDocs.errorMsg')}",
    "details": {}
  },
  "timestamp": "2024-01-01T12:00:00Z"
}`}
        </pre>
      </div>
    </div>
  )
}
