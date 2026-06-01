'use client'

import {
  Bot,
  Clock3,
  FileText,
  MessageSquare,
  Package,
  Phone,
  TrendingUp,
  X
} from 'lucide-react'
import type { CRMDeal } from '../model/deals-types'
import { CrmMoneyPair } from '@/shared/ui/crm-money-pair'
import { Badge } from '@/shared/ui/badge'
import { Button } from '@/shared/ui/button'
import { ScrollArea } from '@/shared/ui/scroll-area'
import { DealStageBadge } from './deal-stage-badge'
import { useCRMStore } from '@/entities/crm/model/crm-store'
import { DealNotesPanel } from './deal-notes-panel'
import { useCloseOnEscape } from '@/shared/hooks/use-close-on-escape'
import { cn } from '@/shared/lib/utils'

type DealDetailsDrawerProps = {
  open: boolean
  deal: CRMDeal | null
  onClose: () => void
}

export function DealDetailsDrawer({
  open,
  deal,
  onClose
}: DealDetailsDrawerProps) {
  const { createOrderFromDeal } = useCRMStore()

  useCloseOnEscape({
    open,
    onClose
  })

  if (!deal) return null

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
          'absolute right-0 top-0 flex h-screen w-full max-w-160 flex-col border-l border-(--cf-border) bg-(--cf-bg) shadow-2xl',
          'transition-all duration-200 ease-out will-change-transform',
          open ? 'translate-x-0' : 'translate-x-full'
        )}
      >
        <div className="flex h-13 items-center justify-between border-b border-(--cf-border) px-4">
          <div className="text-[13px] font-medium text-(--cf-text-muted)">
            Deal details
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
              <div className="grid grid-cols-[1fr_250px] border-b border-(--cf-border)">
                <div className="p-4">
                  <div className="mb-2 flex flex-wrap gap-1.5">
                    <DealStageBadge stage={deal.stage} />

                    <Badge className="bg-(--cf-button) text-(--cf-text)">
                      {deal.priority}
                    </Badge>

                    <Badge className="bg-[var(--cf-blue)] text-black">
                      {deal.probability}%
                    </Badge>
                  </div>

                  <div className="text-[17px] font-semibold text-[var(--cf-text)]">
                    {deal.title}
                  </div>

                  <div className="mt-1 text-[11px] text-[var(--cf-text-muted)]">
                    {deal.dealNumber} · {deal.clientName}
                  </div>

                  {deal.description ? (
                    <div className="mt-3 rounded-md border border-[var(--cf-border)] bg-[var(--cf-element)] p-2 text-[11px] leading-5 text-[var(--cf-text-muted)]">
                      {deal.description}
                    </div>
                  ) : null}
                </div>

                <div className="border-l border-[var(--cf-border)] p-4">
                  <CompactLine label="Client" value={deal.clientName} />
                  <CompactLine
                    label="Company"
                    value={deal.companyName ?? '—'}
                  />
                  <CompactLine label="Phone" value={deal.phone ?? '—'} />
                  <CompactLine label="City" value={deal.city ?? '—'} />
                  <CompactLine
                    label="Manager"
                    value={deal.managerName ?? '—'}
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 border-b border-[var(--cf-border)]">
                <InfoMetric
                  label="Amount"
                  value={
                    <CrmMoneyPair value={deal.amount} displayMode="dual" />
                  }
                />
                <InfoMetric
                  label="Discount"
                  value={
                    <CrmMoneyPair
                      value={deal.discountAmount}
                      displayMode="dual"
                    />
                  }
                />
                <InfoMetric
                  label="Final"
                  value={
                    <CrmMoneyPair value={deal.finalAmount} displayMode="dual" />
                  }
                />
              </div>

              <div className="grid grid-cols-4">
                <SmallMetric
                  label="Products"
                  value={deal.productLines.length}
                />
                <SmallMetric label="Stage" value={deal.stage} />
                <SmallMetric label="Source" value={deal.source} />
                <SmallMetric label="Channel" value={deal.channel} />
              </div>
            </section>

            <PanelBlock
              icon={<TrendingUp className="h-4 w-4" />}
              title="Sales data"
            >
              <InfoRow label="Interest" value={deal.productInterest} />
              <InfoRow label="Object" value={deal.objectType ?? '—'} />
              <InfoRow
                label="Volume"
                value={
                  deal.requiredVolume
                    ? `${deal.requiredVolume} ${deal.requiredUnit ?? ''}`
                    : '—'
                }
              />
              <InfoRow label="Next contact" value={deal.nextContactAt ?? '—'} />

              {deal.nextStep ? (
                <div className="mt-3 rounded-md border border-[var(--cf-border)] bg-[var(--cf-element)] p-2 text-[11px] leading-5 text-[var(--cf-text)]">
                  {deal.nextStep}
                </div>
              ) : null}
            </PanelBlock>

            {deal.aiCreated ? (
              <PanelBlock icon={<Bot className="h-4 w-4" />} title="AI data">
                <div className="mb-2 flex flex-wrap gap-1.5">
                  <Badge className="bg-[var(--cf-blue)] text-black">
                    confidence {deal.aiConfidence ?? 0}%
                  </Badge>
                </div>

                <div className="rounded-md border border-[var(--cf-border)] bg-[var(--cf-element)] p-2 text-[11px] leading-5 text-[var(--cf-text-muted)]">
                  {deal.aiSummary ?? 'AI summary отсутствует'}
                </div>
              </PanelBlock>
            ) : null}

            <DealNotesPanel key={deal.id} deal={deal} />

            <PanelBlock icon={<Package className="h-4 w-4" />} title="Products">
              {deal.productLines.length === 0 ? (
                <EmptyText>Товары ещё не добавлены</EmptyText>
              ) : (
                <div className="space-y-2">
                  {deal.productLines.map(line => (
                    <div key={line.id} className="cf-panel-soft p-2">
                      <div className="text-[12px] font-semibold text-[var(--cf-text)]">
                        {line.productName}
                      </div>
                      <div className="mt-1 text-[11px] text-[var(--cf-text-muted)]">
                        {line.categoryName} · {line.quantity} {line.unit}
                      </div>
                      <div className="mt-2 text-[12px] font-medium text-[var(--cf-text)]">
                        <CrmMoneyPair value={line.total} displayMode="dual" />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </PanelBlock>

            <PanelBlock
              icon={<MessageSquare className="h-4 w-4" />}
              title="Relations"
            >
              <InfoRow label="Client ID" value={deal.clientId} />
              <InfoRow
                label="Conversation"
                value={deal.relatedConversationId ?? '—'}
              />
              <InfoRow label="Quote" value={deal.relatedQuoteId ?? '—'} />
              <InfoRow label="Order" value={deal.relatedOrderId ?? '—'} />
            </PanelBlock>

            {deal.lostReason ? (
              <PanelBlock
                icon={<FileText className="h-4 w-4" />}
                title="Lost reason"
              >
                <div className="rounded-md border border-[rgba(239,23,72,0.25)] bg-[rgba(239,23,72,0.08)] p-2 text-[11px] leading-5 text-[var(--cf-red)]">
                  {deal.lostReason}
                </div>
              </PanelBlock>
            ) : null}

            <PanelBlock icon={<Clock3 className="h-4 w-4" />} title="History">
              <div className="space-y-2">
                {deal.history.map(item => (
                  <div key={item.id} className="cf-panel-soft p-2">
                    <div className="text-[12px] font-semibold text-[var(--cf-text)]">
                      {item.title}
                    </div>
                    {item.description ? (
                      <div className="mt-1 text-[11px] text-[var(--cf-text-muted)]">
                        {item.description}
                      </div>
                    ) : null}
                    <div className="mt-1 text-[10px] text-[var(--cf-text-muted)]">
                      {item.userName ?? 'System'} · {item.createdAt}
                    </div>
                  </div>
                ))}
              </div>
            </PanelBlock>

            <PanelBlock icon={<Phone className="h-4 w-4" />} title="Actions">
              <div className="grid grid-cols-2 gap-2">
                <ActionButton label="Open client" />
                <ActionButton label="Open chat" />
                <ActionButton label="Send quote" />
                <button
                  type="button"
                  disabled={Boolean(deal.relatedOrderId)}
                  onClick={() => void createOrderFromDeal(deal.id)}
                  className="h-9 rounded-md bg-[var(--cf-button)] px-3 text-[12px] text-[var(--cf-text)] hover:bg-[var(--cf-element-hover)] disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Create order
                </button>
              </div>
            </PanelBlock>
          </div>
        </ScrollArea>

        <div className="flex h-[58px] items-center justify-between border-t border-[var(--cf-border)] px-3">
          <div className="text-[11px] text-[var(--cf-text-muted)]">
            Deal ID: {deal.id}
          </div>

          <Button
            type="button"
            variant="ghost"
            className="h-8 rounded-md bg-[var(--cf-button)] px-4 text-[12px] text-[var(--cf-text)] hover:bg-[var(--cf-element-hover)]"
            onClick={onClose}
          >
            Close
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
      <div className="mb-3 flex items-center gap-2 text-[12px] font-semibold text-[var(--cf-text)]">
        {icon ? <span className="text-[var(--cf-icon)]">{icon}</span> : null}
        {title}
      </div>
      {children}
    </section>
  )
}

function CompactLine({ label, value }: { label: string; value: string }) {
  return (
    <div className="mb-2">
      <div className="text-[10px] text-[var(--cf-text-muted)]">{label}</div>
      <div className="mt-0.5 truncate text-[12px] text-[var(--cf-text)]">
        {value}
      </div>
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
    <div className="border-r border-[var(--cf-border)] p-3 last:border-r-0">
      <div className="text-[10px] text-[var(--cf-text-muted)]">{label}</div>
      <div className="mt-1 text-[13px] font-semibold text-[var(--cf-text)]">
        {value}
      </div>
    </div>
  )
}

function SmallMetric({
  label,
  value
}: {
  label: string
  value: string | number
}) {
  return (
    <div className="border-r border-[var(--cf-border)] p-3 last:border-r-0">
      <div className="text-[10px] text-[var(--cf-text-muted)]">{label}</div>
      <div className="mt-1 truncate text-[12px] font-semibold text-[var(--cf-text)]">
        {value}
      </div>
    </div>
  )
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="mb-1.5 grid grid-cols-[110px_minmax(0,1fr)] gap-2 text-[11px]">
      <div className="text-[var(--cf-text-muted)]">{label}</div>
      <div className="truncate text-[var(--cf-text)]">{value}</div>
    </div>
  )
}

function ActionButton({ label }: { label: string }) {
  return (
    <button
      type="button"
      className="h-9 rounded-md bg-[var(--cf-button)] px-3 text-[12px] text-[var(--cf-text)] hover:bg-[var(--cf-element-hover)]"
    >
      {label}
    </button>
  )
}

function EmptyText({ children }: { children: React.ReactNode }) {
  return (
    <div className="text-[11px] text-[var(--cf-text-muted)]">{children}</div>
  )
}
