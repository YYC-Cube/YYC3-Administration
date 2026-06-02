import {
  Calendar,
  CheckCircle2,
  Download,
  Edit,
  Eye,
  FileText,
  Filter,
  Folder,
  Grid3x3,
  Image,
  List,
  Music,
  Search,
  Share2,
  Star,
  Tag,
  Trash2,
  Upload,
  Video,
} from 'lucide-react'
import { useState } from 'react'

import { useThemeColors } from './hooks/use-theme-colors'
import { NeonCard } from './neon-card'

// ==========================================
// YYC³ 营销素材管理 - Marketing Assets Management
// 智能分类 · 版权管理 · 快速检索
// ==========================================

interface Asset {
  id: string
  name: string
  type: 'image' | 'video' | 'document' | 'audio'
  size: string
  format: string
  uploadDate: string
  tags: string[]
  usage: number
  status: 'approved' | 'pending' | 'rejected'
  thumbnail?: string
}

export function MarketingAssetsPage() {
  const tc = useThemeColors()
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [selectedType, setSelectedType] = useState<'all' | Asset['type']>('all')
  const [searchQuery, setSearchQuery] = useState('')

  const assets: Asset[] = [
    {
      id: 'A001',
      name: '618大促主视觉.jpg',
      type: 'image',
      size: '2.4 MB',
      format: 'JPG',
      uploadDate: '2024-05-28',
      tags: ['618', '促销', '主视觉'],
      usage: 12,
      status: 'approved',
    },
    {
      id: 'A002',
      name: '产品宣传片_V2.mp4',
      type: 'video',
      size: '45.8 MB',
      format: 'MP4',
      uploadDate: '2024-05-25',
      tags: ['产品', '宣传片', 'V2'],
      usage: 8,
      status: 'approved',
    },
    {
      id: 'A003',
      name: '品牌故事文案.docx',
      type: 'document',
      size: '156 KB',
      format: 'DOCX',
      uploadDate: '2024-05-20',
      tags: ['品牌', '文案', '故事'],
      usage: 5,
      status: 'approved',
    },
    {
      id: 'A004',
      name: '品牌BGM.mp3',
      type: 'audio',
      size: '3.2 MB',
      format: 'MP3',
      uploadDate: '2024-05-15',
      tags: ['BGM', '品牌', '音乐'],
      usage: 15,
      status: 'approved',
    },
    {
      id: 'A005',
      name: '新品发布海报.psd',
      type: 'image',
      size: '18.5 MB',
      format: 'PSD',
      uploadDate: '2024-05-12',
      tags: ['新品', '海报', '源文件'],
      usage: 3,
      status: 'pending',
    },
    {
      id: 'A006',
      name: '会员权益说明视频.mp4',
      type: 'video',
      size: '28.3 MB',
      format: 'MP4',
      uploadDate: '2024-05-10',
      tags: ['会员', '权益', '说明'],
      usage: 7,
      status: 'approved',
    },
  ]

  const filteredAssets = assets.filter((asset) => {
    const typeMatch = selectedType === 'all' || asset.type === selectedType
    const searchMatch =
      asset.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      asset.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()))
    return typeMatch && searchMatch
  })

  const typeStats = [
    {
      type: 'image' as const,
      label: '图片素材',
      count: assets.filter((a) => a.type === 'image').length,
      icon: Image,
      color: tc.primary,
    },
    {
      type: 'video' as const,
      label: '视频素材',
      count: assets.filter((a) => a.type === 'video').length,
      icon: Video,
      color: tc.secondary,
    },
    {
      type: 'document' as const,
      label: '文档素材',
      count: assets.filter((a) => a.type === 'document').length,
      icon: FileText,
      color: tc.accent,
    },
    {
      type: 'audio' as const,
      label: '音频素材',
      count: assets.filter((a) => a.type === 'audio').length,
      icon: Music,
      color: tc.success,
    },
  ]

  const getTypeIcon = (type: Asset['type']) => {
    switch (type) {
      case 'image':
        return Image
      case 'video':
        return Video
      case 'document':
        return FileText
      case 'audio':
        return Music
    }
  }

  const getStatusConfig = (status: Asset['status']) => {
    switch (status) {
      case 'approved':
        return { label: '已批准', color: tc.success, icon: CheckCircle2 }
      case 'pending':
        return { label: '待审核', color: tc.warning, icon: Calendar }
      case 'rejected':
        return { label: '已拒绝', color: tc.danger, icon: Trash2 }
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2" style={{ color: tc.textPrimary }}>
            营销素材管理
          </h1>
          <p className="text-sm" style={{ color: tc.textSecondary }}>
            智能分类 · 版权管理 · 快速检索
          </p>
        </div>
        <button
          className="flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all"
          style={{
            background: tc.gradientButton,
            color: tc.textPrimary,
            boxShadow: tc.shadowMd,
          }}
        >
          <Upload className="w-5 h-5" />
          上传素材
        </button>
      </div>

      {/* 素材类型统计 */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        {typeStats.map((stat) => {
          const Icon = stat.icon
          return (
            <NeonCard
              key={stat.type}
              className="p-6 cursor-pointer transition-all"
              onClick={() => setSelectedType(stat.type)}
              style={{
                borderColor: selectedType === stat.type ? tc.primary : tc.borderDefault,
                boxShadow: selectedType === stat.type ? tc.neonGlow(tc.primary, 0.3) : 'none',
              }}
            >
              <div className="flex items-center justify-between mb-4">
                <Icon className="w-8 h-8" style={{ color: stat.color }} />
                <span className="text-2xl font-bold" style={{ color: tc.textPrimary }}>
                  {stat.count}
                </span>
              </div>
              <p className="text-sm" style={{ color: tc.textSecondary }}>
                {stat.label}
              </p>
            </NeonCard>
          )
        })}
      </div>

      {/* 工具栏 */}
      <div className="flex items-center gap-4 flex-wrap">
        {/* 搜索 */}
        <div className="flex-1 min-w-[300px] relative">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5"
            style={{ color: tc.textMuted }}
          />
          <input
            type="text"
            placeholder="搜索素材名称或标签..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 rounded-lg text-sm transition-all"
            style={{
              background: tc.bgInput,
              color: tc.textPrimary,
              border: `1px solid ${tc.borderDefault}`,
            }}
          />
        </div>

        {/* 类型筛选 */}
        <button
          onClick={() => setSelectedType('all')}
          className="px-4 py-3 rounded-lg text-sm font-medium transition-all"
          style={{
            background: selectedType === 'all' ? tc.alpha(tc.primary, 0.15) : tc.bgCard,
            color: selectedType === 'all' ? tc.primary : tc.textSecondary,
            border: `1px solid ${selectedType === 'all' ? tc.primary : tc.borderSubtle}`,
          }}
        >
          全部
        </button>

        {/* 视图切换 */}
        <div
          className="flex items-center rounded-lg overflow-hidden"
          style={{ border: `1px solid ${tc.borderSubtle}` }}
        >
          <button
            onClick={() => setViewMode('grid')}
            className="px-3 py-3 transition-all"
            style={{
              background: viewMode === 'grid' ? tc.alpha(tc.primary, 0.15) : tc.bgCard,
              color: viewMode === 'grid' ? tc.primary : tc.textSecondary,
            }}
          >
            <Grid3x3 className="w-5 h-5" />
          </button>
          <button
            onClick={() => setViewMode('list')}
            className="px-3 py-3 transition-all"
            style={{
              background: viewMode === 'list' ? tc.alpha(tc.primary, 0.15) : tc.bgCard,
              color: viewMode === 'list' ? tc.primary : tc.textSecondary,
            }}
          >
            <List className="w-5 h-5" />
          </button>
        </div>

        <button
          className="flex items-center gap-2 px-4 py-3 rounded-lg text-sm font-medium transition-all"
          style={{
            background: tc.bgCard,
            color: tc.textSecondary,
            border: `1px solid ${tc.borderSubtle}`,
          }}
        >
          <Filter className="w-4 h-4" />
          筛选
        </button>
      </div>

      {/* 素材列表 - Grid视图 */}
      {viewMode === 'grid' && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4">
          {filteredAssets.map((asset) => {
            const TypeIcon = getTypeIcon(asset.type)
            const statusConfig = getStatusConfig(asset.status)
            const StatusIcon = statusConfig.icon

            return (
              <NeonCard key={asset.id} className="p-4 group cursor-pointer transition-all">
                {/* 缩略图区域 */}
                <div
                  className="aspect-video rounded-lg mb-4 flex items-center justify-center overflow-hidden"
                  style={{
                    background: tc.bgInput,
                    border: `1px solid ${tc.borderSubtle}`,
                  }}
                >
                  <TypeIcon className="w-12 h-12" style={{ color: tc.textMuted }} />
                </div>

                {/* 信息区域 */}
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <h3
                      className="font-medium text-sm line-clamp-1"
                      style={{ color: tc.textPrimary }}
                    >
                      {asset.name}
                    </h3>
                    <div
                      className="flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium flex-shrink-0"
                      style={{
                        background: tc.alpha(statusConfig.color, 0.1),
                        color: statusConfig.color,
                      }}
                    >
                      <StatusIcon className="w-3 h-3" />
                      {statusConfig.label}
                    </div>
                  </div>

                  <div
                    className="flex items-center justify-between text-xs"
                    style={{ color: tc.textMuted }}
                  >
                    <span>
                      {asset.format} · {asset.size}
                    </span>
                    <span>使用{asset.usage}次</span>
                  </div>

                  {/* 标签 */}
                  <div className="flex flex-wrap gap-1">
                    {asset.tags.slice(0, 3).map((tag) => (
                      <span
                        key={tag}
                        className="px-2 py-0.5 rounded text-xs"
                        style={{
                          background: tc.bgInput,
                          color: tc.textSecondary,
                        }}
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>

                  {/* 操作按钮 */}
                  <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      className="flex-1 flex items-center justify-center gap-1 px-3 py-2 rounded-lg text-xs font-medium transition-all"
                      style={{
                        background: tc.alpha(tc.primary, 0.1),
                        color: tc.primary,
                        border: `1px solid ${tc.borderSubtle}`,
                      }}
                    >
                      <Eye className="w-3 h-3" />
                      预览
                    </button>
                    <button
                      className="px-3 py-2 rounded-lg transition-all"
                      style={{
                        background: tc.bgCard,
                        color: tc.textSecondary,
                        border: `1px solid ${tc.borderSubtle}`,
                      }}
                    >
                      <Download className="w-3 h-3" />
                    </button>
                    <button
                      className="px-3 py-2 rounded-lg transition-all"
                      style={{
                        background: tc.bgCard,
                        color: tc.textSecondary,
                        border: `1px solid ${tc.borderSubtle}`,
                      }}
                    >
                      <Share2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </NeonCard>
            )
          })}
        </div>
      )}

      {/* 素材列表 - List视图 */}
      {viewMode === 'list' && (
        <NeonCard className="p-6">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr style={{ borderBottom: `1px solid ${tc.borderSubtle}` }}>
                  <th
                    className="text-left py-3 px-4 text-sm font-medium"
                    style={{ color: tc.textMuted }}
                  >
                    名称
                  </th>
                  <th
                    className="text-left py-3 px-4 text-sm font-medium"
                    style={{ color: tc.textMuted }}
                  >
                    类型
                  </th>
                  <th
                    className="text-left py-3 px-4 text-sm font-medium"
                    style={{ color: tc.textMuted }}
                  >
                    大小
                  </th>
                  <th
                    className="text-left py-3 px-4 text-sm font-medium"
                    style={{ color: tc.textMuted }}
                  >
                    上传日期
                  </th>
                  <th
                    className="text-left py-3 px-4 text-sm font-medium"
                    style={{ color: tc.textMuted }}
                  >
                    状态
                  </th>
                  <th
                    className="text-center py-3 px-4 text-sm font-medium"
                    style={{ color: tc.textMuted }}
                  >
                    使用次数
                  </th>
                  <th
                    className="text-right py-3 px-4 text-sm font-medium"
                    style={{ color: tc.textMuted }}
                  >
                    操作
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredAssets.map((asset, idx) => {
                  const TypeIcon = getTypeIcon(asset.type)
                  const statusConfig = getStatusConfig(asset.status)
                  const StatusIcon = statusConfig.icon

                  return (
                    <tr
                      key={asset.id}
                      style={{
                        borderBottom:
                          idx < filteredAssets.length - 1 ? `1px solid ${tc.borderSubtle}` : 'none',
                      }}
                    >
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-3">
                          <div
                            className="w-10 h-10 rounded flex items-center justify-center flex-shrink-0"
                            style={{ background: tc.bgInput }}
                          >
                            <TypeIcon className="w-5 h-5" style={{ color: tc.textMuted }} />
                          </div>
                          <span className="font-medium" style={{ color: tc.textPrimary }}>
                            {asset.name}
                          </span>
                        </div>
                      </td>
                      <td className="py-4 px-4" style={{ color: tc.textSecondary }}>
                        {asset.format}
                      </td>
                      <td className="py-4 px-4" style={{ color: tc.textSecondary }}>
                        {asset.size}
                      </td>
                      <td className="py-4 px-4" style={{ color: tc.textSecondary }}>
                        {asset.uploadDate}
                      </td>
                      <td className="py-4 px-4">
                        <div
                          className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium"
                          style={{
                            background: tc.alpha(statusConfig.color, 0.1),
                            color: statusConfig.color,
                          }}
                        >
                          <StatusIcon className="w-3 h-3" />
                          {statusConfig.label}
                        </div>
                      </td>
                      <td
                        className="py-4 px-4 text-center font-medium"
                        style={{ color: tc.primary }}
                      >
                        {asset.usage}
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            className="p-2 rounded transition-all"
                            style={{
                              background: tc.bgCard,
                              color: tc.textSecondary,
                            }}
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            className="p-2 rounded transition-all"
                            style={{
                              background: tc.bgCard,
                              color: tc.textSecondary,
                            }}
                          >
                            <Download className="w-4 h-4" />
                          </button>
                          <button
                            className="p-2 rounded transition-all"
                            style={{
                              background: tc.bgCard,
                              color: tc.textSecondary,
                            }}
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </NeonCard>
      )}
    </div>
  )
}
