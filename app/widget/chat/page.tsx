import { PublicChatWidget } from '@/features/public-chat/ui/public-chat-widget'

type WidgetChatPageProps = {
  searchParams: Promise<{
    siteId?: string
    theme?: string
    pageUrl?: string
  }>
}

export default async function Page({ searchParams }: WidgetChatPageProps) {
  const params = await searchParams

  return (
    <PublicChatWidget
      siteId={params.siteId ?? 'default'}
      theme={params.theme ?? 'light'}
      pageUrl={params.pageUrl ?? ''}
    />
  )
}