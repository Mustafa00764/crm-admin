import type { DealStage } from "../model/deals-types"
import { Badge } from "@/shared/ui/badge"

export function DealStageBadge({ stage }: { stage: DealStage }) {
  return <Badge className={getStageClassName(stage)}>{stage}</Badge>
}

function getStageClassName(stage: DealStage) {
  if (stage === "won") {
    return "bg-(--cf-green) text-black"
  }

  if (stage === "lost" || stage === "cancelled") {
    return "bg-(--cf-red) text-white"
  }

  if (stage === "proposal_sent" || stage === "calculation") {
    return "bg-(--cf-blue) text-black"
  }

  if (stage === "negotiation" || stage === "waiting_decision") {
    return "bg-(--cf-yellow) text-black"
  }

  return "bg-(--cf-table-text)/30 text-primary"
}