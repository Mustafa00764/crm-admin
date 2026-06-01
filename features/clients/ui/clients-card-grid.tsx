'use client'

import {
  Activity,
  Bot,
  Building2,
  Check,
  Globe2,
  Mail,
  MapPin,
  MessageSquare,
  Package,
  Phone,
  Send,
  UserRound,
  WalletCards
} from 'lucide-react'
import type { CRMClient } from '../model/clients-types'
import { cn } from '@/shared/lib/cn'
import { CrmMoneyPair } from '@/shared/ui/crm-money-pair'
import { SelectCheckbox } from '@/shared/ui/select-checkbox'
import { Badge } from '@/shared/ui/badge'
import { ClientStatusBadge } from './client-status-badge'
import { ClientRowActionsMenu } from './client-row-actions-menu'

type ClientsCardGridProps = {
  clients: CRMClient[]
  selectedClientIds: string[]
  onSelect: (clientId: string) => void
  onToggleClient: (clientId: string) => void
}

export function ClientsCardGrid({
  clients,
  selectedClientIds,
  onSelect,
  onToggleClient
}: ClientsCardGridProps) {
  return (
    <section className="grid auto-rows-min gap-3 overflow-auto pb-2 p-px md:grid-cols-2 2xl:grid-cols-3">
      {clients.map(client => {
        const checked = selectedClientIds.includes(client.id)
        const latestActiveDeal = getLatestActiveDeal(client)

        return (
          <article
            key={client.id}
            role="button"
            tabIndex={0}
            onClick={() => onSelect(client.id)}
            onKeyDown={event => {
              if (event.key === 'Enter') {
                onSelect(client.id)
              }
            }}
            className={cn(
              'cf-panel cf-card-hover flex flex-col relative cursor-pointer p-3 text-left transition-all duration-150',
              checked &&
                'border-(--cf-blue) bg-[rgba(8,183,239,0.09)] shadow-[0_0_0_1px_var(--cf-blue)]'
            )}
          >
            {checked ? (
              <div className="absolute right-3 top-12 z-10 flex items-center gap-1 rounded-md bg-[var(--cf-blue)] px-2 py-1 text-[10px] font-semibold text-black">
                <Check className="h-3 w-3" />
                Selected
              </div>
            ) : null}

            <div className="mb-3 flex items-center justify-between gap-2">
              <div
                onClick={event => event.stopPropagation()}
                onKeyDown={event => event.stopPropagation()}
              >
                <SelectCheckbox
                  checked={checked}
                  onCheckedChange={() => onToggleClient(client.id)}
                />
              </div>
              <div className='[&_svg]:text-primary'>
                <ClientRowActionsMenu client={client} />
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div
                className={cn(
                  'flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-orange-600 via-zinc-800 to-sky-600 text-[12px] font-semibold text-white',
                  checked && 'ring-2 ring-[var(--cf-blue)]'
                )}
              >
                {getInitials(client.fullName)}
              </div>

              <div className="min-w-0 flex-1 pr-20">
                <div className="truncate text-[13px] font-semibold text-[var(--cf-text)]">
                  {client.fullName}
                </div>

                <div className="mt-1 truncate text-[11px] text-[var(--cf-text-muted)]">
                  {client.companyName ?? 'Компания не указана'}
                </div>

                <div className="mt-2 flex flex-wrap gap-1.5">
                  <ClientStatusBadge status={client.status} />

                  <Badge className="bg-[var(--cf-button)] text-[var(--cf-text)]">
                    {client.channel}
                  </Badge>

                  {client.aiLeadScore ? (
                    <Badge className="bg-[var(--cf-blue)] text-black">
                      score {client.aiLeadScore}
                    </Badge>
                  ) : null}
                </div>
              </div>
            </div>

            <div className="mt-3 grid grid-cols-2 gap-2">
              <CardField
                icon={<Building2 className="h-3.5 w-3.5" />}
                label="Компания"
                value={client.companyName ?? '—'}
              />

              <CardField
                icon={<MapPin className="h-3.5 w-3.5" />}
                label="Город"
                value={client.city ?? '—'}
              />

              <CardField
                icon={<Phone className="h-3.5 w-3.5" />}
                label="Телефон"
                value={client.phone ?? client.whatsappPhone ?? '—'}
              />

              <CardField
                icon={<Mail className="h-3.5 w-3.5" />}
                label="Email"
                value={client.email ?? '—'}
              />

              <CardField
                icon={<Send className="h-3.5 w-3.5" />}
                label="Telegram"
                value={client.telegramUsername ?? '—'}
              />

              <CardField
                icon={<UserRound className="h-3.5 w-3.5" />}
                label="Ответственный"
                value={formatManagerValue(client)}
              />

              <CardField
                icon={<Globe2 className="h-3.5 w-3.5" />}
                label="Сайт"
                value={client.websiteDomain ?? '—'}
              />

              <CardField
                icon={<Bot className="h-3.5 w-3.5" />}
                label="Бот"
                value={client.botName ?? '—'}
              />
            </div>

            <div className="mt-3 grid grid-cols-4 gap-2">
              <MiniMetric
                icon={<MessageSquare className="h-3.5 w-3.5" />}
                label="Чаты"
                value={client.statistics.totalConversations}
              />

              <MiniMetric
                icon={<Package className="h-3.5 w-3.5" />}
                label="Заказы"
                value={client.statistics.totalOrders}
              />

              <MiniMetric
                icon={<Activity className="h-3.5 w-3.5" />}
                label="Сессии"
                value={client.activitySessions.length}
              />

              <MiniMetric
                icon={<WalletCards className="h-3.5 w-3.5" />}
                label="Долг"
                value={client.statistics.totalDebt.rub > 0 ? 1 : 0}
              />
            </div>

            <div className="mt-3 grid grid-cols-2 gap-2">
              <MoneyBox
                label="Выручка"
                value={client.statistics.totalRevenue}
              />

              <MoneyBox
                label="Долг"
                value={client.statistics.totalDebt}
                danger={client.statistics.totalDebt.rub > 0}
              />
            </div>

            <div className="mt-3 rounded-md border border-[var(--cf-border)] bg-[var(--cf-element)] p-2">
              <div className="text-[10px] text-[var(--cf-text-muted)]">
                Интерес / запрос
              </div>

              <div className="mt-1 line-clamp-2 text-[11px] leading-5 text-[var(--cf-text)]">
                {client.productInterest ??
                  client.aiDetectedIntent ??
                  'Интерес клиента пока не определён'}
              </div>
            </div>

            <div className="mt-2 rounded-md border border-[var(--cf-border)] bg-[var(--cf-element)] p-2">
              <div className="flex items-center justify-between gap-2">
                <div className="text-[10px] text-[var(--cf-text-muted)]">
                  Активная сделка
                </div>

                {latestActiveDeal ? (
                  <Badge className="bg-[var(--cf-blue)] text-black">
                    {latestActiveDeal.status}
                  </Badge>
                ) : null}
              </div>

              {latestActiveDeal ? (
                <>
                  <div className="mt-1 line-clamp-1 text-[11px] font-medium text-[var(--cf-text)]">
                    {latestActiveDeal.title}
                  </div>

                  <div className="mt-1 text-[11px] font-semibold text-[var(--cf-text)]">
                    <CrmMoneyPair
                      value={latestActiveDeal.amount}
                      displayMode="dual"
                    />
                  </div>

                  <div className="mt-1 line-clamp-1 text-[10px] text-[var(--cf-text-muted)]">
                    {latestActiveDeal.managerName ?? 'Без менеджера'} ·{' '}
                    {latestActiveDeal.probability}%
                  </div>
                </>
              ) : (
                <div className="mt-1 text-[11px] text-[var(--cf-text-muted)]">
                  Активных сделок нет
                </div>
              )}
            </div>

            <div className="mt-2 flex flex-1 items-end justify-between gap-2 text-[10px] text---cf-text-muted)">
              <span className="truncate">Источник: {client.source}</span>
              <span className="shrink-0">
                {client.lastContactAt ?? 'нет контакта'}
              </span>
            </div>
          </article>
        )
      })}
    </section>
  )
}

function CardField({
  icon,
  label,
  value
}: {
  icon: React.ReactNode
  label: string
  value: string
}) {
  return (
    <div className="min-w-0 rounded-md border border-[var(--cf-border)] bg-[var(--cf-element)] p-2">
      <div className="flex items-center gap-1.5 text-[10px] text-[var(--cf-text-muted)]">
        <span className="text-[var(--cf-icon)]">{icon}</span>
        {label}
      </div>

      <div className="mt-1 truncate text-[11px] font-medium text-[var(--cf-text)]">
        {value}
      </div>
    </div>
  )
}

function MiniMetric({
  icon,
  label,
  value
}: {
  icon: React.ReactNode
  label: string
  value: number
}) {
  return (
    <div className="rounded-md border border-[var(--cf-border)] bg-[var(--cf-element)] p-2">
      <div className="flex items-center justify-center text-[var(--cf-icon)]">
        {icon}
      </div>

      <div className="mt-1 text-center text-[13px] font-semibold text-[var(--cf-text)]">
        {value}
      </div>

      <div className="mt-0.5 truncate text-center text-[9px] text-[var(--cf-text-muted)]">
        {label}
      </div>
    </div>
  )
}

function MoneyBox({
  label,
  value,
  danger
}: {
  label: string
  value: { rub: number; uzs: number }
  danger?: boolean
}) {
  return (
    <div className="rounded-md border border-[var(--cf-border)] bg-[var(--cf-element)] p-2">
      <div className="text-[10px] text-[var(--cf-text-muted)]">{label}</div>

      <div
        className={
          danger
            ? 'mt-1 text-[12px] font-semibold text-[var(--cf-red)]'
            : 'mt-1 text-[12px] font-semibold text-[var(--cf-text)]'
        }
      >
        <CrmMoneyPair value={value} displayMode="dual" />
      </div>
    </div>
  )
}

function getInitials(name: string) {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map(part => part[0])
    .join('')
    .toUpperCase()
}

function formatManagerValue(client: CRMClient) {
  const currentManager = client.assignedSellerName ?? '—'
  const historyCount = client.managerHistory?.length ?? 0
  const previousCount = Math.max(historyCount - 1, 0)

  if (previousCount <= 0) return currentManager

  return `${currentManager} · +${previousCount}`
}

function getLatestActiveDeal(client: CRMClient) {
  const activeDeals = client.deals.filter(
    deal =>
      deal.status !== 'won' &&
      deal.status !== 'lost' &&
      deal.status !== 'cancelled'
  )

  return [...activeDeals].sort(
    (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
  )[0]
}
