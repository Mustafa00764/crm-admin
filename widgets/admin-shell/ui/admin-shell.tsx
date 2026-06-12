'use client'

import { PublicChatWidget } from '@/features/public-chat/ui/public-chat-widget'
import { AdminNavMenu } from './admin-nav-menu'
import { AdminSidebar } from './admin-sidebar'
import { useRouter } from 'next/router'
import { useEffect, useSyncExternalStore } from 'react'
// import { useEffect } from 'react'
// import { notFound } from 'next/navigation'

type AdminShellProps = {
  children: React.ReactNode
}

const ADMIN_PASSWORD = 'F4@xN8!wP3#sY7qD'

function subscribe() {
  return () => {}
}

function getSnapshot() {
  if (typeof window === 'undefined') return false

  return localStorage.getItem('login') === ADMIN_PASSWORD
}

function getServerSnapshot() {
  return false
}

export function AdminShell({ children }: AdminShellProps) {
  const router = useRouter()
  const isLogin = useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot
  )

  useEffect(() => {
    if (!isLogin) {
      router.replace('/')
    }
  }, [isLogin, router])

  if (!isLogin) {
    return null
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
