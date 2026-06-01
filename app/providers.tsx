'use client'

import * as React from 'react'
import { Toaster } from '@/shared/ui/sonner'
import { TooltipProvider } from '@/shared/ui/tooltip'

type CRMTheme = 'light' | 'dark'

type ThemeContextValue = {
  theme: CRMTheme
  setTheme: (theme: CRMTheme) => void
  toggleTheme: () => void
}

type ProvidersProps = {
  children: React.ReactNode
}

const DEFAULT_THEME: CRMTheme = 'dark'
const THEME_STORAGE_KEY = 'crm.theme'
const THEME_STORAGE_EVENT = 'crm:theme-storage-change'

const ThemeContext = React.createContext<ThemeContextValue | null>(null)

function isCRMTheme(value: string | null): value is CRMTheme {
  return value === 'light' || value === 'dark'
}

function getThemeSnapshot(): CRMTheme {
  if (typeof window === 'undefined') {
    return DEFAULT_THEME
  }

  const storedTheme = window.localStorage.getItem(THEME_STORAGE_KEY)

  if (isCRMTheme(storedTheme)) {
    return storedTheme
  }

  return DEFAULT_THEME
}

function getServerThemeSnapshot(): CRMTheme {
  return DEFAULT_THEME
}

function applyTheme(theme: CRMTheme) {
  if (typeof document === 'undefined') return

  const root = document.documentElement

  root.classList.remove('light', 'dark')
  root.classList.add(theme)
  root.style.colorScheme = theme
}

function subscribeTheme(onStoreChange: () => void) {
  const handleStorage = (event: StorageEvent) => {
    if (event.key === THEME_STORAGE_KEY) {
      onStoreChange()
    }
  }

  const handleCustomStorage = () => {
    onStoreChange()
  }

  window.addEventListener('storage', handleStorage)
  window.addEventListener(THEME_STORAGE_EVENT, handleCustomStorage)

  return () => {
    window.removeEventListener('storage', handleStorage)
    window.removeEventListener(THEME_STORAGE_EVENT, handleCustomStorage)
  }
}

export function Providers({ children }: ProvidersProps) {
  const theme = React.useSyncExternalStore(
    subscribeTheme,
    getThemeSnapshot,
    getServerThemeSnapshot
  )

  React.useEffect(() => {
    applyTheme(theme)
  }, [theme])

  const setTheme = React.useCallback((nextTheme: CRMTheme) => {
    window.localStorage.setItem(THEME_STORAGE_KEY, nextTheme)
    applyTheme(nextTheme)
    window.dispatchEvent(new Event(THEME_STORAGE_EVENT))
  }, [])

  const toggleTheme = React.useCallback(() => {
    setTheme(theme === 'dark' ? 'light' : 'dark')
  }, [theme, setTheme])

  const value = React.useMemo<ThemeContextValue>(
    () => ({
      theme,
      setTheme,
      toggleTheme
    }),
    [theme, setTheme, toggleTheme]
  )

  return (
    <ThemeContext.Provider value={value}>
      <TooltipProvider>{children}</TooltipProvider>
      <Toaster richColors position="top-right" />
    </ThemeContext.Provider>
  )
}

export function useCRMTheme() {
  const context = React.useContext(ThemeContext)

  if (!context) {
    throw new Error('useCRMTheme must be used inside Providers')
  }

  return context
}
