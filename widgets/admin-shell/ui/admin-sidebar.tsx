'use client'

import { Button } from '@/shared/ui/button'
import { Separator } from '@/shared/ui/separator'
import { cn } from '@/shared/lib/cn'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/shared/ui/tooltip'
import { sidebarItems } from '../entities/navigation-data'



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

      <div className="mt-3 h-8 w-8 rounded-full border border-(--cf-border) bg-linear-to-br from-orange-600 via-zinc-800 to-sky-600" />

      <nav className="mt-5 flex flex-1 flex-col items-center gap-1">
        {sidebarItems.map((item, index) => {
          const Icon = item.icon

          return (
            <div key={item.title} className="flex flex-col items-center">
              {[3, 6, 12, 15].includes(index) ? (
                <Separator className="my-2 w-7 bg-(--cf-border)" />
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
                        'h-9 w-9 rounded-md text-(--cf-icon) hover:bg-(--cf-element-hover) hover:text-(--cf-text)',
                        pathname === item.href &&
                          'bg-(--cf-element) text-(--cf-text)'
                      )}
                    >
                      <Icon className="h-4.25 w-4.25" />
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
