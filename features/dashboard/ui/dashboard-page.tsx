'use client'

import { useCRMStore } from '@/entities/crm/model/crm-store'
import { DashboardFilters } from './dashboard-filters'
import { DashboardKpiGrid } from './dashboard-kpi-grid'
import { DashboardSalesChart } from './dashboard-sales-chart'
import { DashboardOrdersChart } from './dashboard-orders-chart'
import { DashboardSourceGrid } from './dashboard-source-grid'
import { DashboardManagerTable } from './dashboard-manager-table'
import { DashboardAiPerformance } from './dashboard-ai-performance'
import { DashboardCriticalEvents } from './dashboard-critical-events'
import { DashboardRecentActivity } from './dashboard-recent-activity'
import { Skeleton } from '@/shared/ui/skeleton'
import { useEffect } from 'react'
import { AdminPageHeader } from '@/widgets/admin-shell/ui/admin-page-header'
import { ThemeToggle } from '@/shared/ui/theme-toggle'
import { Button } from '@/shared/ui/button'
import { Download, Plus, RefreshCw } from 'lucide-react'

export function DashboardPage() {
  const {
    dashboardData,
    dashboardFilters,
    dashboardLoading,
    dashboardError,
    loadDashboard,
    updateDashboardFilters
  } = useCRMStore()

  useEffect(() => {
    void loadDashboard()
  }, [loadDashboard])

  return (
    <div className="cf-page min-h-screen">
      <AdminPageHeader
        title="Dashboard - CRM Overview"
        actions={
          <>
            <ThemeToggle />

            <Button
              type="button"
              variant="ghost"
              className="cf-icon-button"
              onClick={() => void loadDashboard()}
              disabled={dashboardLoading}
            >
              <RefreshCw
                className={
                  dashboardLoading ? 'h-4 w-4 animate-spin' : 'h-4 w-4'
                }
              />
            </Button>

            <Button type="button" variant="ghost" className="cf-icon-button">
              <Download className="h-4 w-4" />
            </Button>

            <Button type="button" variant="ghost" className="cf-icon-button">
              <Plus className="h-5 w-5" />
            </Button>
          </>
        }
      />

      <div className="space-y-3 px-5 py-3">
        <DashboardFilters
          filters={dashboardFilters}
          onChange={updateDashboardFilters}
        />

        {dashboardError ? (
          <div className="rounded-md border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
            {dashboardError}
          </div>
        ) : null}

        {dashboardLoading && !dashboardData ? (
          <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-4 2xl:grid-cols-6">
            {Array.from({ length: 12 }).map((_, index) => (
              <Skeleton key={index} className="h-[98px] rounded-md" />
            ))}
          </div>
        ) : null}

        {dashboardData ? (
          <>
            <DashboardKpiGrid
              data={dashboardData.kpi}
              displayMode={dashboardFilters.currencyDisplay}
            />

            <div className="grid gap-3 xl:grid-cols-[1.45fr_1fr]">
              <DashboardSalesChart data={dashboardData.salesChart} />
              <DashboardOrdersChart data={dashboardData.ordersChart} />
            </div>

            <DashboardSourceGrid
              channels={dashboardData.leadsByChannel}
              websites={dashboardData.revenueByWebsite}
              bots={dashboardData.revenueByBot}
              displayMode={dashboardFilters.currencyDisplay}
            />

            <div className="grid gap-3 xl:grid-cols-[1fr_1fr]">
              <DashboardCriticalEvents data={dashboardData.criticalEvents} />
              <DashboardAiPerformance
                data={dashboardData.aiPerformance}
                displayMode={dashboardFilters.currencyDisplay}
              />
            </div>

            <div className="flex gap-3 flex-col xl:flex-row">
              <DashboardManagerTable
                data={dashboardData.managerLeaderboard}
                displayMode={dashboardFilters.currencyDisplay}
              />
              <DashboardRecentActivity data={dashboardData.recentActivity} />
            </div>
          </>
        ) : null}
      </div>
    </div>
  )
}
