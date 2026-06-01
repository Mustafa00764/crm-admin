"use client"

import { Skeleton } from "@/shared/ui/skeleton"

export function DealsKanbanSkeleton() {
  return (
    <section className="overflow-x-auto pb-2">
      <div className="flex min-w-max gap-3">
        {Array.from({ length: 6 }).map((_, columnIndex) => (
          <div key={columnIndex} className="cf-panel w-[310px] shrink-0 p-3">
            <div className="mb-3 flex items-start justify-between">
              <div>
                <Skeleton className="h-4 w-[120px]" />
                <Skeleton className="mt-2 h-3 w-[90px]" />
              </div>
              <Skeleton className="h-5 w-[70px] rounded" />
            </div>

            <div className="space-y-2">
              {Array.from({ length: 4 }).map((_, cardIndex) => (
                <div
                  key={cardIndex}
                  className="rounded-md border border-[var(--cf-border)] bg-[var(--cf-element)] p-3"
                >
                  <div className="mb-2 flex gap-2">
                    <Skeleton className="h-7 w-7 rounded-md" />
                    <div className="flex-1">
                      <Skeleton className="h-4 w-[170px]" />
                      <Skeleton className="mt-2 h-3 w-[120px]" />
                    </div>
                  </div>

                  <Skeleton className="mt-3 h-4 w-[150px]" />
                  <Skeleton className="mt-3 h-6 w-full rounded" />
                  <Skeleton className="mt-2 h-8 w-full rounded-md" />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}