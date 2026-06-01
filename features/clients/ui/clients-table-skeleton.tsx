"use client"

import { Skeleton } from "@/shared/ui/skeleton"

export function ClientsTableSkeleton() {
  return (
    <section className="cf-panel overflow-hidden">
      <div className="clients-table-scroll">
        <div className="min-w-[1480px]">
          <div className="grid h-9 grid-cols-[52px_56px_210px_170px_150px_190px_125px_140px_190px_170px_170px_150px_160px_160px_160px_74px] bg-[var(--cf-panel-soft)] px-0">
            {Array.from({ length: 16 }).map((_, index) => (
              <div key={index} className="flex items-center px-3">
                <Skeleton className="h-3 w-full max-w-[90px]" />
              </div>
            ))}
          </div>

          <div>
            {Array.from({ length: 10 }).map((_, rowIndex) => (
              <div
                key={rowIndex}
                className="grid h-[42px] grid-cols-[52px_56px_210px_170px_150px_190px_125px_140px_190px_170px_170px_150px_160px_160px_160px_74px] odd:bg-[var(--cf-table-row)] even:bg-[var(--cf-table-row-alt)]"
              >
                {Array.from({ length: 16 }).map((_, cellIndex) => (
                  <div key={cellIndex} className="flex items-center px-3">
                    <Skeleton
                      className={
                        cellIndex === 0
                          ? "h-7 w-7 rounded-md"
                          : cellIndex === 2
                            ? "h-7 w-[150px]"
                            : "h-3 w-full max-w-[120px]"
                      }
                    />
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="flex h-[61px] items-center gap-1 border-t border-[var(--cf-border)] px-3">
        {Array.from({ length: 8 }).map((_, index) => (
          <Skeleton key={index} className="h-9 w-10 rounded-md" />
        ))}
      </div>
    </section>
  )
}