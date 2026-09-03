import { Database, Download, Plus, Trash2 } from 'lucide-react'
import { AnimatePresence, motion } from 'motion/react'
import { useCallback, useState } from 'react'

import { STAGE_KEYS, STAGE_META, TABS } from './number-database-data'
import { ContactFormModal, RecycleBinPanel } from './number-database-modals'
import {
  AnalyticsTab,
  CollaborationTab,
  ContactsTab,
  KnowledgeTab,
  MonitorTab,
  OverviewTab,
  ServiceTab,
  ValueTab,
} from './number-database-tabs'

import type { Contact, TabId } from './number-database-data'

import { useI18n } from '@/app/components/i18n-context'
import { useContacts } from '@/features/customer/pages/contacts-context'
import { useThemeColors } from '@/shared/hooks/use-theme-colors'

export function NumberDatabasePage() {
  const { t } = useI18n()
  const {
    contacts,
    deletedContacts,
    addContact,
    updateContact,
    deleteContact: _deleteContact,
    toggleStar: _toggleStar,
    setContacts,
  } = useContacts()
  const [activeTab, setActiveTab] = useState<TabId>('overview')
  const [showAddModal, setShowAddModal] = useState(false)
  const [editContact, setEditContact] = useState<Contact | null>(null)
  const [showRecycleBin, setShowRecycleBin] = useState(false)

  const handleSaveContact = useCallback(
    (c: Contact) => {
      if (editContact) {
        updateContact(c.id, c)
      } else {
        addContact(c)
      }
      setShowAddModal(false)
      setEditContact(null)
    },
    [editContact, updateContact, addContact],
  )

  // Tab label/sublabel via i18n
  const tabLabels: Record<TabId, { label: string; sublabel: string }> = {
    overview: { label: t('ndb.tab.overview'), sublabel: t('ndb.tab.overviewSub') },
    contacts: { label: t('ndb.tab.contacts'), sublabel: t('ndb.tab.contactsSub') },
    analytics: { label: t('ndb.tab.analytics'), sublabel: t('ndb.tab.analyticsSub') },
    collaboration: { label: t('ndb.tab.collaboration'), sublabel: t('ndb.tab.collaborationSub') },
    value: { label: t('ndb.tab.value'), sublabel: t('ndb.tab.valueSub') },
    service: { label: t('ndb.tab.service'), sublabel: t('ndb.tab.serviceSub') },
    knowledge: { label: t('ndb.tab.knowledge'), sublabel: t('ndb.tab.knowledgeSub') },
    monitor: { label: t('ndb.tab.monitor'), sublabel: t('ndb.tab.monitorSub') },
  }

  return (
    <div
      className="h-full flex flex-col overflow-hidden"
      style={{ animation: 'spring-in 0.4s var(--spring-easing) both' }}
    >
      {/* Page Header */}
      <div className="shrink-0 px-6 pt-6 pb-0">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2
              className="tracking-wider flex items-center gap-3"
              style={{ color: '#00f0ff', textShadow: '0 0 15px rgba(0,240,255,0.5)' }}
            >
              <Database className="w-6 h-6" />
              {t('ndb.title')}
            </h2>
            <p className="text-xs text-white/25 mt-1 tracking-wider">{t('ndb.subtitle')}</p>
          </div>
          <div className="flex items-center gap-2">
            {/* Recycle Bin */}
            <button
              onClick={() => setShowRecycleBin(true)}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] transition-all relative"
              style={{
                background: 'rgba(0,95,115,0.06)',
                border: '1px solid rgba(0,95,115,0.2)',
                color: '#005f73',
              }}
            >
              <Trash2 className="w-3 h-3" />
              {deletedContacts.length > 0 && (
                <span
                  className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full text-[7px] flex items-center justify-center"
                  style={{ background: '#005f73', color: 'white' }}
                >
                  {deletedContacts.length}
                </span>
              )}
            </button>
            <button
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] transition-all"
              style={{
                background: 'rgba(0,240,255,0.06)',
                border: '1px solid rgba(0,240,255,0.2)',
                color: '#00f0ff',
              }}
            >
              <Download className="w-3 h-3" /> {t('ndb.export')}
            </button>
            <button
              onClick={() => {
                setEditContact(null)
                setShowAddModal(true)
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] transition-all"
              style={{
                background: 'linear-gradient(135deg, rgba(0,240,255,0.15), rgba(0,212,255,0.15))',
                border: '1px solid rgba(0,240,255,0.3)',
                color: '#00f0ff',
                boxShadow: '0 0 12px rgba(0,240,255,0.15)',
              }}
            >
              <Plus className="w-3 h-3" /> {t('ndb.addContact')}
            </button>
          </div>
        </div>

        {/* Tab Bar */}
        <div className="flex gap-1 overflow-x-auto pb-3" style={{ scrollbarWidth: 'none' }}>
          {TABS.map((tab) => {
            const Icon = tab.icon
            const active = activeTab === tab.id
            const labels = tabLabels[tab.id]
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-[11px] whitespace-nowrap transition-all duration-300 border shrink-0"
                style={{
                  background: active ? `${tab.color}12` : 'transparent',
                  borderColor: active ? `${tab.color}40` : 'rgba(255,255,255,0.04)',
                  color: active ? tab.color : 'rgba(255,255,255,0.3)',
                  boxShadow: active ? `0 0 12px ${tab.color}20` : 'none',
                }}
              >
                <Icon className="w-3.5 h-3.5" />
                {labels.label}
                <span className="text-[8px] opacity-40 hidden lg:inline">{labels.sublabel}</span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-y-auto px-6 pb-6" style={{ scrollbarWidth: 'none' }}>
        {activeTab === 'overview' && <OverviewTab contacts={contacts} />}
        {activeTab === 'contacts' && (
          <ContactsTab
            contacts={contacts}
            setContacts={setContacts}
            onEdit={(c) => {
              setEditContact(c)
              setShowAddModal(true)
            }}
          />
        )}
        {activeTab === 'analytics' && <AnalyticsTab />}
        {activeTab === 'collaboration' && <CollaborationTab />}
        {activeTab === 'value' && <ValueTab contacts={contacts} />}
        {activeTab === 'service' && <ServiceTab />}
        {activeTab === 'knowledge' && <KnowledgeTab />}
        {activeTab === 'monitor' && <MonitorTab />}
      </div>

      {/* Modals */}
      {showAddModal && (
        <ContactFormModal
          contact={editContact}
          onSave={handleSaveContact}
          onClose={() => {
            setShowAddModal(false)
            setEditContact(null)
          }}
        />
      )}
      {showRecycleBin && <RecycleBinPanel onClose={() => setShowRecycleBin(false)} />}
    </div>
  )
}
