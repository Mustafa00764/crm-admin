'use client'

import {
  BarChart3,
  Bot,
  Brain,
  FileText,
  Globe2,
  LayoutDashboard,
  MessageSquare,
  Package,
  Settings,
  ShoppingCart,
  Users,
  WalletCards,
  Bell,
  ShieldAlert,
  ListChecks,
  BadgeRussianRuble,
  Box
} from 'lucide-react'
import { Button } from '@/shared/ui/button'
import { Separator } from '@/shared/ui/separator'
import { cn } from '@/shared/lib/cn'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/shared/ui/tooltip'

const sidebarItems = [
  {
    title: 'Dashboard',
    href: 'dashboard',
    icon: LayoutDashboard
  },
  { title: 'Conversations', href: 'conversations', icon: MessageSquare },
  { title: 'Clients', href: 'clients', icon: Users },

  { title: 'Deals', href: 'deals', icon: FileText },
  { title: 'Orders', href: 'orders', icon: ShoppingCart },
  { title: 'Payments', href: 'payments', icon: WalletCards },

  { title: 'Products', href: 'products', icon: Package },
  { title: 'Product Categories', href: 'product-categories', icon: Box },
  { title: 'Websites', href: 'websites', icon: Globe2 },
  { title: 'Bots', href: 'bots', icon: Bot },
  { title: 'AI Agents', href: 'ai-agents', icon: Brain },

  { title: 'Analytics', href: 'analytics', icon: BarChart3 },
  { title: 'Tasks', href: 'tasks', icon: ListChecks },
  { title: 'Notifications', href: 'notifications', icon: Bell },
  { title: 'Warnings', href: 'warnings', icon: ShieldAlert },

  { title: 'Currency', href: 'currency', icon: BadgeRussianRuble },
  { title: 'Settings', href: 'settings', icon: Settings }
]

export function AdminSidebar() {
  const pathname = usePathname().replace('/', '')
  return (
    <aside className="cf-sidebar sticky top-0 hidden h-screen w-16 shrink-0 lg:flex lg:flex-col lg:items-center">
      <div className="flex h-13 w-full items-center justify-center">
        <div className="relative h-8 w-8">
          <div className="absolute left-1 top-3 h-4 w-6 rounded-full bg-white" />
          <div className="absolute left-2 top-1 h-6 w-6 rounded-full bg-white" />
          <div className="absolute left-0 top-4 h-3 w-8 rounded-full bg-white" />
        </div>
      </div>

      <div className="mt-3 h-8 w-8 rounded-full border border-[var(--cf-border)] bg-gradient-to-br from-orange-600 via-zinc-800 to-sky-600" />

      <nav className="mt-5 flex flex-1 flex-col items-center gap-1">
        {sidebarItems.map((item, index) => {
          const Icon = item.icon

          return (
            <div key={item.title} className="flex flex-col items-center">
              {[3, 6, 11, 15].includes(index) ? (
                <Separator className="my-2 w-7 bg-[var(--cf-border)]" />
              ) : null}
              <Tooltip>
                <TooltipTrigger asChild>
                  <Link href={item.href}>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      title={item.title}
                      className={cn(
                        'h-9 w-9 rounded-md text-[var(--cf-icon)] hover:bg-[var(--cf-element-hover)] hover:text-[var(--cf-text)]',
                        pathname === item.href &&
                          'bg-[var(--cf-element)] text-[var(--cf-text)]'
                      )}
                    >
                      <Icon className="h-[17px] w-[17px]" />
                    </Button>
                  </Link>
                </TooltipTrigger>
                <TooltipContent side={'right'}>
                  <p>{item.title}</p>
                </TooltipContent>
              </Tooltip>
            </div>
          )
        })}
      </nav>
    </aside>
  )
}
