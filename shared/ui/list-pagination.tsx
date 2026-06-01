'use client'

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/shared/ui/select'
import type { PersistedPageSize } from '@/shared/hooks/use-persisted-page-size'
import { ListPageNavigation } from './list-page-navigation'

const pageSizeOptions: PersistedPageSize[] = [10, 20, 30, 50]

export function ListPagination({
  page,
  pageSize,
  total,
  totalPages,
  onPageChange,
  onPageSizeChange
}: {
  page: number
  pageSize: PersistedPageSize
  total: number
  totalPages: number
  onPageChange: (page: number) => void
  onPageSizeChange: (pageSize: PersistedPageSize) => void
}) {
  const safeTotalPages = Math.max(1, totalPages)
  const safePage = Math.min(Math.max(1, page), safeTotalPages)

  const from = total === 0 ? 0 : (safePage - 1) * pageSize + 1
  const to = Math.min(safePage * pageSize, total)

  return (
    <div className="cf-panel flex items-center justify-between gap-3 px-3 py-2">
      <div className="flex items-center gap-2">
        <span className="text-[12px] text-[var(--cf-text-muted)]">
          Rows per page
        </span>

        <Select
          value={String(pageSize)}
          onValueChange={value => {
            onPageSizeChange(Number(value) as PersistedPageSize)
            onPageChange(1)
          }}
        >
          <SelectTrigger className="cf-control h-8 w-[86px] px-3 text-[12px] shadow-none">
            <SelectValue />
          </SelectTrigger>

          <SelectContent className="cf-panel">
            {pageSizeOptions.map(option => (
              <SelectItem key={option} value={String(option)}>
                {option}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <span className="text-[12px] text-[var(--cf-text-muted)]">
          {from}-{to} of {total}
        </span>
      </div>

      <ListPageNavigation
        page={safePage}
        totalPages={safeTotalPages}
        onPageChange={onPageChange}
      />
    </div>
  )
}
