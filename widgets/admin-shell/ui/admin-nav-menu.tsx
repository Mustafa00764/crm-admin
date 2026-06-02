'use client'

import { Button } from '@/shared/ui/button'
import { Separator } from '@/shared/ui/separator'
import { cn } from '@/shared/lib/cn'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/shared/ui/tooltip'
import { navItems } from '../entities/navigation-data'


export function AdminNavMenu() {
  const pathname = usePathname().replace('/', '')
  return (
    <aside className="w-max fixed z-50 bottom-8 bg-(--cf-bg) left-[50%] translate-x-[-50%] justify-center flex h-12 shrink-0 lg:hidden lg:items-center rounded-full border border-(--cf-border) px-4">
      {/* <div className="flex h-13 w-full items-center justify-center">
        <div className="relative h-8 w-8">
          <div className="absolute left-1 top-3 h-4 w-6 rounded-full bg-white" />
          <div className="absolute left-2 top-1 h-6 w-6 rounded-full bg-white" />
          <div className="absolute left-0 top-4 h-3 w-8 rounded-full bg-white" />
        </div>
      </div> */}

      {/* <div className="mt-3 h-8 w-8 rounded-full border border-[var(--cf-border)] bg-gradient-to-br from-orange-600 via-zinc-800 to-sky-600" /> */}

      <nav className="flex flex-1 items-center justify-center gap-1">
        {navItems.map((item, index) => {
          const Icon = item.icon

          return (
            <div key={item.title} className="flex flex-col items-center">
              {[3, 6, 11, 15].includes(index) ? (
                <Separator className="w-7 bg-(--cf-border)" />
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
                <TooltipContent side={'top'}>
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
