"use client"

import { Skeleton } from "@/shared/ui/skeleton"

export function ClientsCardSkeleton() {
  return (
    <section className="grid auto-rows-min gap-3 md:grid-cols-2 2xl:grid-cols-3">
      {Array.from({ length: 9 }).map((_, index) => (
        <div key={index} className="cf-panel p-3">
          <div className="mb-3 flex items-center justify-between">
            <Skeleton className="h-7 w-7 rounded-md" />
            <Skeleton className="h-7 w-7 rounded-md" />
          </div>

          <div className="flex items-start gap-3">
            <Skeleton className="h-10 w-10 rounded-full" />

            <div className="min-w-0 flex-1">
              <Skeleton className="h-4 w-[160px]" />
              <Skeleton className="mt-2 h-3 w-[120px]" />
              <div className="mt-3 flex gap-2">
                <Skeleton className="h-5 w-[70px] rounded" />
                <Skeleton className="h-5 w-[80px] rounded" />
              </div>
            </div>
          </div>

          <div className="mt-3 grid grid-cols-2 gap-2">
            {Array.from({ length: 4 }).map((_, metricIndex) => (
              <Skeleton key={metricIndex} className="h-[54px] rounded-md" />
            ))}
          </div>

          <Skeleton className="mt-3 h-[54px] rounded-md" />
          <Skeleton className="mt-2 h-[54px] rounded-md" />
        </div>
      ))}
    </section>
  )
}