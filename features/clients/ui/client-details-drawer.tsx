'use client'

import {
  Activity,
  Bot,
  Globe2,
  Package,
  Phone,
  UserRound,
  X
} from 'lucide-react'
import type { CRMClient } from '../model/clients-types'
import { CrmMoneyPair } from '@/shared/ui/crm-money-pair'
import { ClientStatusBadge } from './client-status-badge'
import { ClientNotesPanel } from './client-notes-panel'
import { Badge } from '@/shared/ui/badge'
import { Button } from '@/shared/ui/button'
import { ScrollArea } from '@/shared/ui/scroll-area'
import { Separator } from '@/shared/ui/separator'
import { ClientDealsPanel } from './client-deals-panel'
import { useCloseOnEscape } from '@/shared/hooks/use-close-on-escape'
import { cn } from '@/shared/lib/utils'

type ClientDetailsDrawerProps = {
  open: boolean
  client: CRMClient | null
  onClose: () => void
}

export function ClientDetailsDrawer({
  open,
  client,
  onClose
}: ClientDetailsDrawerProps) {
  useCloseOnEscape({
    open,
    onClose
  })
  if (!client) return null

  return (
    <div
      className={cn(
        'fixed inset-0 z-50 transition-[visibility] duration-300',
        open ? 'visible' : 'invisible'
      )}
      aria-hidden={!open}
    >
      <button
        type="button"
        className={cn(
          'absolute inset-0 bg-black/45 transition-opacity duration-200 ease-out',
          open ? 'opacity-100' : 'opacity-0'
        )}
        onClick={onClose}
        aria-label="Close deal details"
      />

      <aside
        className={cn(
          'absolute right-0 top-0 flex h-screen w-full max-w-155 flex-col border-l border-(--cf-border) bg-(--cf-bg) shadow-2xl',
          'transition-all duration-200 ease-out will-change-transform',
          open ? 'translate-x-0' : 'translate-x-full'
        )}
      >
        <div className="flex h-13 items-center justify-between border-b border-(--cf-border) px-4">
          <div className="text-[13px] font-medium text-(--cf-text-muted)">
            Client details
          </div>

          <Button
            type="button"
            variant="ghost"
            className="cf-icon-button"
            onClick={onClose}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        <ScrollArea className="min-h-0 flex-1">
          <div className="space-y-3 p-3">
            <section className="cf-panel overflow-hidden">
              <div className="grid grid-cols-2 border-b border-(--cf-border)">
                <div className="p-4 border-r border-(--cf-border)">
                  <div className="flex items-start gap-3">
                    <div className="h-11 w-11 aspect-square rounded-full bg-linear-to-br from-orange-600 via-zinc-800 to-sky-600" />

                    <div className="min-w-0">
                      <div
                        className="truncate text-wrap text-[16px] font-semibold text-(--cf-text)"
                        title={client.fullName}
                      >
                        {client.fullName}
                      </div>

                      <div className="mt-1 truncate text-[12px] text-(--cf-text-muted)">
                        {client.companyName ??
                          client.productInterest ??
                          'no company'}
                      </div>
                    </div>
                  </div>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    <ClientStatusBadge status={client.status} />
                    <Badge className="bg-(--cf-button) text-(--cf-text)">
                      {client.channel}
                    </Badge>
                    {client.aiLeadScore ? (
                      <Badge className="bg-(--cf-blue) text-black">
                        score {client.aiLeadScore}
                      </Badge>
                    ) : null}
                  </div>
                  <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2">
                    <ActionButton label="Telegram" />
                    <ActionButton label="Admin chat" />
                  </div>
                </div>

                <div className="p-4">
                  <div className="grid gap-2">
                    <CompactLine
                      label="Phone"
                      value={client.phone ?? client.whatsappPhone ?? '—'}
                    />
                    <CompactLine label="Email" value={client.email ?? '—'} />
                    <CompactLine label="City" value={client.city ?? '—'} />
                    <CompactLine
                      label="Manager"
                      value={client.assignedSellerName ?? '—'}
                    />
                    <CompactLine
                      label="Last"
                      value={client.lastContactAt ?? '—'}
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 border-b border-(--cf-border)">
                <InfoMetric
                  label="Total revenue"
                  value={
                    <CrmMoneyPair
                      value={client.statistics.totalRevenue}
                      displayMode="dual"
                    />
                  }
                />

                <InfoMetric
                  label="Debt"
                  value={
                    <CrmMoneyPair
                      value={client.statistics.totalDebt}
                      displayMode="dual"
                    />
                  }
                />
              </div>

              <div className="grid grid-cols-4">
                <SmallMetric
                  label="Chats"
                  value={client.statistics.totalConversations}
                />
                <SmallMetric
                  label="Deals"
                  value={client.statistics.totalDeals}
                />
                <SmallMetric
                  label="Orders"
                  value={client.statistics.totalOrders}
                />
                <SmallMetric
                  label="Returns"
                  value={client.statistics.returnedOrders}
                />
              </div>
            </section>
            <PanelBlock
              icon={<UserRound className="h-4 w-4" />}
              title="Manager history"
            >
              {client.managerHistory.length === 0 ? (
                <EmptyText>История менеджеров отсутствует</EmptyText>
              ) : (
                <div className="space-y-2">
                  {client.managerHistory.map(item => (
                    <div
                      key={item.id}
                      className="rounded-md border border-(--cf-border) bg-(--cf-element) p-2"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="text-[12px] font-semibold text-(--cf-text)">
                          {item.managerName}
                        </div>

                        {item.isCurrent ? (
                          <Badge className="bg-(--cf-blue) text-black">
                            current
                          </Badge>
                        ) : (
                          <Badge className="bg-(--cf-button) text-(--cf-text)">
                            previous
                          </Badge>
                        )}
                      </div>

                      <div className="mt-1 text-[11px] text-(--cf-text-muted)">
                        {item.role} · {item.reason}
                      </div>

                      <div className="mt-1 text-[11px] text-(--cf-text-muted)">
                        {item.startedAt}
                        {item.endedAt ? ` — ${item.endedAt}` : ' — сейчас'}
                      </div>

                      {item.comment ? (
                        <div className="mt-2 text-[11px] leading-5 text-(--cf-text)">
                          {item.comment}
                        </div>
                      ) : null}
                    </div>
                  ))}
                </div>
              )}
            </PanelBlock>

            <PanelBlock
              icon={<Globe2 className="h-4 w-4" />}
              title="Source / UTM"
            >
              <InfoRow label="Source" value={client.source} />
              <InfoRow label="Website" value={client.websiteDomain ?? '—'} />
              <InfoRow label="Bot" value={client.botName ?? '—'} />
              <InfoRow label="First page" value={client.firstPageUrl ?? '—'} />
              <InfoRow label="Last page" value={client.lastPageUrl ?? '—'} />

              <Separator className="my-2 bg-(--cf-border)" />

              <InfoRow label="utm_source" value={client.utmSource ?? '—'} />
              <InfoRow label="utm_medium" value={client.utmMedium ?? '—'} />
              <InfoRow label="utm_campaign" value={client.utmCampaign ?? '—'} />
              <InfoRow label="utm_content" value={client.utmContent ?? '—'} />
              <InfoRow label="utm_term" value={client.utmTerm ?? '—'} />
            </PanelBlock>

            <PanelBlock icon={<Bot className="h-4 w-4" />} title="AI data">
              <div className="mb-2 flex flex-wrap gap-1.5">
                {client.aiLeadScore ? (
                  <Badge className="bg-(--cf-blue) text-black">
                    score {client.aiLeadScore}
                  </Badge>
                ) : null}

                {client.aiDetectedIntent ? (
                  <Badge className="bg-(--cf-button) text-(--cf-text)">
                    {client.aiDetectedIntent}
                  </Badge>
                ) : null}
              </div>

              <InfoRow label="Interest" value={client.productInterest ?? '—'} />
              <InfoRow label="Object" value={client.objectType ?? '—'} />
              <InfoRow
                label="Volume"
                value={
                  client.requiredVolume
                    ? `${client.requiredVolume} ${client.requiredUnit ?? ''}`
                    : '—'
                }
              />

              {client.budget ? (
                <div className="mt-2">
                  <div className="text-[10px] text-(--cf-text-muted)">
                    Budget
                  </div>
                  <div className="mt-1 text-[12px] font-semibold text-(--cf-text)">
                    <CrmMoneyPair value={client.budget} displayMode="dual" />
                  </div>
                </div>
              ) : null}

              {client.aiSummary ? (
                <div className="mt-3 rounded-md border border-(--cf-border) bg-(--cf-element) p-2 text-[11px] leading-5 text-(--cf-text-muted)">
                  {client.aiSummary}
                </div>
              ) : null}

              {client.aiMissingFields?.length ? (
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {client.aiMissingFields.map(field => (
                    <Badge
                      key={field}
                      className="bg-[rgba(245,187,36,0.14)] text-(--cf-yellow)"
                    >
                      {field}
                    </Badge>
                  ))}
                </div>
              ) : null}
            </PanelBlock>

            <ClientDealsPanel deals={client.deals} />

            <PanelBlock
              icon={<Package className="h-4 w-4" />}
              title="Ordered products"
            >
              {client.orderedProducts.length === 0 ? (
                <EmptyText>Нет заказанных товаров</EmptyText>
              ) : (
                <div className="space-y-2">
                  {client.orderedProducts.map(product => (
                    <div key={product.id} className="cf-panel-soft p-2">
                      <div className="text-[12px] font-semibold text-(--cf-text)">
                        {product.productName}
                      </div>
                      <div className="mt-1 text-[11px] text-(--cf-text-muted)">
                        {product.categoryName} · {product.quantity}{' '}
                        {product.unit}
                      </div>
                      <div className="mt-2 text-[12px] font-medium text-(--cf-text)">
                        <CrmMoneyPair
                          value={product.total}
                          displayMode="dual"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </PanelBlock>

            <PanelBlock
              icon={<Activity className="h-4 w-4" />}
              title="Activity sessions"
            >
              {client.activitySessions.length === 0 ? (
                <EmptyText>Нет activity sessions</EmptyText>
              ) : (
                <div className="space-y-2">
                  {client.activitySessions.map(session => (
                    <div key={session.id} className="cf-panel-soft p-2">
                      <div className="flex items-center justify-between gap-2">
                        <div className="text-[12px] font-semibold text-(--cf-text)">
                          {session.channel}
                        </div>
                        <Badge className="bg-(--cf-button) text-(--cf-text)">
                          {session.status}
                        </Badge>
                      </div>

                      <div className="mt-2 text-[11px] leading-5 text-(--cf-text-muted)">
                        {session.websiteDomain ?? '—'}
                        <br />
                        first: {session.firstPageUrl ?? '—'}
                        <br />
                        last: {session.lastPageUrl ?? '—'}
                        <br />
                        pages: {session.pageViews} · products:{' '}
                        {session.productViews}
                        <br />
                        chat: {session.chatOpens} · TG: {session.telegramClicks}{' '}
                        · WA: {session.whatsappClicks}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </PanelBlock>

            <ClientNotesPanel client={client} />

            <PanelBlock
              icon={<Phone className="h-4 w-4" />}
              title="Quick actions"
            >
              <div className="grid grid-cols-2 gap-2">
                <ActionButton label="Open chat" />
                <ActionButton label="Create deal" />
                <ActionButton label="Create order" />
                <ActionButton label="Create task" />
              </div>
            </PanelBlock>
          </div>
        </ScrollArea>

        <div className="flex h-14.5 items-center justify-between border-t border-(--cf-border) px-3">
          <div className="text-[11px] text-(--cf-text-muted)">
            Client ID: {client.id}
          </div>

          <Button
            type="button"
            variant="ghost"
            className="h-8 rounded-md bg-(--cf-button) px-4 text-[12px] text-(--cf-text) hover:bg-(--cf-element-hover)"
            onClick={onClose}
          >
            Cancel
          </Button>
        </div>
      </aside>
    </div>
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
      <div className="mb-3 flex items-center gap-2 text-[12px] font-semibold text-(--cf-text)">
        {icon ? <span className="text-(--cf-icon)">{icon}</span> : null}
        {title}
      </div>
      {children}
    </section>
  )
}

function CompactLine({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-[10px] text-(--cf-text-muted)">{label}</div>
      <div className="mt-0.5 truncate text-[12px] text-(--cf-text)">
        {value}
      </div>
    </div>
  )
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="mb-1.5 grid grid-cols-[96px_minmax(0,1fr)] gap-2 text-[11px]">
      <div className="text-(--cf-text-muted)">{label}</div>
      <div className="truncate text-(--cf-text)">{value}</div>
    </div>
  )
}

function InfoMetric({
  label,
  value
}: {
  label: string
  value: React.ReactNode
}) {
  return (
    <div className="border-r border-(--cf-border) p-3 last:border-r-0">
      <div className="text-[10px] text-(--cf-text-muted)">{label}</div>
      <div className="mt-1 text-[13px] font-semibold text-(--cf-text)">
        {value}
      </div>
    </div>
  )
}

function SmallMetric({ label, value }: { label: string; value: number }) {
  return (
    <div className="border-r border-(--cf-border) p-3 last:border-r-0">
      <div className="text-[10px] text-(--cf-text-muted)">{label}</div>
      <div className="mt-1 text-[14px] font-semibold text-(--cf-text)">
        {value}
      </div>
    </div>
  )
}

function ActionButton({ label }: { label: string }) {
  return (
    <button
      type="button"
      className="h-9 rounded-md bg-(--cf-button) px-3 text-[12px] text-(--cf-text) hover:bg-(--cf-element-hover)"
    >
      {label}
    </button>
  )
}

function EmptyText({ children }: { children: React.ReactNode }) {
  return <div className="text-[11px] text-(--cf-text-muted)">{children}</div>
}
