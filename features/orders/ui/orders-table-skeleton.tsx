export function OrdersTableSkeleton() {
  return (
    <section className="cf-panel overflow-hidden">
      <div className="w-full space-y-2 p-3 grid grid-cols-4 gap-3">
        {Array.from({ length: 4 }).map((_, index) => (
          <div
            key={index}
            className="w-full h-120 animate-pulse rounded-md bg-(--cf-element)"
          />
        ))}
      </div>
    </section>
  )
}