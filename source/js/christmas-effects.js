(() => {
  const meteorState = {
    canvas: null,
    ctx: null,
    animationId: 0,
    stars: [],
    meteors: [],
    sparks: [],
    spawnTimer: 0,
    lastTime: 0,
    width: 0,
    height: 0,
    dpr: 1,
    resizeHandler: null
  }

  const isChristmas = () => {
    const now = new Date()
    const month = now.getMonth() + 1
    const day = now.getDate()
    return month === 12 && (day === 24 || day === 25)
  }

  const isMeteorWindow = (date = new Date()) => {
    const minutes = date.getHours() * 60 + date.getMinutes()
    return minutes >= (23 * 60 + 59) || minutes <= 5
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

  const buildMeteorStars = () => {
    meteorState.stars.length = 0
    const layers = [90, 70, 40]

    layers.forEach((count, layer) => {
      for (let i = 0; i < count; i++) {
        meteorState.stars.push({
          x: Math.random() * meteorState.width,
          y: Math.random() * meteorState.height,
          r: Math.random() * (layer === 0 ? 1.6 : layer === 1 ? 1.15 : 0.8) + 0.2,
          a: Math.random() * 0.7 + 0.15,
          twinkle: Math.random() * Math.PI * 2,
          speed: 0.4 + Math.random() * 1.2
        })
      }
    })
  }

  const resizeMeteorCanvas = () => {
    if (!meteorState.canvas || !meteorState.ctx) return

    meteorState.dpr = Math.min(window.devicePixelRatio || 1, 2)
    meteorState.width = window.innerWidth
    meteorState.height = window.innerHeight
    meteorState.canvas.width = Math.floor(meteorState.width * meteorState.dpr)
    meteorState.canvas.height = Math.floor(meteorState.height * meteorState.dpr)
    meteorState.canvas.style.width = `${meteorState.width}px`
    meteorState.canvas.style.height = `${meteorState.height}px`
    meteorState.ctx.setTransform(meteorState.dpr, 0, 0, meteorState.dpr, 0, 0)
    buildMeteorStars()
  }

  const drawMeteorSkyGlow = () => {
    const { ctx, width, height } = meteorState

    const glowLeft = ctx.createRadialGradient(width * 0.18, height * 0.16, 0, width * 0.18, height * 0.16, height * 0.56)
    glowLeft.addColorStop(0, 'rgba(88, 126, 255, 0.18)')
    glowLeft.addColorStop(1, 'rgba(88, 126, 255, 0)')
    ctx.fillStyle = glowLeft
    ctx.fillRect(0, 0, width, height)

    const glowRight = ctx.createRadialGradient(width * 0.78, height * 0.22, 0, width * 0.78, height * 0.22, height * 0.42)
    glowRight.addColorStop(0, 'rgba(181, 113, 255, 0.14)')
    glowRight.addColorStop(1, 'rgba(181, 113, 255, 0)')
    ctx.fillStyle = glowRight
    ctx.fillRect(0, 0, width, height)

    const moon = ctx.createRadialGradient(width * 0.82, height * 0.18, 0, width * 0.82, height * 0.18, 58)
    moon.addColorStop(0, 'rgba(255,255,255,0.95)')
    moon.addColorStop(0.25, 'rgba(227,236,255,0.64)')
    moon.addColorStop(1, 'rgba(227,236,255,0)')
    ctx.fillStyle = moon
    ctx.beginPath()
    ctx.arc(width * 0.82, height * 0.18, 58, 0, Math.PI * 2)
    ctx.fill()
  }

  const drawMeteorStars = t => {
    const { ctx, stars } = meteorState

    stars.forEach(star => {
      const flicker = 0.55 + Math.sin(t * star.speed + star.twinkle) * 0.45
      ctx.globalAlpha = star.a * flicker
      ctx.fillStyle = '#ffffff'
      ctx.beginPath()
      ctx.arc(star.x, star.y, star.r, 0, Math.PI * 2)
      ctx.fill()

      if (star.r > 1.1) {
        ctx.globalAlpha = star.a * flicker * 0.16
        ctx.beginPath()
        ctx.arc(star.x, star.y, star.r * 5.5, 0, Math.PI * 2)
        ctx.fill()
      }
    })

    ctx.globalAlpha = 1
  }

  const addMeteor = () => {
    const fromRight = Math.random() > 0.34
    const startX = fromRight ? meteorState.width + Math.random() * 180 : Math.random() * meteorState.width * 0.8
    const startY = -80 - Math.random() * 120
    const speed = 900 + Math.random() * 1200
    const angle = (Math.PI / 180) * (fromRight ? 135 + Math.random() * 12 : 118 + Math.random() * 16)

    meteorState.meteors.push({
      x: startX,
      y: startY,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      len: 140 + Math.random() * 220,
      life: 0,
      maxLife: 0.8 + Math.random() * 0.65,
      width: 1.4 + Math.random() * 2.4,
      hue: 200 + Math.random() * 40,
      glow: 16 + Math.random() * 18
    })
  }

  const addMeteorBurst = (x, y, hue) => {
    const count = 8 + Math.floor(Math.random() * 8)

    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2
      const speed = 35 + Math.random() * 120
      meteorState.sparks.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 0,
        maxLife: 0.35 + Math.random() * 0.45,
        size: 1 + Math.random() * 2.4,
        hue
      })
    }
  }

  const drawMeteor = meteor => {
    const { ctx } = meteorState
    const norm = Math.hypot(meteor.vx, meteor.vy) || 1
    const tailX = meteor.x - (meteor.vx / norm) * meteor.len
    const tailY = meteor.y - (meteor.vy / norm) * meteor.len

    const gradient = ctx.createLinearGradient(meteor.x, meteor.y, tailX, tailY)
    gradient.addColorStop(0, `hsla(${meteor.hue}, 100%, 88%, 1)`)
    gradient.addColorStop(0.15, `hsla(${meteor.hue}, 100%, 76%, 0.95)`)
    gradient.addColorStop(0.5, `hsla(${meteor.hue}, 100%, 65%, 0.3)`)
    gradient.addColorStop(1, `hsla(${meteor.hue}, 100%, 55%, 0)`)

    ctx.save()
    ctx.lineCap = 'round'
    ctx.strokeStyle = gradient
    ctx.lineWidth = meteor.width
    ctx.shadowBlur = meteor.glow
    ctx.shadowColor = `hsla(${meteor.hue}, 100%, 78%, 0.9)`
    ctx.beginPath()
    ctx.moveTo(meteor.x, meteor.y)
    ctx.lineTo(tailX, tailY)
    ctx.stroke()

    ctx.fillStyle = '#fff'
    ctx.shadowBlur = meteor.glow * 1.25
    ctx.beginPath()
    ctx.arc(meteor.x, meteor.y, meteor.width * 1.35, 0, Math.PI * 2)
    ctx.fill()
    ctx.restore()
  }

  const drawSpark = spark => {
    const { ctx } = meteorState
    const alpha = 1 - spark.life / spark.maxLife
    ctx.save()
    ctx.globalAlpha = alpha
    ctx.fillStyle = `hsla(${spark.hue}, 100%, 78%, 1)`
    ctx.shadowBlur = 10
    ctx.shadowColor = `hsla(${spark.hue}, 100%, 70%, 0.8)`
    ctx.beginPath()
    ctx.arc(spark.x, spark.y, spark.size, 0, Math.PI * 2)
    ctx.fill()
    ctx.restore()
  }

  const runMeteorFrame = now => {
    const { ctx, width, height } = meteorState
    if (!ctx) return

    const dt = Math.min((now - meteorState.lastTime) / 1000, 0.033)
    meteorState.lastTime = now

    ctx.clearRect(0, 0, width, height)
    drawMeteorSkyGlow()
    drawMeteorStars(now * 0.001)

    if (isMeteorWindow()) {
      meteorState.spawnTimer -= dt
      if (meteorState.spawnTimer <= 0) {
        addMeteor()
        meteorState.spawnTimer = 0.08 + Math.random() * 0.28
      }
    }

    for (let i = meteorState.meteors.length - 1; i >= 0; i--) {
      const meteor = meteorState.meteors[i]
      meteor.x += meteor.vx * dt
      meteor.y += meteor.vy * dt
      meteor.life += dt

      drawMeteor(meteor)

      const dead = meteor.life > meteor.maxLife || meteor.x < -400 || meteor.y > height + 280
      if (dead) {
        if (Math.random() > 0.35) addMeteorBurst(meteor.x, meteor.y, meteor.hue)
        meteorState.meteors.splice(i, 1)
      }
    }

    for (let i = meteorState.sparks.length - 1; i >= 0; i--) {
      const spark = meteorState.sparks[i]
      spark.life += dt
      spark.x += spark.vx * dt
      spark.y += spark.vy * dt
      spark.vx *= 0.985
      spark.vy = spark.vy * 0.985 + 26 * dt

      drawSpark(spark)

      if (spark.life >= spark.maxLife) {
        meteorState.sparks.splice(i, 1)
      }
    }

    meteorState.animationId = requestAnimationFrame(runMeteorFrame)
  }

  const startMeteorShower = () => {
    if (meteorState.canvas) return

    const canvas = document.createElement('canvas')
    canvas.id = 'meteor-shower'
    canvas.className = 'meteor-shower'
    document.body.appendChild(canvas)

    meteorState.canvas = canvas
    meteorState.ctx = canvas.getContext('2d')
    meteorState.spawnTimer = 0
    meteorState.lastTime = performance.now()
    resizeMeteorCanvas()

    meteorState.resizeHandler = () => resizeMeteorCanvas()
    window.addEventListener('resize', meteorState.resizeHandler)
    meteorState.animationId = requestAnimationFrame(runMeteorFrame)
  }

  const stopMeteorShower = () => {
    if (meteorState.animationId) cancelAnimationFrame(meteorState.animationId)
    if (meteorState.resizeHandler) window.removeEventListener('resize', meteorState.resizeHandler)
    if (meteorState.canvas) meteorState.canvas.remove()

    meteorState.canvas = null
    meteorState.ctx = null
    meteorState.animationId = 0
    meteorState.stars = []
    meteorState.meteors = []
    meteorState.sparks = []
    meteorState.resizeHandler = null
  }

  const syncMeteorShower = () => {
    if (isMeteorWindow()) {
      startMeteorShower()
    } else {
      stopMeteorShower()
    }
  }

  const initHolidayEffects = () => {
    if (isChristmas()) {
      createSnow()
      attachChristmasHat()
    }

    syncMeteorShower()
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initHolidayEffects, { once: true })
  } else {
    initHolidayEffects()
  }

  setInterval(syncMeteorShower, 15000)

  if (window.btf?.addGlobalFn) {
    btf.addGlobalFn('pjaxComplete', initHolidayEffects, 'holidayEffects')
  } else {
    window.addEventListener('pjax:complete', initHolidayEffects)
  }
})()
