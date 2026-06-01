'use client'

import * as React from 'react'
import { useCRMStore } from '@/entities/crm/model/crm-store'
import { ConversationsList } from './conversations-list'
import { ConversationChat } from './conversation-chat'
import { ConversationRightPanel } from './conversation-right-panel'
import { Skeleton } from '@/shared/ui/skeleton'
import { Plus, RefreshCw, Settings2 } from 'lucide-react'
import { AdminPageHeader } from '@/widgets/admin-shell/ui/admin-page-header'
import { ThemeToggle } from '@/shared/ui/theme-toggle'
import { Button } from '@/shared/ui/button'
export function ConversationsPage() {
  const {
    conversations,
    selectedConversationId,
    conversationsLoading,
    conversationsError,
    loadConversations,
    selectConversation
  } = useCRMStore()

  React.useEffect(() => {
    void loadConversations()
  }, [loadConversations])

  const selectedConversation =
    conversations.find(item => item.id === selectedConversationId) ?? null

  return (
    <div className="cf-page min-h-screen">
      <AdminPageHeader
        title="Dashboard - Conversations"
        actions={
          <>
            <ThemeToggle />

            <Button
              type="button"
              variant="ghost"
              className="cf-icon-button"
              onClick={() => void loadConversations()}
              disabled={conversationsLoading}
            >
              <RefreshCw
                className={
                  conversationsLoading ? 'h-4 w-4 animate-spin' : 'h-4 w-4'
                }
              />
            </Button>

            <Button type="button" variant="ghost" className="cf-icon-button">
              <Settings2 className="h-4 w-4" />
            </Button>

            <Button type="button" variant="ghost" className="cf-icon-button">
              <Plus className="h-5 w-5" />
            </Button>
          </>
        }
      />

      <div className="grid h-[calc(100vh-52px)] grid-cols-1 gap-3 px-5 py-3 xl:grid-cols-[330px_minmax(0,1fr)_380px]">
        <ConversationsList
          conversations={conversations}
          selectedConversationId={selectedConversationId}
          onSelect={selectConversation}
          loading={conversationsLoading}
          error={conversationsError}
        />

        {conversationsLoading && !selectedConversation ? (
          <section className="cf-panel p-3">
            <Skeleton className="h-full min-h-[500px] rounded-md" />
          </section>
        ) : (
          <ConversationChat conversation={selectedConversation} />
        )}

        <ConversationRightPanel conversation={selectedConversation} />
      </div>
    </div>
  )
}
