import {
  AlertTriangle,
  CircleDollarSign,
  Clock3,
  Factory,
  FileText,
  MessageSquare,
  ShoppingCart,
  Truck,
  Undo2,
  Users,
  WalletCards
} from 'lucide-react'
import type { CurrencyDisplayMode } from '@/entities/crm/types'
import type { DashboardKpi } from '../model/dashboard-types'
import { CrmMoneyPair } from '@/shared/ui/crm-money-pair'
import { DashboardKpiCard } from './dashboard-kpi-card'

type DashboardKpiGridProps = {
  data: DashboardKpi
  displayMode: CurrencyDisplayMode
}

export function DashboardKpiGrid({ data, displayMode }: DashboardKpiGridProps) {
  return (
    <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-4 2xl:grid-cols-6">
      <DashboardKpiCard
        title="Выручка"
        value={<CrmMoneyPair value={data.revenue} displayMode={displayMode} />}
        description="за выбранный период"
        icon={<CircleDollarSign className="h-4 w-4" />}
        tone="success"
      />

      <DashboardKpiCard
        title="Оплачено"
        value={<CrmMoneyPair value={data.paid} displayMode={displayMode} />}
        description="confirmed payments"
        icon={<WalletCards className="h-4 w-4" />}
        tone="info"
      />

      <DashboardKpiCard
        title="Долг"
        value={<CrmMoneyPair value={data.debt} displayMode={displayMode} />}
        description="остаток по заказам"
        icon={<AlertTriangle className="h-4 w-4" />}
        tone="warning"
      />

      <DashboardKpiCard
        title="Активные сделки"
        value={data.activeDeals}
        description="в работе"
        icon={<FileText className="h-4 w-4" />}
        tone="neutral"
      />

      <DashboardKpiCard
        title="Активные заказы"
        value={data.activeOrders}
        description="производство / доставка"
        icon={<ShoppingCart className="h-4 w-4" />}
        tone="info"
      />

      <DashboardKpiCard
        title="Новые лиды"
        value={data.newLeads}
        description="сайт, TG, WA, формы"
        icon={<Users className="h-4 w-4" />}
        tone="success"
      />

      <DashboardKpiCard
        title="Чаты ждут менеджера"
        value={data.waitingManagerChats}
        description="AI needs human"
        icon={<MessageSquare className="h-4 w-4" />}
        tone="warning"
      />

      <DashboardKpiCard
        title="Задержки производства"
        value={data.productionDelays}
        description="production_delayed"
        icon={<Factory className="h-4 w-4" />}
        tone="warning"
      />

      <DashboardKpiCard
        title="Задержки доставки"
        value={data.deliveryDelays}
        description="delivery_delayed"
        icon={<Truck className="h-4 w-4" />}
        tone="error"
      />

      <DashboardKpiCard
        title="Возвраты"
        value={data.returns}
        description="return requests"
        icon={<Undo2 className="h-4 w-4" />}
        tone="error"
      />

      <DashboardKpiCard
        title="Убытки"
        value={<CrmMoneyPair value={data.losses} displayMode={displayMode} />}
        description="доставка, возвраты, брак"
        icon={<AlertTriangle className="h-4 w-4" />}
        tone="error"
      />

      <DashboardKpiCard
        title="Просроченные задачи"
        value={data.overdueTasks}
        description="follow-ups overdue"
        icon={<Clock3 className="h-4 w-4" />}
        tone="warning"
      />
    </div>
  )
}
