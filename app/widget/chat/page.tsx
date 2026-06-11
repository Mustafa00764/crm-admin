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

  const siteId = params.siteId || 'profnastilvtashkente'
  const theme = params.theme || 'light'
  const pageUrl = params.pageUrl || ''

  console.log(params, siteId);
  

  return <PublicChatWidget siteId={siteId} theme={theme} pageUrl={pageUrl} />
}