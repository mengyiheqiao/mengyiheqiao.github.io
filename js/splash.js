// 启动动画：峡湾与鲸
// 全部由代码实时生成：阴天蓝调的峡湾、远处雪山和雾里的小木屋、深色海面、海鸥，
// 海鸥围着鱼群盘旋，一头座头鲸张嘴冲出水面捕鱼，近处礁石上有个背影在看着它；
// 鲸鱼沉下去后时间飞快流逝，海鸥飞走，入夜，极光出现，最后时间慢下来
// 同一个标签页只播一次；点击 / 按键 / 滚轮可跳过；系统开启"减少动态效果"时不播
(() => {
  const KEY = 'jy-splash-seen'
  const SCENE = 8000 // 开始起雾结束的时间（毫秒）
  const HORIZON = 0.56 // 海平线的位置（从上往下的比例）
  const WHALE_START = 0.6 // 鲸鱼冲出水面的时间（秒）
  const WHALE_DUR = 2.3 // 冲出水面到沉回去的时长（秒）
  const LAPSE_START = 3.0 // 鲸鱼沉下去后，时间开始飞快流逝（秒）
  const LAPSE_END = 5.4 // 时间慢下来、回到正常速度（秒）

  // 调试：网址加 ?splash 强制重播，?splash=hold 播完后停在极光夜景，不自动消失
  const force = /[?&]splash\b/.test(location.search)
  const hold = /[?&]splash=hold\b/.test(location.search)
  // 调试：再加 &at=1.9 定格在第 1.9 秒
  const atMatch = location.search.match(/[?&]at=([\d.]+)/)
  const freezeAt = hold && atMatch ? parseFloat(atMatch[1]) : null

  try {
    if (sessionStorage.getItem(KEY) && !force) return
    sessionStorage.setItem(KEY, '1')
  } catch (e) { /* 隐私模式下 sessionStorage 可能不可用，照常播放 */ }
  if (!force && window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches) return

  const root = document.documentElement
  root.classList.add('jy-splash-on')

  // ================= 时间线 =================
  const rand = (a, b) => a + Math.random() * (b - a)
  const clamp01 = x => Math.max(0, Math.min(1, x))
  const smooth = (a, b, x) => { const k = clamp01((x - a) / (b - a)); return k * k * (3 - 2 * k) }
  // 鲸鱼沉下去以后，时间开始飞快流逝：最快约 25 倍速，到 LAPSE_END 慢慢停回正常速度
  const lapseSpeed = t => 1 + 24 * smooth(LAPSE_START, LAPSE_START + 0.6, t) * (1 - smooth(LAPSE_END - 1.2, LAPSE_END, t))
  const nightAt = t => smooth(LAPSE_START, LAPSE_START + 1.8, t) // 0 = 阴天白昼，1 = 深夜
  const auroraAt = t => smooth(LAPSE_START + 1.2, LAPSE_END + 0.3, t) // 极光出现的程度

  // ================= 天空 / 雪山 / 海面 / 极光（WebGL） =================
  const FRAG = `
    precision mediump float;
    uniform vec2 r;
    uniform float t;   // 场景时间（延时摄影时会加速）
    uniform float hz;
    uniform float n;   // 夜晚程度
    uniform float au;  // 极光程度

    float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
    float noise(vec2 p) {
      vec2 i = floor(p), f = fract(p);
      f = f * f * (3.0 - 2.0 * f);
      return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), f.x),
                 mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), f.x), f.y);
    }
    float fbm(vec2 p) {
      float v = 0.0, a = 0.5;
      for (int i = 0; i < 5; i++) { v += a * noise(p); p *= 2.03; a *= 0.5; }
      return v;
    }
    // 脊状噪声：叠几层"折过来的"噪声，做出锋利的山脊和山沟
    float ridged(vec2 p) {
      float v = 0.0, a = 0.5, w = 1.0;
      for (int i = 0; i < 5; i++) {
        float m = 1.0 - abs(noise(p) * 2.0 - 1.0);
        m *= m * w;
        w = clamp(m * 1.6, 0.0, 1.0);
        v += m * a;
        p *= 2.1;
        a *= 0.5;
      }
      return v;
    }
    // 天空：阴天白昼 → 蓝调 → 深夜
    vec3 sky(float k) {
      k = pow(clamp(k, 0.0, 1.0), 0.7);
      vec3 day = mix(vec3(0.62, 0.67, 0.78), vec3(0.24, 0.30, 0.45), k);
      vec3 dusk = mix(vec3(0.30, 0.37, 0.56), vec3(0.08, 0.12, 0.28), k);
      vec3 night = mix(vec3(0.09, 0.14, 0.26), vec3(0.015, 0.03, 0.08), k);
      return mix(mix(day, dusk, smoothstep(0.0, 0.5, n)), night, smoothstep(0.5, 1.0, n));
    }
    // 极光帘幕：底部亮绿，往上渐变成紫色并淡出，竖向有光柱纹理
    vec3 aurora(vec2 uv) {
      vec3 col = vec3(0.0);
      for (int i = 0; i < 3; i++) {
        float fi = float(i);
        float x = uv.x * 1.1 + fi * 1.9;
        float base = 0.45 + fi * 0.09
                   + 0.12 * sin(x * 1.4 + t * 0.22 + fi * 2.0)
                   + 0.10 * (fbm(vec2(x * 0.7, t * 0.08 + fi)) - 0.5);
        float d = uv.y - base;
        float curtain = smoothstep(-0.03, 0.0, d) * exp(-max(d, 0.0) * (5.0 + fi * 2.5));
        float rays = 0.45 + 0.55 * fbm(vec2(x * 9.0 + t * 0.15, t * 0.35 + fi * 4.0));
        vec3 c = mix(vec3(0.12, 1.0, 0.62), vec3(0.58, 0.32, 1.0), smoothstep(0.02, 0.3, d));
        col += c * curtain * rays * (1.0 - fi * 0.25);
      }
      return col * 0.8;
    }
    // 山体着色：岩石 + 沟里和高处的积雪，fog 越大越被雾吃掉；夜里变暗、偏冷，雪上映一点极光
    vec3 mountain(float ax, float y, float top, float fog, vec3 rock) {
      float hgt = clamp((y - hz) / max(top - hz, 0.001), 0.0, 1.0);
      float gully = ridged(vec2(ax * 9.0, y * 3.5));
      float grain = fbm(vec2(ax * 40.0, y * 60.0));
      float snow = smoothstep(0.42, 0.62, hgt * 0.7 + gully * 0.45 + (grain - 0.5) * 0.25);
      vec3 snowCol = mix(vec3(0.88, 0.91, 0.95), vec3(0.30, 0.37, 0.52), n) + vec3(0.04, 0.16, 0.10) * au * hgt;
      vec3 c = mix(rock * (0.8 + grain * 0.4) * (1.0 - 0.6 * n), snowCol, snow);
      // 光从左上方来：山沟左侧亮、右侧暗，让山有立体感
      float shape = fbm(vec2(ax * 6.0, y * 10.0));
      float gx = fbm(vec2((ax + 0.015) * 6.0, y * 10.0)) - shape;
      c *= 1.0 + clamp(-gx * 5.0, -0.22, 0.18);
      return mix(c, sky(0.02), fog * (1.0 - hgt * 0.25));
    }
    float sea(vec2 q, float tt) {
      return fbm(q + vec2(tt * 0.05, tt * 0.22)) + 0.35 * noise(q * 3.1 - vec2(0.0, tt * 0.55));
    }

    void main() {
      vec2 p = gl_FragCoord.xy / r;
      float ax = p.x * r.x / r.y;
      float px = 1.5 / r.y; // 一个像素的高度，用来给山脊边缘抗锯齿
      vec3 col;

      if (p.y >= hz) {
        float k = (p.y - hz) / (1.0 - hz);
        col = sky(k);
        // 云层：入夜后慢慢散开，给星星和极光让位
        float clouds = 1.0 - 0.85 * n;
        float c = fbm(vec2(ax * 1.2 + t * 0.015, k * 3.5));
        col = mix(col, sky(0.1) * 1.12, smoothstep(0.5, 0.85, c) * 0.4 * clouds);
        col = mix(col, sky(1.0) * 0.8, smoothstep(0.55, 0.95, fbm(vec2(ax * 0.8 - t * 0.01, k * 2.0 + 5.0))) * 0.35 * k * clouds);
        // 星星
        float s = hash(floor(gl_FragCoord.xy / 1.5));
        if (s > 0.9965) col += vec3(0.85, 0.9, 1.0) * (0.55 + 0.45 * sin(t * 2.0 + s * 300.0)) * smoothstep(0.25, 0.8, k) * smoothstep(0.4, 1.0, n);
        // 极光（在山后面）
        col += aurora(vec2(ax, k)) * au * smoothstep(0.05, 0.35, k);

        // 远山：最高、雾最重
        float far = hz + 0.015 + 0.22 * pow(ridged(vec2(ax * 1.6 + 2.3, 0.7)), 1.6);
        col = mix(col, mountain(ax, p.y, far, 0.55, vec3(0.34, 0.39, 0.5)), smoothstep(far, far - px, p.y));
        // 中景山：矮一些、更清楚
        float mid = hz - 0.01 + 0.13 * pow(ridged(vec2(ax * 2.8 + 7.1, 3.3)), 1.5);
        col = mix(col, mountain(ax, p.y, mid, 0.32, vec3(0.27, 0.32, 0.42)), smoothstep(mid, mid - px, p.y));
        // 两侧近处的峡湾崖壁：最暗、雾最少
        float side = max(smoothstep(0.3, 0.0, p.x), smoothstep(0.74, 1.0, p.x));
        float cliff = hz + side * (0.05 + 0.2 * ridged(vec2(ax * 1.4 + 9.0, 5.0)));
        col = mix(col, mountain(ax, p.y, cliff, 0.15, vec3(0.16, 0.19, 0.26)), smoothstep(cliff, cliff - px, p.y) * step(0.01, side));
        // 贴着水面慢慢飘的低雾
        float bank = smoothstep(hz + 0.075, hz, p.y) * (0.45 + 0.55 * fbm(vec2(ax * 2.2 - t * 0.04, p.y * 18.0)));
        col = mix(col, sky(0.06), bank * 0.6 * (1.0 - 0.4 * n));
      } else {
        // 海面：按透视把屏幕坐标换成海面坐标，越远波浪越密
        float dy = hz - p.y;
        float z = 0.045 / (dy + 0.002);
        vec2 q = vec2((ax - 0.8) * z * 0.8, z * 1.5);
        float h = sea(q, t);
        float hx = sea(q + vec2(0.04, 0.0), t) - h;
        float hy = sea(q + vec2(0.0, 0.04), t) - h;
        float ripple = noise(q * 9.0 + vec2(t * 0.3, t * 1.2)) - 0.5;
        float fine = noise(q * 26.0 + vec2(-t * 0.5, t * 2.0)) - 0.5;
        float slope = clamp(0.5 + hy * 10.0 + hx * 3.0 + ripple * 0.35 + fine * 0.2 * smoothstep(0.0, 0.4, dy / hz), 0.0, 1.0);
        vec3 deep = vec3(0.05, 0.08, 0.13) * (1.0 - 0.6 * n);
        vec3 refl = sky(0.1 + slope * 0.6);
        float fres = mix(0.18, 0.85, pow(1.0 - dy / hz, 1.5));
        col = mix(deep, refl, fres * (0.2 + 0.8 * slope * slope));
        // 阴天的水面反光
        col += pow(slope, 7.0) * 0.18 * (1.0 - 0.7 * n);
        // 白浪
        col += smoothstep(0.74, 0.92, h + ripple * 0.15) * 0.2 * smoothstep(0.0, 0.25, dy / hz) * (1.0 - 0.6 * n);
        // 极光在水里的倒影：镜像 + 波纹扰动
        float mk = dy / (1.0 - hz);
        float wob = (slope - 0.5) * 0.05 + sin(p.y * 140.0 + t * 1.8) * 0.004;
        col += aurora(vec2(ax + wob, mk)) * au * smoothstep(0.05, 0.35, mk) * 0.35 * (0.5 + slope);
        // 海平线的雾
        col = mix(col, sky(0.03), exp(-dy * 40.0) * 0.9);
      }
      gl_FragColor = vec4(col, 1.0);
    }`

  const startWorld = canvas => {
    const gl = canvas.getContext('webgl', { antialias: false, alpha: false })
    if (!gl) return null
    const sh = (type, src) => {
      const s = gl.createShader(type)
      gl.shaderSource(s, src)
      gl.compileShader(s)
      return s
    }
    const prog = gl.createProgram()
    gl.attachShader(prog, sh(gl.VERTEX_SHADER, 'attribute vec2 a;void main(){gl_Position=vec4(a,0.,1.);}'))
    gl.attachShader(prog, sh(gl.FRAGMENT_SHADER, FRAG))
    gl.linkProgram(prog)
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) return null
    gl.useProgram(prog)
    gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer())
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW)
    const loc = gl.getAttribLocation(prog, 'a')
    gl.enableVertexAttribArray(loc)
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0)
    const uR = gl.getUniformLocation(prog, 'r')
    const uT = gl.getUniformLocation(prog, 't')
    const uN = gl.getUniformLocation(prog, 'n')
    const uA = gl.getUniformLocation(prog, 'au')
    gl.uniform1f(gl.getUniformLocation(prog, 'hz'), 1 - HORIZON)
    return {
      resize () {
        // 按屏幕实际分辨率渲染（高分屏最多 1.5 倍），保证山脊和海面清楚
        const scale = Math.min(window.devicePixelRatio || 1, 1.5)
        canvas.width = Math.round(canvas.clientWidth * scale)
        canvas.height = Math.round(canvas.clientHeight * scale)
        gl.viewport(0, 0, canvas.width, canvas.height)
        gl.uniform2f(uR, canvas.width, canvas.height)
      },
      // sceneT：扭曲过的场景时间；t：真实时间（决定入夜和极光的进度）
      draw (sceneT, t) {
        gl.uniform1f(uT, sceneT + 10)
        gl.uniform1f(uN, nightAt(t))
        gl.uniform1f(uA, auroraAt(t))
        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4)
      }
    }
  }

  // ================= 近景和生物（Canvas 2D） =================

  // 鲸鱼皮肤的斑驳纹理：生成一次，之后当图案平铺
  let skin = null
  const skinPattern = ctx => {
    if (skin) return ctx.createPattern(skin, 'repeat')
    skin = document.createElement('canvas')
    skin.width = skin.height = 96
    const s = skin.getContext('2d')
    for (let i = 0; i < 260; i++) {
      const light = Math.random() < 0.6
      s.fillStyle = light ? `rgba(190, 200, 215, ${rand(0.08, 0.35)})` : `rgba(5, 8, 14, ${rand(0.1, 0.35)})`
      s.beginPath()
      s.ellipse(rand(0, 96), rand(0, 96), rand(0.3, 1.6), rand(0.3, 1.1), rand(0, Math.PI), 0, Math.PI * 2)
      s.fill()
    }
    return ctx.createPattern(skin, 'repeat')
  }

  // 座头鲸：头朝 +x、肚子朝 +y，身长 200 个单位
  // gape：下颌张开的角度（弧度）；pouch：喉囊鼓起的程度
  const HINGE = [44, 7] // 下颌的转轴
  const rotAround = (x, y, a) => {
    const c = Math.cos(a)
    const s = Math.sin(a)
    return [HINGE[0] + (x - HINGE[0]) * c - (y - HINGE[1]) * s, HINGE[1] + (x - HINGE[0]) * s + (y - HINGE[1]) * c]
  }
  const whalePath = ctx => {
    ctx.beginPath()
    ctx.moveTo(100, 0)
    ctx.bezierCurveTo(98, -14, 75, -24, 40, -25)
    ctx.bezierCurveTo(0, -26, -50, -18, -85, -6)
    ctx.lineTo(-96, -4)
    ctx.bezierCurveTo(-104, -22, -120, -30, -130, -27)
    ctx.bezierCurveTo(-120, -14, -113, -4, -109, 0)
    ctx.bezierCurveTo(-113, 4, -120, 14, -130, 27)
    ctx.bezierCurveTo(-120, 30, -104, 22, -96, 4)
    ctx.lineTo(-85, 6)
    ctx.bezierCurveTo(-50, 18, 0, 26, 40, 25)
    ctx.bezierCurveTo(75, 24, 98, 14, 100, 0)
    ctx.closePath()
  }
  const drawWhale = (ctx, gape, pouch, fishInMouth) => {
    whalePath(ctx)
    const body = ctx.createLinearGradient(0, -26, 0, 26)
    body.addColorStop(0, '#171d2a')
    body.addColorStop(0.5, '#283143')
    body.addColorStop(0.8, '#3e4860')
    body.addColorStop(1, '#6f7a92')
    ctx.fillStyle = body
    ctx.fill()

    ctx.save()
    ctx.clip()
    // 斑驳的皮肤
    ctx.fillStyle = skinPattern(ctx)
    ctx.fillRect(-140, -40, 280, 80)
    // 背部的反光
    ctx.strokeStyle = 'rgba(175, 188, 210, 0.4)'
    ctx.lineWidth = 2.5
    ctx.beginPath()
    ctx.moveTo(96, -6)
    ctx.bezierCurveTo(90, -18, 70, -24, 40, -24.5)
    ctx.bezierCurveTo(0, -25.5, -50, -17.5, -85, -5.5)
    ctx.stroke()
    // 身上的旧伤痕
    ctx.strokeStyle = 'rgba(200, 208, 222, 0.25)'
    ctx.lineWidth = 0.6
    for (const [x, y, l] of [[20, -14, 9], [-8, -10, 7], [-30, -6, 11], [5, -4, 6]]) {
      ctx.beginPath()
      ctx.moveTo(x, y)
      ctx.lineTo(x - l, y + l * 0.25)
      ctx.stroke()
    }
    ctx.restore()

    // 头上的疙瘩
    for (let i = 0; i < 11; i++) {
      const x = 56 + i * 3.9
      const y = -20.5 + i * 1.6 + (i % 2) * 1.8
      ctx.fillStyle = 'rgba(105, 117, 140, 0.8)'
      ctx.beginPath()
      ctx.arc(x, y, 1.3, 0, Math.PI * 2)
      ctx.fill()
      ctx.fillStyle = 'rgba(190, 200, 215, 0.5)'
      ctx.beginPath()
      ctx.arc(x - 0.4, y - 0.4, 0.5, 0, Math.PI * 2)
      ctx.fill()
    }

    // ---- 张开的嘴 ----
    const tip = rotAround(98, 8, gape) // 下颌尖
    const tipLow = rotAround(95, 14, gape)
    if (gape > 0.03) {
      // 嘴里：深色，喉咙深处带一点肉色
      const inner = ctx.createLinearGradient(HINGE[0], HINGE[1], 100, 4)
      inner.addColorStop(0, '#24161b')
      inner.addColorStop(1, '#06080d')
      ctx.fillStyle = inner
      ctx.beginPath()
      ctx.moveTo(HINGE[0], HINGE[1])
      ctx.lineTo(100, 1)
      ctx.lineTo(tip[0], tip[1])
      ctx.closePath()
      ctx.fill()
      // 上颌垂下来的鲸须
      ctx.strokeStyle = 'rgba(38, 32, 30, 0.85)'
      ctx.lineWidth = 0.5
      for (let x = 50; x <= 97; x += 1.2) {
        const y = 1 + (100 - x) * 0.11
        ctx.beginPath()
        ctx.moveTo(x, y)
        ctx.lineTo(x - 0.4, y + 2 + gape * 4 + (x % 3) * 0.4)
        ctx.stroke()
      }
      // 嘴里翻腾的水和鱼
      ctx.fillStyle = `rgba(225, 233, 245, ${0.35 * Math.min(1, gape * 2)})`
      ctx.beginPath()
      ctx.moveTo(HINGE[0] + 6, HINGE[1] + 4)
      ctx.quadraticCurveTo((HINGE[0] + tip[0]) / 2 + 4, (HINGE[1] + tip[1]) / 2 - 6, tip[0] - 4, tip[1] - 3)
      ctx.lineTo(tip[0] - 8, tip[1] + 1)
      ctx.quadraticCurveTo((HINGE[0] + tip[0]) / 2, (HINGE[1] + tip[1]) / 2, HINGE[0] + 6, HINGE[1] + 6)
      ctx.fill()
      ctx.fillStyle = 'rgba(215, 225, 238, 0.9)'
      for (const [fx, fy] of fishInMouth) {
        const [x, y] = rotAround(fx, fy, gape * 0.5)
        ctx.beginPath()
        ctx.ellipse(x, y, 2, 0.7, gape, 0, Math.PI * 2)
        ctx.fill()
      }
    }

    // 喉囊：从下颌底一直鼓到肚子，表面是一道道褶沟
    const belly = [22, 25]
    const midX = (tipLow[0] + belly[0]) / 2
    const midY = (tipLow[1] + belly[1]) / 2
    const dx = tipLow[0] - belly[0]
    const dy = tipLow[1] - belly[1]
    const len = Math.hypot(dx, dy) || 1
    const nx = dy / len // 指向外侧的法线
    const ny = -dx / len
    const bulge = 6 + pouch
    const ctrl = [midX - nx * bulge * 2, midY - ny * bulge * 2]
    ctx.beginPath()
    ctx.moveTo(HINGE[0], HINGE[1] + 3)
    ctx.lineTo(tipLow[0], tipLow[1])
    ctx.quadraticCurveTo(ctrl[0], ctrl[1], belly[0], belly[1])
    ctx.lineTo(HINGE[0] - 6, HINGE[1] + 8)
    ctx.closePath()
    const pouchFill = ctx.createLinearGradient(HINGE[0], HINGE[1], ctrl[0], ctrl[1])
    pouchFill.addColorStop(0, '#3e475a')
    pouchFill.addColorStop(0.55, '#7c879b')
    pouchFill.addColorStop(1, '#a3adbe')
    ctx.fillStyle = pouchFill
    ctx.fill()
    ctx.strokeStyle = 'rgba(35, 42, 58, 0.6)'
    ctx.lineWidth = 0.6
    for (let i = 1; i <= 11; i++) {
      const k = i / 12
      const sx = HINGE[0] + (tipLow[0] - HINGE[0]) * k
      const sy = HINGE[1] + 3 + (tipLow[1] - HINGE[1] - 3) * k
      ctx.beginPath()
      ctx.moveTo(sx, sy)
      ctx.quadraticCurveTo(ctrl[0] * k + midX * (1 - k), ctrl[1] * k + midY * (1 - k), belly[0] + (tipLow[0] - belly[0]) * k * 0.15, belly[1] + (tipLow[1] - belly[1]) * k * 0.15)
      ctx.stroke()
    }

    // 下颌：跟着张开的角度转
    ctx.save()
    ctx.translate(HINGE[0], HINGE[1])
    ctx.rotate(gape)
    ctx.translate(-HINGE[0], -HINGE[1])
    ctx.fillStyle = '#2a3346'
    ctx.beginPath()
    ctx.moveTo(HINGE[0], HINGE[1])
    ctx.lineTo(98, 7)
    ctx.quadraticCurveTo(101, 10, 95, 14)
    ctx.lineTo(HINGE[0], HINGE[1] + 5)
    ctx.closePath()
    ctx.fill()
    // 下巴上的藤壶
    for (let i = 0; i < 14; i++) {
      ctx.fillStyle = `rgba(${200 + (i % 3) * 15}, ${205 + (i % 3) * 12}, 215, ${0.55 + (i % 4) * 0.1})`
      ctx.beginPath()
      ctx.arc(84 + (i % 5) * 2.4, 9 + Math.floor(i / 5) * 1.6, 0.6 + (i % 3) * 0.3, 0, Math.PI * 2)
      ctx.fill()
    }
    ctx.restore()

    // 眼睛
    ctx.fillStyle = '#0b0f17'
    ctx.beginPath()
    ctx.arc(50, 4, 1.6, 0, Math.PI * 2)
    ctx.fill()

    // 白色的长胸鳍，前缘有一排小疙瘩
    ctx.beginPath()
    ctx.moveTo(40, 18)
    ctx.bezierCurveTo(26, 42, 2, 66, -30, 78)
    ctx.bezierCurveTo(-20, 66, -2, 46, 16, 26)
    ctx.bezierCurveTo(24, 21, 32, 19, 40, 18)
    ctx.closePath()
    const fin = ctx.createLinearGradient(40, 18, -30, 78)
    fin.addColorStop(0, '#8b96aa')
    fin.addColorStop(0.35, '#dfe5ee')
    fin.addColorStop(1, '#aab4c5')
    ctx.fillStyle = fin
    ctx.fill()
    ctx.fillStyle = 'rgba(120, 130, 150, 0.6)'
    for (let i = 0; i < 6; i++) {
      ctx.beginPath()
      ctx.arc(32 - i * 10.5, 28 + i * 9.5, 1.2, 0, Math.PI * 2)
      ctx.fill()
    }
  }

  const startLife = canvas => {
    const ctx = canvas.getContext('2d')
    let W = 0
    let H = 0
    let unit = 1
    let portrait = false
    let lay = null
    let farGulls = []
    let flock = []
    let drops = []
    let foam = []
    let fish = []
    let rock = []
    let mouthFish = []
    let events = {}

    const layout = () => {
      portrait = W < H
      return portrait
        ? { wx: W * 0.6, wy: H * 0.68, L: Math.min(W * 0.7, H * 0.36), px: W * 0.22, rockTop: H * 0.85, rockRight: W * 0.5, fh: H * 0.17, house: W * 0.84 }
        : { wx: W * 0.58, wy: H * 0.71, L: Math.min(W * 0.36, H * 0.55), px: W * 0.17, rockTop: H * 0.87, rockRight: W * 0.4, fh: H * 0.3, house: W * 0.8 }
    }

    const makeScene = () => {
      lay = layout()
      // 远处零星的海鸥
      farGulls = Array.from({ length: portrait ? 16 : 26 }, () => ({
        x: rand(0, W),
        y: rand(H * 0.04, H * HORIZON * 0.95),
        s: rand(0.05, 0.35),
        dir: Math.random() < 0.5 ? -1 : 1,
        phase: rand(0, Math.PI * 2),
        freq: rand(3.5, 6.5),
        flap: Math.random() < 0.35 ? rand(0.15, 0.3) : rand(0.7, 1),
        bob: rand(0, Math.PI * 2)
      }))
      // 围着鲸鱼那片海面盘旋的一大群
      flock = Array.from({ length: portrait ? 26 : 38 }, () => {
        const rx = rand(0.2, 1.15) * lay.L
        return {
          a: rand(0, Math.PI * 2),
          rx,
          ry: rx * rand(0.18, 0.4),
          hy: rand(0.12, 0.55) * lay.L, // 离水面的高度
          spin: (Math.random() < 0.5 ? -1 : 1) * rand(0.35, 0.8),
          s: rand(0.35, 1),
          phase: rand(0, Math.PI * 2),
          freq: rand(4, 7),
          flap: Math.random() < 0.3 ? rand(0.15, 0.3) : rand(0.7, 1),
          ox: 0, oy: 0, vx: 0, vy: 0, diver: Math.random() < 0.2
        }
      }).sort((a, b) => a.s - b.s)
      mouthFish = Array.from({ length: 9 }, () => [rand(55, 92), rand(3, 9)])

      // 近处礁石的轮廓：左边高、往右逐渐落进海里，表面坑坑洼洼
      rock = []
      for (let i = 0; i <= 40; i++) {
        const k = i / 40
        const x = -W * 0.02 + k * (lay.rockRight + W * 0.02)
        const lift = k < 0.55 ? 1 - Math.pow((0.4 - k) / 0.4, 2) * 0.5 : 1 - Math.pow((k - 0.55) / 0.45, 1.6)
        const y = lay.rockTop + (1 - lift) * H * 0.13 + (Math.random() - 0.5) * H * 0.018 * (i % 3 === 0 ? 2 : 1)
        rock.push([x, y])
      }
    }

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      W = canvas.width = Math.round(canvas.clientWidth * dpr)
      H = canvas.height = Math.round(canvas.clientHeight * dpr)
      unit = Math.min(W, H) / 800
      makeScene()
    }

    // 海鸥：从下往上看的剪影，翅膀上面灰、翼尖黑
    const gullWing = (s, tipY, elbowY, tone, alpha, tips) => {
      ctx.fillStyle = `rgba(${tone}, ${tone + 5}, ${tone + 12}, ${alpha})`
      ctx.beginPath()
      ctx.moveTo(0, -s * 0.03)
      ctx.quadraticCurveTo(-s * 0.25, elbowY - s * 0.07, -s * 0.48, elbowY)
      ctx.lineTo(-s, tipY)
      ctx.lineTo(-s * 0.5, elbowY + s * 0.11)
      ctx.quadraticCurveTo(-s * 0.25, elbowY * 0.5 + s * 0.13, 0, s * 0.07)
      ctx.closePath()
      ctx.fill()
      if (tips) {
        ctx.fillStyle = `rgba(30, 34, 44, ${alpha})`
        ctx.beginPath()
        ctx.moveTo(-s, tipY)
        ctx.lineTo(-s * 0.8, tipY + (elbowY - tipY) * 0.25 - s * 0.01)
        ctx.lineTo(-s * 0.84, tipY + (elbowY - tipY) * 0.35 + s * 0.06)
        ctx.closePath()
        ctx.fill()
      }
    }
    const paintGull = (x, y, depth, f, t) => {
      const s = (3 + 18 * depth * depth) * unit
      const tipY = -s * 0.5 * f
      const elbowY = -s * 0.3 * (f + 0.35)
      // 远处的偏灰、半透明（被雾气吃掉），近处的偏白
      const tone = Math.round(160 + 70 * depth)
      const alpha = 0.4 + 0.58 * depth
      ctx.save()
      ctx.translate(x, y)
      gullWing(s, tipY, elbowY, tone, alpha, depth > 0.35)
      ctx.scale(-1, 1)
      gullWing(s, tipY, elbowY, tone, alpha, depth > 0.35)
      ctx.fillStyle = `rgba(${tone + 15}, ${tone + 18}, ${tone + 22}, ${alpha})`
      ctx.beginPath()
      ctx.ellipse(0, s * 0.02, s * 0.2, s * 0.075, 0, 0, Math.PI * 2)
      ctx.fill()
      ctx.restore()
    }
    const drawFarGull = (g, t, dt) => {
      if (g.gone) return
      const leaving = t > LAPSE_START
      g.x += g.dir * (14 + 70 * g.s) * unit * dt * (leaving ? lapseSpeed(t) * 0.6 : 1)
      if (leaving) g.y -= 20 * unit * dt * lapseSpeed(t)
      if (g.x < -40 || g.x > W + 40 || g.y < -40) {
        if (leaving) { g.gone = true; return }
        g.x = g.x < -40 ? W + 40 : -40
      }
      const f = Math.sin(t * g.freq + g.phase) * g.flap + (1 - g.flap) * 0.25
      paintGull(g.x, g.y + Math.sin(t * 0.8 + g.bob) * 6 * unit, g.s, f, t)
    }
    // 鸟群：绕着鲸鱼盘旋，受惊时被弹开，再像弹簧一样慢慢飞回来
    const drawFlockGull = (g, t, dt) => {
      if (g.gone) return
      if (g.leave) {
        // 飞走：不再被拉回来，跟着加速的时间一起飞出画面
        const k = dt * lapseSpeed(t) * 0.5
        g.ox += g.vx * k
        g.oy += g.vy * k
        const x = lay.wx + Math.cos(g.a) * g.rx + g.ox
        const y = lay.wy - g.hy + Math.sin(g.a) * g.ry + g.oy
        if (x < -60 || x > W + 60 || y < -60) { g.gone = true; return }
      }
      g.a += g.spin * dt
      if (!g.leave) {
        g.vx += -g.ox * 3 * dt
        g.vy += -g.oy * 3 * dt
        g.vx *= 1 - 1.4 * dt
        g.vy *= 1 - 1.4 * dt
        g.ox += g.vx * dt
        g.oy += g.vy * dt
      }
      const x = lay.wx + Math.cos(g.a) * g.rx + g.ox
      const y = lay.wy - g.hy + Math.sin(g.a) * g.ry + g.oy
      const panic = Math.min(1, Math.hypot(g.vx, g.vy) / (lay.L * 1.5))
      const f = Math.sin(t * (g.freq + panic * 5) + g.phase) * Math.max(g.flap, panic) + (1 - Math.max(g.flap, panic)) * 0.25
      paintGull(x, y, g.s, f, t)
    }
    const scatterFlock = () => {
      for (const g of flock) {
        const x = Math.cos(g.a) * g.rx
        const y = -g.hy + Math.sin(g.a) * g.ry
        const d = Math.hypot(x, y) || 1
        const power = rand(1.2, 2.4) * lay.L
        g.vx += (x / d) * power
        g.vy += (y / d) * power - rand(0.4, 1) * lay.L
      }
    }
    const leaveFlock = () => {
      for (const g of flock) {
        g.leave = true
        const side = Math.cos(g.a) >= 0 ? 1 : -1
        g.vx = side * rand(0.8, 1.6) * lay.L
        g.vy = -rand(0.5, 1.2) * lay.L
      }
    }
    const diveFlock = () => {
      for (const g of flock) {
        if (!g.diver) continue
        g.vx += rand(-0.3, 0.3) * lay.L
        g.vy += (g.hy + rand(0, 0.1) * lay.L) * 3.2
      }
    }

    // 远处的船
    const drawBoat = (x, y, size, t, light, night) => {
      const bob = Math.sin(t * 1.6 + x) * 1.2 * unit
      ctx.globalAlpha = 0.85 * (1 - 0.6 * night)
      ctx.fillStyle = '#2a3242'
      ctx.fillRect(x - size, y - size * 0.25 + bob, size * 2, size * 0.3)
      ctx.fillStyle = '#c9d0db'
      ctx.fillRect(x - size * 0.35, y - size * 0.7 + bob, size * 0.7, size * 0.45)
      ctx.globalAlpha = 1
      ctx.fillStyle = light
      ctx.shadowColor = light
      ctx.shadowBlur = 8 * unit * (1 + 1.5 * night)
      ctx.beginPath()
      ctx.arc(x + size * 0.15, y - size * 0.85 + bob, Math.max(1.5, size * 0.09), 0, Math.PI * 2)
      ctx.fill()
      ctx.shadowBlur = 0
      ctx.globalAlpha = 1
    }

    // 雾里若隐若现的小木屋，窗里一点暖光，水里有摇晃的倒影
    const drawHouse = (x, y, t, night) => {
      const w = 13 * unit
      const glow = Math.min(1, (0.55 + 0.25 * Math.sin(t * 1.3) + 0.1 * Math.sin(t * 4.7)) * (1 + 0.6 * night))
      ctx.globalAlpha = 0.5 * (1 - 0.4 * night)
      ctx.fillStyle = '#4a3a3e'
      ctx.fillRect(x - w / 2, y - w * 0.55, w, w * 0.55)
      ctx.fillStyle = '#3a3036'
      ctx.beginPath()
      ctx.moveTo(x - w * 0.62, y - w * 0.52)
      ctx.lineTo(x, y - w * 0.95)
      ctx.lineTo(x + w * 0.62, y - w * 0.52)
      ctx.closePath()
      ctx.fill()
      ctx.globalAlpha = 1
      ctx.fillStyle = `rgba(255, 196, 120, ${glow})`
      ctx.shadowColor = 'rgba(255, 180, 90, 0.9)'
      ctx.shadowBlur = 10 * unit * (1 + 2 * night)
      ctx.fillRect(x - w * 0.12, y - w * 0.38, w * 0.22, w * 0.18)
      ctx.shadowBlur = 0
      // 倒影
      const len = H * 0.07 * (1 + night)
      const grad = ctx.createLinearGradient(0, y, 0, y + len)
      grad.addColorStop(0, `rgba(255, 190, 110, ${0.35 * glow})`)
      grad.addColorStop(1, 'rgba(255, 190, 110, 0)')
      ctx.strokeStyle = grad
      ctx.lineWidth = w * 0.14
      ctx.beginPath()
      ctx.moveTo(x, y + 2 * unit)
      for (let i = 1; i <= 10; i++) {
        const yy = y + (len * i) / 10
        ctx.lineTo(x + Math.sin(t * 3 + i * 1.7) * w * 0.15 * (i / 10), yy)
      }
      ctx.stroke()
    }

    // 近处礁石
    const auroraTint = (r, g, b, a, au) => `rgba(${Math.round(r + (110 - r) * au)}, ${Math.round(g + (225 - g) * au)}, ${Math.round(b + (185 - b) * au)}, ${a})`
    const drawRock = au => {
      const top = Math.min(...rock.map(p => p[1]))
      const grad = ctx.createLinearGradient(0, top, 0, H)
      grad.addColorStop(0, '#151b27')
      grad.addColorStop(1, '#090c13')
      ctx.fillStyle = grad
      ctx.beginPath()
      ctx.moveTo(rock[0][0], H)
      for (const [x, y] of rock) ctx.lineTo(x, y)
      ctx.lineTo(rock[rock.length - 1][0], H)
      ctx.closePath()
      ctx.fill()
      // 湿漉漉的边缘反光
      ctx.strokeStyle = auroraTint(140, 156, 184, 0.28, au)
      ctx.lineWidth = 1.5 * unit
      ctx.beginPath()
      rock.forEach(([x, y], i) => (i ? ctx.lineTo(x, y + 1) : ctx.moveTo(x, y + 1)))
      ctx.stroke()
    }

    // 背影：穿大衣、手插口袋，围巾和衣角被风吹动；站姿 100 个单位高，脚在原点
    // look：0 = 望着前方，1 = 头转向鲸鱼那边
    const drawFigure = (x, footY, h, t, look, au) => {
      const k = h / 100
      const sway = Math.sin(t * 1.2) * 0.6
      const hx = sway * 0.5 + look * 2.2 // 头的横向位置
      const breathe = Math.sin(t * 1.8) * 0.4
      const f1 = Math.sin(t * 3.1) * 1.2
      const f2 = Math.sin(t * 2.6 + 1) * 1.5
      ctx.save()
      ctx.translate(x, footY)
      ctx.scale(k, k)
      ctx.filter = `blur(${Math.max(0.3, 0.5 / k)}px)` // 边缘稍微柔一点，和雾气里的背景更融
      // 腿
      ctx.fillStyle = '#0e131c'
      ctx.beginPath()
      ctx.moveTo(-8.5, -17)
      ctx.lineTo(-2, -17)
      ctx.lineTo(-2.5, 0)
      ctx.lineTo(-8, 0)
      ctx.closePath()
      ctx.moveTo(2, -17)
      ctx.lineTo(8.5, -17)
      ctx.lineTo(8, 0)
      ctx.lineTo(2.5, 0)
      ctx.closePath()
      ctx.fill()
      // 大衣
      const coat = ctx.createLinearGradient(0, -76, 0, -14)
      coat.addColorStop(0, '#1a2130')
      coat.addColorStop(1, '#10151f')
      ctx.fillStyle = coat
      ctx.beginPath()
      ctx.moveTo(-13 + sway * 0.3, -73 - breathe)
      ctx.bezierCurveTo(-17.5, -70, -18.5, -56, -18, -42)
      ctx.lineTo(-20 + f1 * 0.4, -15)
      ctx.quadraticCurveTo(0, -13 + f2 * 0.3, 21 + f1, -16 + f2 * 0.4)
      ctx.lineTo(18, -42)
      ctx.bezierCurveTo(18.5, -56, 17.5, -70, 13 + sway * 0.3, -73 - breathe)
      ctx.quadraticCurveTo(0, -77 - breathe, -13 + sway * 0.3, -73 - breathe)
      ctx.closePath()
      ctx.fill()
      // 手臂插在口袋里的轮廓
      ctx.strokeStyle = 'rgba(48, 58, 78, 0.9)'
      ctx.lineWidth = 0.9
      ctx.beginPath()
      ctx.moveTo(-15.5, -67)
      ctx.quadraticCurveTo(-17.5, -52, -12, -38)
      ctx.moveTo(15.5, -67)
      ctx.quadraticCurveTo(17.5, -52, 12, -38)
      ctx.stroke()
      // 脖子、头和头发
      ctx.fillStyle = '#121824'
      ctx.fillRect(-3 + sway * 0.4, -81 - breathe, 6, 9)
      ctx.beginPath()
      ctx.ellipse(hx, -87 - breathe, 6.6 - look * 0.8, 7.8, look * 0.12, 0, Math.PI * 2)
      ctx.fill()
      ctx.fillStyle = '#0b0f17'
      ctx.beginPath()
      ctx.ellipse(hx, -89.5 - breathe, 6.9, 5.6, look * 0.12, Math.PI, Math.PI * 2)
      ctx.fill()
      // 被风吹起的深红围巾
      ctx.fillStyle = '#5e3436'
      ctx.beginPath()
      ctx.moveTo(-6 + sway * 0.4, -76 - breathe)
      ctx.quadraticCurveTo(0, -79 - breathe, 6 + sway * 0.4, -76 - breathe)
      ctx.quadraticCurveTo(14 + f2, -78 + f1, 22 + f2 * 1.6, -72 + f1)
      ctx.quadraticCurveTo(13 + f2 * 0.6, -71, 5, -72 - breathe)
      ctx.quadraticCurveTo(0, -73, -6 + sway * 0.4, -76 - breathe)
      ctx.closePath()
      ctx.fill()
      // 肩膀和头顶的天光轮廓
      ctx.strokeStyle = auroraTint(165, 180, 206, 0.4 + 0.15 * au, au)
      ctx.lineWidth = 0.8
      ctx.beginPath()
      ctx.ellipse(hx, -87 - breathe, 6.6 - look * 0.8, 7.8, look * 0.12, Math.PI * 1.05, Math.PI * 1.7)
      ctx.stroke()
      ctx.beginPath()
      ctx.moveTo(-17, -66)
      ctx.quadraticCurveTo(-15, -72 - breathe, -6, -75 - breathe)
      ctx.stroke()
      ctx.restore()
    }

    const spray = (x, y, n, power, spread) => {
      const L = lay.L
      for (let i = 0; i < n; i++) {
        drops.push({
          x: x + rand(-spread, spread) * L,
          y,
          vx: rand(-0.35, 0.35) * L,
          vy: -rand(0.3, 1) * power * L,
          r: rand(0.4, 1.5) * unit * 1.4,
          life: rand(0.9, 1.6),
          age: 0
        })
      }
    }
    const addFoam = (x, y, w, h, life) => {
      foam.push({ x, y, w, h, spread: rand(0.1, 0.4), age: 0, life })
    }
    // 跳出水面的小鱼
    const jumpFish = (x, y, n, power) => {
      for (let i = 0; i < n; i++) {
        fish.push({
          x: x + rand(-0.3, 0.3) * lay.L,
          y,
          vx: rand(-0.4, 0.4) * lay.L,
          vy: -rand(0.4, 1) * power * lay.L,
          age: 0
        })
      }
    }

    // 从嘴角倾泻下来的水
    const drawPour = (cx, cy, ang, k, wy, amount, t) => {
      const cos = Math.cos(ang)
      const sin = Math.sin(ang)
      ctx.lineCap = 'round'
      for (const [lx, ly, w] of [[98, 6, 5], [86, 14, 6], [70, 18, 4], [52, 20, 3]]) {
        const sx = cx + (lx * cos - ly * sin) * k
        const sy = cy + (lx * sin + ly * cos) * k
        if (sy >= wy) continue
        const grad = ctx.createLinearGradient(0, sy, 0, wy)
        grad.addColorStop(0, `rgba(232, 238, 247, ${0.75 * amount})`)
        grad.addColorStop(1, `rgba(232, 238, 247, ${0.2 * amount})`)
        ctx.strokeStyle = grad
        ctx.lineWidth = w * unit * (0.6 + amount)
        ctx.beginPath()
        ctx.moveTo(sx, sy)
        ctx.quadraticCurveTo(sx + 6 * unit + Math.sin(t * 9 + lx) * 3 * unit, (sy + wy) / 2, sx + 10 * unit + Math.sin(t * 7 + ly) * 5 * unit, wy)
        ctx.stroke()
      }
    }

    return {
      resize,
      draw (t, dt) {
        ctx.clearRect(0, 0, W, H)
        const horizonY = H * HORIZON
        const { wx, wy, L } = lay

        const night = nightAt(t)
        const au = auroraAt(t)

        // 远处：小木屋、船、零星海鸥
        drawHouse(lay.house, horizonY + 1 * unit, t, night)
        drawBoat(W * 0.68, horizonY + 6 * unit, 13 * unit, t, '#ffffff', night)
        drawBoat(W * 0.36, horizonY + 3 * unit, 8 * unit, t, '#5dff9a', night)
        for (const g of farGulls) drawFarGull(g, t, dt)

        // 天要黑了，鸟群飞走
        if (!events.leave && t > LAPSE_START) {
          events.leave = true
          leaveFlock()
        }

        // ---- 鲸鱼：冲刺进食 ----
        const u = (t - WHALE_START) / WHALE_DUR

        // 冲出水面之前：鱼群被赶到水面，翻起一片小水花
        if (u < 0.05 && dt > 0) {
          if (Math.random() < 0.6) spray(wx + rand(-0.35, 0.35) * L, wy + rand(-0.01, 0.03) * L, 2, 0.22, 0.02)
          if (Math.random() < 0.08) jumpFish(wx, wy, 1, 0.5)
        }
        // 鸟群的背面一半先画（在鲸鱼后面）
        for (const g of flock) if (Math.sin(g.a) < 0) drawFlockGull(g, t, dt)

        if (u > 0 && u < 1.05) {
          const e = smooth(0, 0.3, u) * (1 - smooth(0.62, 1, u)) // 露出水面的程度
          const gape = 0.7 * (1 - smooth(0.3, 0.62, u)) // 张嘴 → 停在最高点慢慢合上
          const pouch = 16 * smooth(0.04, 0.32, u) * (1 - 0.6 * smooth(0.45, 1, u))
          const ang = -1.52 + 0.14 * smooth(0.3, 1, u) // 几乎垂直，慢慢往右倒一点
          const k = L / 200
          const cx = wx + 0.03 * L * smooth(0.3, 1, u)
          const cy = wy - e * 0.55 * L + 0.5 * L // 头尖离水面 e × 0.55 个身长

          if (!events.burst && u > 0.02) {
            events.burst = true
            scatterFlock()
            jumpFish(wx, wy, 26, 1.1)
            spray(wx, wy, 120, 1.2, 0.18)
          }
          if (u < 0.3 && dt > 0) {
            spray(wx, wy, 8, 1, 0.14)
            addFoam(wx + rand(-0.25, 0.25) * L, wy + rand(-0.005, 0.03) * L, rand(0.03, 0.1) * L, rand(0.006, 0.018) * L, rand(1.4, 2.4))
          }
          if (u > 0.45 && u < 0.85 && dt > 0) spray(wx + 0.1 * L, wy, 4, 0.5, 0.12)
          if (!events.dive && u > 0.68) {
            events.dive = true
            diveFlock()
          }
          if (!events.sink && u > 0.78) {
            events.sink = true
            spray(wx, wy, 160, 1, 0.3)
            for (let i = 0; i < 36; i++) {
              const off = (Math.random() + Math.random() + Math.random()) / 3 - 0.5
              addFoam(wx + off * L * 1.1, wy + rand(-0.01, 0.05) * L, rand(0.04, 0.16) * L, rand(0.008, 0.025) * L, rand(1.6, 2.6))
            }
          }

          ctx.save()
          ctx.beginPath()
          ctx.rect(0, 0, W, wy) // 只画水面以上的部分
          ctx.clip()
          ctx.save()
          ctx.translate(cx, cy)
          ctx.rotate(ang)
          ctx.scale(k, k)
          drawWhale(ctx, gape, pouch, gape > 0.1 ? mouthFish : [])
          ctx.restore()
          const pour = smooth(0.32, 0.5, u) * (1 - smooth(0.8, 1, u))
          if (pour > 0.02) drawPour(cx, cy, ang, k, wy, pour, t)
          ctx.restore()
          // 鲸鱼周围被顶起的一圈白水
          ctx.fillStyle = `rgba(228, 235, 244, ${0.3 * e})`
          ctx.beginPath()
          ctx.ellipse(cx, wy + 0.01 * L, 0.2 * L, 0.025 * L, 0, 0, Math.PI * 2)
          ctx.fill()
        }

        // 白沫：慢慢摊开、变淡
        foam = foam.filter(f => (f.age += dt) < f.life)
        for (const f of foam) {
          const p = f.age / f.life
          ctx.fillStyle = `rgba(228, 234, 243, ${0.28 * (1 - p) * Math.min(1, f.age * 8) * (1 - 0.8 * night)})`
          ctx.beginPath()
          ctx.ellipse(f.x, f.y, f.w * (1 + p * f.spread * 3), f.h * (1 + p * f.spread), 0, 0, Math.PI * 2)
          ctx.fill()
        }

        // 水花：画成沿运动方向的短线，看起来是飞溅而不是圆点
        const grav = 1.9 * L
        drops = drops.filter(d => (d.age += dt) < d.life && d.y <= wy + 4 * unit)
        ctx.lineCap = 'round'
        for (const d of drops) {
          d.vy += grav * dt
          d.x += d.vx * dt
          d.y += d.vy * dt
          ctx.strokeStyle = `rgba(236, 241, 248, ${0.8 * (1 - d.age / d.life)})`
          ctx.lineWidth = d.r
          ctx.beginPath()
          ctx.moveTo(d.x, d.y)
          ctx.lineTo(d.x - d.vx * 0.018, d.y - d.vy * 0.018)
          ctx.stroke()
        }

        // 小鱼：银色的一小条，朝着飞行方向，偶尔闪一下
        fish = fish.filter(f => (f.age += dt) < 3 && f.y <= wy + 2 * unit)
        for (const f of fish) {
          f.vy += grav * dt
          f.x += f.vx * dt
          f.y += f.vy * dt
          const glint = 0.6 + 0.4 * Math.sin(f.age * 25 + f.x)
          ctx.fillStyle = `rgba(${Math.round(200 + 50 * glint)}, ${Math.round(210 + 40 * glint)}, 235, 0.95)`
          ctx.beginPath()
          ctx.ellipse(f.x, f.y, 3.2 * unit, 1.1 * unit, Math.atan2(f.vy, f.vx), 0, Math.PI * 2)
          ctx.fill()
        }

        // 鸟群的前面一半（在鲸鱼前面）
        for (const g of flock) if (Math.sin(g.a) >= 0) drawFlockGull(g, t, dt)

        // 最前面：礁石和背影
        drawRock(au)
        // 鲸鱼冲出来时转头去看，极光出现时又抬头望一会儿
        const look = smooth(0, 0.12, u) * (1 - smooth(1.2, 1.8, u)) + 0.6 * smooth(LAPSE_END - 0.8, LAPSE_END + 0.6, t)
        drawFigure(lay.px, lay.rockTop + H * 0.012, lay.fh, t, look, au)
      }
    }
  }

  // ================= 搭建画面 =================
  const build = () => {
    const el = document.createElement('div')
    el.id = 'jy-splash'
    el.setAttribute('aria-hidden', 'true')
    el.innerHTML = `
      <div class="jy-scene">
        <canvas class="jy-world"></canvas>
        <canvas class="jy-life"></canvas>
      </div>
      <div class="jy-vignette"></div>
      <div class="jy-grain"></div>
      <div class="jy-text">
        <div class="jy-title">jiayu</div>
        <div class="jy-sub">愿你仍认得我</div>
      </div>
      <div class="jy-skip">点击任意处进入</div>
      <div class="jy-mist"></div>`
    document.body.appendChild(el)

    const world = startWorld(el.querySelector('.jy-world'))
    const life = startLife(el.querySelector('.jy-life'))
    const resize = () => {
      if (world) world.resize()
      life.resize()
    }
    resize()
    window.addEventListener('resize', resize)

    let raf = 0
    let prev = performance.now()
    const t0 = prev
    let frozen = false
    let sceneT = 0 // 场景时间：延时摄影时走得飞快，最后慢下来
    const frame = now => {
      let t = (now - t0) / 1000
      let dt = Math.min((now - prev) / 1000, 0.05)
      prev = now
      if (freezeAt !== null) {
        // 定格：先按 1/60 秒一步快进到指定时间，让水花、鸟群、场景时间都算出来，之后不再前进
        if (!frozen) {
          for (let s = 0; s < freezeAt; s += 1 / 60) {
            life.draw(s, 1 / 60)
            sceneT += lapseSpeed(s) / 60
          }
          frozen = true
        }
        t = freezeAt
        dt = 0
      }
      sceneT += dt * lapseSpeed(t)
      if (world) world.draw(sceneT, t)
      life.draw(t, dt)
      raf = requestAnimationFrame(frame)
    }
    raf = requestAnimationFrame(frame)
    requestAnimationFrame(() => el.classList.add('jy-ready'))

    let done = false
    let timer = 0
    // 先起雾盖住画面，再整体淡出露出博客；手动跳过时雾来得快一些
    const finish = fast => {
      if (done) return
      done = true
      clearTimeout(timer)
      ;['click', 'keydown', 'wheel', 'touchstart'].forEach(t => window.removeEventListener(t, skip))
      if (fast) el.classList.add('jy-fast')
      el.classList.add('jy-mist-in')
      setTimeout(() => {
        root.classList.remove('jy-splash-on')
        el.classList.add('jy-out')
        setTimeout(() => {
          cancelAnimationFrame(raf)
          window.removeEventListener('resize', resize)
          el.remove()
        }, 950)
      }, fast ? 500 : 1000)
    }
    const skip = () => finish(true)
    ;['click', 'keydown', 'wheel', 'touchstart'].forEach(t => window.addEventListener(t, skip, { passive: true }))
    if (!hold) timer = setTimeout(() => finish(false), SCENE)
  }

  if (document.body) build()
  else document.addEventListener('DOMContentLoaded', build)
})()
