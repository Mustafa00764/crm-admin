'use client'

import {
  Area,
  AreaChart,
  CartesianGrid,
  Legend,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from 'recharts'
import type { DashboardSalesPoint } from '../model/dashboard-types'

type DashboardSalesChartProps = {
  data: DashboardSalesPoint[]
}

export function DashboardSalesChart({ data }: DashboardSalesChartProps) {
  const chartData = data.map(item => ({
    date: item.date,
    revenue: item.revenue.rub,
    paid: item.paid.rub,
    debt: item.debt.rub,
    losses: item.losses.rub
  }))

  return (
    <section className="cf-panel rounded-md p-4">
      <div className="mb-4">
        <h2 className="text-[14px] font-semibold text-[var(--cf-text)]">
          Продажи
        </h2>
      </div>

      <div className="h-[292px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData}>
            <CartesianGrid strokeDasharray="2 3" />
            <XAxis dataKey="date" tickLine={false} axisLine={false} />
            <YAxis tickLine={false} axisLine={false} />
            <Tooltip />
            <Legend />

            <Area
              type="monotone"
              dataKey="revenue"
              name="Выручка"
              stroke="var(--cf-blue)"
              fill="var(--cf-blue)"
              fillOpacity={0.14}
              strokeWidth={2}
            />

            <Area
              type="monotone"
              dataKey="paid"
              name="Оплачено"
              stroke="var(--cf-green)"
              fill="var(--cf-green)"
              fillOpacity={0.14}
              strokeWidth={2}
            />

            <Line
              type="monotone"
              dataKey="debt"
              name="Долг"
              stroke="var(--cf-yellow)"
              strokeWidth={2}
              dot={false}
            />

            <Line
              type="monotone"
              dataKey="losses"
              name="Убытки"
              stroke="var(--cf-red)"
              strokeWidth={2}
              dot={false}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </section>
  )
}
