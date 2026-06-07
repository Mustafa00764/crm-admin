;(function () {
  let currentScript = document.currentScript
  if (!currentScript) return

  let crmUrl = 'https://crm-admin-hibj.vercel.app'
  let siteId = currentScript.getAttribute('data-site-id') || 'default'
  let position = currentScript.getAttribute('data-position') || 'left'
  let theme = currentScript.getAttribute('data-theme') || 'light'

  let buttonSize = 60
  let openedWidth = 380
  let openedHeight = 620
  let offset = 20
  let opened = false

  // Автоматические сообщения tooltip.
  // Сначала узбекский, потом русский.
  let tooltipIndex = 0
  let tooltipTimer = null
  let tooltipHideTimer = null
  let tooltipHovering = false

  const tooltipMessages = [
    'Savolingiz bormi? Yozing, yordam beraman 😊',
    'Есть вопросы? Напишите, мы онлайн 😊'
  ]

  const hoverTooltipText = 'Есть вопросы? Напишите, мы онлайн 😊'

  let root = document.createElement('div')
  root.id = 'omni-crm-chat-widget-root'

  Object.assign(root.style, {
    position: 'fixed',
    zIndex: '2147483647',
    width: openedWidth + 'px',
    height: openedHeight + buttonSize + 24 + 'px',
    background: 'transparent',
    pointerEvents: 'none'
  })

  function getPanelWidth() {
    return Math.min(openedWidth, window.innerWidth - offset * 2)
  }

  function getPanelHeight() {
    return Math.min(openedHeight, window.innerHeight - buttonSize - offset * 3)
  }

  function applyPosition() {
    root.style.left = 'auto'
    root.style.right = 'auto'
    root.style.top = 'auto'
    root.style.bottom = 'auto'
    root.style.transform = 'none'

    if (position === 'right') {
      root.style.right = offset + 'px'
      root.style.bottom = offset + 'px'
      return
    }

    if (position === 'top-left') {
      root.style.left = offset + 'px'
      root.style.top = offset + 'px'
      return
    }

    if (position === 'top-right') {
      root.style.right = offset + 'px'
      root.style.top = offset + 'px'
      return
    }

    if (position === 'center') {
      root.style.left = '50%'
      root.style.top = '50%'
      root.style.transform = 'translate(-50%, -50%)'
      return
    }

    root.style.left = offset + 'px'
    root.style.bottom = '10%'
  }

  let style = document.createElement('style')
  style.textContent = `
    @keyframes omniCrmPing {
      0% {
        transform: scale(1);
        opacity: .65;
      }

      75%, 100% {
        transform: scale(2.2);
        opacity: 0;
      }
    }

    #omni-crm-chat-button {
      transition: transform .18s ease, box-shadow .18s ease;
    }

    #omni-crm-chat-button:hover {
      transform: translateY(-2px);
      box-shadow: 0 18px 36px rgba(0, 0, 0, .28) !important;
    }

    #omni-crm-tooltip {
      transition: opacity .18s ease, transform .18s ease, visibility .18s ease;
    }

    @media (max-width: 480px) {
      #omni-crm-chat-widget-root {
        left: 12px !important;
        right: 12px !important;
        width: calc(100vw - 24px) !important;
      }

      #omni-crm-tooltip {
        max-width: calc(100vw - 96px) !important;
        font-size: 13px !important;
        line-height: 1.35 !important;
        white-space: normal !important;
        left: 72px !important;
      }
    }
  `
  document.head.appendChild(style)

  let iframe = document.createElement('iframe')

  iframe.src =
    crmUrl +
    '/widget/chat?siteId=' +
    encodeURIComponent(siteId) +
    '&theme=' +
    encodeURIComponent(theme) +
    '&pageUrl=' +
    encodeURIComponent(window.location.href)

  iframe.title = 'Online Chat'
  iframe.allow = 'microphone'
  iframe.setAttribute('allowtransparency', 'true')

  Object.assign(iframe.style, {
    position: 'absolute',
    left: '0',
    bottom: buttonSize + 16 + 'px',
    width: getPanelWidth() + 'px',
    height: getPanelHeight() + 'px',
    border: '0',
    borderRadius: '18px',
    background: 'transparent',
    display: 'none',
    pointerEvents: 'auto',
    boxShadow: '0 18px 50px rgba(0, 0, 0, .25)',
    overflow: 'hidden'
  })

  let button = document.createElement('button')
  button.type = 'button'
  button.id = 'omni-crm-chat-button'
  button.setAttribute('aria-label', 'Открыть чат')

  Object.assign(button.style, {
    position: 'absolute',
    left: '0',
    bottom: '0',
    width: buttonSize + 'px',
    height: buttonSize + 'px',
    borderRadius: '999px',
    border: '0',
    padding: '0',
    margin: '0',
    cursor: 'pointer',
    pointerEvents: 'auto',
    background: 'transparent',
    boxShadow: '0 14px 30px rgba(0, 0, 0, .25)'
  })

  button.innerHTML = `
    <img
      src="${crmUrl}/images/assistant-2.png"
      alt="assistant"
      style="
        width: ${buttonSize}px;
        height: ${buttonSize}px;
        border-radius: 999px;
        object-fit: cover;
        object-position: top;
        display: block;
      "
    />

    <span
      style="
        position: absolute;
        right: 2px;
        bottom: 2px;
        width: 14px;
        height: 14px;
        border-radius: 999px;
        background: #22c55e;
        opacity: .6;
        animation: omniCrmPing 1.4s cubic-bezier(0, 0, .2, 1) infinite;
        z-index: 1;
      "
    ></span>

    <span
      style="
        position: absolute;
        right: 2px;
        bottom: 2px;
        width: 14px;
        height: 14px;
        border-radius: 999px;
        background: #22c55e;
        border: 2px solid ${theme === 'light' ? '#ffffff' : '#090b10'};
        box-sizing: border-box;
        z-index: 2;
      "
    ></span>
  `

  let tooltip = document.createElement('div')
  tooltip.id = 'omni-crm-tooltip'
  tooltip.textContent = hoverTooltipText

  Object.assign(tooltip.style, {
    position: 'absolute',
    left: buttonSize + 12 + 'px',
    bottom: '13px',
    maxWidth: '300px',
    padding: '10px 14px',
    borderRadius: '14px',
    fontSize: '14px',
    lineHeight: '16px',
    fontWeight: '400',
    letterSpacing: '0',
    whiteSpace: 'nowrap',
    background: theme === 'light' ? '#ffffff' : '#090b10',
    color: theme === 'light' ? '#0f172a' : '#ffffff',
    boxShadow: '0 12px 30px rgba(0, 0, 0, .16)',
    opacity: '0',
    visibility: 'hidden',
    transform: 'translateX(-6px)',
    pointerEvents: 'none'
  })

  function showTooltip(text) {
    if (opened) return

    tooltip.textContent = text || hoverTooltipText
    tooltip.style.opacity = '1'
    tooltip.style.visibility = 'visible'
    tooltip.style.transform = 'translateX(0)'
  }

  function hideTooltip() {
    tooltip.style.opacity = '0'
    tooltip.style.visibility = 'hidden'
    tooltip.style.transform = 'translateX(-6px)'
  }

  function showAutoTooltip() {
    if (opened || tooltipHovering) return

    showTooltip(tooltipMessages[tooltipIndex])

    tooltipIndex = (tooltipIndex + 1) % tooltipMessages.length

    clearTimeout(tooltipHideTimer)

    tooltipHideTimer = setTimeout(function () {
      if (!tooltipHovering) {
        hideTooltip()
      }
    }, 3500)
  }

  function startAutoTooltip() {
    stopAutoTooltip()

    tooltipTimer = setInterval(function () {
      showAutoTooltip()
    }, 7000)

    setTimeout(function () {
      showAutoTooltip()
    }, 1200)
  }

  function stopAutoTooltip() {
    if (tooltipTimer) {
      clearInterval(tooltipTimer)
      tooltipTimer = null
    }

    if (tooltipHideTimer) {
      clearTimeout(tooltipHideTimer)
      tooltipHideTimer = null
    }

    hideTooltip()
  }

  function openChat() {
    opened = true
    stopAutoTooltip()

    iframe.style.display = 'block'
    button.style.display = 'none'

    if (position === 'full') {
      Object.assign(root.style, {
        left: '0',
        right: '0',
        top: '0',
        bottom: '0',
        width: '100vw',
        height: '100vh',
        transform: 'none'
      })

      Object.assign(iframe.style, {
        left: '0',
        right: '0',
        top: '0',
        bottom: '0',
        width: '100vw',
        height: '100vh',
        borderRadius: '0'
      })

      return
    }

    let panelWidth = getPanelWidth()
    let panelHeight = getPanelHeight()

    Object.assign(root.style, {
      width: panelWidth + 'px',
      height: panelHeight + 'px'
    })

    Object.assign(iframe.style, {
      left: '0',
      bottom: '0',
      width: panelWidth + 'px',
      height: panelHeight + 'px',
      borderRadius: window.innerWidth <= 480 ? '16px' : '18px'
    })

    applyPosition()
  }

  function closeChat() {
    opened = false

    iframe.style.display = 'none'
    button.style.display = 'block'

    let panelWidth = getPanelWidth()
    let panelHeight = getPanelHeight()

    Object.assign(root.style, {
      width: panelWidth + 'px',
      height: panelHeight + buttonSize + 24 + 'px'
    })

    Object.assign(iframe.style, {
      position: 'absolute',
      left: '0',
      bottom: buttonSize + 16 + 'px',
      width: panelWidth + 'px',
      height: panelHeight + 'px',
      borderRadius: '18px'
    })

    applyPosition()
    startAutoTooltip()
  }

  button.addEventListener('mouseenter', function () {
    tooltipHovering = true

    if (tooltipHideTimer) {
      clearTimeout(tooltipHideTimer)
      tooltipHideTimer = null
    }

    showTooltip(hoverTooltipText)
  })

  button.addEventListener('mouseleave', function () {
    tooltipHovering = false
    hideTooltip()
  })

  button.addEventListener('click', function () {
    openChat()
  })

  window.addEventListener('message', function (event) {
    if (event.origin !== crmUrl) return
    if (!event.data || event.data.source !== 'omni-crm-widget') return

    if (event.data.type === 'open') {
      openChat()
    }

    if (event.data.type === 'close') {
      closeChat()
    }
  })

  window.addEventListener('resize', function () {
    if (opened) {
      openChat()
    } else {
      closeChat()
    }
  })

  applyPosition()

  root.appendChild(iframe)
  root.appendChild(tooltip)
  root.appendChild(button)
  document.body.appendChild(root)

  startAutoTooltip()
})()
