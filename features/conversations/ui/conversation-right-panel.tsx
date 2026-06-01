'use client'

import {
  Bot,
  ClipboardList,
  MessageSquareText,
  Package,
  UserRound,
  Activity
} from 'lucide-react'
import type { Conversation } from '../model/conversations-types'
import { CrmMoneyPair } from '@/shared/ui/crm-money-pair'
import { Badge } from '@/shared/ui/badge'
import { Button } from '@/shared/ui/button'
import { ScrollArea } from '@/shared/ui/scroll-area'
import { Separator } from '@/shared/ui/separator'
import { ConversationNotesPanel } from './conversation-notes-panel'

type ConversationRightPanelProps = {
  conversation: Conversation | null
}

export function ConversationRightPanel({
  conversation
}: ConversationRightPanelProps) {
  if (!conversation) {
    return (
      <aside className="cf-panel flex items-center justify-center text-[12px] text-[var(--cf-text-muted)] xl:flex">
        Нет выбранного клиента
      </aside>
    )
  }

  const ai = conversation.aiCollectedInfo
  const client = conversation.client

  return (
    <aside className="cf-panel hidden min-h-0 overflow-hidden xl:flex xl:flex-col">
      <div className="border-b border-[var(--cf-border)] p-3">
        <div className="text-[13px] font-semibold text-[var(--cf-text)]">
          Client / AI panel
        </div>
        <div className="mt-1 text-[11px] text-[var(--cf-text-muted)]">
          данные, которые AI и CRM уже собрали по клиенту
        </div>
      </div>

      <ScrollArea className="min-h-0 flex-1">
        <div className="space-y-3 p-3">
          <PanelBlock
            icon={<UserRound className="h-4 w-4" />}
            title="Client Info"
          >
            <InfoRow label="Имя" value={client.fullName} />
            <InfoRow label="Компания" value={client.companyName ?? '—'} />
            <InfoRow
              label="Телефон"
              value={client.phone ?? client.whatsappPhone ?? '—'}
            />
            <InfoRow label="Email" value={client.email ?? '—'} />
            <InfoRow label="Город" value={client.city ?? '—'} />
            <InfoRow label="Источник" value={client.source} />
            <InfoRow label="Сайт" value={client.websiteDomain ?? '—'} />
            <InfoRow label="Бот" value={client.botName ?? '—'} />
            <InfoRow
              label="Менеджер"
              value={client.assignedSellerName ?? '—'}
            />
          </PanelBlock>

          <PanelBlock
            icon={<Bot className="h-4 w-4" />}
            title="AI Collected Info"
          >
            {ai ? (
              <>
                <div className="mb-2 flex flex-wrap gap-1.5">
                  <Badge className="bg-[var(--cf-blue)] text-black">
                    lead score {ai.leadScore}
                  </Badge>
                  <Badge className="bg-[var(--cf-button)] text-[var(--cf-text)]">
                    confidence {ai.confidence}%
                  </Badge>
                  <Badge className="bg-[var(--cf-button)] text-[var(--cf-text)]">
                    {ai.detectedIntent}
                  </Badge>
                </div>

                <InfoRow label="Категория" value={ai.productCategory ?? '—'} />
                <InfoRow label="Товар" value={ai.productName ?? '—'} />
                <InfoRow label="Объект" value={ai.objectType ?? '—'} />
                <InfoRow
                  label="Объём"
                  value={ai.volume ? `${ai.volume} ${ai.unit}` : '—'}
                />
                <InfoRow label="Город" value={ai.city ?? '—'} />
                <InfoRow label="RAL" value={ai.ralColor ?? '—'} />
                <InfoRow label="Срочность" value={ai.urgency ?? '—'} />

                {ai.budget ? (
                  <div className="mt-2">
                    <div className="text-[10px] text-[var(--cf-text-muted)]">
                      Бюджет
                    </div>
                    <div className="mt-1 text-[12px] font-semibold text-[var(--cf-text)]">
                      <CrmMoneyPair value={ai.budget} displayMode="dual" />
                    </div>
                  </div>
                ) : null}

                <Separator className="my-3 bg-[var(--cf-border)]" />

                <div className="text-[11px] leading-5 text-[var(--cf-text-muted)]">
                  {ai.summary}
                </div>
              </>
            ) : (
              <EmptyText>AI пока не собрал данные</EmptyText>
            )}
          </PanelBlock>

          <PanelBlock
            icon={<ClipboardList className="h-4 w-4" />}
            title="Missing Fields"
          >
            {ai && ai.missingFields.length > 0 ? (
              <div className="flex flex-wrap gap-1.5">
                {ai.missingFields.map(field => (
                  <Badge
                    key={field}
                    className="bg-[rgba(245,187,36,0.14)] text-[var(--cf-yellow)]"
                  >
                    {field}
                  </Badge>
                ))}
              </div>
            ) : (
              <EmptyText>Нет пропущенных полей</EmptyText>
            )}
          </PanelBlock>

          <PanelBlock
            icon={<MessageSquareText className="h-4 w-4" />}
            title="Suggested Reply"
          >
            {ai?.suggestedReply ? (
              <>
                <div className="rounded-md border border-[var(--cf-border)] bg-[var(--cf-element)] p-2 text-[11px] leading-5 text-[var(--cf-text)]">
                  {ai.suggestedReply}
                </div>
                <div className="mt-2 flex gap-2">
                  <Button className="h-7 rounded-md bg-[var(--cf-button)] px-3 text-[11px] text-[var(--cf-text)] hover:bg-[var(--cf-element-hover)]">
                    Insert
                  </Button>
                  <Button className="h-7 rounded-md bg-[var(--cf-button)] px-3 text-[11px] text-[var(--cf-text)] hover:bg-[var(--cf-element-hover)]">
                    Edit
                  </Button>
                </div>
              </>
            ) : (
              <EmptyText>Нет подсказки</EmptyText>
            )}
          </PanelBlock>

          {conversation.activeDeal ? (
            <PanelBlock
              icon={<Package className="h-4 w-4" />}
              title="Active Deal"
            >
              <InfoRow label="Номер" value={conversation.activeDeal.number} />
              <InfoRow label="Стадия" value={conversation.activeDeal.stage} />
              <InfoRow
                label="Вероятность"
                value={`${conversation.activeDeal.probability}%`}
              />
              <div className="mt-2 text-[12px] font-semibold text-[var(--cf-text)]">
                <CrmMoneyPair
                  value={conversation.activeDeal.finalAmount}
                  displayMode="dual"
                />
              </div>
            </PanelBlock>
          ) : null}

          <PanelBlock
            icon={<Package className="h-4 w-4" />}
            title="Client Orders"
          >
            {conversation.clientOrders.length === 0 ? (
              <EmptyText>Заказов пока нет</EmptyText>
            ) : (
              <div className="space-y-2">
                {conversation.clientOrders.map(order => (
                  <div key={order.id} className="cf-panel-soft p-2">
                    <div className="flex items-center justify-between gap-2">
                      <div className="text-[12px] font-semibold text-[var(--cf-text)]">
                        {order.number}
                      </div>
                      <Badge className="bg-[var(--cf-button)] text-[var(--cf-text)]">
                        {order.status}
                      </Badge>
                    </div>
                    <div className="mt-2 text-[11px] text-[var(--cf-text-muted)]">
                      debt:
                    </div>
                    <div className="text-[12px] font-medium text-[var(--cf-text)]">
                      <CrmMoneyPair value={order.debt} displayMode="dual" />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </PanelBlock>

          <PanelBlock
            icon={<Activity className="h-4 w-4" />}
            title="Activity Sessions"
          >
            {conversation.activitySessions.length === 0 ? (
              <EmptyText>Нет activity sessions</EmptyText>
            ) : (
              <div className="space-y-2">
                {conversation.activitySessions.map(session => (
                  <div key={session.id} className="cf-panel-soft p-2">
                    <div className="flex items-center justify-between">
                      <div className="text-[12px] font-semibold text-[var(--cf-text)]">
                        {session.channel}
                      </div>
                      <Badge className="bg-[var(--cf-button)] text-[var(--cf-text)]">
                        {session.status}
                      </Badge>
                    </div>
                    <div className="mt-2 text-[11px] leading-5 text-[var(--cf-text-muted)]">
                      {session.websiteDomain ?? '—'}
                      <br />
                      page views: {session.pageViews} · product views:{' '}
                      {session.productViews}
                      <br />
                      first: {session.firstPageUrl ?? '—'}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </PanelBlock>

          <ConversationNotesPanel conversation={conversation} />
        </div>
      </ScrollArea>
    </aside>
  )
}

function PanelBlock({
  icon,
  title,
  children
}: {
  icon?: React.ReactNode
  title: string
  children: React.ReactNode
}) {
  return (
    <section className="cf-panel-soft p-3">
      <div className="mb-3 flex items-center gap-2 text-[12px] font-semibold text-[var(--cf-text)]">
        {icon ? <span className="text-[var(--cf-icon)]">{icon}</span> : null}
        {title}
      </div>
      {children}
    </section>
  )
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="mb-1.5 grid grid-cols-[92px_minmax(0,1fr)] gap-2 text-[11px]">
      <div className="text-[var(--cf-text-muted)]">{label}</div>
      <div className="truncate text-[var(--cf-text)]">{value}</div>
    </div>
  )
}

function EmptyText({ children }: { children: React.ReactNode }) {
  return (
    <div className="text-[11px] text-[var(--cf-text-muted)]">{children}</div>
  )
}
