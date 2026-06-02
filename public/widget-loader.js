;(function () {
  var currentScript = document.currentScript

  if (!currentScript) return

  var crmUrl = 'https://crm-admin-hibj.vercel.app'
  var siteId = currentScript.getAttribute('data-site-id') || 'default'
  var position = currentScript.getAttribute('data-position') || 'right'
  var theme = currentScript.getAttribute('data-theme') || 'dark'

  var container = document.createElement('div')
  container.id = 'omni-crm-chat-widget-root'

  container.style.position = 'fixed'
  container.style.zIndex = '2147483647'
  container.style.width = '380px'
  container.style.height = '620px'
  container.style.border = '0'
  container.style.overflow = 'hidden'

  if (position === 'left') {
    container.style.left = '20px'
    container.style.right = 'auto'
    container.style.bottom = '20px'
    container.style.top = 'auto'
  }

  if (position === 'right') {
    container.style.right = '20px'
    container.style.left = 'auto'
    container.style.bottom = '20px'
    container.style.top = 'auto'
  }

  if (position === 'top-left') {
    container.style.left = '20px'
    container.style.right = 'auto'
    container.style.top = '20px'
    container.style.bottom = 'auto'
  }

  if (position === 'top-right') {
    container.style.right = '20px'
    container.style.left = 'auto'
    container.style.top = '20px'
    container.style.bottom = 'auto'
  }

  if (position === 'center') {
    container.style.left = '50%'
    container.style.top = '50%'
    container.style.right = 'auto'
    container.style.bottom = 'auto'
    container.style.transform = 'translate(-50%, -50%)'
  }

  if (position === 'full') {
    container.style.left = '0'
    container.style.right = '0'
    container.style.top = '0'
    container.style.bottom = '0'
    container.style.width = '100vw'
    container.style.height = '100vh'
  }

  var iframe = document.createElement('iframe')

  iframe.src =
    crmUrl +
    '/widget/chat?siteId=' +
    encodeURIComponent(siteId) +
    '&theme=' +
    encodeURIComponent(theme) +
    '&pageUrl=' +
    encodeURIComponent(window.location.href)

  iframe.title = 'AI Chat'
  iframe.allow = 'microphone'
  iframe.style.width = '100%'
  iframe.style.height = '100%'
  iframe.style.border = '0'
  iframe.style.borderRadius = '18px'
  iframe.style.boxShadow = '0 20px 60px rgba(0,0,0,.35)'
  iframe.style.background = 'transparent'

  container.appendChild(iframe)
  document.body.appendChild(container)
})()
