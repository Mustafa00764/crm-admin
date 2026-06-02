import { PublicChatWidget } from '@/features/public-chat/ui/public-chat-widget'

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