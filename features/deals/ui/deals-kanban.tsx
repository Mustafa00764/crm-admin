'use client'

import * as React from 'react'
import {
  DndContext,
  DragOverlay,
  MouseSensor,
  TouchSensor,
  closestCorners,
  defaultDropAnimationSideEffects,
  useDroppable,
  useSensor,
  useSensors,
  type DragCancelEvent,
  type DragEndEvent,
  type DragOverEvent,
  type DragStartEvent,
  type DropAnimation
} from '@dnd-kit/core'
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Check, GripVertical } from 'lucide-react'
import type { CRMDeal, DealStage } from '../model/deals-types'
import { dealStages } from '../model/deals-types'
import { cn } from '@/shared/lib/cn'
import { CrmMoneyPair } from '@/shared/ui/crm-money-pair'
import { SelectCheckbox } from '@/shared/ui/select-checkbox'
import { Badge } from '@/shared/ui/badge'
import { useCRMStore } from '@/entities/crm/model/crm-store'
import { DealStageBadge } from './deal-stage-badge'

type DealsKanbanProps = {
  deals: CRMDeal[]
  selectedDealIds: string[]
  onSelect: (dealId: string) => void
  onToggleDeal: (dealId: string) => void
}

type SortableHookReturn = ReturnType<typeof useSortable>
type SortableAttributes = SortableHookReturn['attributes']
type SortableListeners = SortableHookReturn['listeners']
type SortableActivatorRef = SortableHookReturn['setActivatorNodeRef']

const dropAnimation: DropAnimation = {
  duration: 180,
  easing: 'cubic-bezier(0.2, 0, 0, 1)',
  sideEffects: defaultDropAnimationSideEffects({
    styles: {
      active: {
        opacity: '0'
      }
    }
  })
}

export function DealsKanban({
  deals,
  selectedDealIds,
  onSelect,
  onToggleDeal
}: DealsKanbanProps) {
  const { moveDeal } = useCRMStore()

  const [activeDealId, setActiveDealId] = React.useState<string | null>(null)
  const [draftDeals, setDraftDeals] = React.useState<CRMDeal[] | null>(null)
  const [overStage, setOverStage] = React.useState<DealStage | null>(null)

  const sensors = useSensors(
    useSensor(MouseSensor, {
      activationConstraint: {
        distance: 8
      }
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 160,
        tolerance: 8
      }
    })
  )

  const orderedDeals = React.useMemo(() => {
    return [...deals].sort((a, b) => a.sortOrder - b.sortOrder)
  }, [deals])

  const displayDeals = draftDeals ?? orderedDeals

  const activeDeal = React.useMemo(() => {
    if (!activeDealId) return null

    return displayDeals.find(deal => deal.id === activeDealId) ?? null
  }, [activeDealId, displayDeals])

  const dealsByStage = React.useMemo(() => {
    return dealStages.map(stage => ({
      ...stage,
      deals: getStageDeals(displayDeals, stage.value)
    }))
  }, [displayDeals])

  const handleDragStart = React.useCallback(
    (event: DragStartEvent) => {
      const activeId = String(event.active.id)
      const activeDeal = orderedDeals.find(deal => deal.id === activeId)

      setActiveDealId(activeId)
      setDraftDeals(orderedDeals)
      setOverStage(activeDeal?.stage ?? null)
    },
    [orderedDeals]
  )

  const handleDragOver = React.useCallback(
    (event: DragOverEvent) => {
      const activeId = String(event.active.id)
      const overId = event.over?.id

      if (!overId) {
        setOverStage(null)
        return
      }

      const currentDisplayDeals = draftDeals ?? orderedDeals
      const currentTargetStage = getStageFromOverId(currentDisplayDeals, overId)

      setOverStage(currentTargetStage)

      if (String(overId) === activeId) return

      setDraftDeals(currentDeals => {
        const baseDeals = currentDeals ?? orderedDeals
        const target = getMoveTarget(baseDeals, activeId, overId, event)

        if (!target) return currentDeals

        const nextDeals = moveDealInMemory(
          baseDeals,
          activeId,
          target.stage,
          target.index
        )

        if (getDealsOrderKey(nextDeals) === getDealsOrderKey(baseDeals)) {
          return currentDeals
        }

        return nextDeals
      })
    },
    [draftDeals, orderedDeals]
  )

  const handleDragCancel = React.useCallback((_event: DragCancelEvent) => {
    setActiveDealId(null)
    setDraftDeals(null)
    setOverStage(null)
    console.log(_event)
  }, [])

  const handleDragEnd = React.useCallback(
    (event: DragEndEvent) => {
      const activeId = String(event.active.id)
      const overId = event.over?.id

      if (!overId) {
        setActiveDealId(null)
        setDraftDeals(null)
        setOverStage(null)
        return
      }

      const target = getMoveTarget(displayDeals, activeId, overId, event)

      if (!target) {
        setActiveDealId(null)
        setDraftDeals(null)
        setOverStage(null)
        return
      }

      const finalDeals = moveDealInMemory(
        displayDeals,
        activeId,
        target.stage,
        target.index
      )

      const finalDeal = finalDeals.find(deal => deal.id === activeId)

      if (!finalDeal) {
        setActiveDealId(null)
        setDraftDeals(null)
        setOverStage(null)
        return
      }

      const finalStageDeals = getStageDeals(finalDeals, finalDeal.stage)
      const finalIndex = finalStageDeals.findIndex(deal => deal.id === activeId)

      setDraftDeals(finalDeals)
      setActiveDealId(null)
      setOverStage(null)

      void moveDeal(activeId, finalDeal.stage, Math.max(finalIndex, 0)).finally(
        () => {
          setDraftDeals(null)
        }
      )
    },
    [displayDeals, moveDeal]
  )

  return (
    <section className="min-h-0 overflow-x-auto pb-2">
      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragCancel={handleDragCancel}
        onDragEnd={handleDragEnd}
      >
        <div className="flex min-w-max gap-3 p-px">
          {dealsByStage.map(stage => (
            <DealsKanbanColumn
              key={stage.value}
              stage={stage.value}
              label={stage.label}
              deals={stage.deals}
              selectedDealIds={selectedDealIds}
              isColumnOver={overStage === stage.value}
              onSelect={onSelect}
              onToggleDeal={onToggleDeal}
            />
          ))}
        </div>

        <DragOverlay
          adjustScale={false}
          dropAnimation={dropAnimation}
          className="pointer-events-none"
        >
          {activeDeal ? (
            <div className="w-71.5">
              <DealCardView
                deal={activeDeal}
                checked={selectedDealIds.includes(activeDeal.id)}
                isOverlay
              />
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>
    </section>
  )
}

const DealsKanbanColumn = React.memo(function DealsKanbanColumn({
  stage,
  label,
  deals,
  selectedDealIds,
  isColumnOver,
  onSelect,
  onToggleDeal
}: {
  stage: DealStage
  label: string
  deals: CRMDeal[]
  selectedDealIds: string[]
  isColumnOver: boolean
  onSelect: (dealId: string) => void
  onToggleDeal: (dealId: string) => void
}) {
  const { setNodeRef } = useDroppable({
    id: stage
  })

  const totalRub = React.useMemo(() => {
    return deals.reduce((sum, deal) => sum + deal.finalAmount.rub, 0)
  }, [deals])

  return (
    <div
      ref={setNodeRef}
      className={cn(
        'cf-panel flex min-h-130 w-77.5 shrink-0 flex-col p-3 transition-[background-color,border-color,box-shadow] duration-200 ease-out',
        isColumnOver &&
          'border-(--cf-blue) bg-[rgba(8,183,239,0.08)] shadow-[0_0_0_1px_var(--cf-blue)]'
      )}
    >
      <div className="mb-3 flex items-start justify-between gap-2">
        <div>
          <div className="text-[12px] font-semibold text-(--cf-text)">
            {label}
          </div>

          <div className="mt-1 text-[10px] text-(--cf-text-muted)">
            {deals.length} deals · {totalRub.toLocaleString('ru-RU')} ₽
          </div>
        </div>

        <DealStageBadge stage={stage} />
      </div>

      <SortableContext
        id={stage}
        items={deals.map(deal => deal.id)}
        strategy={verticalListSortingStrategy}
      >
        <div className="min-h-107.5 flex-1 space-y-2">
          {deals.map(deal => (
            <SortableDealCard
              key={deal.id}
              deal={deal}
              checked={selectedDealIds.includes(deal.id)}
              onSelect={() => onSelect(deal.id)}
              onToggle={() => onToggleDeal(deal.id)}
            />
          ))}

          {deals.length === 0 ? (
            <div className="flex min-h-30 items-center justify-center rounded-md border border-dashed border-(--cf-border) p-4 text-center text-[11px] text-(--cf-text-muted) transition-colors duration-200">
              Перетащите сделку сюда
            </div>
          ) : null}
        </div>
      </SortableContext>
    </div>
  )
})

const SortableDealCard = React.memo(function SortableDealCard({
  deal,
  checked,
  onSelect,
  onToggle
}: {
  deal: CRMDeal
  checked: boolean
  onSelect: () => void
  onToggle: () => void
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    setActivatorNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({
    id: deal.id
  })

  const style = React.useMemo(
    () =>
      ({
        transform: CSS.Transform.toString(transform),
        transition: isDragging
          ? 'none'
          : (transition ?? 'transform 220ms cubic-bezier(0.2, 0, 0, 1)'),
        willChange: 'transform',
        touchAction: 'none'
      }) satisfies React.CSSProperties,
    [transform, transition, isDragging]
  )

  return (
    <article
      ref={setNodeRef}
      style={style}
      onClick={onSelect}
      className={cn(
        'relative rounded-md outline-none',
        'transform-gpu backface-hidden',
        isDragging && 'opacity-0'
      )}
    >
      <DealCardView
        deal={deal}
        checked={checked}
        onToggle={onToggle}
        isDragging={isDragging}
        dragHandleRef={setActivatorNodeRef}
        dragAttributes={attributes}
        dragListeners={listeners}
      />
    </article>
  )
})

function DealCardView({
  deal,
  checked,
  onToggle,
  isDragging,
  isOverlay,
  dragHandleRef,
  dragAttributes,
  dragListeners
}: {
  deal: CRMDeal
  checked: boolean
  onToggle?: () => void
  isDragging?: boolean
  isOverlay?: boolean
  dragHandleRef?: SortableActivatorRef
  dragAttributes?: SortableAttributes
  dragListeners?: SortableListeners
}) {
  return (
    <div
      className={cn(
        'relative rounded-md border border-(--cf-border) bg-(--cf-element) p-3 ',
        'transition-all duration-200 ease-out',
        !isOverlay && 'hover:bg-(--cf-element-hover)',
        checked &&
          'border-(--cf-blue) ',
        isDragging && 'border-(--cf-blue) shadow-[0_0_0_1px_var(--cf-blue)]',
        isOverlay &&
          'cursor-grabbing border-(--cf-blue) bg-(--cf-element) shadow-[0_18px_42px_rgba(0,0,0,0.36),0_0_0_1px_var(--cf-blue)]'
      )}
    >
      {checked ? (
        <div className="absolute right-2 top-2 flex items-center gap-1 rounded-md bg-(--cf-blue) px-1.5 py-0.5 text-[9px] font-semibold text-black">
          <Check className="h-3 w-3" />
          Selected
        </div>
      ) : null}

      <div className="mb-2 flex items-center gap-2">
        <div
          className={isOverlay ? 'pointer-events-none' : undefined}
          onClick={event => event.stopPropagation()}
          onPointerDown={event => event.stopPropagation()}
        >
          <SelectCheckbox
            checked={checked}
            onCheckedChange={onToggle ?? (() => undefined)}
          />
        </div>

        <button
          ref={dragHandleRef}
          type="button"
          className={cn(
            'flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-(--cf-button) text-(--cf-icon)',
            isOverlay ? 'cursor-grabbing' : 'cursor-grab active:cursor-grabbing'
          )}
          style={{ touchAction: 'none' }}
          onClick={event => event.stopPropagation()}
          {...(dragAttributes ?? {})}
          {...(dragListeners ?? {})}
        >
          <GripVertical className="h-4 w-4" />
        </button>

        <div className="min-w-0 flex-1 pr-10">
          <div
            className="truncate text-[12px] font-semibold text-(--cf-text)"
            title={deal.title}
          >
            {deal.title}
          </div>

          <div
            className="truncate text-[10px] text-(--cf-text-muted)"
            title={`${deal.dealNumber} · ${deal.clientName}`}
          >
            {deal.dealNumber} · {deal.clientName}
          </div>
        </div>
      </div>

      <KanbanDealBody deal={deal} />
    </div>
  )
}

const KanbanDealBody = React.memo(function KanbanDealBody({
  deal
}: {
  deal: CRMDeal
}) {
  return (
    <>
      <div className="mt-2 text-[12px] font-semibold text-(--cf-text)">
        <CrmMoneyPair value={deal.finalAmount} displayMode="dual" />
      </div>

      <div className="mt-2 flex flex-wrap gap-1.5">
        <Badge className="bg-(--cf-button) text-(--cf-text)">
          {deal.priority}
        </Badge>

        <Badge className="bg-(--cf-button) text-(--cf-text)">
          {deal.probability}%
        </Badge>

        <Badge className="bg-(--cf-button) text-(--cf-text)">
          {deal.channel}
        </Badge>
      </div>

      <div className="mt-2 text-[11px] text-(--cf-text-muted)">
        Manager: {deal.managerName ?? '—'}
      </div>

      {deal.nextStep ? (
        <div className="mt-2 line-clamp-2 rounded-md border border-(--cf-border) bg-(--cf-element) p-2 text-[11px] leading-5 text-primary/80">
          {deal.nextStep}
        </div>
      ) : null}

      {deal.notes.length > 0 ? (
        <div className="mt-2 rounded-md border border-(--cf-border) bg-(--cf-element) px-2 py-1 text-[10px] text-primary/80">
          Notes: {deal.notes.length}
        </div>
      ) : null}
    </>
  )
})

function getMoveTarget(
  deals: CRMDeal[],
  activeId: string,
  overId: unknown,
  event: DragOverEvent | DragEndEvent
): { stage: DealStage; index: number } | null {
  if (isDealStage(overId)) {
    const stageDeals = getStageDeals(deals, overId).filter(
      deal => deal.id !== activeId
    )

    return {
      stage: overId,
      index: stageDeals.length
    }
  }

  const overIdString = String(overId)
  const overDeal = deals.find(deal => deal.id === overIdString)

  if (!overDeal) return null

  const targetStage = overDeal.stage

  const stageDealsWithoutActive = getStageDeals(deals, targetStage).filter(
    deal => deal.id !== activeId
  )

  const sortableData = event.over?.data.current?.sortable as
    | { index?: number }
    | undefined

  const fallbackIndex = stageDealsWithoutActive.findIndex(
    deal => deal.id === overDeal.id
  )

  const rawIndex =
    typeof sortableData?.index === 'number'
      ? sortableData.index
      : fallbackIndex >= 0
        ? fallbackIndex
        : stageDealsWithoutActive.length

  return {
    stage: targetStage,
    index: Math.max(0, Math.min(rawIndex, stageDealsWithoutActive.length))
  }
}

function moveDealInMemory(
  deals: CRMDeal[],
  activeId: string,
  targetStage: DealStage,
  targetIndex: number
) {
  const activeDeal = deals.find(deal => deal.id === activeId)

  if (!activeDeal) return deals

  const withoutActiveDeal = deals.filter(deal => deal.id !== activeId)

  const nextDeals: CRMDeal[] = []

  for (const stage of dealStages) {
    const stageDeals = getStageDeals(withoutActiveDeal, stage.value)

    if (stage.value === targetStage) {
      stageDeals.splice(targetIndex, 0, {
        ...activeDeal,
        stage: targetStage
      })
    }

    stageDeals.forEach((deal, index) => {
      nextDeals.push({
        ...deal,
        sortOrder: index
      })
    })
  }

  return nextDeals
}

function getStageDeals(deals: CRMDeal[], stage: DealStage) {
  return deals
    .filter(deal => deal.stage === stage)
    .sort((a, b) => a.sortOrder - b.sortOrder)
}

function getStageFromOverId(
  deals: CRMDeal[],
  overId: unknown
): DealStage | null {
  if (isDealStage(overId)) {
    return overId
  }

  const overDeal = deals.find(deal => deal.id === String(overId))

  return overDeal?.stage ?? null
}

function getDealsOrderKey(deals: CRMDeal[]) {
  return deals
    .map(deal => `${deal.id}:${deal.stage}:${deal.sortOrder}`)
    .join('|')
}

function isDealStage(value: unknown): value is DealStage {
  return (
    typeof value === 'string' && dealStages.some(stage => stage.value === value)
  )
}
