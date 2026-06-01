import type { DashboardCriticalEvent } from '../model/dashboard-types'
import { cn } from '@/shared/lib/cn'
import { Badge } from '@/shared/ui/badge'
import { Button } from '@/shared/ui/button'
import {
  AlertTriangle,
  Bot,
  Brain,
  Clock3,
  Globe2,
  MessageSquare,
  ShoppingCart,
  UserRound
} from 'lucide-react'

type DashboardCriticalEventsProps = {
  data: DashboardCriticalEvent[]
}

export function DashboardCriticalEvents({
  data
}: DashboardCriticalEventsProps) {
  return (
    <section className="cf-panel p-3">
      <div className="mb-3 flex items-center gap-2 text-[13px] font-semibold text-[var(--cf-text)]">
        <AlertTriangle className="h-4 w-4 text-[var(--cf-yellow)]" />
        Требуют внимания
      </div>

      <div className="space-y-2">
        {data.length === 0 ? (
          <div className="cf-panel-soft p-6 text-center text-[12px] text-[var(--cf-text-muted)]">
            Критичных событий нет
          </div>
        ) : null}

        {data.map(event => (
          <div
            key={event.id}
            className="cf-panel-soft flex items-start gap-3 p-3"
          >
            <div
              className={cn(
                'rounded-md border p-1.5',
                getSeverityClass(event.severity)
              )}
            >
              {getEntityIcon(event.entityType)}
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <div className="text-[12px] font-medium text-[var(--cf-text)]">
                  {event.title}
                </div>
                <Badge className={getBadgeClass(event.severity)}>
                  {event.severity}
                </Badge>
              </div>

              <div className="mt-1 text-[11px] leading-5 text-[var(--cf-text-muted)]">
                {event.description}
              </div>

              <div className="mt-1 text-[10px] text-[var(--cf-text-muted)]">
                {event.createdAt}
              </div>
            </div>

            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-7 rounded-md bg-[var(--cf-button)] px-3 text-[11px] text-[var(--cf-text)] hover:bg-[var(--cf-element-hover)]"
            >
              Open
            </Button>
          </div>
        ))}
      </div>
    </section>
  )
}

function getEntityIcon(entityType: DashboardCriticalEvent['entityType']) {
  const className = 'h-4 w-4'

  if (entityType === 'conversation')
    return <MessageSquare className={className} />
  if (entityType === 'order') return <ShoppingCart className={className} />
  if (entityType === 'task') return <Clock3 className={className} />
  if (entityType === 'bot') return <Bot className={className} />
  if (entityType === 'website') return <Globe2 className={className} />
  if (entityType === 'client') return <UserRound className={className} />
  if (entityType === 'ai_agent') return <Brain className={className} />

  return <AlertTriangle className={className} />
}

function getSeverityClass(severity: DashboardCriticalEvent['severity']) {
  if (severity === 'success') {
    return 'border-[var(--cf-green)] bg-[rgba(92,207,69,0.08)] text-[var(--cf-green)]'
  }

  if (severity === 'warning') {
    return 'border-[var(--cf-yellow)] bg-[rgba(245,187,36,0.08)] text-[var(--cf-yellow)]'
  }

  if (severity === 'error') {
    return 'border-[var(--cf-red)] bg-[rgba(239,23,72,0.08)] text-[var(--cf-red)]'
  }

  return 'border-[var(--cf-blue)] bg-[rgba(8,183,239,0.08)] text-[var(--cf-blue)]'
}

function getBadgeClass(severity: DashboardCriticalEvent['severity']) {
  if (severity === 'error') return 'bg-[var(--cf-red)] text-white'
  if (severity === 'warning') return 'bg-[var(--cf-yellow)] text-black'
  if (severity === 'success') return 'bg-[var(--cf-green)] text-black'
  return 'bg-[var(--cf-blue)] text-black'
}
