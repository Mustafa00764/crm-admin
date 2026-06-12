import { AdminNavMenu } from './admin-nav-menu'
import { AdminSidebar } from './admin-sidebar'

type AdminShellProps = {
  children: React.ReactNode
}

export function AdminShell({ children }: AdminShellProps) {
  return (
    <div className="crm-page min-h-screen h-auto pb-24 lg:pb-0">
      <div className="flex relative min-h-screen">
        <AdminSidebar />
        <main className="min-w-0 h-full flex-1">{children}</main>
      </div>
      <AdminNavMenu />

      {/* <PublicChatWidget siteId={'default'} theme={'light'} pageUrl={''} /> */}
    </div>
  )
}
