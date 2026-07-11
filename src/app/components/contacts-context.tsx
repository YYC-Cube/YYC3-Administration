/* eslint-disable react-refresh/only-export-components */
import { createContext, type ReactNode, useCallback, useContext, useEffect, useState } from 'react'

// ==========================================
// YYC³ 共享联系人状态 — Contacts Context
// 统一管理 contact-book / number-database 数据同步
// ==========================================

/**
 * Unified contact data model shared across contact-book and number-database modules.
 * Contains CRM fields, AI scoring, lifecycle stage, and risk assessment.
 */
export interface SharedContact {
  id: string
  name: string
  phone: string
  email: string
  company: string
  position: string
  stage: '获客' | '转化' | '成交' | '服务' | '忠诚'
  tags: string[]
  aiScore: number
  aiInsights: string[]
  starred: boolean
  avatar?: string
  address: string
  source: string
  createdAt: string
  lastContact: string
  totalCalls: number
  totalValue: number
  notes: string
  riskLevel: 'low' | 'medium' | 'high'
}

const STORAGE_KEY = 'yyc3_contacts'
const DELETED_STORAGE_KEY = 'yyc3_contacts_deleted'

// Mock Data (canonical source)
const MOCK_CONTACTS: SharedContact[] = [
  {
    id: 'c1',
    name: '张明远',
    phone: '138-0001-2345',
    email: 'zhang.my@startech.cn',
    company: '星际科技',
    position: 'CTO',
    stage: '转化',
    tags: ['重点客户', '决策人'],
    aiScore: 92,
    aiInsights: ['近30天互动频率上升40%', '对AI解决方案兴趣浓厚', '建议推送定制方案'],
    starred: true,
    address: '北京市朝阳区科技路88号',
    source: '行业展会',
    createdAt: '2025-08-15',
    lastContact: '2小时前',
    totalCalls: 24,
    totalValue: 128000,
    notes: 'Q2预算已批准，等待技术评估',
    riskLevel: 'low',
  },
  {
    id: 'c2',
    name: '李思琪',
    phone: '139-0002-3456',
    email: 'lsq@clouddata.io',
    company: '云端数据',
    position: '采购总监',
    stage: '成交',
    tags: ['VIP', '决策人'],
    aiScore: 88,
    aiInsights: ['已签订框架协议', '季度采购周期', '推荐追加增值服务'],
    starred: true,
    address: '上海市浦东新区数据港12号',
    source: '客户推荐',
    createdAt: '2025-06-20',
    lastContact: '1天前',
    totalCalls: 38,
    totalValue: 256000,
    notes: '对数据分析模块最感兴趣',
    riskLevel: 'low',
  },
  {
    id: 'c3',
    name: '王建华',
    phone: '137-0003-4567',
    email: 'wjh@quantum-comp.cn',
    company: '量子计算',
    position: '技术总监',
    stage: '获客',
    tags: ['新客户', '高潜力', '技术对接'],
    aiScore: 75,
    aiInsights: ['首次接触，需建立信任', '技术导向型决策', '建议安排技术演示'],
    starred: false,
    address: '深圳市南山区量子大厦',
    source: '官网注册',
    createdAt: '2026-02-10',
    lastContact: '3天前',
    totalCalls: 5,
    totalValue: 64000,
    notes: '对量子加密通信有需求',
    riskLevel: 'medium',
  },
  {
    id: 'c4',
    name: '陈雅文',
    phone: '136-0004-5678',
    email: 'cyw@chainnet.com',
    company: '智链网络',
    position: 'CEO',
    stage: '服务',
    tags: ['VIP', '战略合作', '决策人'],
    aiScore: 95,
    aiInsights: ['核心战略客户', '满意度评分4.9/5', '续约意向强烈'],
    starred: true,
    address: '杭州市西湖区智慧大道1号',
    source: '行业推荐',
    createdAt: '2025-03-05',
    lastContact: '刚刚',
    totalCalls: 67,
    totalValue: 512000,
    notes: '已使用全套产品线',
    riskLevel: 'low',
  },
  {
    id: 'c5',
    name: '赵鹏飞',
    phone: '135-0005-6789',
    email: 'zpf@futureenergy.cn',
    company: '未来能源',
    position: 'VP 商务',
    stage: '忠诚',
    tags: ['VIP', '重点客户'],
    aiScore: 98,
    aiInsights: ['忠实老客户，合作3年', '推荐人计划活跃', '可作为案例展示'],
    starred: true,
    address: '成都市高新区能源中心',
    source: '线下活动',
    createdAt: '2024-01-12',
    lastContact: '5小时前',
    totalCalls: 112,
    totalValue: 1024000,
    notes: '年度战略合作伙伴',
    riskLevel: 'low',
  },
  {
    id: 'c6',
    name: '刘芳芳',
    phone: '158-0006-7890',
    email: 'lff@bioai.cn',
    company: '生物智能',
    position: '研发经理',
    stage: '获客',
    tags: ['新客户', '技术对接'],
    aiScore: 62,
    aiInsights: ['接触初期，需多次沟通', '对AI辅助研发感兴趣', '建议发送行业白皮书'],
    starred: false,
    address: '武汉市光谷生物城',
    source: '搜索引擎',
    createdAt: '2026-03-01',
    lastContact: '1周前',
    totalCalls: 2,
    totalValue: 0,
    notes: '初步了解阶段',
    riskLevel: 'high',
  },
  {
    id: 'c7',
    name: '孙浩然',
    phone: '186-0007-8901',
    email: 'shr@smartmfg.cn',
    company: '智造工业',
    position: '供应链总监',
    stage: '转化',
    tags: ['高潜力', '待跟进'],
    aiScore: 81,
    aiInsights: ['已完成产品演示', '预算审批中', '竞争对手报价中，需加速'],
    starred: false,
    address: '苏州市工业园区智造路',
    source: '行业展会',
    createdAt: '2025-11-20',
    lastContact: '2天前',
    totalCalls: 15,
    totalValue: 89000,
    notes: '对智能质检方案有需求',
    riskLevel: 'medium',
  },
  {
    id: 'c8',
    name: '周小敏',
    phone: '177-0008-9012',
    email: 'zxm@edunova.cn',
    company: '新智教育',
    position: '运营总监',
    stage: '服务',
    tags: ['重点客户'],
    aiScore: 86,
    aiInsights: ['使用6个月满意度高', '有扩展需求', '推荐升级企业版'],
    starred: false,
    address: '广州市天河区教育城',
    source: '合作伙伴',
    createdAt: '2025-09-08',
    lastContact: '4小时前',
    totalCalls: 28,
    totalValue: 186000,
    notes: '即将到期续约',
    riskLevel: 'low',
  },
  {
    id: 'c9',
    name: '吴志强',
    phone: '150-0009-0123',
    email: 'wzq@fincloud.cn',
    company: '金融云',
    position: '安全官',
    stage: '转化',
    tags: ['决策人', '高潜力'],
    aiScore: 78,
    aiInsights: ['安全合规是核心诉求', '需要SOC2认证', '建议安排安全架构会议'],
    starred: false,
    address: '北京市金融街8号',
    source: '行业会议',
    createdAt: '2025-12-15',
    lastContact: '6小时前',
    totalCalls: 9,
    totalValue: 320000,
    notes: '高价值潜在客户',
    riskLevel: 'low',
  },
  {
    id: 'c10',
    name: '黄丽华',
    phone: '133-0010-1234',
    email: 'hlh@healthai.cn',
    company: '健康智能',
    position: '产品经理',
    stage: '获客',
    tags: ['新客户'],
    aiScore: 55,
    aiInsights: ['早期接触阶段', '行业知识需培育', '建议定期推送行业资讯'],
    starred: false,
    address: '南京市鼓楼区医疗谷',
    source: '社交媒体',
    createdAt: '2026-03-10',
    lastContact: '5天前',
    totalCalls: 1,
    totalValue: 0,
    notes: '初次电话咨询',
    riskLevel: 'high',
  },
]

/**
 * Wrapper for a soft-deleted contact, preserving the original data and deletion timestamp.
 * Used by the recovery/undo feature in the contacts management UI.
 */
export interface DeletedContact {
  contact: SharedContact
  deletedAt: string
}

interface ContactsContextType {
  contacts: SharedContact[]
  deletedContacts: DeletedContact[]
  addContact: (contact: SharedContact) => void
  updateContact: (id: string, updates: Partial<SharedContact>) => void
  deleteContact: (id: string) => void
  batchDeleteContacts: (ids: string[]) => void
  recoverContact: (id: string) => void
  recoverAllContacts: () => void
  clearDeletedContacts: () => void
  toggleStar: (id: string) => void
  updateStage: (id: string, stage: SharedContact['stage']) => void
  setContacts: React.Dispatch<React.SetStateAction<SharedContact[]>>
}

function loadContacts(): SharedContact[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) return JSON.parse(raw)
  } catch {
    /* fallback */
  }
  return MOCK_CONTACTS
}

function saveContacts(contacts: SharedContact[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(contacts))
  } catch {
    /* */
  }
}

function loadDeletedContacts(): DeletedContact[] {
  try {
    const raw = localStorage.getItem(DELETED_STORAGE_KEY)
    if (raw) return JSON.parse(raw)
  } catch {
    /* */
  }
  return []
}

function saveDeletedContacts(deleted: DeletedContact[]) {
  try {
    localStorage.setItem(DELETED_STORAGE_KEY, JSON.stringify(deleted))
  } catch {
    /* */
  }
}

const ContactsContext = createContext<ContactsContextType | null>(null)

/**
 * Shared contacts state provider.
 * Manages the canonical contact list, soft-deletion with recovery,
 * starring, and lifecycle stage updates. Auto-persists to `localStorage`.
 */
export function ContactsProvider({ children }: { children: ReactNode }) {
  const [contacts, setContacts] = useState<SharedContact[]>(loadContacts)
  const [deletedContacts, setDeletedContacts] = useState<DeletedContact[]>(loadDeletedContacts)

  // Persist contacts
  useEffect(() => {
    saveContacts(contacts)
  }, [contacts])
  useEffect(() => {
    saveDeletedContacts(deletedContacts)
  }, [deletedContacts])

  const addContact = useCallback((contact: SharedContact) => {
    setContacts((prev) => [contact, ...prev])
  }, [])

  const updateContact = useCallback((id: string, updates: Partial<SharedContact>) => {
    setContacts((prev) => prev.map((c) => (c.id === id ? { ...c, ...updates } : c)))
  }, [])

  const deleteContact = useCallback((id: string) => {
    setContacts((prev) => {
      const target = prev.find((c) => c.id === id)
      if (target) {
        setDeletedContacts((del) =>
          [
            {
              contact: target,
              deletedAt: new Date().toISOString(),
            },
            ...del,
          ].slice(0, 50),
        ) // keep max 50 deleted
      }
      return prev.filter((c) => c.id !== id)
    })
  }, [])

  const batchDeleteContacts = useCallback((ids: string[]) => {
    setContacts((prev) => {
      const toDelete = prev.filter((c) => ids.includes(c.id))
      if (toDelete.length) {
        setDeletedContacts((del) =>
          [
            ...toDelete.map((c) => ({ contact: c, deletedAt: new Date().toISOString() })),
            ...del,
          ].slice(0, 50),
        )
      }
      return prev.filter((c) => !ids.includes(c.id))
    })
  }, [])

  const recoverContact = useCallback((id: string) => {
    setDeletedContacts((prev) => {
      const target = prev.find((d) => d.contact.id === id)
      if (target) {
        setContacts((c) => [target.contact, ...c])
      }
      return prev.filter((d) => d.contact.id !== id)
    })
  }, [])

  const recoverAllContacts = useCallback(() => {
    setDeletedContacts((prev) => {
      if (prev.length) {
        setContacts((c) => [...prev.map((d) => d.contact), ...c])
      }
      return []
    })
  }, [])

  const clearDeletedContacts = useCallback(() => {
    setDeletedContacts([])
  }, [])

  const toggleStar = useCallback((id: string) => {
    setContacts((prev) => prev.map((c) => (c.id === id ? { ...c, starred: !c.starred } : c)))
  }, [])

  const updateStage = useCallback((id: string, stage: SharedContact['stage']) => {
    setContacts((prev) => prev.map((c) => (c.id === id ? { ...c, stage } : c)))
  }, [])

  return (
    <ContactsContext.Provider
      value={{
        contacts,
        deletedContacts,
        addContact,
        updateContact,
        deleteContact,
        batchDeleteContacts,
        recoverContact,
        recoverAllContacts,
        clearDeletedContacts,
        toggleStar,
        updateStage,
        setContacts,
      }}
    >
      {children}
    </ContactsContext.Provider>
  )
}

/**
 * Hook to access the shared contacts state and mutation methods.
 * Must be called within a `<ContactsProvider>` tree.
 *
 * @throws Error if called outside of `ContactsProvider`.
 */
export function useContacts() {
  const ctx = useContext(ContactsContext)
  if (!ctx) throw new Error('useContacts must be used within ContactsProvider')
  return ctx
}
