'use client'

import * as React from 'react'
import {
  usePersistedPageSize,
  type PersistedPageSize
} from './use-persisted-page-size'

export function usePaginatedList<T>({
  items,
  storageKey,
  defaultPageSize = 20
}: {
  items: T[]
  storageKey: string
  defaultPageSize?: PersistedPageSize
}) {
  const [pageSize, setPersistedPageSize] = usePersistedPageSize(
    storageKey,
    defaultPageSize
  )
  const [page, setPage] = React.useState(1)

  const total = items.length
  const totalPages = Math.max(1, Math.ceil(total / pageSize))
  const safePage = Math.min(Math.max(1, page), totalPages)

  const paginatedItems = React.useMemo(() => {
    const start = (safePage - 1) * pageSize
    const end = start + pageSize

    return items.slice(start, end)
  }, [items, safePage, pageSize])

  const setPageSize = React.useCallback(
    (nextPageSize: PersistedPageSize) => {
      setPersistedPageSize(nextPageSize)
      setPage(1)
    },
    [setPersistedPageSize]
  )

  const resetPage = React.useCallback(() => {
    setPage(1)
  }, [])

  return {
    page: safePage,
    pageSize,
    total,
    totalPages,
    paginatedItems,
    setPage,
    setPageSize,
    resetPage
  }
}