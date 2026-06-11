import { PublicChatWidget } from '@/features/public-chat/ui/public-chat-widget'

type WidgetChatPageProps = {
  searchParams: Promise<{
    siteId?: string
    theme?: string
    pageUrl?: string
  }>
}

export default async function WidgetChatPage({
  searchParams
}: WidgetChatPageProps) {
  const params = await searchParams

  return (
    <PublicChatWidget
      siteId={params.siteId || 'evroshtaketnikmoskva'}
      theme={params.theme || 'light'}
      pageUrl={params.pageUrl || ''}
    />
  )
}
