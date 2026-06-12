'use client'

import { PublicChatWidget } from '@/features/public-chat/ui/public-chat-widget'
import { AdminNavMenu } from './admin-nav-menu'
import { AdminSidebar } from './admin-sidebar'
import { useEffect } from 'react'
import { notFound } from 'next/navigation'

type AdminShellProps = {
  children: React.ReactNode
}

export function AdminShell({ children }: AdminShellProps) {
  const isLogin = localStorage.getItem('login') === 'F4@xN8!wP3#sY7qD' || false

  useEffect(() => {
    localStorage.setItem('login', '')
  }, [])

  if (!isLogin) {
    notFound()
  }

  return (
    <div className="crm-page min-h-screen h-auto pb-24 lg:pb-0">
      <div className="flex relative min-h-screen">
        <AdminSidebar />
        <main className="min-w-0 h-full flex-1">{children}</main>
      </div>
      <AdminNavMenu />

      <PublicChatWidget siteId={'default'} theme={'light'} pageUrl={''} />
    </div>
  )
}
