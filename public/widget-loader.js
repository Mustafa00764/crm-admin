;(function () {
  var currentScript = document.currentScript

  if (!currentScript) return

  var crmUrl = 'https://crm-admin-hibj.vercel.app'
  var siteId = currentScript.getAttribute('data-site-id') || 'default'
  var position = currentScript.getAttribute('data-position') || 'right'
  var theme = currentScript.getAttribute('data-theme') || 'dark'

  var closedSize = 56
  var openedWidth = 380
  var openedHeight = 620
  var offset = 20

  var container = document.createElement('div')
  container.id = 'omni-crm-chat-widget-root'

  container.style.position = 'fixed'
  container.style.zIndex = '2147483647'
  container.style.width = closedSize + 'px'
  container.style.height = closedSize + 'px'
  container.style.borderRadius = closedSize + 'px'
  container.style.border = '0'
  container.style.overflow = 'hidden'
  container.style.background = 'white'
//   container.style.transition = 'width .2s ease, height .2s ease'

  function applyPosition() {
    container.style.left = 'auto'
    container.style.right = 'auto'
    container.style.top = 'auto'
    container.style.bottom = 'auto'
    container.style.transform = 'none'

    if (position === 'left') {
      container.style.left = offset + 'px'
      container.style.bottom = offset + 'px'
      return
    }

    if (position === 'top-left') {
      container.style.left = offset + 'px'
      container.style.top = offset + 'px'
      return
    }

    if (position === 'top-right') {
      container.style.right = offset + 'px'
      container.style.top = offset + 'px'
      return
    }

    if (position === 'center') {
      container.style.left = '50%'
      container.style.top = '50%'
      container.style.transform = 'translate(-50%, -50%)'
      return
    }

    container.style.right = offset + 'px'
    container.style.bottom = offset + 'px'
  }

  function setClosedSize() {
    // document.querySelector('body').style.backgroundColor = 'white'

    container.style.width = closedSize + 'px'
    container.style.height = closedSize + 'px'
    container.style.borderRadius = '56px'

    applyPosition()
  }

  function setOpenedSize() {
    // document.querySelector('body').style.backgroundColor = 'white'

    if (position === 'full') {
      container.style.left = '0'
      container.style.right = '0'
      container.style.top = '0'
      container.style.bottom = '0'
      container.style.width = '100vw'
      container.style.height = '100vh'
      container.style.transform = 'none'
      return
    }

    container.style.width = openedWidth + 'px'
    container.style.height = openedHeight + 'px'
    container.style.borderRadius = '20px'
    applyPosition()
  }

  applyPosition()

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
  iframe.allowTransparency = 'true'
  iframe.style.width = '100%'
  iframe.style.height = '100%'
  iframe.style.border = '0'
  iframe.style.background = 'transparent'
  iframe.style.display = 'block'

  window.addEventListener('message', function (event) {
    if (event.origin !== crmUrl) return

    if (!event.data || event.data.source !== 'omni-crm-widget') return

    if (event.data.type === 'open') {
      setOpenedSize()
    }

    if (event.data.type === 'close') {
      setClosedSize()
    }
  })

  container.appendChild(iframe)
  document.body.appendChild(container)
})()
