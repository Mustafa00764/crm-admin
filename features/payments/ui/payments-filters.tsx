'use client'

import { Search } from 'lucide-react'
import type { ChannelType } from '@/entities/crm/types'
import type {
  PaymentFilters,
  PaymentMethod,
  PaymentStatus
} from '../model/payments-types'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/shared/ui/select'

export function PaymentsFilters({
  filters,
  onChange
}: {
  filters: PaymentFilters
  onChange: (payload: Partial<PaymentFilters>) => void
}) {
  return (
    <section className="space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        <SmallSelect
          value={filters.status}
          className="w-[145px]"
          onValueChange={value =>
            onChange({ status: value as PaymentStatus | 'all' })
          }
          items={[
            ['all', 'All statuses'],
            ['pending', 'Pending'],
            ['confirmed', 'Confirmed'],
            ['cancelled', 'Cancelled'],
            ['refunded', 'Refunded']
          ]}
        />

        <SmallSelect
          value={filters.method}
          className="w-[150px]"
          onValueChange={value =>
            onChange({ method: value as PaymentMethod | 'all' })
          }
          items={[
            ['all', 'All methods'],
            ['cash', 'Cash'],
            ['bank_transfer', 'Bank transfer'],
            ['card', 'Card'],
            ['online', 'Online'],
            ['invoice', 'Invoice'],
            ['other', 'Other']
          ]}
        />

        <SmallSelect
          value={filters.managerId}
          className="w-[150px]"
          onValueChange={value => onChange({ managerId: value })}
          items={[
            ['all', 'All managers'],
            ['u_001', 'Максим Орлов'],
            ['u_002', 'Анна Смирнова'],
            ['u_003', 'Игорь Ким']
          ]}
        />

        <SmallSelect
          value={filters.channel}
          className="w-[140px]"
          onValueChange={value =>
            onChange({ channel: value as ChannelType | 'all' })
          }
          items={[
            ['all', 'All channels'],
            ['telegram', 'Telegram'],
            ['whatsapp', 'WhatsApp'],
            ['website_chat', 'Website chat'],
            ['phone', 'Phone'],
            ['manual', 'Manual']
          ]}
        />

        <input
          className="cf-control w-[120px] px-3 outline-none placeholder:text-[var(--cf-text-muted)]"
          placeholder="Amount from"
          value={filters.amountFrom}
          onChange={event => onChange({ amountFrom: event.target.value })}
        />

        <input
          className="cf-control w-[120px] px-3 outline-none placeholder:text-[var(--cf-text-muted)]"
          placeholder="Amount to"
          value={filters.amountTo}
          onChange={event => onChange({ amountTo: event.target.value })}
        />
      </div>

      <div className="relative w-full max-w-[420px]">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--cf-icon)]" />

        <input
          className="cf-control w-full pl-9 pr-3 outline-none placeholder:text-[var(--cf-text-muted)]"
          placeholder="Search payment, order, client, phone..."
          value={filters.search}
          onChange={event => onChange({ search: event.target.value })}
        />
      </div>
    </section>
  )
}

function SmallSelect({
  value,
  items,
  onValueChange,
  className
}: {
  value: string
  items: Array<[string, string]>
  onValueChange: (value: string) => void
  className: string
}) {
  return (
    <Select value={value} onValueChange={onValueChange}>
      <SelectTrigger className={`cf-control ${className} px-3 shadow-none`}>
        <SelectValue />
      </SelectTrigger>

      <SelectContent className="cf-panel">
        {items.map(([itemValue, label]) => (
          <SelectItem key={itemValue} value={itemValue}>
            {label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}