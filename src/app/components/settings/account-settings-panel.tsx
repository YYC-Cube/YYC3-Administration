/**
 * @file components/settings/account-settings-panel.tsx
 * @description Account Settings Panel - User Profile Management
 * @author YanYuCloudCube Team <admin@0379.email>
 * @version v1.0.0
 * @created 2026-03-17
 * @updated 2026-03-17
 * @status stable
 * @license MIT
 * @copyright Copyright (c) 2026 YanYuCloudCube Team
 * @tags settings,account,profile
 */

import { Briefcase, Camera, Link as LinkIcon, Mail, MapPin, User } from 'lucide-react'
import { motion } from 'motion/react'
import { useState } from 'react'

import { useThemeColors } from '../hooks/use-theme-colors'

import type { ReactNode } from 'react'

import { accountService } from '@/services/settings-services'
import { useSettingsStore } from '@/stores/useSettingsStore'

export function AccountSettingsPanel() {
  const tc = useThemeColors()
  const { settings, updateUserProfile } = useSettingsStore()
  const { userProfile } = settings

  const [isUploading, setIsUploading] = useState(false)

  // 处理头像上传
  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setIsUploading(true)
    try {
      const avatarUrl = await accountService.uploadAvatar(file)
      updateUserProfile({ avatar: avatarUrl })
    } catch (error) {
      console.error('头像上传失败:', error)
    } finally {
      setIsUploading(false)
    }
  }

  // 处理字段更新
  const handleFieldUpdate = (field: string, value: string) => {
    updateUserProfile({ [field]: value })
  }

  return (
    <div className="space-y-8">
      {/* 标题 */}
      <div>
        <h2 className="text-2xl font-bold mb-2" style={{ color: tc.primary }}>
          账号信息
        </h2>
        <p style={{ color: tc.textSecondary }}>管理您的个人信息和头像</p>
      </div>

      {/* 头像部分 */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-6"
      >
        <div className="relative">
          <div
            className="w-24 h-24 rounded-full overflow-hidden flex items-center justify-center"
            style={{
              background: tc.bgInput,
              border: `2px solid ${tc.borderDefault}`,
            }}
          >
            {userProfile.avatar ? (
              <img
                src={userProfile.avatar}
                alt={userProfile.username}
                className="w-full h-full object-cover"
              />
            ) : (
              <User size={40} style={{ color: tc.textMuted }} />
            )}
          </div>
          <label
            className="absolute bottom-0 right-0 p-2 rounded-full cursor-pointer transition-transform hover:scale-110"
            style={{
              background: tc.primary,
              color: tc.textInverse,
              boxShadow: tc.shadowMd,
            }}
          >
            <Camera size={16} />
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleAvatarUpload}
              disabled={isUploading}
            />
          </label>
        </div>
        <div>
          <h3 className="text-lg font-semibold" style={{ color: tc.textPrimary }}>
            {userProfile.username}
          </h3>
          <p className="text-sm" style={{ color: tc.textSecondary }}>
            {userProfile.email}
          </p>
          {isUploading && (
            <p className="text-xs mt-1" style={{ color: tc.accent }}>
              上传中...
            </p>
          )}
        </div>
      </motion.div>

      {/* 表单字段 */}
      <div className="space-y-4">
        {/* 用户名 */}
        <FormField
          icon={User}
          label="用户名"
          value={userProfile.username}
          onChange={(value) => handleFieldUpdate('username', value)}
          tc={tc}
        />

        {/* 邮箱 */}
        <FormField
          icon={Mail}
          label="邮箱"
          type="email"
          value={userProfile.email}
          onChange={(value) => handleFieldUpdate('email', value)}
          tc={tc}
        />

        {/* 角色 */}
        <FormField
          icon={Briefcase}
          label="角色"
          value={userProfile.role || ''}
          onChange={(value) => handleFieldUpdate('role', value)}
          placeholder="例如：AI 架构师"
          tc={tc}
        />

        {/* 位置 */}
        <FormField
          icon={MapPin}
          label="位置"
          value={userProfile.location || ''}
          onChange={(value) => handleFieldUpdate('location', value)}
          placeholder="例如：北京"
          tc={tc}
        />

        {/* 网站 */}
        <FormField
          icon={LinkIcon}
          label="个人网站"
          value={userProfile.website || ''}
          onChange={(value) => handleFieldUpdate('website', value)}
          placeholder="https://"
          tc={tc}
        />

        {/* 个人简介 */}
        <div>
          <label className="block text-sm font-medium mb-2" style={{ color: tc.textSecondary }}>
            个人简介
          </label>
          <textarea
            value={userProfile.bio || ''}
            onChange={(e) => handleFieldUpdate('bio', e.target.value)}
            placeholder="介绍一下自己..."
            rows={4}
            className="w-full px-4 py-3 rounded-lg outline-none transition-all resize-none"
            style={{
              background: tc.bgInput,
              color: tc.textPrimary,
              border: `1px solid ${tc.borderDefault}`,
            }}
          />
        </div>
      </div>
    </div>
  )
}

// 表单字段组件
interface FormFieldProps {
  icon: (props: {
    className?: string
    size?: number | string
    style?: React.CSSProperties
  }) => ReactNode
  label: string
  value: string
  onChange: (value: string) => void
  type?: string
  placeholder?: string
  tc: ReturnType<typeof useThemeColors>
}

function FormField({
  icon: Icon,
  label,
  value,
  onChange,
  type = 'text',
  placeholder,
  tc,
}: FormFieldProps) {
  return (
    <div>
      <label className="block text-sm font-medium mb-2" style={{ color: tc.textSecondary }}>
        {label}
      </label>
      <div className="relative">
        <Icon
          size={18}
          style={{ color: tc.textMuted }}
          className="absolute left-4 top-1/2 -translate-y-1/2"
        />
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full pl-12 pr-4 py-3 rounded-lg outline-none transition-all"
          style={{
            background: tc.bgInput,
            color: tc.textPrimary,
            border: `1px solid ${tc.borderDefault}`,
          }}
        />
      </div>
    </div>
  )
}
