'use client'

import { cn } from '@/shared/lib/cn'
import { CrmMoneyPair } from '@/shared/ui/crm-money-pair'
import { SelectCheckbox } from '@/shared/ui/select-checkbox'
import type { PaymentRow } from '../model/payments-types'
import { PaymentStatusSelect } from './payment-status-select'
import { PaymentRowActionsMenu } from './payment-row-actions-menu'

type PaymentsTableProps = {
  payments: PaymentRow[]
  selectedPaymentId: string | null
  selectedPaymentIds: string[]
  onSelect: (paymentId: string) => void
  onTogglePayment: (paymentId: string) => void
  onToggleAll: () => void
}

export function PaymentsTable({
  payments,
  selectedPaymentId,
  selectedPaymentIds,
  onSelect,
  onTogglePayment,
  onToggleAll
}: PaymentsTableProps) {
const allSelected =
  payments.length > 0 &&
  payments.every(row => selectedPaymentIds.includes(row.id))

  return (
    <section className="cf-panel flex-1 flex flex-col justify-between min-h-full h-full overflow-hidden">
      <div className="min-h-full flex-1 overflow-auto">
        <table className="w-max min-w-[1540px] border-separate border-spacing-0">
          <thead>
            <tr>
              <th className="sticky left-0 top-0 z-50 h-9 w-[52px] min-w-[52px] bg-[var(--cf-panel-soft)] px-3 text-left">
                <SelectCheckbox checked={allSelected} onCheckedChange={onToggleAll} />
              </th>

              <th className="sticky left-[52px] top-0 z-50 h-9 w-[56px] min-w-[56px] bg-[var(--cf-panel-soft)] px-3 text-left text-[11px] text-[var(--cf-text-muted)] shadow-[2px_0_2px_rgba(0,0,0,0.05)]">
                #
              </th>

              <Head className="min-w-[130px]">payment</Head>
              <Head className="min-w-[130px]">order</Head>
              <Head className="min-w-[210px]">client</Head>
              <Head className="min-w-[150px]">phone</Head>
              <Head className="min-w-[160px]">manager</Head>
              <Head className="min-w-[150px]">status</Head>
              <Head className="min-w-[140px]">method</Head>
              <Head className="min-w-[170px]">amount</Head>
              <Head className="min-w-[170px]">order paid</Head>
              <Head className="min-w-[170px]">remaining</Head>
              <Head className="min-w-[140px]">channel</Head>
              <Head className="min-w-[160px]">paid at</Head>

              <th className="sticky right-0 top-0 z-50 h-9 w-[74px] min-w-[74px] bg-[var(--cf-panel-soft)] px-3 text-center text-[11px] text-[var(--cf-text-muted)] shadow-[-2px_0_2px_rgba(0,0,0,0.05)]">
                options
              </th>
            </tr>
          </thead>

          <tbody>
            {payments.map((row, index) => {
              const checked = selectedPaymentIds.includes(row.id)

              return (
                <tr
                  key={row.id}
                  onClick={() => onSelect(row.id)}
                  className={cn(
                    'group cursor-pointer',
                    selectedPaymentId === row.id && 'is-selected'
                  )}
                >
                  <Cell className="sticky left-0 z-30 w-[52px] min-w-[52px] group-hover:bg-[var(--cf-table-row-hover)]">
                    <div
                      onClick={event => event.stopPropagation()}
                      onPointerDown={event => event.stopPropagation()}
                    >
                      <SelectCheckbox
                        checked={checked}
                        onCheckedChange={() => onTogglePayment(row.id)}
                      />
                    </div>
                  </Cell>

                  <Cell className="sticky left-[52px] z-30 w-[56px] min-w-[56px] shadow-[2px_0_2px_rgba(0,0,0,0.05)] group-hover:bg-[var(--cf-table-row-hover)]">
                    {index + 1}
                  </Cell>

                  <Cell className="min-w-[130px]">{row.payment.id}</Cell>
                  <Cell className="min-w-[130px]">{row.orderNumber}</Cell>

                  <Cell className="min-w-[210px] max-w-[210px]">
                    <div className="truncate font-medium">{row.clientName}</div>
                    <div className="truncate text-[10px] opacity-60">
                      {row.companyName ?? row.city ?? '—'}
                    </div>
                  </Cell>

                  <Cell className="min-w-[150px]">{row.phone ?? '—'}</Cell>
                  <Cell className="min-w-[160px]">{row.managerName}</Cell>

                  <Cell className="min-w-[150px]">
                    <PaymentStatusSelect row={row} variant="table" />
                  </Cell>

                  <Cell className="min-w-[140px]">{row.payment.method}</Cell>

                  <Cell className="min-w-[170px]">
                    <CrmMoneyPair value={row.payment.amount} displayMode="dual" />
                  </Cell>

                  <Cell className="min-w-[170px]">
                    <CrmMoneyPair value={row.orderPaidAmount} displayMode="dual" />
                  </Cell>

                  <Cell className="min-w-[170px]">
                    <CrmMoneyPair
                      value={row.orderRemainingAmount}
                      displayMode="dual"
                    />
                  </Cell>

                  <Cell className="min-w-[140px]">{row.channel}</Cell>
                  <Cell className="min-w-[160px]">{row.payment.paidAt ?? '—'}</Cell>

                  <Cell className="sticky right-0 z-30 w-[74px] min-w-[74px] text-center shadow-[-2px_0_2px_rgba(0,0,0,0.05)] group-hover:bg-[var(--cf-table-row-hover)]">
                    <PaymentRowActionsMenu row={row} onOpen={() => onSelect(row.id)} />
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