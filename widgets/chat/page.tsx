import { PublicChatWidget } from "@/features/public-chat/public-chat-widget"

export default function Page({
  searchParams
}: {
  searchParams: {
    siteId?: string
    theme?: string
    pageUrl?: string
  }
}) {
  return (
    <PublicChatWidget
      siteId={searchParams.siteId ?? 'default'}
      theme={searchParams.theme ?? 'dark'}
      pageUrl={searchParams.pageUrl ?? ''}
    />
  )
}