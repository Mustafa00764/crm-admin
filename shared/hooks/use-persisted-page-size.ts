'use client'

import { useCallback, useSyncExternalStore } from "react"


const PAGE_SIZE_STORAGE_EVENT = 'crm:page-size-storage-change'

const allowedPageSizes = [10, 20, 30, 50] as const

export type PersistedPageSize = (typeof allowedPageSizes)[number]

function readPageSize(key: string, defaultValue: PersistedPageSize) {
  if (typeof window === 'undefined') {
    return defaultValue
  }

  const saved = Number(window.localStorage.getItem(key))

  if (allowedPageSizes.includes(saved as PersistedPageSize)) {
    return saved as PersistedPageSize
  }

  return defaultValue
}

export function usePersistedPageSize(
  key: string,
  defaultValue: PersistedPageSize = 20
) {
  const subscribe = useCallback(
    (onStoreChange: () => void) => {
      const handleStorage = (event: StorageEvent) => {
        if (event.key === key) {
          onStoreChange()
        }
      }

      const handleCustomStorage = (event: Event) => {
        const customEvent = event as CustomEvent<{ key: string }>

        if (customEvent.detail?.key === key) {
          onStoreChange()
        }
      }

      window.addEventListener('storage', handleStorage)
      window.addEventListener(PAGE_SIZE_STORAGE_EVENT, handleCustomStorage)

      return () => {
        window.removeEventListener('storage', handleStorage)
        window.removeEventListener(
          PAGE_SIZE_STORAGE_EVENT,
          handleCustomStorage
        )
      }
    },
    [key]
  )

  const getSnapshot = useCallback(() => {
    return readPageSize(key, defaultValue)
  }, [key, defaultValue])

  const getServerSnapshot = useCallback(() => {
    return defaultValue
  }, [defaultValue])

  const pageSize = useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot
  )

  const setPageSize = useCallback(
    (nextPageSize: PersistedPageSize) => {
      if (typeof window === 'undefined') return

      window.localStorage.setItem(key, String(nextPageSize))

      window.dispatchEvent(
        new CustomEvent(PAGE_SIZE_STORAGE_EVENT, {
          detail: { key }
        })
      )
    },
    [key]
  )

  return [pageSize, setPageSize] as const
}