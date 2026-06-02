(function () {
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
  container.style.bottom = '20px'
  container.style.width = '380px'
  container.style.height = '620px'
  container.style.border = '0'
  container.style.overflow = 'hidden'

  if (position === 'left') {
    container.style.left = '20px'
  } else {
    container.style.right = '20px'
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