/**
 * @file model-settings-mcp.tsx
 * @description 模型设置 — MCP 服务器配置面板(P2-③ 第二刀)
 * @author YanYuCloudCube Team <admin@0379.email>
 * @tags models,settings,mcp
 */

import {
  AlertCircle,
  Check,
  CheckCircle2,
  ExternalLink,
  Play,
  Plug,
  Plus,
  Server,
  Settings,
  Settings2,
  Terminal,
  Trash2,
  X,
} from 'lucide-react'
import { AnimatePresence, motion } from 'motion/react'
import { useEffect, useState } from 'react'

import type { MCPServerConfig } from '@/features/settings/model-settings/model-settings-data'

import { useI18n } from '@/app/components/i18n-context'
import {
  DEFAULT_MCP_SERVERS,
  loadJSON,
  saveJSON,
  STORAGE_KEYS,
} from '@/features/settings/model-settings/model-settings-data'
import { CopyButton } from '@/features/settings/model-settings/model-settings-provider-card'
import { useThemeColors } from '@/shared/hooks/use-theme-colors'

function MCPConfigPanel() {
  const { t: i } = useI18n()
  const [servers, setServers] = useState<MCPServerConfig[]>(() =>
    loadJSON(STORAGE_KEYS.mcpServers, DEFAULT_MCP_SERVERS),
  )
  const [addingServer, setAddingServer] = useState(false)
  const [newServer, setNewServer] = useState({
    name: '',
    command: '',
    args: '',
    env: '',
    description: '',
  })
  const [editingId, setEditingId] = useState<string | null>(null)
  const [jsonMode, setJsonMode] = useState(false)
  const [jsonDraft, setJsonDraft] = useState('')
  const [jsonError, setJsonError] = useState('')

  useEffect(() => {
    saveJSON(STORAGE_KEYS.mcpServers, servers)
  }, [servers])

  const handleToggle = (id: string) => {
    setServers((prev) => prev.map((s) => (s.id === id ? { ...s, enabled: !s.enabled } : s)))
  }
  const handleRemove = (id: string) => {
    setServers((prev) => prev.filter((s) => s.id !== id))
  }
  const handleAdd = () => {
    if (!newServer.name || !newServer.command) return
    let envObj: Record<string, string> = {}
    try {
      if (newServer.env) envObj = JSON.parse(newServer.env)
    } catch {
      /* invalid json */
    }
    const server: MCPServerConfig = {
      id: 'mcp-' + Date.now(),
      name: newServer.name,
      description: newServer.description || newServer.name,
      command: newServer.command,
      args: newServer.args ? newServer.args.split(/\s+/) : [],
      env: envObj,
      enabled: true,
    }
    setServers((prev) => [...prev, server])
    setNewServer({ name: '', command: '', args: '', env: '', description: '' })
    setAddingServer(false)
  }

  const handleExportJson = () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const mcpConfig: Record<string, any> = { mcpServers: {} }
    servers
      .filter((s) => s.enabled)
      .forEach((s) => {
        mcpConfig.mcpServers[s.name.toLowerCase()] = {
          command: s.command,
          args: s.args,
          ...(Object.keys(s.env).length > 0 ? { env: s.env } : {}),
        }
      })
    setJsonDraft(JSON.stringify(mcpConfig, null, 2))
    setJsonMode(true)
    setJsonError('')
  }

  const handleImportJson = () => {
    try {
      const parsed = JSON.parse(jsonDraft)
      const mcpServers = parsed.mcpServers || parsed
      const imported: MCPServerConfig[] = Object.entries(mcpServers).map(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ([name, conf]: [string, any]) => ({
          id: 'mcp-' + Date.now() + '-' + name,
          name,
          description: conf.description || name,
          command: conf.command || '',
          args: conf.args || [],
          env: conf.env || {},
          enabled: true,
        }),
      )
      setServers(imported)
      setJsonMode(false)
      setJsonError('')
    } catch (e: unknown) {
      setJsonError(i('ms.jsonParseFail', { msg: e instanceof Error ? e.message : String(e) }))
    }
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Plug className="w-4 h-4 text-violet-400" />
          <span className="text-[12px] text-white/70">{i('ms.mcpTitle')}</span>
          <span className="text-[9px] text-white/20 bg-white/[0.03] px-1.5 py-0.5 rounded">
            {i('ms.mcpEnabled', {
              enabled: servers.filter((s) => s.enabled).length,
              total: servers.length,
            })}
          </span>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={handleExportJson}
            className="flex items-center gap-1 px-2 py-1 rounded text-[9px] text-white/25 hover:text-white/50 hover:bg-white/[0.04] transition-all"
          >
            <Terminal className="w-3 h-3" /> {jsonMode ? i('ms.listMode') : i('ms.jsonMode')}
          </button>
        </div>
      </div>

      {/* JSON Mode */}
      {jsonMode && (
        <div className="space-y-2">
          <textarea
            value={jsonDraft}
            onChange={(e) => {
              setJsonDraft(e.target.value)
              setJsonError('')
            }}
            rows={12}
            className="w-full bg-black/20 border border-white/[0.06] rounded-lg px-3 py-2 text-[10px] text-white/60 font-mono focus:outline-none focus:border-violet-500/40 resize-none"
            placeholder='{"mcpServers": { "filesystem": { "command": "npx", "args": [...] } }}'
          />
          {jsonError && (
            <div className="text-[10px] text-red-400/70 flex items-center gap-1">
              <AlertCircle className="w-3 h-3" />
              {jsonError}
            </div>
          )}
          <div className="flex items-center gap-2">
            <button
              onClick={handleImportJson}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-violet-500/15 border border-violet-500/20 text-violet-400 text-[10px] hover:bg-violet-500/25 transition-all"
            >
              <Check className="w-3 h-3" /> {i('ms.importJson')}
            </button>
            <button
              onClick={() => setJsonMode(false)}
              className="px-3 py-1.5 rounded-lg text-white/30 text-[10px] hover:bg-white/[0.04] transition-all"
            >
              {i('ms.cancel')}
            </button>
            <CopyButton text={jsonDraft} />
          </div>
          <div className="text-[9px] text-white/20 px-1">{i('ms.mcpJsonDesc')}</div>
        </div>
      )}

      {/* Server list */}
      {!jsonMode && (
        <div className="space-y-2">
          {servers.map((server) => (
            <div
              key={server.id}
              className={`rounded-xl border p-3 space-y-2 transition-all ${
                server.enabled
                  ? 'border-white/[0.06] bg-white/[0.02]'
                  : 'border-white/[0.03] bg-white/[0.01] opacity-50'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <button onClick={() => handleToggle(server.id)} className="shrink-0">
                  <div
                    className={`w-8 h-4 rounded-full transition-all ${server.enabled ? 'bg-violet-500/30' : 'bg-white/[0.06]'}`}
                  >
                    <div
                      className={`w-3.5 h-3.5 rounded-full transition-all mt-[1px] ${
                        server.enabled ? 'bg-violet-400 ml-[17px]' : 'bg-white/20 ml-[1px]'
                      }`}
                    />
                  </div>
                </button>
                <div className="flex-1 min-w-0">
                  <div className="text-[11px] text-white/60">{server.name}</div>
                  <div className="text-[9px] text-white/20">{i(server.description)}</div>
                </div>
                <button
                  onClick={() => setEditingId(editingId === server.id ? null : server.id)}
                  className="p-1 rounded text-white/15 hover:text-white/40 hover:bg-white/[0.04] transition-all"
                >
                  <Settings2 className="w-3 h-3" />
                </button>
                <button
                  onClick={() => handleRemove(server.id)}
                  className="p-1 rounded text-white/15 hover:text-red-400 hover:bg-red-500/10 transition-all"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>

              {editingId === server.id && (
                <div className="space-y-2 pl-10">
                  <div className="text-[9px] text-white/20 space-y-1 font-mono">
                    <div className="flex items-center gap-2">
                      <span className="text-white/30 w-16 shrink-0">command:</span>
                      <span className="text-white/50">{server.command}</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="text-white/30 w-16 shrink-0">args:</span>
                      <span className="text-white/50 break-all">{JSON.stringify(server.args)}</span>
                    </div>
                    {Object.keys(server.env).length > 0 && (
                      <div className="flex items-start gap-2">
                        <span className="text-white/30 w-16 shrink-0">env:</span>
                        <span className="text-white/50 break-all">
                          {JSON.stringify(server.env)}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}

          {/* Add server */}
          {addingServer ? (
            <div className="rounded-xl border border-dashed border-violet-500/20 bg-violet-500/[0.03] p-3 space-y-2">
              <div className="text-[10px] text-violet-400/70 mb-1">{i('ms.addMcpServer')}</div>
              <div className="grid grid-cols-2 gap-2">
                <input
                  value={newServer.name}
                  onChange={(e) => setNewServer({ ...newServer, name: e.target.value })}
                  placeholder={i('ms.mcpNamePlaceholder')}
                  className="bg-white/[0.04] border border-white/[0.06] rounded-lg px-3 py-1.5 text-[10px] text-white/70 font-mono focus:outline-none focus:border-violet-500/40 placeholder:text-white/10"
                />
                <input
                  value={newServer.command}
                  onChange={(e) => setNewServer({ ...newServer, command: e.target.value })}
                  placeholder={i('ms.mcpCommandPlaceholder')}
                  className="bg-white/[0.04] border border-white/[0.06] rounded-lg px-3 py-1.5 text-[10px] text-white/70 font-mono focus:outline-none focus:border-violet-500/40 placeholder:text-white/10"
                />
              </div>
              <input
                value={newServer.args}
                onChange={(e) => setNewServer({ ...newServer, args: e.target.value })}
                placeholder={i('ms.mcpArgsPlaceholder')}
                className="w-full bg-white/[0.04] border border-white/[0.06] rounded-lg px-3 py-1.5 text-[10px] text-white/70 font-mono focus:outline-none focus:border-violet-500/40 placeholder:text-white/10"
              />
              <input
                value={newServer.env}
                onChange={(e) => setNewServer({ ...newServer, env: e.target.value })}
                placeholder={i('ms.mcpEnvPlaceholder')}
                className="w-full bg-white/[0.04] border border-white/[0.06] rounded-lg px-3 py-1.5 text-[10px] text-white/70 font-mono focus:outline-none focus:border-violet-500/40 placeholder:text-white/10"
              />
              <div className="flex gap-2">
                <button
                  onClick={handleAdd}
                  disabled={!newServer.name || !newServer.command}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-violet-500/15 text-violet-400 text-[10px] hover:bg-violet-500/25 transition-all disabled:opacity-30 border border-violet-500/20"
                >
                  <Plus className="w-3 h-3" /> {i('ms.add')}
                </button>
                <button
                  onClick={() => setAddingServer(false)}
                  className="px-3 py-1.5 rounded-lg text-white/30 text-[10px] hover:bg-white/[0.04] transition-all"
                >
                  {i('ms.cancel')}
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setAddingServer(true)}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-dashed border-white/[0.06] text-white/20 hover:text-white/40 hover:border-white/[0.12] transition-all text-[11px]"
            >
              <Plus className="w-3.5 h-3.5" /> {i('ms.addMcpServer')}
            </button>
          )}
        </div>
      )}
    </div>
  )
}

/* ================================================================
   Smart Diagnostics Panel
   ================================================================ */

export { MCPConfigPanel }
