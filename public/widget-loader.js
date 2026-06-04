;(function () {
  let currentScript = document.currentScript
  if (!currentScript) return

  let crmUrl = 'https://crm-admin-hibj.vercel.app'
  let siteId = currentScript.getAttribute('data-site-id') || 'default'
  let position = currentScript.getAttribute('data-position') || 'right'
  let theme = currentScript.getAttribute('data-theme') || 'light'

  let closedSize = 56
  let openedWidth = 380
  let openedHeight = 620
  let offset = 20

  let container = document.createElement('div')
  container.id = 'omni-crm-chat-widget-root'

  Object.assign(container.style, {
    position: 'fixed',
    zIndex: '2147483647',
    width: closedSize + 'px',
    height: closedSize + 'px',
    borderRadius: closedSize + 'px',
    border: '0',
    overflow: 'hidden',
    background: 'transparent',
    pointerEvents: 'auto'
  })

  function applyPosition() {
    container.style.left = 'auto'
    container.style.right = 'auto'
    container.style.top = 'auto'
    container.style.bottom = 'auto'
    container.style.transform = 'none'

    if (position === 'left') {
      container.style.left = offset + 'px'
      container.style.bottom = '10%'
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
    container.style.bottom = '10%'
  }

  function setClosedSize() {
    container.style.width = closedSize + 'px'
    container.style.height = closedSize + 'px'
    container.style.borderRadius = '56px'
    container.style.overflow = 'hidden'
    applyPosition()
  }

  function setOpenedSize() {
    if (position === 'full') {
      Object.assign(container.style, {
        left: '0',
        right: '0',
        top: '0',
        bottom: '0',
        width: '100vw',
        height: '100vh',
        borderRadius: '0',
        overflow: 'hidden',
        transform: 'none'
      })
      return
    }

    container.style.width = openedWidth + 'px'
    container.style.height = openedHeight + 'px'
    container.style.borderRadius = '18.55px'
    container.style.overflow = 'hidden'
    applyPosition()
  }

  applyPosition()

  let iframe = document.createElement('iframe')

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
  iframe.setAttribute('allowtransparency', 'true')

  Object.assign(iframe.style, {
    width: '100%',
    height: '100%',
    border: '0',
    background: 'transparent',
    display: 'block'
  })

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
