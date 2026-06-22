;(function () {
  /**
   * currentScript — это <script>, через который подключили виджет.
   *
   * Пример подключения:
   * <script
   *   src="https://crm-admin-hibj.vercel.app/widget-loader.js"
   *   data-site-id="profnastilvtashkente"
   *   data-position="left"
   *   data-theme="light"
   * ></script>
   */
  let currentScript = document.currentScript
  if (!currentScript) return

  /**
   * Главный домен CRM/чата.
   * Отсюда берется:
   * - iframe чата;
   * - картинка ассистента;
   * - публичная страница /widget/chat.
   */
  let crmUrl = 'https://crm-admin-hibj.vercel.app'

  /**
   * siteId — ID сайта, чтобы backend понимал, какой prompt/настройки использовать.
   * position — позиция виджета на сайте.
   * theme — тема виджета: light или dark.
   */
  let siteId = currentScript.getAttribute('data-site-id') || 'default'
  let position = currentScript.getAttribute('data-position') || 'left'
  let theme = currentScript.getAttribute('data-theme') || 'light'

  /**
   * Единые размеры виджета для всех сайтов.
   *
   * Эти значения задаются непосредственно внутри loader-файла.
   * Поэтому в HTML-подключение не нужно добавлять data-атрибуты
   * для ширины, высоты, минимального или максимального размера.
   *
   * buttonSize — размер круглой кнопки ассистента.
   * openedWidth — текущая ширина открытого окна чата.
   * openedHeight — текущая высота открытого окна чата.
   * minOpenedWidth / minOpenedHeight — минимальный размер.
   * maxOpenedWidth / maxOpenedHeight — максимальный размер.
   * offset — отступ виджета от края окна браузера.
   */
  let buttonSize = 60

  // Все виджеты впервые открываются с одинаковым размером 380 × 620 px.
  let openedWidth = 280
  let openedHeight = 360

  // Пользователь не сможет уменьшить окно меньше этих значений.
  let minOpenedWidth = 280
  let minOpenedHeight = 360

  // Пользователь не сможет увеличить окно больше этих значений.
  let maxOpenedWidth = 460
  let maxOpenedHeight = 680

  let offset = 30
  let opened = false

  /**
   * Сохраняем размер отдельно для каждого сайта.
   * После перезагрузки страницы пользователь получит тот же размер окна.
   */
  let sizeStorageKey = 'omni-crm-chat-size:' + siteId

  try {
    let savedSize = JSON.parse(sessionStorage.getItem(sizeStorageKey) || 'null')

    if (savedSize && Number.isFinite(savedSize.width) && savedSize.width > 0) {
      openedWidth = savedSize.width
    }

    if (
      savedSize &&
      Number.isFinite(savedSize.height) &&
      savedSize.height > 0
    ) {
      openedHeight = savedSize.height
    }
  } catch (error) {
    console.error(error)

    /**
     * В некоторых браузерах localStorage может быть запрещен.
     * В таком случае виджет продолжит работать без сохранения размера.
     */
  }

  /**
   * Настройки tooltip.
   *
   * tooltipIndex — какой текст tooltip будет следующим.
   * tooltipTimer — setInterval для автоматического показа tooltip.
   * tooltipHideTimer — setTimeout для скрытия tooltip.
   * tooltipHovering — true, когда пользователь навел курсор на кнопку.
   */
  let tooltipIndex = 0
  let tooltipTimer = null
  let tooltipHideTimer = null
  let tooltipHovering = false

  /**
   * Тексты автоматического tooltip.
   *
   * Они показываются по очереди:
   * 1. Узбекский
   * 2. Русский
   */

  const defaultMessage = {
    id: 'default',
    messages: ['Есть вопросы? Пишите 😊', 'Помочь с выбором? Мы онлайн 😊']
  }

  const sitesList = [
    {
      id: 'profnastilvtashkente',
      messages: ['Savol bormi? Yozing 😊', 'Есть вопросы? Пишите 😊']
    },
    {
      id: 'profnastilvspb',
      messages: [
        'Обращайтесь в любом формате 😊',
        'Помочь с выбором? Мы онлайн 😊'
      ]
    },
    {
      id: 'profnastilmoskva',
      messages: [
        'Обращайтесь в любом формате 😊',
        'Помочь с выбором? Мы онлайн 😊'
      ]
    },
    {
      id: 'sendvichpanel',
      messages: [
        'Обращайтесь в любом формате 😊',
        'Помочь с выбором? Мы онлайн 😊'
      ]
    },
    {
      id: 'chernyjmetall',
      messages: [
        'Обращайтесь в любом формате 😊',
        'Помочь с выбором? Мы онлайн 😊'
      ]
    },
    {
      id: 'pkmm',
      messages: [
        'Обращайтесь в любом формате 😊',
        'Помочь с выбором? Мы онлайн 😊'
      ]
    },
    {
      id: 'sandwichpanelsvspb',
      messages: [
        'Обращайтесь в любом формате 😊',
        'Помочь с выбором? Мы онлайн 😊'
      ]
    },
    {
      id: 'evroshtaketnikmoskva',
      messages: [
        'Обращайтесь в любом формате 😊',
        'Помочь с выбором? Мы онлайн 😊'
      ]
    }
  ]

  const currentSite =
    sitesList.find(site => site.id === siteId) || defaultMessage

  const tooltipMessages = currentSite.messages

  /**
   * currentTooltipText хранит последний показанный текст.
   *
   * Это нужно для hover:
   * - если последним был узбекский tooltip, при наведении останется узбекский;
   * - если последним был русский tooltip, при наведении останется русский.
   */
  let currentTooltipText = tooltipMessages[0]

  /**
   * root — главный контейнер всего виджета.
   *
   * Внутри root находятся:
   * - iframe чата;
   * - tooltip;
   * - кнопка ассистента.
   *
   * pointerEvents: 'none' нужен, чтобы большой контейнер root
   * не перекрывал клики по сайту.
   *
   * Кнопке и iframe отдельно задается pointerEvents: 'auto',
   * поэтому они остаются кликабельными.
   */
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

  /**
   * getPanelWidth() считает адаптивную ширину окна чата.
   *
   * Если экран меньше openedWidth,
   * окно не выходит за пределы экрана.
   */
  /**
   * clamp(value, min, max)
   *
   * Ограничивает число допустимым диапазоном.
   * Это не дает пользователю сделать чат слишком маленьким
   * или растянуть его за пределы экрана.
   */
  function clamp(value, min, max) {
    return Math.min(Math.max(value, min), max)
  }

  function getPanelWidth() {
    let availableWidth = Math.max(0, window.innerWidth - offset * 2)
    let allowedMaxWidth = Math.min(maxOpenedWidth, availableWidth)
    let allowedMinWidth = Math.min(minOpenedWidth, allowedMaxWidth)

    return clamp(openedWidth, allowedMinWidth, allowedMaxWidth)
  }

  /**
   * getPanelHeight() считает адаптивную высоту окна чата.
   *
   * Для стандартной позиции left нижний отступ равен 10% высоты окна,
   * поэтому отдельно учитываем это при вычислении максимальной высоты.
   */
  function getPanelHeight() {
    let bottomSpace =
      position === 'left' ? Math.max(offset, window.innerHeight * 0.1) : offset

    let availableHeight = Math.max(0, window.innerHeight - bottomSpace - offset)

    let allowedMaxHeight = Math.min(maxOpenedHeight, availableHeight)
    let allowedMinHeight = Math.min(minOpenedHeight, allowedMaxHeight)

    return clamp(openedHeight, allowedMinHeight, allowedMaxHeight)
  }

  /**
   * saveCurrentSize()
   *
   * Сохраняет выбранный пользователем размер между перезагрузками страницы.
   */
  function saveCurrentSize() {
    try {
      sessionStorage.setItem(
        sizeStorageKey,
        JSON.stringify({
          width: openedWidth,
          height: openedHeight
        })
      )
    } catch (error) {
      console.error(error)

      /**
       * Ошибка сохранения не должна ломать сам виджет.
       */
    }
  }

  /**
   * applyPosition() ставит виджет в нужное место экрана.
   *
   * Доступные позиции:
   * - left
   * - right
   * - top-left
   * - top-right
   * - center
   * - full
   *
   * По умолчанию используется left.
   */
  function applyPosition() {
    /**
     * Сначала сбрасываем все позиционные стили,
     * чтобы при повторном вызове не оставались старые значения.
     */
    root.style.left = 'auto'
    root.style.right = 'auto'
    root.style.top = 'auto'
    root.style.bottom = 'auto'
    root.style.transform = 'none'

    if (position === 'right') {
      root.style.right = '3vw'
      root.style.bottom = '3vh'
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

    /**
     * Позиция по умолчанию.
     * Виджет слева и чуть выше нижнего края экрана.
     */
    root.style.left = offset + 'px'
    root.style.bottom = '10%'
  }

  /**
   * Создаем CSS-стили и добавляем их в <head> сайта.
   *
   * Здесь находятся:
   * - анимация зеленой точки;
   * - hover-эффект кнопки;
   * - анимация tooltip;
   * - адаптив для мобильных устройств.
   */
  let style = document.createElement('style')
  style.textContent = `
    /**
     * omniCrmPing — анимация пульсации зеленой точки.
     * Используется для онлайн-индикатора на кнопке.
     */
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

    /**
     * Стили кнопки ассистента.
     * transition делает hover плавным.
     */
    #omni-crm-chat-button {
      transition: transform .18s ease, box-shadow .18s ease;
    }

    /**
     * Hover кнопки.
     * Кнопка немного поднимается и получает более сильную тень.
     */
    #omni-crm-chat-button:hover {
      transform: translateY(-2px);
      box-shadow: 0 18px 36px rgba(0, 0, 0, .28) !important;
    }

    /**
     * Tooltip плавно появляется и исчезает.
     */
    #omni-crm-tooltip {
      transition: opacity .18s ease, transform .18s ease, visibility .18s ease;
    }

    /**
     * Адаптив для телефонов.
     * root занимает почти всю ширину экрана,
     * чтобы tooltip и чат не выходили за границы.
     */
    @media (max-width: 480px) {
      #omni-crm-chat-widget-root {
        max-width: calc(100vw - 24px) !important;
      }

      /**
       * Tooltip на телефоне:
       * - становится уже;
       * - текст переносится;
       * - уменьшается размер шрифта.
       */
      #omni-crm-tooltip {
        max-width: calc(100vw - 64px) !important;
        width: auto;
        font-size: 12px !important;
        line-height: 1.15 !important;
        white-space: normal !important;
        right: 72px !important;
        padding: 8px 10px !important;
      }
    }
  `
  document.head.appendChild(style)

  /**
   * iframe — окно самого чата.
   *
   * В закрытом состоянии iframe скрыт.
   * При открытии чата iframe становится видимым.
   */
  let iframe = document.createElement('iframe')

  /**
   * В URL iframe передаем:
   * - siteId;
   * - theme;
   * - pageUrl текущей страницы.
   *
   * pageUrl нужен, чтобы менеджер видел,
   * с какой страницы пришел клиент.
   */
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
    /**
     * iframe расположен внутри root.
     */
    position: 'absolute',
    left: '0',

    /**
     * В закрытом состоянии iframe находится выше кнопки,
     * но он скрыт через display: none.
     */
    bottom: buttonSize + 16 + 'px',

    /**
     * Адаптивные размеры окна.
     */
    width: getPanelWidth() + 'px',
    height: getPanelHeight() + 'px',

    border: '1px solid #e5e5e5',
    borderRadius: '18px',
    background: 'transparent',

    /**
     * Изначально чат скрыт.
     */
    display: 'none',

    /**
     * iframe должен принимать клики.
     */
    pointerEvents: 'auto',

    /**
     * Тень вокруг открытого окна чата.
     */
    boxShadow: '0 18px 50px rgba(0, 0, 0, .25)',

    /**
     * Обрезает содержимое по скругленным углам.
     */
    overflow: 'hidden'
  })

  /**
   * button — круглая кнопка ассистента.
   *
   * Она находится рядом с tooltip и открывает чат.
   */
  let button = document.createElement('button')
  button.type = 'button'
  button.id = 'omni-crm-chat-button'
  button.setAttribute('aria-label', 'Открыть чат')

  Object.assign(button.style, {
    position: 'absolute',
    right: position === 'right' ? '0' : '',
    left: position === 'left' ? '0' : '',
    bottom: '0',
    width: buttonSize + 'px',
    height: buttonSize + 'px',
    borderRadius: '999px',
    border: '0',
    padding: '0',
    margin: '0',
    cursor: 'pointer',

    /**
     * Кнопка остается кликабельной,
     * несмотря на pointerEvents: none у root.
     */
    pointerEvents: 'auto',

    background: '#08b7ef',
    boxShadow: '0 14px 30px rgba(0, 0, 0, .25)'
  })

  /**
   * Содержимое кнопки:
   * 1. Картинка ассистента.
   * 2. Пульсирующая зеленая точка.
   * 3. Основная зеленая точка онлайн-статуса.
   */
  /**
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
    <svg xmlns="http://www.w3.org/2000/svg" width="${buttonSize / 1.5}" height="${buttonSize / 1.5}" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-mic-icon lucide-mic"><path d="M12 19v3"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><rect x="9" y="2" width="6" height="13" rx="3"/></svg>
  **/
  button.innerHTML = `
    <!-- Фото / иконка ассистента -->
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
    <!-- Пульсация вокруг зеленой точки -->
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

    <!-- Основная зеленая точка онлайн -->
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

  /**
   * tooltip — всплывающая подсказка рядом с кнопкой.
   *
   * Используется в двух сценариях:
   * 1. Показывается автоматически каждые несколько секунд.
   * 2. Показывается при наведении на кнопку.
   *
   * При наведении показывается последний язык:
   * - если последним был узбекский — остается узбекский;
   * - если последним был русский — остается русский.
   */
  let tooltip = document.createElement('div')
  tooltip.id = 'omni-crm-tooltip'
  tooltip.textContent = currentTooltipText

  Object.assign(tooltip.style, {
    position: 'absolute',

    /**
     * Расположение tooltip справа от кнопки.
     */
    right: position === 'right' ? buttonSize + 12 + 'px' : '',
    left: position === 'left' ? buttonSize + 12 + 'px' : '',
    bottom: '13px',

    /**
     * Размеры tooltip.
     */
    maxWidth: '100vw',
    width: 'auto',

    /**
     * Внутренние отступы.
     */
    padding: '10px 14px',

    /**
     * Скругление.
     */
    borderRadius: '14px',

    /**
     * Типографика tooltip.
     */
    fontSize: '14px',
    lineHeight: '16px',
    fontWeight: '400',
    letterSpacing: '0',

    /**
     * На десктопе текст в одну строку.
     * На мобильном white-space меняется на normal через media query.
     */
    whiteSpace: 'nowrap',

    /**
     * Цвет tooltip зависит от темы сайта.
     */
    background:
      theme === 'light' ? 'rgba(234,231,231,1)' : 'rgba(234,231,231,1)',
    color: theme === 'light' ? '#0f172a' : '#ffffff',

    /**
     * Тень tooltip.
     */
    boxShadow: '0 12px 30px rgba(0, 0, 0, .16)',

    /**
     * Изначально tooltip скрыт.
     */
    opacity: '0',
    visibility: 'hidden',
    transform: 'translateX(-6px)',

    /**
     * Tooltip не перехватывает клики.
     */
    pointerEvents: 'none'
  })

  /**
   * resizeHandle — ручка изменения размера открытого окна чата.
   *
   * Пользователь может:
   * - зажать ее мышью и потянуть;
   * - потянуть пальцем на сенсорном экране;
   * - использовать стрелки клавиатуры, когда ручка в фокусе.
   */
  let resizeHandle = document.createElement('button')
  resizeHandle.type = 'button'
  resizeHandle.id = 'omni-crm-resize-handle'
  resizeHandle.setAttribute('aria-label', 'Изменить размер окна чата')
  resizeHandle.title = 'Потяните, чтобы изменить размер окна'

  Object.assign(resizeHandle.style, {
    position: 'absolute',
    zIndex: '5',
    width: '30px',
    height: '30px',
    borderRadius: '999px',
    border: '1px solid rgba(255, 255, 255, .9)',
    padding: '0',
    margin: '0',
    display: 'none',
    opacity: '0',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#ffffff',
    background: 'rgba(15, 23, 42, .82)',
    boxShadow: '0 6px 18px rgba(0, 0, 0, .25)',
    pointerEvents: 'auto',
    touchAction: 'none',
    userSelect: 'none',
    cursor: 'nwse-resize',
    transition:
      'transform .18s ease, background .18s ease, box-shadow .18s ease'
  })

  resizeHandle.addEventListener('mouseenter', function () {
    // resizeHandle.style.transform = 'scale(1.08)'
    // resizeHandle.style.background = 'rgba(37, 99, 235, .95)'
    // resizeHandle.style.boxShadow = '0 10px 26px rgba(0, 0, 0, .35)'
    resizeHandle.style.opacity = '1'
  })

  resizeHandle.addEventListener('mouseleave', function () {
    // resizeHandle.style.transform = 'scale(1)'
    // resizeHandle.style.background = 'rgba(15, 23, 42, .82)'
    // resizeHandle.style.boxShadow = '0 6px 18px rgba(0, 0, 0, .25)'
    resizeHandle.style.opacity = '0'
  })

  resizeHandle.innerHTML = `
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
        aria-hidden="true"
      >
        <path d="M15 3h6v6" />
        <path d="M9 21H3v-6" />
        <path d="M21 3l-7 7" />
        <path d="M3 21l7-7" />
      </svg>
  `

  /**
   * Состояние текущего drag-resize.
   */
  let resizeState = null
  let previousBodyUserSelect = ''

  /**
   * updateResizeHandlePlacement()
   *
   * Ставит ручку в тот угол, из которого удобно растягивать чат
   * с учетом текущей позиции виджета.
   */
  function updateResizeHandlePlacement() {
    resizeHandle.style.left = 'auto'
    resizeHandle.style.right = 'auto'
    resizeHandle.style.top = 'auto'
    resizeHandle.style.bottom = 'auto'

    if (position === 'right') {
      resizeHandle.style.left = '-8px'
      resizeHandle.style.top = '-8px'
      resizeHandle.style.cursor = 'nwse-resize'
      resizeHandle.style.transform = 'rotate(-90deg)'
      return
    }

    if (position === 'top-left') {
      resizeHandle.style.right = '-8px'
      resizeHandle.style.bottom = '-8px'
      resizeHandle.style.cursor = 'nwse-resize'
      return
    }

    if (position === 'top-right') {
      resizeHandle.style.left = '-8px'
      resizeHandle.style.bottom = '-8px'
      resizeHandle.style.cursor = 'nesw-resize'
      return
    }

    if (position === 'center') {
      resizeHandle.style.right = '-8px'
      resizeHandle.style.bottom = '-8px'
      resizeHandle.style.cursor = 'nwse-resize'
      return
    }

    /**
     * Позиция left по умолчанию:
     * ручка находится в правом верхнем углу.
     */
    resizeHandle.style.right = '-8px'
    resizeHandle.style.top = '-8px'
    resizeHandle.style.cursor = 'nesw-resize'
  }

  /**
   * applyOpenedPanelSize()
   *
   * Применяет текущие openedWidth/openedHeight к root и iframe.
   * Вызывается при открытии, изменении размера и resize окна браузера.
   */
  function applyOpenedPanelSize() {
    let panelWidth = getPanelWidth()
    let panelHeight = getPanelHeight()

    Object.assign(root.style, {
      width: panelWidth + 'px',
      height: panelHeight + 'px'
    })

    Object.assign(iframe.style, {
      left: '0',
      right: 'auto',
      top: 'auto',
      bottom: '0',
      width: panelWidth + 'px',
      height: panelHeight + 'px',
      borderRadius: window.innerWidth <= 480 ? '16px' : '18px'
    })

    updateResizeHandlePlacement()
    applyPosition()
  }

  function getHorizontalResizeDirection() {
    return position === 'right' || position === 'top-right' ? -1 : 1
  }

  function getVerticalResizeDirection() {
    return position === 'left' || position === 'right' ? -1 : 1
  }

  function onResizePointerMove(event) {
    if (!resizeState) return

    let horizontalDelta =
      (event.clientX - resizeState.startX) * resizeState.horizontalDirection

    let verticalDelta =
      (event.clientY - resizeState.startY) * resizeState.verticalDirection

    openedWidth = resizeState.startWidth + horizontalDelta
    openedHeight = resizeState.startHeight + verticalDelta

    /**
     * getPanelWidth/getPanelHeight дополнительно ограничат размеры
     * минимальными, максимальными и доступной областью экрана.
     */
    openedWidth = getPanelWidth()
    openedHeight = getPanelHeight()

    applyOpenedPanelSize()
  }

  function finishResize(event) {
    if (!resizeState) return

    if (
      event &&
      Number.isFinite(event.pointerId) &&
      resizeHandle.hasPointerCapture &&
      resizeHandle.hasPointerCapture(event.pointerId)
    ) {
      resizeHandle.releasePointerCapture(event.pointerId)
    }

    resizeState = null
    iframe.style.pointerEvents = 'auto'
    document.body.style.userSelect = previousBodyUserSelect

    window.removeEventListener('pointermove', onResizePointerMove)
    window.removeEventListener('pointerup', finishResize)
    window.removeEventListener('pointercancel', finishResize)

    saveCurrentSize()
  }

  resizeHandle.addEventListener('pointerdown', function (event) {
    // Ручное изменение размера доступно всегда, кроме режима full.
    if (!opened || position === 'full') return

    event.preventDefault()

    resizeState = {
      startX: event.clientX,
      startY: event.clientY,
      startWidth: getPanelWidth(),
      startHeight: getPanelHeight(),
      horizontalDirection: getHorizontalResizeDirection(),
      verticalDirection: getVerticalResizeDirection()
    }

    previousBodyUserSelect = document.body.style.userSelect
    document.body.style.userSelect = 'none'

    /**
     * Пока пользователь тянет ручку, временно отключаем события iframe.
     * Иначе iframe может перехватить указатель у родительской страницы.
     */
    iframe.style.pointerEvents = 'none'

    if (resizeHandle.setPointerCapture) {
      resizeHandle.setPointerCapture(event.pointerId)
    }

    window.addEventListener('pointermove', onResizePointerMove)
    window.addEventListener('pointerup', finishResize)
    window.addEventListener('pointercancel', finishResize)
  })

  /**
   * Доступное изменение размера с клавиатуры.
   * Обычная стрелка меняет размер на 10 px,
   * Shift + стрелка — на 40 px.
   */
  resizeHandle.addEventListener('keydown', function (event) {
    if (!opened || position === 'full') return

    let step = event.shiftKey ? 40 : 10
    let handled = true

    if (event.key === 'ArrowRight') {
      openedWidth += step
    } else if (event.key === 'ArrowLeft') {
      openedWidth -= step
    } else if (event.key === 'ArrowDown') {
      openedHeight += step
    } else if (event.key === 'ArrowUp') {
      openedHeight -= step
    } else {
      handled = false
    }

    if (!handled) return

    event.preventDefault()

    openedWidth = getPanelWidth()
    openedHeight = getPanelHeight()

    applyOpenedPanelSize()
    saveCurrentSize()
  })

  updateResizeHandlePlacement()

  /**
   * showTooltip(text)
   *
   * Показывает tooltip.
   *
   * Если передали text:
   * - обновляет currentTooltipText;
   * - показывает новый текст.
   *
   * Если text не передали:
   * - показывает последний сохраненный currentTooltipText.
   *
   * Это нужно, чтобы при hover сохранялся язык последнего автоматического tooltip.
   */
  function showTooltip(text) {
    if (opened) return

    if (text) {
      currentTooltipText = text
    }

    tooltip.textContent = currentTooltipText
    tooltip.style.opacity = '1'
    tooltip.style.visibility = 'visible'
    tooltip.style.transform = 'translateX(0)'
  }

  /**
   * hideTooltip()
   *
   * Скрывает tooltip.
   */
  function hideTooltip() {
    tooltip.style.opacity = '0'
    tooltip.style.visibility = 'hidden'
    tooltip.style.transform = 'translateX(-6px)'
  }

  /**
   * showAutoTooltip()
   *
   * Автоматически показывает tooltip.
   *
   * Не показывает tooltip, если:
   * - чат открыт;
   * - пользователь прямо сейчас навел курсор на кнопку.
   */
  function showAutoTooltip() {
    if (opened || tooltipHovering) return

    /**
     * Показываем текущий текст из массива tooltipMessages.
     * showTooltip сам сохранит его в currentTooltipText.
     */
    showTooltip(tooltipMessages[tooltipIndex])

    /**
     * Переключаем индекс на следующее сообщение.
     * После последнего элемента возвращаемся к первому.
     */
    tooltipIndex = (tooltipIndex + 1) % tooltipMessages.length

    /**
     * Если уже был таймер скрытия — очищаем.
     */
    clearTimeout(tooltipHideTimer)

    /**
     * Скрываем tooltip через 4 секунды.
     * Если в этот момент пользователь навел курсор,
     * tooltip не скрываем.
     */
    tooltipHideTimer = setTimeout(function () {
      if (!tooltipHovering) {
        hideTooltip()
      }
    }, 4000)
  }

  /**
   * startAutoTooltip()
   *
   * Запускает автоматический показ tooltip.
   *
   * 7000 — tooltip показывается каждые 7 секунд.
   * 1200 — первый показ через 1.2 секунды после загрузки.
   */
  function startAutoTooltip() {
    stopAutoTooltip()

    tooltipTimer = setInterval(function () {
      showAutoTooltip()
    }, 7000)

    setTimeout(function () {
      showAutoTooltip()
    }, 1200)
  }

  /**
   * stopAutoTooltip()
   *
   * Останавливает автоматический tooltip.
   * Используется при открытии чата.
   */
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

  /**
   * openChat()
   *
   * Открывает чат:
   * - меняет состояние opened;
   * - останавливает tooltip;
   * - показывает iframe;
   * - скрывает кнопку;
   * - меняет размеры root и iframe.
   */
  function openChat() {
    opened = true
    stopAutoTooltip()

    iframe.style.display = 'block'
    button.style.display = 'none'

    /**
     * Если position === 'full',
     * чат открывается на весь экран.
     */
    if (position === 'full') {
      resizeHandle.style.display = 'none'

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

    /**
     * Обычный режим открытия.
     * Чат открывается небольшим окном.
     */
    resizeHandle.style.display = 'flex'
    applyOpenedPanelSize()
  }

  /**
   * closeChat()
   *
   * Закрывает чат:
   * - скрывает iframe;
   * - показывает кнопку;
   * - возвращает размеры root;
   * - запускает автоматический tooltip снова.
   */
  function closeChat() {
    opened = false

    iframe.style.display = 'none'
    button.style.display = 'block'
    resizeHandle.style.display = 'none'

    /**
     * Если чат закрыли во время изменения размера,
     * корректно завершаем resize-сессию.
     */
    finishResize()

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

  /**
   * Наведение на кнопку.
   *
   * Важно:
   * showTooltip() вызывается без текста,
   * поэтому показывается currentTooltipText.
   *
   * То есть если последним был узбекский tooltip,
   * при наведении останется узбекский.
   */
  button.addEventListener('mouseenter', function () {
    tooltipHovering = true

    if (tooltipHideTimer) {
      clearTimeout(tooltipHideTimer)
      tooltipHideTimer = null
    }

    showTooltip()
  })

  /**
   * Когда курсор уходит с кнопки,
   * tooltip скрывается.
   */
  button.addEventListener('mouseleave', function () {
    tooltipHovering = false
    hideTooltip()
  })

  /**
   * Клик по кнопке открывает чат.
   */
  button.addEventListener('click', function () {
    openChat()
  })

  /**
   * Слушаем сообщения из iframe.
   *
   * iframe может отправить:
   * - open — открыть чат;
   * - close — закрыть чат.
   *
   * Проверка event.origin защищает от сообщений с других сайтов.
   */
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

  /**
   * При изменении размера окна пересчитываем размеры.
   *
   * Это нужно для адаптива:
   * - на телефоне;
   * - при повороте экрана;
   * - при изменении ширины браузера.
   */
  window.addEventListener('resize', function () {
    if (opened) {
      openChat()
    } else {
      closeChat()
    }
  })

  /**
   * Сразу выставляем позицию виджета.
   */
  applyPosition()

  /**
   * Добавляем элементы в root.
   *
   * Порядок важен:
   * 1. iframe — окно чата;
   * 2. tooltip — всплывающая подсказка;
   * 3. button — кнопка ассистента.
   */
  root.appendChild(iframe)
  root.appendChild(tooltip)
  root.appendChild(resizeHandle)
  root.appendChild(button)

  /**
   * Вставляем root на сайт клиента.
   */
  document.body.appendChild(root)

  /**
   * Запускаем автоматический tooltip.
   */
  startAutoTooltip()
})()
