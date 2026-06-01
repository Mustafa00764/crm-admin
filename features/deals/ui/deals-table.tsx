'use client'

import type { CRMDeal } from '../model/deals-types'
import { cn } from '@/shared/lib/cn'
import { CrmMoneyPair } from '@/shared/ui/crm-money-pair'
import { SelectCheckbox } from '@/shared/ui/select-checkbox'
import { DealRowActionsMenu } from './deal-row-actions-menu'
import { DealStageSelect } from './deal-stage-select'

type DealsTableProps = {
  deals: CRMDeal[]
  allDeals: CRMDeal[]
  selectedDealId: string | null
  selectedDealIds: string[]
  onSelect: (dealId: string) => void
  onToggleDeal: (dealId: string) => void
  onToggleAll: () => void
}

export function DealsTable({
  deals,
  allDeals,
  selectedDealId,
  selectedDealIds,
  onSelect,
  onToggleDeal,
  onToggleAll
}: DealsTableProps) {
  const allSelected =
    deals.length > 0 && deals.every(deal => selectedDealIds.includes(deal.id))

  return (
    <section className="cf-panel flex-1 min-h-0 overflow-hidden">
      <div className="h-full  overflow-auto">
        <table className="w-max min-w-[1540px] border-separate border-spacing-0">
          <thead>
            <tr>
              <th className="sticky left-0 top-0 z-50 h-9 w-[52px] min-w-[52px] bg-[var(--cf-panel-soft)] px-3 text-left ">
                <SelectCheckbox
                  checked={allSelected}
                  onCheckedChange={onToggleAll}
                />
              </th>

              <th className="sticky left-[52px] top-0 z-50 h-9 w-[56px] min-w-[56px] bg-[var(--cf-panel-soft)] px-3 text-left text-[11px] text-[var(--cf-text-muted)] shadow-[2px_0_2px_rgba(0,0,0,0.05)]">
                #
              </th>

              <Head className="min-w-[120px]">number</Head>
              <Head className="min-w-[240px]">deal</Head>
              <Head className="min-w-[190px]">client</Head>
              <Head className="min-w-[150px]">phone</Head>
              <Head className="min-w-[160px]">manager</Head>
              <Head className="min-w-[150px]">stage</Head>
              <Head className="min-w-[120px]">priority</Head>
              <Head className="min-w-[160px]">amount</Head>
              <Head className="min-w-[160px]">final</Head>
              <Head className="min-w-[120px]">probability</Head>
              <Head className="min-w-[140px]">source</Head>
              <Head className="min-w-[140px]">channel</Head>
              <Head className="min-w-[160px]">next contact</Head>

              <th className="sticky right-0 top-0 z-50 h-9 w-[74px] min-w-[74px] bg-[var(--cf-panel-soft)] px-3 text-center text-[11px] text-[var(--cf-text-muted)] shadow-[-2px_0_2px_rgba(0,0,0,0.05)]">
                options
              </th>
            </tr>
          </thead>

          <tbody>
            {deals.map((deal, index) => {
              const checked = selectedDealIds.includes(deal.id)

              return (
                <tr
                  key={deal.id}
                  onClick={() => onSelect(deal.id)}
                  className={cn(
                    'group cursor-pointer',
                    selectedDealId === deal.id && 'is-selected'
                  )}
                >
                  <Cell className="sticky left-0 z-30 w-[52px] min-w-[52px] group-hover:bg-[var(--cf-table-row-hover)] ">
                    <div
                      onClick={event => event.stopPropagation()}
                      onKeyDown={event => event.stopPropagation()}
                    >
                      <SelectCheckbox
                        checked={checked}
                        onCheckedChange={() => onToggleDeal(deal.id)}
                      />
                    </div>
                  </Cell>

                  <Cell className="sticky left-[52px] z-30 w-[56px] min-w-[56px] group-hover:bg-[var(--cf-table-row-hover)] shadow-[2px_0_2px_rgba(0,0,0,0.05)]">
                    {index + 1}
                  </Cell>

                  <Cell className="min-w-[120px]">{deal.dealNumber}</Cell>

                  <Cell className="min-w-[240px] max-w-[240px]">
                    <div className="truncate font-medium">{deal.title}</div>
                    <div className="truncate text-[10px] opacity-60">
                      {deal.productInterest}
                    </div>
                  </Cell>

                  <Cell className="min-w-[190px] max-w-[190px]">
                    <div className="truncate font-medium">
                      {deal.clientName}
                    </div>
                    <div className="truncate text-[10px] opacity-60">
                      {deal.companyName ?? deal.city ?? '—'}
                    </div>
                  </Cell>

                  <Cell className="min-w-[150px]">{deal.phone ?? '—'}</Cell>
                  <Cell className="min-w-[160px]">
                    {deal.managerName ?? '—'}
                  </Cell>

                  <Cell className="min-w-[150px]">
                    <DealStageSelect deal={deal} deals={allDeals} />
                  </Cell>

                  <Cell className="min-w-[120px]">{deal.priority}</Cell>

                  <Cell className="min-w-[160px]">
                    <CrmMoneyPair value={deal.amount} displayMode="dual" />
                  </Cell>

                  <Cell className="min-w-[160px]">
                    <CrmMoneyPair value={deal.finalAmount} displayMode="dual" />
                  </Cell>

                  <Cell className="min-w-[120px]">{deal.probability}%</Cell>
                  <Cell className="min-w-[140px]">{deal.source}</Cell>
                  <Cell className="min-w-[140px]">{deal.channel}</Cell>
                  <Cell className="min-w-[160px]">
                    {deal.nextContactAt ?? '—'}
                  </Cell>

                  <Cell className="sticky right-0 z-30 w-[74px] min-w-[74px] text-center shadow-[-2px_0_2px_rgba(0,0,0,0.05)] group-hover:bg-[var(--cf-table-row-hover)]">
                    <DealRowActionsMenu deal={deal} />
                  </Cell>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </section>
  )
}

function Head({
  children,
  className
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <th
      className={cn(
        'sticky top-0 z-40 h-9 bg-[var(--cf-panel-soft)] px-3 text-left text-[11px] font-medium text-[var(--cf-text-muted)]',
        className
      )}
    >
      {children}
    </th>
  )
}

function Cell({
  children,
  className
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <td
      className={cn(
        'h-[42px] border-b border-[rgba(255,255,255,0.06)] bg-[var(--cf-table-row)] px-3 text-[12px] text-[var(--cf-table-text)] transition group-even:bg-[var(--cf-table-row-alt)] group-hover:bg-[var(--cf-table-row-hover)]',
        className
      )}
    >
      {children}
    </td>
  )
}
