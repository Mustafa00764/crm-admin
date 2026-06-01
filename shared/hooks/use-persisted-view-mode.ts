'use client'

import * as React from 'react'

export type PersistedViewMode = 'table' | 'cards'

const VIEW_MODE_STORAGE_EVENT = 'crm:view-mode-storage-change'

function readViewMode(key: string, defaultValue: PersistedViewMode) {
  if (typeof window === 'undefined') {
    return defaultValue
  }

  const saved = window.localStorage.getItem(key)

  if (saved === 'table' || saved === 'cards') {
    return saved
  }

  return defaultValue
}

export function usePersistedViewMode(
  key: string,
  defaultValue: PersistedViewMode = 'table'
) {
  const subscribe = React.useCallback(
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
      window.addEventListener(VIEW_MODE_STORAGE_EVENT, handleCustomStorage)

      return () => {
        window.removeEventListener('storage', handleStorage)
        window.removeEventListener(
          VIEW_MODE_STORAGE_EVENT,
          handleCustomStorage
        )
      }
    },
    [key]
  )

  const getSnapshot = React.useCallback(() => {
    return readViewMode(key, defaultValue)
  }, [key, defaultValue])

  const getServerSnapshot = React.useCallback(() => {
    return defaultValue
  }, [defaultValue])

  const viewMode = React.useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot
  )

  const setViewMode = React.useCallback(
    (nextViewMode: PersistedViewMode) => {
      if (typeof window === 'undefined') return

      window.localStorage.setItem(key, nextViewMode)

      window.dispatchEvent(
        new CustomEvent(VIEW_MODE_STORAGE_EVENT, {
          detail: { key }
        })
      )
    },
    [key]
  )

  return [viewMode, setViewMode] as const
}