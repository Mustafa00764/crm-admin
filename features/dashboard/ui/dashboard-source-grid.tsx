import type { CurrencyDisplayMode } from '@/entities/crm/types'
import type {
  DashboardBotItem,
  DashboardChannelItem,
  DashboardWebsiteItem
} from '../model/dashboard-types'
import { CrmMoneyPair } from '@/shared/ui/crm-money-pair'
import { formatNumber } from '@/shared/lib/format-number'
import { cn } from '@/shared/lib/cn'
import { Badge } from '@/shared/ui/badge'
import { Bot, Globe2, MessageSquare } from 'lucide-react'

type DashboardSourceGridProps = {
  channels: DashboardChannelItem[]
  websites: DashboardWebsiteItem[]
  bots: DashboardBotItem[]
  displayMode: CurrencyDisplayMode
}

export function DashboardSourceGrid({
  channels,
  websites,
  bots,
  displayMode
}: DashboardSourceGridProps) {
  return (
    <div className="grid gap-3 xl:grid-cols-3">
      <section className="cf-panel p-3">
        <PanelTitle
          icon={<MessageSquare className="h-4 w-4" />}
          title="Лиды по каналам"
        />

        <div className="mt-3 space-y-2">
          {channels.map(item => (
            <div key={item.channel} className="cf-panel-soft p-3">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <Badge className="bg-[var(--cf-button)] text-[var(--cf-text)]">
                      {getChannelLabel(item.channel)}
                    </Badge>
                    <span className="text-[12px] font-medium text-[var(--cf-text)]">
                      {item.label}
                    </span>
                  </div>

                  <div className="mt-2 text-[11px] text-[var(--cf-text-muted)]">
                    {formatNumber(item.leads)} лидов ·{' '}
                    {formatNumber(item.orders)} заказов
                  </div>
                </div>

                <div className="text-[12px] font-semibold text-[var(--cf-text)]">
                  {item.conversionPercent}%
                </div>
              </div>

              <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-[var(--cf-element)]">
                <div
                  className="h-full rounded-full bg-[var(--cf-blue)]"
                  style={{ width: `${Math.min(item.conversionPercent, 100)}%` }}
                />
              </div>

              <div className="mt-3 text-[12px] font-medium text-[var(--cf-text)]">
                <CrmMoneyPair value={item.revenue} displayMode={displayMode} />
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="cf-panel p-3">
        <PanelTitle
          icon={<Globe2 className="h-4 w-4" />}
          title="Выручка по сайтам"
        />

        <div className="mt-3 space-y-2">
          {websites.map(site => (
            <div key={site.id} className="cf-panel-soft p-3">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span
                      className={cn(
                        'h-2 w-2 shrink-0 rounded-full',
                        getStatusDotClass(site.status)
                      )}
                    />
                    <span className="truncate text-[12px] font-medium text-[var(--cf-text)]">
                      {site.domain}
                    </span>
                  </div>

                  <div className="mt-2 text-[11px] text-[var(--cf-text-muted)]">
                    {formatNumber(site.visits)} visits ·{' '}
                    {formatNumber(site.leads)} leads ·{' '}
                    {formatNumber(site.orders)} orders
                  </div>
                </div>

                <Badge className="bg-[var(--cf-button)] text-[var(--cf-text)]">
                  {site.conversionPercent}%
                </Badge>
              </div>

              <div className="mt-3 text-[12px] font-medium text-[var(--cf-text)]">
                <CrmMoneyPair value={site.revenue} displayMode={displayMode} />
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="cf-panel p-3">
        <PanelTitle
          icon={<Bot className="h-4 w-4" />}
          title="Выручка по ботам"
        />

        <div className="mt-3 space-y-2">
          {bots.map(bot => (
            <div key={bot.id} className="cf-panel-soft p-3">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span
                      className={cn(
                        'h-2 w-2 shrink-0 rounded-full',
                        getStatusDotClass(bot.status)
                      )}
                    />
                    <span className="truncate text-[12px] font-medium text-[var(--cf-text)]">
                      {bot.name}
                    </span>
                  </div>

                  <div className="mt-2 text-[11px] text-[var(--cf-text-muted)]">
                    {getChannelLabel(bot.channel)} · in{' '}
                    {formatNumber(bot.incomingMessages)} · out{' '}
                    {formatNumber(bot.outgoingMessages)}
                  </div>
                </div>

                <Badge
                  className={
                    bot.errors > 0
                      ? 'bg-[var(--cf-red)] text-white'
                      : 'bg-[var(--cf-button)]'
                  }
                >
                  errors: {bot.errors}
                </Badge>
              </div>

              <div className="mt-3 grid grid-cols-2 gap-2 text-[11px] text-[var(--cf-text-muted)]">
                <div>
                  AI replies
                  <div className="mt-1 text-[12px] font-medium text-[var(--cf-text)]">
                    {formatNumber(bot.aiReplies)}
                  </div>
                </div>

                <div>
                  Manual
                  <div className="mt-1 text-[12px] font-medium text-[var(--cf-text)]">
                    {formatNumber(bot.manualReplies)}
                  </div>
                </div>
              </div>

              <div className="mt-3 text-[12px] font-medium text-[var(--cf-text)]">
                <CrmMoneyPair value={bot.revenue} displayMode={displayMode} />
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}

function PanelTitle({ icon, title }: { icon: React.ReactNode; title: string }) {
  return (
    <div className="flex items-center gap-2 text-[13px] font-semibold text-[var(--cf-text)]">
      <span className="text-[var(--cf-icon)]">{icon}</span>
      {title}
    </div>
  )
}

function getStatusDotClass(status: 'active' | 'warning' | 'error') {
  if (status === 'active') return 'bg-[var(--cf-green)]'
  if (status === 'warning') return 'bg-[var(--cf-yellow)]'
  return 'bg-[var(--cf-red)]'
}

function getChannelLabel(channel: string) {
  const labels: Record<string, string> = {
    website_chat: 'Site chat',
    telegram: 'Telegram',
    whatsapp: 'WhatsApp',
    email: 'Email',
    website_form: 'Form',
    phone: 'Phone',
    manual: 'Manual',
    instagram: 'Instagram',
    vk: 'VK',
    avito: 'Avito',
    custom: 'Custom'
  }

  return labels[channel] ?? channel
}
