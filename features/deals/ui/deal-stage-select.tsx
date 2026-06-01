'use client'

import * as React from 'react'
import type { CRMDeal, DealStage } from '../model/deals-types'
import { dealStages } from '../model/deals-types'
import { useCRMStore } from '@/entities/crm/model/crm-store'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/shared/ui/select'
import { cn } from '@/shared/lib/utils'

type DealStageSelectProps = {
  deal: CRMDeal
  deals: CRMDeal[]
}

const stageDotColors: Record<DealStage, string> = {
  new: '#08b7ef',
  qualification: '#38bdf8',
  calculation: '#f59e0b',
  proposal_sent: '#a78bfa',
  negotiation: '#f97316',
  waiting_decision: '#eab308',
  won: '#22c55e',
  lost: '#ef4444',
  cancelled: '#64748b'
}

export function DealStageSelect({ deal, deals }: DealStageSelectProps) {
  const { moveDeal } = useCRMStore()
  const [pending, setPending] = React.useState(false)

  const handleChange = async (nextStage: DealStage) => {
    if (pending) return
    if (nextStage === deal.stage) return

    setPending(true)

    const targetIndex = deals.filter(
      item => item.stage === nextStage && item.id !== deal.id
    ).length

    try {
      await moveDeal(deal.id, nextStage, targetIndex)
    } finally {
      setPending(false)
    }
  }

  return (
    <div
      onClick={event => event.stopPropagation()}
      onPointerDown={event => event.stopPropagation()}
    >
      <Select
        value={deal.stage}
        disabled={pending}
        onValueChange={nextValue => void handleChange(nextValue as DealStage)}
      >
        <SelectTrigger
          className={cn(
            'h-7 w-full border px-2 text-[11px] text-(--cf-table-text) border-(--cf-table-text)/15 outline-none focus:ring-0 focus:ring-offset-0 focus-visible:border-(--cf-table-text)/30 disabled:cursor-not-allowed disabled:opacity-60 [&_svg]:text-(--cf-table-text)/80'
          )}
        >
          <span className="flex min-w-0 items-center gap-2">
            <span className="min-w-0 truncate">
              <SelectValue placeholder="Stage" />
            </span>
          </span>
        </SelectTrigger>

        <SelectContent className="border border-[var(--cf-border)] bg-[var(--cf-bg)] text-[var(--cf-text)]">
          {dealStages.map(stage => (
            <SelectItem
              key={stage.value}
              value={stage.value}
              textValue={stage.label}
              className="text-[11px] focus:bg-[var(--cf-element-hover)] focus:text-[var(--cf-text)]"
            >
              <span className="flex items-center gap-2">
                <span
                  className="h-2 w-2 shrink-0 rounded-full"
                  style={{ backgroundColor: stageDotColors[stage.value] }}
                />

                <span>{stage.label}</span>
              </span>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}
