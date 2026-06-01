'use client'

import { ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/shared/lib/cn'

function getVisiblePages(currentPage: number, totalPages: number) {
  const pages: Array<number | 'ellipsis-left' | 'ellipsis-right'> = []

  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, index) => index + 1)
  }

  pages.push(1)

  if (currentPage > 4) {
    pages.push('ellipsis-left')
  }

  const start = Math.max(2, currentPage - 1)
  const end = Math.min(totalPages - 1, currentPage + 1)

  for (let page = start; page <= end; page += 1) {
    pages.push(page)
  }

  if (currentPage < totalPages - 3) {
    pages.push('ellipsis-right')
  }

  pages.push(totalPages)

  return pages
}

export function ListPageNavigation({
  page,
  totalPages,
  onPageChange
}: {
  page: number
  totalPages: number
  onPageChange: (page: number) => void
}) {
  const safeTotalPages = Math.max(1, totalPages)
  const safePage = Math.min(Math.max(1, page), safeTotalPages)
  const visiblePages = getVisiblePages(safePage, safeTotalPages)

  return (
    <div className="flex items-center gap-1">
      <button
        type="button"
        disabled={safePage <= 1}
        className="h-8 rounded-md bg-[var(--cf-element)] px-3 text-[12px] text-[var(--cf-text)] hover:bg-[var(--cf-element-hover)] disabled:cursor-not-allowed disabled:opacity-50"
        onClick={() => onPageChange(1)}
      >
        First
      </button>

      <button
        type="button"
        disabled={safePage <= 1}
        className="flex h-8 w-8 items-center justify-center rounded-md bg-[var(--cf-element)] text-[var(--cf-text)] hover:bg-[var(--cf-element-hover)] disabled:cursor-not-allowed disabled:opacity-50"
        onClick={() => onPageChange(Math.max(1, safePage - 1))}
      >
        <ChevronLeft className="h-4 w-4" />
      </button>

      {visiblePages.map(item => {
        if (typeof item !== 'number') {
          return (
            <span
              key={item}
              className="flex h-8 min-w-8 items-center justify-center rounded-md px-2 text-[12px] text-[var(--cf-text-muted)]"
            >
              ...
            </span>
          )
        }

        const active = item === safePage

        return (
          <button
            key={item}
            type="button"
            className={cn(
              'h-8 min-w-8 rounded-md px-3 text-[12px] transition',
              active
                ? 'bg-[var(--cf-button)] text-[var(--cf-text)]'
                : 'bg-[var(--cf-element)] text-[var(--cf-text)] hover:bg-[var(--cf-element-hover)]'
            )}
            onClick={() => onPageChange(item)}
          >
            {item}
          </button>
        )
      })}

      <button
        type="button"
        disabled={safePage >= safeTotalPages}
        className="flex h-8 w-8 items-center justify-center rounded-md bg-[var(--cf-element)] text-[var(--cf-text)] hover:bg-[var(--cf-element-hover)] disabled:cursor-not-allowed disabled:opacity-50"
        onClick={() => onPageChange(Math.min(safeTotalPages, safePage + 1))}
      >
        <ChevronRight className="h-4 w-4" />
      </button>

      <button
        type="button"
        disabled={safePage >= safeTotalPages}
        className="h-8 rounded-md bg-[var(--cf-element)] px-3 text-[12px] text-[var(--cf-text)] hover:bg-[var(--cf-element-hover)] disabled:cursor-not-allowed disabled:opacity-50"
        onClick={() => onPageChange(safeTotalPages)}
      >
        Last
      </button>
    </div>
  )
}
