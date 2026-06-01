import { AdminShell } from "@/widgets/admin-shell/ui/admin-shell"

type AdminLayoutProps = {
  children: React.ReactNode
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  return <AdminShell>{children}</AdminShell>
}