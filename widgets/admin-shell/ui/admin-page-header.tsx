"use client"

import type { ReactNode } from "react"

type AdminPageHeaderProps = {
  title: string
  actions?: ReactNode
}

export function AdminPageHeader({ title, actions }: AdminPageHeaderProps) {
  return (
    <header className="sticky top-0 z-50 h-13 border-b border-[var(--cf-border)] bg-[var(--cf-bg)] px-5">
      <div className="flex h-full items-center justify-between gap-4">
        <div className="truncate text-[13px] font-medium text-[var(--cf-text-muted)]">
          {title}
        </div>

        <div className="flex items-center gap-2">
          <div className="hidden text-[12px] text-[var(--cf-text-muted)] xl:block">
            server time: {new Date().toLocaleString("ru-RU")}
          </div>

          {actions}
        </div>
      </div>
    </header>
  )
}