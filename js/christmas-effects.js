(() => {
  const isChristmas = () => {
    const now = new Date()
    const month = now.getMonth() + 1
    const day = now.getDate()
    return month === 12 && (day === 24 || day === 25)
  }

  const createSnow = () => {
    if (document.getElementById('snow-layer')) return

    const layer = document.createElement('div')
    layer.id = 'snow-layer'
    layer.className = 'snow-layer'
    document.body.appendChild(layer)

    const count = window.innerWidth <= 768 ? 28 : 54

    for (let i = 0; i < count; i++) {
      const flake = document.createElement('span')
      const size = 4 + Math.random() * 10
      const left = Math.random() * 100
      const duration = 8 + Math.random() * 8
      const delay = Math.random() * 8
      const sway = 2.4 + Math.random() * 3
      const opacity = 0.35 + Math.random() * 0.65

      flake.className = 'snowflake'
      flake.style.left = `${left}vw`
      flake.style.width = `${size}px`
      flake.style.height = `${size}px`
      flake.style.opacity = opacity
      flake.style.animationDuration = `${duration}s, ${sway}s`
      flake.style.animationDelay = `${delay}s, ${delay}s`

      layer.appendChild(flake)
    }
  }

  const attachChristmasHat = () => {
    const avatar = document.getElementById('avatar')
    if (!avatar) return
    if (avatar.closest('.christmas-avatar-wrap')) return

    const wrapper = document.createElement('span')
    wrapper.className = 'christmas-avatar-wrap'

    avatar.parentNode.insertBefore(wrapper, avatar)
    wrapper.appendChild(avatar)

    const hat = document.createElement('img')
    hat.className = 'christmas-hat'
    hat.src = '/img/christmas-hat.png'
    hat.alt = 'Christmas Hat'
    hat.decoding = 'async'
    wrapper.appendChild(hat)
  }

  const initChristmasEffects = () => {
    if (!isChristmas()) return
    createSnow()
    attachChristmasHat()
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initChristmasEffects, { once: true })
  } else {
    initChristmasEffects()
  }

  if (window.btf?.addGlobalFn) {
    btf.addGlobalFn('pjaxComplete', initChristmasEffects, 'christmasEffects')
  } else {
    window.addEventListener('pjax:complete', initChristmasEffects)
  }
})()
