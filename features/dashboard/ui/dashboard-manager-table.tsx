import type { CurrencyDisplayMode } from '@/entities/crm/types'
import type { DashboardManagerRow } from '../model/dashboard-types'
import { CrmMoneyPair } from '@/shared/ui/crm-money-pair'
import { formatNumber } from '@/shared/lib/format-number'
import { Badge } from '@/shared/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/shared/ui/table'
import { ScrollArea, ScrollBar } from '@/shared/ui/scroll-area'
import { Users } from 'lucide-react'

type DashboardManagerTableProps = {
  data: DashboardManagerRow[]
  displayMode: CurrencyDisplayMode
}

export function DashboardManagerTable({
  data,
  displayMode
}: DashboardManagerTableProps) {
  return (
    <section className="cf-panel w-auto flex-1 p-3">
      <div className="mb-3 flex items-center gap-2 text-[13px] font-semibold text-[var(--cf-text)]">
        <Users className="h-4 w-4 text-[var(--cf-icon)]" />
        Менеджеры
      </div>

      <ScrollArea className="w-full">
        <Table className="min-w-[980px] overflow-hidden rounded-md">
          <TableHeader>
            <TableRow className="border-none bg-[var(--cf-panel-soft)] hover:bg-[var(--cf-panel-soft)]">
              <TableHead className="h-9 text-[11px] text-[var(--cf-text-muted)]">
                #
              </TableHead>
              <TableHead className="h-9 text-[11px] text-[var(--cf-text-muted)]">
                Менеджер
              </TableHead>
              <TableHead className="h-9 text-[11px] text-[var(--cf-text-muted)]">
                Клиенты
              </TableHead>
              <TableHead className="h-9 text-[11px] text-[var(--cf-text-muted)]">
                Чаты
              </TableHead>
              <TableHead className="h-9 text-[11px] text-[var(--cf-text-muted)]">
                Сделки
              </TableHead>
              <TableHead className="h-9 text-[11px] text-[var(--cf-text-muted)]">
                Заказы
              </TableHead>
              <TableHead className="h-9 text-[11px] text-[var(--cf-text-muted)]">
                Выручка
              </TableHead>
              <TableHead className="h-9 text-[11px] text-[var(--cf-text-muted)]">
                Оплачено
              </TableHead>
              <TableHead className="h-9 text-[11px] text-[var(--cf-text-muted)]">
                Долг
              </TableHead>
              <TableHead className="h-9 text-[11px] text-[var(--cf-text-muted)]">
                Конв.
              </TableHead>
              <TableHead className="h-9 text-[11px] text-[var(--cf-text-muted)]">
                Ответ
              </TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {data.map((manager, index) => (
              <TableRow
                key={manager.id}
                className="border-none odd:bg-[var(--cf-table-row)] even:bg-[var(--cf-table-row-alt)] hover:opacity-95 hover:bg-[var(--cf-table-row-alt)]/95 transition-all"
              >
                <TableCell className="h-10 text-[12px] text-[var(--cf-table-text)]">
                  {index + 1}
                </TableCell>

                <TableCell className="h-10 text-[12px] text-[var(--cf-table-text)]">
                  <div className="flex items-center gap-2">
                    <div className="flex h-7 w-7 items-center justify-center rounded-full bg-zinc-800 text-[10px] text-white">
                      {getInitials(manager.fullName)}
                    </div>

                    <div>
                      <div className="font-medium">{manager.fullName}</div>
                      <div className="text-[10px] opacity-60">
                        {manager.role}
                      </div>
                    </div>
                  </div>
                </TableCell>

                <TableCell className="h-10 text-[12px] text-[var(--cf-table-text)]">
                  {formatNumber(manager.clients)}
                </TableCell>
                <TableCell className="h-10 text-[12px] text-[var(--cf-table-text)]">
                  {formatNumber(manager.chats)}
                </TableCell>
                <TableCell className="h-10 text-[12px] text-[var(--cf-table-text)]">
                  {formatNumber(manager.deals)}
                </TableCell>
                <TableCell className="h-10 text-[12px] text-[var(--cf-table-text)]">
                  {formatNumber(manager.orders)}
                </TableCell>

                <TableCell className="h-10 text-[12px] text-[var(--cf-table-text)]">
                  <CrmMoneyPair
                    value={manager.revenue}
                    displayMode={displayMode}
                  />
                </TableCell>

                <TableCell className="h-10 text-[12px] text-[var(--cf-table-text)]">
                  <CrmMoneyPair
                    value={manager.paid}
                    displayMode={displayMode}
                  />
                </TableCell>

                <TableCell className="h-10 text-[12px] text-[var(--cf-table-text)]">
                  <CrmMoneyPair
                    value={manager.debt}
                    displayMode={displayMode}
                  />
                </TableCell>

                <TableCell className="h-10 text-[12px] text-[var(--cf-table-text)]">
                  <Badge className="bg-zinc-800 text-white">
                    {manager.conversionPercent}%
                  </Badge>
                </TableCell>

                <TableCell className="h-10 text-[12px] text-[var(--cf-table-text)]">
                  {manager.averageReplyTimeSec} сек
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        <ScrollBar orientation="horizontal" />
      </ScrollArea>
    </section>
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
