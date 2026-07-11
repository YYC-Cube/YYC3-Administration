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

import { useThemeColors } from './hooks/use-theme-colors'
import { useI18n } from './i18n-context'
import { NeonCard } from './neon-card'

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
    description: '用户登录，获取访问令牌',
    tags: ['认证'],
    request: {
      username: { type: 'string', required: true, description: '用户名或邮箱' },
      password: { type: 'string', required: true, description: '密码' },
      rememberMe: { type: 'boolean', required: false, description: '记住我' },
    },
    response: {
      accessToken: { type: 'string', description: '访问令牌' },
      refreshToken: { type: 'string', description: '刷新令牌' },
      user: { type: 'UserProfile', description: '用户信息' },
      expiresIn: { type: 'number', description: '过期时间（秒）' },
    },
  },
  {
    id: 'auth-refresh',
    method: 'POST',
    path: '/api/auth/refresh',
    description: '使用刷新令牌获取新的访问令牌',
    tags: ['认证'],
    request: {
      refreshToken: { type: 'string', required: true, description: '刷新令牌' },
    },
    response: {
      accessToken: { type: 'string', description: '新访问令牌' },
      expiresIn: { type: 'number', description: '过期时间（秒）' },
    },
  },
  {
    id: 'auth-logout',
    method: 'POST',
    path: '/api/auth/logout',
    description: '用户登出，失效令牌',
    tags: ['认证'],
  },
  {
    id: 'chat-send',
    method: 'POST',
    path: '/api/chat',
    description: '发送消息给AI模型',
    tags: ['AI对话'],
    request: {
      message: { type: 'string', required: true, description: '消息内容' },
      conversationId: { type: 'string', required: false, description: '对话ID' },
      model: { type: 'AIModelType', required: false, description: '模型类型' },
      stream: { type: 'boolean', required: false, description: '流式响应' },
    },
    response: {
      id: { type: 'string', description: '响应ID' },
      conversationId: { type: 'string', description: '对话ID' },
      content: { type: 'string', description: '响应内容' },
      model: { type: 'AIModelType', description: '使用的模型' },
      usage: {
        type: '{ promptTokens, completionTokens, totalTokens }',
        description: '令牌使用情况',
      },
    },
  },
  {
    id: 'chat-history',
    method: 'GET',
    path: '/api/chat/history',
    description: '获取对话历史列表',
    tags: ['AI对话'],
    response: {
      conversations: { type: 'Conversation[]', description: '对话列表' },
      total: { type: 'number', description: '总数' },
    },
  },
  {
    id: 'contacts-list',
    method: 'GET',
    path: '/api/contacts',
    description: '获取联系人列表',
    tags: ['联系人'],
    response: {
      items: { type: 'SharedContact[]', description: '联系人列表' },
      total: { type: 'number', description: '总数' },
      page: { type: 'number', description: '当前页' },
      pageSize: { type: 'number', description: '每页数量' },
    },
  },
  {
    id: 'contacts-create',
    method: 'POST',
    path: '/api/contacts',
    description: '创建新联系人',
    tags: ['联系人'],
    request: {
      name: { type: 'string', required: true, description: '姓名' },
      phone: { type: 'string', required: true, description: '电话' },
      email: { type: 'string', required: false, description: '邮箱' },
      company: { type: 'string', required: false, description: '公司' },
      stage: { type: 'CustomerStage', required: false, description: '生命周期阶段' },
      tags: { type: 'string[]', required: false, description: '标签' },
    },
    response: {
      id: { type: 'string', description: '联系人ID' },
      ...{ name: { type: 'string' }, phone: { type: 'string' }, email: { type: 'string' } },
    },
  },
  {
    id: 'contacts-update',
    method: 'PUT',
    path: '/api/contacts/{id}',
    description: '更新联系人信息',
    tags: ['联系人'],
    request: {
      name: { type: 'string', required: false, description: '姓名' },
      phone: { type: 'string', required: false, description: '电话' },
      email: { type: 'string', required: false, description: '邮箱' },
      stage: { type: 'CustomerStage', required: false, description: '生命周期阶段' },
    },
  },
  {
    id: 'contacts-delete',
    method: 'DELETE',
    path: '/api/contacts/{id}',
    description: '删除联系人',
    tags: ['联系人'],
  },
  {
    id: 'calls-initiate',
    method: 'POST',
    path: '/api/calls',
    description: '发起AI呼叫',
    tags: ['AI呼叫'],
    request: {
      phoneNumber: { type: 'string', required: true, description: '目标号码' },
      contactId: { type: 'string', required: false, description: '联系人ID' },
      script: { type: 'string', required: false, description: '呼叫脚本' },
      record: { type: 'boolean', required: false, description: '录音设置' },
    },
    response: {
      callId: { type: 'string', description: '呼叫ID' },
      status: { type: 'string', description: '状态' },
      startTime: { type: 'string', description: '开始时间' },
    },
  },
  {
    id: 'calls-list',
    method: 'GET',
    path: '/api/calls',
    description: '获取通话记录列表',
    tags: ['AI呼叫'],
    response: {
      items: { type: 'CallRecord[]', description: '通话记录列表' },
      total: { type: 'number', description: '总数' },
    },
  },
  {
    id: 'export-data',
    method: 'POST',
    path: '/api/export',
    description: '导出数据',
    tags: ['数据导出'],
    request: {
      dataType: { type: 'string', required: true, description: '数据类型' },
      format: { type: 'string', required: true, description: '导出格式' },
      filters: { type: 'Record<string, unknown>', required: false, description: '筛选条件' },
      dateRange: { type: '{ from, to }', required: false, description: '日期范围' },
    },
    response: {
      exportId: { type: 'string', description: '导出ID' },
      fileUrl: { type: 'string', description: '文件URL' },
      fileSize: { type: 'number', description: '文件大小' },
    },
  },
  {
    id: 'models-list',
    method: 'GET',
    path: '/api/models',
    description: '获取可用AI模型列表',
    tags: ['AI模型'],
    response: {
      models: { type: 'AIModelConfig[]', description: '模型配置列表' },
    },
  },
  {
    id: 'models-config',
    method: 'PUT',
    path: '/api/models/{id}',
    description: '更新模型配置',
    tags: ['AI模型'],
    request: {
      temperature: { type: 'number', required: false, description: '温度' },
      maxTokens: { type: 'number', required: false, description: '最大令牌数' },
      systemPrompt: { type: 'string', required: false, description: '系统提示' },
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
            {tag}
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
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs" style={{ color: tc.textMuted }}>
                  {endpoint.description}
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
                                {field.description || '-'}
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
                                {field.description || '-'}
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
