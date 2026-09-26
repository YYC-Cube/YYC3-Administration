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
  stage: 'acquisition' | 'conversion' | 'deal' | 'service' | 'loyalty'
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

// Mock Data (canonical source) — display strings are i18n keys, resolved via t() at render
const MOCK_CONTACTS: SharedContact[] = [
  {
    id: 'c1',
    name: 'ctc.c1.name',
    phone: '138-0001-2345',
    email: 'zhang.my@startech.cn',
    company: 'ctc.c1.company',
    position: 'ctc.c1.position',
    stage: 'conversion',
    tags: ['keyClient', 'decisionMaker'],
    aiScore: 92,
    aiInsights: ['ctc.c1.insight1', 'ctc.c1.insight2', 'ctc.c1.insight3'],
    starred: true,
    address: 'ctc.c1.addr',
    source: 'ctc.c1.source',
    createdAt: '2025-08-15',
    lastContact: 'ctc.c1.lastContact',
    totalCalls: 24,
    totalValue: 128000,
    notes: 'ctc.c1.notes',
    riskLevel: 'low',
  },
  {
    id: 'c2',
    name: 'ctc.c2.name',
    phone: '139-0002-3456',
    email: 'lsq@clouddata.io',
    company: 'ctc.c2.company',
    position: 'ctc.c2.position',
    stage: 'deal',
    tags: ['VIP', 'decisionMaker'],
    aiScore: 88,
    aiInsights: ['ctc.c2.insight1', 'ctc.c2.insight2', 'ctc.c2.insight3'],
    starred: true,
    address: 'ctc.c2.addr',
    source: 'ctc.c2.source',
    createdAt: '2025-06-20',
    lastContact: 'ctc.c2.lastContact',
    totalCalls: 38,
    totalValue: 256000,
    notes: 'ctc.c2.notes',
    riskLevel: 'low',
  },
  {
    id: 'c3',
    name: 'ctc.c3.name',
    phone: '137-0003-4567',
    email: 'wjh@quantum-comp.cn',
    company: 'ctc.c3.company',
    position: 'ctc.c3.position',
    stage: 'acquisition',
    tags: ['newClient', 'highPotential', 'techContact'],
    aiScore: 75,
    aiInsights: ['ctc.c3.insight1', 'ctc.c3.insight2', 'ctc.c3.insight3'],
    starred: false,
    address: 'ctc.c3.addr',
    source: 'ctc.c3.source',
    createdAt: '2026-02-10',
    lastContact: 'ctc.c3.lastContact',
    totalCalls: 5,
    totalValue: 64000,
    notes: 'ctc.c3.notes',
    riskLevel: 'medium',
  },
  {
    id: 'c4',
    name: 'ctc.c4.name',
    phone: '136-0004-5678',
    email: 'cyw@chainnet.com',
    company: 'ctc.c4.company',
    position: 'ctc.c4.position',
    stage: 'service',
    tags: ['VIP', 'strategicPartner', 'decisionMaker'],
    aiScore: 95,
    aiInsights: ['ctc.c4.insight1', 'ctc.c4.insight2', 'ctc.c4.insight3'],
    starred: true,
    address: 'ctc.c4.addr',
    source: 'ctc.c4.source',
    createdAt: '2025-03-05',
    lastContact: 'ctc.c4.lastContact',
    totalCalls: 67,
    totalValue: 512000,
    notes: 'ctc.c4.notes',
    riskLevel: 'low',
  },
  {
    id: 'c5',
    name: 'ctc.c5.name',
    phone: '135-0005-6789',
    email: 'zpf@futureenergy.cn',
    company: 'ctc.c5.company',
    position: 'ctc.c5.position',
    stage: 'loyalty',
    tags: ['VIP', 'keyClient'],
    aiScore: 98,
    aiInsights: ['ctc.c5.insight1', 'ctc.c5.insight2', 'ctc.c5.insight3'],
    starred: true,
    address: 'ctc.c5.addr',
    source: 'ctc.c5.source',
    createdAt: '2024-01-12',
    lastContact: 'ctc.c5.lastContact',
    totalCalls: 112,
    totalValue: 1024000,
    notes: 'ctc.c5.notes',
    riskLevel: 'low',
  },
  {
    id: 'c6',
    name: 'ctc.c6.name',
    phone: '158-0006-7890',
    email: 'lff@bioai.cn',
    company: 'ctc.c6.company',
    position: 'ctc.c6.position',
    stage: 'acquisition',
    tags: ['newClient', 'techContact'],
    aiScore: 62,
    aiInsights: ['ctc.c6.insight1', 'ctc.c6.insight2', 'ctc.c6.insight3'],
    starred: false,
    address: 'ctc.c6.addr',
    source: 'ctc.c6.source',
    createdAt: '2026-03-01',
    lastContact: 'ctc.c6.lastContact',
    totalCalls: 2,
    totalValue: 0,
    notes: 'ctc.c6.notes',
    riskLevel: 'high',
  },
  {
    id: 'c7',
    name: 'ctc.c7.name',
    phone: '186-0007-8901',
    email: 'shr@smartmfg.cn',
    company: 'ctc.c7.company',
    position: 'ctc.c7.position',
    stage: 'conversion',
    tags: ['highPotential', 'pending'],
    aiScore: 81,
    aiInsights: ['ctc.c7.insight1', 'ctc.c7.insight2', 'ctc.c7.insight3'],
    starred: false,
    address: 'ctc.c7.addr',
    source: 'ctc.c7.source',
    createdAt: '2025-11-20',
    lastContact: 'ctc.c7.lastContact',
    totalCalls: 15,
    totalValue: 89000,
    notes: 'ctc.c7.notes',
    riskLevel: 'medium',
  },
  {
    id: 'c8',
    name: 'ctc.c8.name',
    phone: '177-0008-9012',
    email: 'zxm@edunova.cn',
    company: 'ctc.c8.company',
    position: 'ctc.c8.position',
    stage: 'service',
    tags: ['keyClient'],
    aiScore: 86,
    aiInsights: ['ctc.c8.insight1', 'ctc.c8.insight2', 'ctc.c8.insight3'],
    starred: false,
    address: 'ctc.c8.addr',
    source: 'ctc.c8.source',
    createdAt: '2025-09-08',
    lastContact: 'ctc.c8.lastContact',
    totalCalls: 28,
    totalValue: 186000,
    notes: 'ctc.c8.notes',
    riskLevel: 'low',
  },
  {
    id: 'c9',
    name: 'ctc.c9.name',
    phone: '150-0009-0123',
    email: 'wzq@fincloud.cn',
    company: 'ctc.c9.company',
    position: 'ctc.c9.position',
    stage: 'conversion',
    tags: ['decisionMaker', 'highPotential'],
    aiScore: 78,
    aiInsights: ['ctc.c9.insight1', 'ctc.c9.insight2', 'ctc.c9.insight3'],
    starred: false,
    address: 'ctc.c9.addr',
    source: 'ctc.c9.source',
    createdAt: '2025-12-15',
    lastContact: 'ctc.c9.lastContact',
    totalCalls: 9,
    totalValue: 320000,
    notes: 'ctc.c9.notes',
    riskLevel: 'low',
  },
  {
    id: 'c10',
    name: 'ctc.c10.name',
    phone: '133-0010-1234',
    email: 'hlh@healthai.cn',
    company: 'ctc.c10.company',
    position: 'ctc.c10.position',
    stage: 'acquisition',
    tags: ['newClient'],
    aiScore: 55,
    aiInsights: ['ctc.c10.insight1', 'ctc.c10.insight2', 'ctc.c10.insight3'],
    starred: false,
    address: 'ctc.c10.addr',
    source: 'ctc.c10.source',
    createdAt: '2026-03-10',
    lastContact: 'ctc.c10.lastContact',
    totalCalls: 1,
    totalValue: 0,
    notes: 'ctc.c10.notes',
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
