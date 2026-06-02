'use client'

import {
  useEffect,
  useState,
  useSyncExternalStore,
  type ReactNode
} from 'react'

type AdminPageHeaderProps = {
  title: string
  actions?: ReactNode
}

export function AdminPageHeader({ title, actions }: AdminPageHeaderProps) {
  const [time, setTime] = useState(new Date())

  useEffect(() => {
    const interval = setInterval(() => {
      setTime(new Date())
    }, 1000)

    return () => clearInterval(interval)
  }, [])

  return (
    <header className="sticky top-0 z-50 h-13 border-b border-[var(--cf-border)] bg-[var(--cf-bg)] px-5">
      <div className="flex h-full items-center justify-between gap-4">
        <div className="truncate text-[13px] font-medium text-[var(--cf-text-muted)]">
          {title}
        </div>

        <div className="flex items-center gap-2">
          <div className="hidden text-[12px] text-[var(--cf-text-muted)] xl:block">
            server time: <ClientHeaderClock />
          </div>

          {actions}
        </div>
      </div>
    </header>
  )
}

function subscribeClock(onStoreChange: () => void) {
  const timeoutId = window.setTimeout(onStoreChange, 0)
  const intervalId = window.setInterval(onStoreChange, 1000)

  return () => {
    window.clearTimeout(timeoutId)
    window.clearInterval(intervalId)
  }
}

function getClockSnapshot() {
  return new Date().toLocaleString('ru-RU')
}

function getServerClockSnapshot() {
  return '--.--.----, --:--:--'
}

function ClientHeaderClock() {
  const time = useSyncExternalStore(
    subscribeClock,
    getClockSnapshot,
    getServerClockSnapshot
  )

  return (
    <div className="hidden text-[12px] text-[var(--cf-text-muted)] md:block">
      {time}
    </div>
  )
}
