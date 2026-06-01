'use client'

import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from 'recharts'
import type { DashboardOrderPoint } from '../model/dashboard-types'

type DashboardOrdersChartProps = {
  data: DashboardOrderPoint[]
}

export function DashboardOrdersChart({ data }: DashboardOrdersChartProps) {
  return (
    <section className="cf-panel rounded-md p-4">
      <div className="mb-4">
        <h2 className="text-[14px] font-semibold text-[var(--cf-text)]">
          Заказы
        </h2>
      </div>

      <div className="h-[292px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="2 3" />
            <XAxis dataKey="date" tickLine={false} axisLine={false} />
            <YAxis tickLine={false} axisLine={false} />
            <Tooltip />
            <Legend />

            <Bar
              dataKey="newOrders"
              name="Новые"
              fill="var(--cf-blue)"
              radius={[4, 4, 0, 0]}
            />

            <Bar
              dataKey="paidOrders"
              name="Оплаченные"
              fill="var(--cf-green)"
              radius={[4, 4, 0, 0]}
            />

            <Bar
              dataKey="delayedOrders"
              name="Задержки"
              fill="var(--cf-yellow)"
              radius={[4, 4, 0, 0]}
            />

            <Bar
              dataKey="returnedOrders"
              name="Возвраты"
              fill="var(--cf-red)"
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </section>
  )
}
