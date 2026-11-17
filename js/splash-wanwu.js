// 启动动画：道生万物
// 全部由代码实时生成：几十万个微粒组成的旋涡星系（金色核球、三条旋臂、外圈蓝紫色的气），
// 镜头从高处俯视慢慢落到正面，所有微粒忽然聚拢、显出名字，停一会儿后升腾散去，露出博客。
// 同一个标签页只播一次；点击 / 按键 / 滚轮可跳过；系统开启"减少动态效果"或浏览器不支持 WebGL2 时不播
(() => {
  const KEY = 'wy-splash-seen'
  const TEXT = 'jiayu' // 微粒聚成的字，想换成「万物」之类直接改这里
  const SUB = '愿你仍认得我' // 名字下面的小字，留空就不显示
  const T_ASM = 3.0 // 微粒开始聚成字（秒）
  const T_SUB = 4.0 // 小字浮现
  const T_DIS = 5.4 // 字升腾散去
  const T_OUT = 6.6 // 整个画面开始淡出、露出博客
  const FONT = 'Georgia, "Noto Serif SC", "Source Han Serif SC", "Songti SC", "STSong", "Times New Roman", serif'

  // 调试：网址加 ?splash 强制重播，?splash=hold 停在字聚好的样子不消失；?splash&at=2 定格在第 2 秒
  const force = /[?&]splash\b/.test(location.search)
  const hold = /[?&]splash=hold\b/.test(location.search)
  const atMatch = location.search.match(/[?&]at=([\d.]+)/)
  const freezeAt = force && atMatch ? parseFloat(atMatch[1]) : null
  const stay = hold || freezeAt !== null // 定格时也不自动消失

  try {
    if (sessionStorage.getItem(KEY) && !force) return
  } catch (e) { /* 隐私模式下 sessionStorage 可能不可用，照常播放 */ }
  if (!force && window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches) return

  // 先试一下 WebGL2 和浮点渲染目标，不支持就干脆不播，不挡住博客
  const probe = document.createElement('canvas').getContext('webgl2')
  if (!probe) return
  const f32 = !!probe.getExtension('EXT_color_buffer_float')
  if (!f32 && !probe.getExtension('EXT_color_buffer_half_float')) return
  const lose = probe.getExtension('WEBGL_lose_context')
  if (lose) lose.loseContext()

  try { sessionStorage.setItem(KEY, '1') } catch (e) { /* 同上 */ }
  const root = document.documentElement
  root.classList.add('wy-splash-on')

  const clamp01 = x => Math.max(0, Math.min(1, x))
  const smooth = (a, b, x) => { const k = clamp01((x - a) / (b - a)); return k * k * (3 - 2 * k) }
  const lerp = (a, b, k) => a + (b - a) * k

  // 手机和小屏用少一些微粒；桌面 26 万颗
  const small = Math.min(screen.width, screen.height) < 700 || /Mobi|Android|iPhone|iPad/i.test(navigator.userAgent)
  const N = small ? 256 : 512 // 微粒贴图的边长，总数是它的平方

  // ================= 着色器 =================
  const VS_QUAD = `#version 300 es
    layout(location=0) in vec2 p; out vec2 v;
    void main(){ v = p * 0.5 + 0.5; gl_Position = vec4(p, 0.0, 1.0); }`

  const NOISE = `
    float hash13(vec3 p3){ p3 = fract(p3 * .1031); p3 += dot(p3, p3.zyx + 31.32); return fract((p3.x + p3.y) * p3.z); }
    float noise3(vec3 x){
      vec3 i = floor(x), f = fract(x); f = f * f * (3. - 2. * f);
      return mix(mix(mix(hash13(i), hash13(i + vec3(1,0,0)), f.x), mix(hash13(i + vec3(0,1,0)), hash13(i + vec3(1,1,0)), f.x), f.y),
                 mix(mix(hash13(i + vec3(0,0,1)), hash13(i + vec3(1,0,1)), f.x), mix(hash13(i + vec3(0,1,1)), hash13(i + vec3(1,1,1)), f.x), f.y), f.z);
    }
    vec3 noiseV(vec3 p){ return vec3(noise3(p), noise3(p + vec3(31.4, 17.2, 9.1)), noise3(p + vec3(5.3, 71.1, 23.7))); }`

  // 微粒的运动：平时按星系较差自转（越靠里转得越快）再叠一层卷曲湍流；
  // 聚字时每颗微粒被弹簧拉向字上的一个点；散去时往上飘
  const FS_SIM = `#version 300 es
    precision highp float;
    layout(location=0) out vec4 oPos;
    layout(location=1) out vec4 oVel;
    uniform sampler2D uPos, uVel, uTarget;
    uniform float uDt, uT, uAssemble, uDisperse, uKick;
    uniform int uSize;
    ${NOISE}
    vec3 curl(vec3 p){
      float e = 0.08;
      vec3 dx = noiseV(p + vec3(e,0,0)) - noiseV(p - vec3(e,0,0));
      vec3 dy = noiseV(p + vec3(0,e,0)) - noiseV(p - vec3(0,e,0));
      vec3 dz = noiseV(p + vec3(0,0,e)) - noiseV(p - vec3(0,0,e));
      return vec3(dy.z - dz.y, dz.x - dx.z, dx.y - dy.x) / (2. * e);
    }
    void main(){
      ivec2 ij = ivec2(gl_FragCoord.xy);
      vec4 P = texelFetch(uPos, ij, 0);
      vec4 V = texelFetch(uVel, ij, 0);
      vec4 Tg = texelFetch(uTarget, ij, 0);
      vec3 p = P.xyz, vel = V.xyz;
      float id = float(ij.x + ij.y * uSize);
      float h = hash13(vec3(id, 3.1, 7.7));
      vec3 c = curl(p * 0.7 + vec3(h * 0.2, uT * 0.03, 0.));
      // 星系：直接按角速度把位置转过去（不会因为步长被甩出去），再加湍流漂移
      float rxz = length(p.xz) + 1e-4;
      float vorb = 1.9 * sqrt(1.0 / (0.3 + rxz * 0.25)) * (0.92 + 0.16 * h);
      float omega = min(vorb / rxz, 3.5) * (1.0 + 0.35 * uKick);
      float cs = cos(omega * uDt), sn = sin(omega * uDt);
      vec3 pr = vec3(p.x * cs - p.z * sn, p.y, p.x * sn + p.z * cs);
      vec3 drift = c * vec3(1., 0.35, 1.) * (0.55 + uKick * 0.9) * smoothstep(0.3, 2.2, rxz)
                 - p * 0.06 * smoothstep(7., 9.5, rxz)
                 - vec3(0., p.y, 0.) * 0.15 * smoothstep(2.5, 0.5, rxz);
      vec3 pFlow = pr + drift * uDt;
      vec3 velFlow = (pFlow - p) / uDt;
      // 聚字
      vec3 tgt = Tg.xyz + (noiseV(p * 3.0 + uT * 0.5) - 0.5) * 0.06;
      vec3 velAsm = vel + ((tgt - p) * 14.0 - vel * 4.5 + c * 0.4) * uDt;
      float isTxt = Tg.w * uAssemble;
      vel = mix(velFlow, velAsm, isTxt);
      // 散去
      if (uDisperse > 0.) {
        vec3 up = vec3(0., 9.0, 0.) + c * 8.0;
        vel = mix(vel, vel * 0.98 + up * uDt * uDisperse * (0.6 + h), uDisperse * Tg.w);
      }
      p = mix(pFlow, p + vel * uDt, max(isTxt, uDisperse * Tg.w));
      // 不参与聚字的微粒跑远了就在星系里重生
      float life = P.w;
      if (Tg.w < 0.5) {
        life -= uDt * (0.05 + 0.1 * h);
        if (length(p) > 11.0 || life < 0.) {
          float a = h * 6.2831, rr = 0.3 + 7.0 * pow(hash13(vec3(id, uT, 1.)), 0.8);
          p = vec3(cos(a) * rr, (hash13(vec3(id, uT, 2.)) - 0.5) * 1.2, sin(a) * rr);
          vel = vec3(0.); life = 1.0;
        }
      }
      oPos = vec4(p, life);
      oVel = vec4(vel, 0.);
    }`

  const VS_PTS = `#version 300 es
    precision highp float;
    uniform sampler2D uPos, uVel, uTarget;
    uniform mat4 uVP;
    uniform float uAssemble, uFade, uPointScale, uMaxSize, uDisperse;
    uniform int uSize;
    out vec3 vCol; out float vA;
    float hash11(float n){ return fract(sin(n) * 43758.5453); }
    void main(){
      int id = gl_VertexID;
      ivec2 ij = ivec2(id % uSize, id / uSize);
      vec4 P = texelFetch(uPos, ij, 0);
      vec4 V = texelFetch(uVel, ij, 0);
      vec4 Tg = texelFetch(uTarget, ij, 0);
      vec4 clip = uVP * vec4(P.xyz, 1.);
      gl_Position = clip;
      float w = max(clip.w, 0.2);
      float sp = length(V.xyz), r = length(P.xz);
      // 颜色：核心金、旋臂玫红、外圈蓝紫，跑得快的偏青
      vec3 col = mix(vec3(1.0, 0.72, 0.35), vec3(0.95, 0.32, 0.5), smoothstep(0.8, 3.5, r));
      col = mix(col, vec3(0.3, 0.42, 1.0), smoothstep(3.0, 7.5, r));
      col = mix(col, vec3(0.3, 0.95, 0.9), smoothstep(2.5, 6., sp) * 0.6);
      float hid = hash11(float(id) * 0.731);
      float isTxt = Tg.w * uAssemble;
      col = mix(col, mix(vec3(1.0, 0.88, 0.62), vec3(1.0, 0.55, 0.35), hid), isTxt);
      float sz = uPointScale / w;
      gl_PointSize = clamp(sz, 1.0, uMaxSize);
      vCol = col;
      float a = clamp(P.w * 4., 0., 1.) * uFade;
      if (Tg.w > 0.5) a *= 1. - uDisperse * (0.6 + 0.4 * hid);
      a *= mix(1.0, 2.4, isTxt);
      vA = a * clamp(sz / 1.5, 0.3, 1.0);
    }`

  const FS_PTS = `#version 300 es
    precision highp float;
    in vec3 vCol; in float vA; out vec4 o;
    uniform float uIntensity;
    void main(){
      float d = length(gl_PointCoord - 0.5) * 2.;
      float a = exp(-d * d * 3.2) * smoothstep(1., 0.6, d);
      o = vec4(vCol * a * vA * uIntensity, 1.);
    }`

  const FS_DOWN = `#version 300 es
    precision highp float;
    in vec2 v; out vec4 o;
    uniform sampler2D uTex; uniform vec2 uTexel; uniform float uThreshold;
    void main(){
      vec3 c = (texture(uTex, v + uTexel * vec2(-1,-1)).rgb + texture(uTex, v + uTexel * vec2(1,-1)).rgb
              + texture(uTex, v + uTexel * vec2(-1,1)).rgb + texture(uTex, v + uTexel * vec2(1,1)).rgb) * 0.25;
      if (uThreshold > 0.) { float l = max(c.r, max(c.g, c.b)); c *= max(l - uThreshold, 0.) / max(l, 1e-4); }
      o = vec4(c, 1.);
    }`

  const FS_BLUR = `#version 300 es
    precision highp float;
    in vec2 v; out vec4 o;
    uniform sampler2D uTex; uniform vec2 uDir;
    void main(){
      float w[5] = float[](0.227027, 0.1945946, 0.1216216, 0.054054, 0.016216);
      vec3 c = texture(uTex, v).rgb * w[0];
      for (int i = 1; i < 5; i++) { c += (texture(uTex, v + uDir * float(i)).rgb + texture(uTex, v - uDir * float(i)).rgb) * w[i]; }
      o = vec4(c, 1.);
    }`

  // 合成：泛光 + 电影感色调映射 + 暗角 + 颗粒，背景是一点很暗的紫色星云
  const FS_FINAL = `#version 300 es
    precision highp float;
    in vec2 v; out vec4 o;
    uniform sampler2D uHdr, uB1, uB2;
    uniform float uT, uFade;
    uniform vec2 uRes;
    ${NOISE}
    float hash12(vec2 p){ vec3 p3 = fract(vec3(p.xyx) * .1031); p3 += dot(p3, p3.yzx + 33.33); return fract((p3.x + p3.y) * p3.z); }
    vec3 aces(vec3 x){ return clamp((x * (2.51 * x + .03)) / (x * (2.43 * x + .59) + .14), 0., 1.); }
    void main(){
      vec2 c = (v - 0.5) * vec2(uRes.x / uRes.y, 1.);
      float d = length(c);
      vec3 bg = mix(vec3(0.012, 0.008, 0.03), vec3(0.0), smoothstep(0., 0.9, d));
      float n = noise3(vec3(c * 2.5, uT * 0.05)) * 0.6 + noise3(vec3(c * 5.0, uT * 0.08)) * 0.4;
      bg += vec3(0.08, 0.03, 0.12) * smoothstep(0.45, 0.8, n) * exp(-d * 2.) * 0.6;
      vec3 col = bg + (texture(uHdr, v).rgb + texture(uB1, v).rgb * 0.7 + texture(uB2, v).rgb * 0.5) * uFade;
      col = aces(col);
      col = pow(col, vec3(1.0 / 1.05));
      col *= 1. - 0.45 * smoothstep(0.45, 1.25, d);
      float g = hash12(gl_FragCoord.xy + fract(uT * 13.7) * 97.);
      col += (g - 0.5) * 0.03 * (0.35 + 0.65 * (1. - col.g)) + (g - 0.5) / 255.;
      o = vec4(col, 1.);
    }`

  // ================= 矩阵 =================
  const sub3 = (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]]
  const dot3 = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2]
  const cross3 = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]]
  const norm3 = a => { const l = Math.hypot(a[0], a[1], a[2]); return [a[0] / l, a[1] / l, a[2] / l] }
  const perspective = (fovy, aspect, n, f) => {
    const t = 1 / Math.tan(fovy / 2); const m = new Float32Array(16)
    m[0] = t / aspect; m[5] = t; m[10] = (f + n) / (n - f); m[11] = -1; m[14] = 2 * f * n / (n - f); return m
  }
  const lookAt = (e, c, up) => {
    const z = norm3(sub3(e, c)), x = norm3(cross3(up, z)), y = cross3(z, x); const m = new Float32Array(16)
    m[0] = x[0]; m[4] = x[1]; m[8] = x[2]; m[1] = y[0]; m[5] = y[1]; m[9] = y[2]; m[2] = z[0]; m[6] = z[1]; m[10] = z[2]
    m[12] = -dot3(x, e); m[13] = -dot3(y, e); m[14] = -dot3(z, e); m[15] = 1; return m
  }
  const mul4 = (a, b) => {
    const o = new Float32Array(16)
    for (let i = 0; i < 4; i++) for (let j = 0; j < 4; j++) { let s = 0; for (let k = 0; k < 4; k++) s += a[k * 4 + j] * b[i * 4 + k]; o[i * 4 + j] = s }
    return o
  }
  const FOV = 50 * Math.PI / 180

  // ================= 画面 =================
  const startWorld = canvas => {
    const gl = canvas.getContext('webgl2', { antialias: false, alpha: false, depth: false, powerPreference: 'high-performance' })
    if (!gl) return null
    if (!gl.getExtension('EXT_color_buffer_float')) gl.getExtension('EXT_color_buffer_half_float')
    const FT = f32 ? gl.FLOAT : gl.HALF_FLOAT
    const FI = f32 ? gl.RGBA32F : gl.RGBA16F

    const shader = (type, src) => {
      const s = gl.createShader(type); gl.shaderSource(s, src); gl.compileShader(s)
      if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s))
      return s
    }
    const program = (vs, fs) => {
      const p = gl.createProgram()
      gl.attachShader(p, shader(gl.VERTEX_SHADER, vs)); gl.attachShader(p, shader(gl.FRAGMENT_SHADER, fs)); gl.linkProgram(p)
      if (!gl.getProgramParameter(p, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(p))
      const u = {}
      for (let i = 0, n = gl.getProgramParameter(p, gl.ACTIVE_UNIFORMS); i < n; i++) {
        const name = gl.getActiveUniform(p, i).name; u[name.replace('[0]', '')] = gl.getUniformLocation(p, name)
      }
      return { p, u }
    }
    const tex = (w, h, internal, type, data, filter) => {
      const t = gl.createTexture(); gl.bindTexture(gl.TEXTURE_2D, t)
      gl.texImage2D(gl.TEXTURE_2D, 0, internal, w, h, 0, gl.RGBA, type, data || null)
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, filter); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, filter)
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
      return t
    }
    const fbo = texs => {
      const f = gl.createFramebuffer(); gl.bindFramebuffer(gl.FRAMEBUFFER, f)
      texs.forEach((t, i) => gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0 + i, gl.TEXTURE_2D, t, 0))
      gl.drawBuffers(texs.map((_, i) => gl.COLOR_ATTACHMENT0 + i))
      if (gl.checkFramebufferStatus(gl.FRAMEBUFFER) !== gl.FRAMEBUFFER_COMPLETE) throw new Error('framebuffer incomplete')
      return f
    }
    const toHalf = arr => {
      // 只有半精度浮点可用时，把 Float32 数据转成 16 位
      const out = new Uint16Array(arr.length), f = new Float32Array(1), i32 = new Int32Array(f.buffer)
      for (let k = 0; k < arr.length; k++) {
        f[0] = arr[k]; const x = i32[0]
        const s = (x >> 16) & 0x8000, e = ((x >> 23) & 0xff) - 112, m = x & 0x7fffff
        out[k] = e <= 0 ? s : e >= 31 ? s | 0x7c00 : s | (e << 10) | (m >> 13)
      }
      return out
    }
    const upload = arr => (f32 ? arr : toHalf(arr))

    const P = {
      sim: program(VS_QUAD, FS_SIM), pts: program(VS_PTS, FS_PTS),
      down: program(VS_QUAD, FS_DOWN), blur: program(VS_QUAD, FS_BLUR), fin: program(VS_QUAD, FS_FINAL),
    }
    const quad = gl.createVertexArray(); gl.bindVertexArray(quad)
    gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer())
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW)
    gl.enableVertexAttribArray(0); gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0)
    const empty = gl.createVertexArray()
    const drawQuad = () => { gl.bindVertexArray(quad); gl.drawArrays(gl.TRIANGLES, 0, 3) }
    const bind = (unit, t) => { gl.activeTexture(gl.TEXTURE0 + unit); gl.bindTexture(gl.TEXTURE_2D, t) }

    // ---- 初始星系：核球 + 三条对数螺旋臂 + 弥散的盘 ----
    let seed = 12345
    const rnd = () => { seed = (seed * 1664525 + 1013904223) >>> 0; return seed / 4294967296 }
    const COUNT = N * N
    const pos0 = new Float32Array(COUNT * 4)
    for (let i = 0; i < COUNT; i++) {
      let rr, a, y; const u = rnd()
      if (u < 0.14) { rr = Math.pow(rnd(), 1.3) * 1.9 + 0.05; a = rnd() * Math.PI * 2; y = (rnd() - 0.5) * (0.2 + rr * 0.7) }
      else if (u < 0.78) {
        rr = 1.0 + Math.pow(rnd(), 0.85) * 6.4
        const spread = (rnd() + rnd() - 1) * (0.28 + 0.05 * rr)
        const inner = Math.min(Math.max((rr - 0.8) / 2.4, 0), 1)
        a = (i % 3) * 2 * Math.PI / 3 + 1.55 * Math.log(rr) + spread + (rnd() - 0.5) * 6.2832 * (1 - inner)
        y = (rnd() + rnd() - 1) * (0.18 + rr * 0.05)
      } else { rr = Math.pow(rnd(), 0.6) * 7.6; a = rnd() * Math.PI * 2; y = (rnd() + rnd() - 1) * (0.35 + rr * 0.09) }
      pos0[i * 4] = Math.cos(a) * rr; pos0[i * 4 + 1] = y; pos0[i * 4 + 2] = Math.sin(a) * rr; pos0[i * 4 + 3] = 0.3 + rnd() * 0.7
    }
    const posT = [tex(N, N, FI, FT, upload(pos0), gl.NEAREST), tex(N, N, FI, FT, null, gl.NEAREST)]
    const velT = [tex(N, N, FI, FT, upload(new Float32Array(COUNT * 4)), gl.NEAREST), tex(N, N, FI, FT, null, gl.NEAREST)]
    const simF = [fbo([posT[0], velT[0]]), fbo([posT[1], velT[1]])]
    let cur = 0

    // ---- 字：把 TEXT 画到画布上，78% 的微粒各自认领字里的一个点 ----
    const textBox = (() => {
      const c = document.createElement('canvas'); c.width = 1536; c.height = 864
      const x = c.getContext('2d')
      x.fillStyle = '#fff'; x.textAlign = 'center'; x.textBaseline = 'middle'
      let size = 520
      x.font = `900 ${size}px ${FONT}`
      const w = x.measureText(TEXT).width
      size = Math.min(size, size * (c.width * 0.8) / Math.max(w, 1))
      x.font = `900 ${size}px ${FONT}`
      x.fillText(TEXT, c.width / 2, c.height / 2)
      const img = x.getImageData(0, 0, c.width, c.height).data
      const pts = []
      for (let j = 0; j < c.height; j++) for (let i = 0; i < c.width; i++) if (img[(j * c.width + i) * 4 + 3] > 128) pts.push(i, j)
      const n = pts.length / 2
      const data = new Float32Array(COUNT * 4)
      const planeW = 14.0, planeH = planeW * c.height / c.width
      let minX = 0, maxX = 0, minY = 0, maxY = 0
      for (let k = 0; k < COUNT; k++) {
        if (rnd() < 0.78 && n > 0) {
          const q = (rnd() * n) | 0
          const px = ((pts[q * 2] + rnd()) / c.width - 0.5) * planeW
          const py = -((pts[q * 2 + 1] + rnd()) / c.height - 0.5) * planeH
          data[k * 4] = px; data[k * 4 + 1] = py; data[k * 4 + 2] = (rnd() - 0.5) * 0.25; data[k * 4 + 3] = 1
          minX = Math.min(minX, px); maxX = Math.max(maxX, px); minY = Math.min(minY, py); maxY = Math.max(maxY, py)
        }
      }
      return { tex: tex(N, N, FI, FT, upload(data), gl.NEAREST), halfW: Math.max(-minX, maxX), minY, maxY }
    })()

    // ---- 渲染目标（随窗口大小重建）----
    let W = 1, H = 1, hdr, hdrF, mips = []
    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, small ? 2 : 1.5)
      let w = Math.round(canvas.clientWidth * dpr), h = Math.round(canvas.clientHeight * dpr)
      const cap = 2.6e6 // 最多约 260 万像素，4K 屏也不会太吃力
      if (w * h > cap) { const k = Math.sqrt(cap / (w * h)); w = Math.round(w * k); h = Math.round(h * k) }
      if (w === W && h === H) return
      W = canvas.width = Math.max(w, 1); H = canvas.height = Math.max(h, 1)
      ;[hdr, ...mips.flatMap(m => [m.a, m.b])].forEach(t => t && gl.deleteTexture(t))
      hdr = tex(W, H, gl.RGBA16F, gl.HALF_FLOAT, null, gl.LINEAR); hdrF = fbo([hdr])
      mips = [2, 4, 8].map(d => {
        const w2 = Math.max(1, (W / d) | 0), h2 = Math.max(1, (H / d) | 0)
        const a = tex(w2, h2, gl.RGBA16F, gl.HALF_FLOAT, null, gl.LINEAR), b = tex(w2, h2, gl.RGBA16F, gl.HALF_FLOAT, null, gl.LINEAR)
        return { w: w2, h: h2, a, b, fa: fbo([a]), fb: fbo([b]) }
      })
    }

    const step = (t, dt) => {
      gl.useProgram(P.sim.p); gl.bindFramebuffer(gl.FRAMEBUFFER, simF[1 - cur]); gl.viewport(0, 0, N, N)
      bind(0, posT[cur]); bind(1, velT[cur]); bind(2, textBox.tex)
      gl.uniform1i(P.sim.u.uPos, 0); gl.uniform1i(P.sim.u.uVel, 1); gl.uniform1i(P.sim.u.uTarget, 2); gl.uniform1i(P.sim.u.uSize, N)
      gl.uniform1f(P.sim.u.uDt, dt); gl.uniform1f(P.sim.u.uT, t)
      gl.uniform1f(P.sim.u.uAssemble, assembleAt(t))
      gl.uniform1f(P.sim.u.uDisperse, disperseAt(t))
      gl.uniform1f(P.sim.u.uKick, kickAt(t))
      drawQuad(); cur = 1 - cur
    }
    const assembleAt = t => smooth(T_ASM, T_ASM + 0.9, t)
    const disperseAt = t => (hold ? 0 : smooth(T_DIS, T_DIS + 1.0, t))
    // 聚字那一下，整个星系被轻轻甩一下
    const kickAt = t => (t > T_ASM - 0.4 ? Math.exp(-(t - T_ASM + 0.4) * 2.5) : 0)

    // 镜头：先从高处斜着看星系并绕着转，聚字前落到正面，正面的距离保证字在竖屏上也放得下
    const camera = t => {
      const aspect = W / H
      const orbit = 0.35 + t * 0.16
      // 竖屏时镜头退远一些，整个星系才放得进窄屏
      const farR = Math.max(10.0, 6.0 / (Math.tan(FOV / 2) * aspect))
      const far = [Math.sin(orbit) * farR, (7.0 - t * 0.35) * farR / 10, Math.cos(orbit) * farR]
      const fit = (textBox.halfW * 1.3 + 0.4) / (Math.tan(FOV / 2) * aspect)
      const dist = Math.max(11.0, fit) - 0.8 * smooth(T_ASM, T_DIS + 1.5, t)
      const front = [Math.sin(0.08 * (t - T_ASM)) * 0.5, 0.3, dist]
      const k = smooth(T_ASM - 1.6, T_ASM + 0.6, t)
      const eye = [lerp(far[0], front[0], k), lerp(far[1], front[1], k), lerp(far[2], front[2], k)]
      return mul4(perspective(FOV, aspect, 0.1, 100), lookAt(eye, [0, 0.1 * k, 0], [0, 1, 0]))
    }

    const draw = t => {
      const vp = camera(t)
      // 微粒叠加发光，画到 HDR 缓冲里
      gl.bindFramebuffer(gl.FRAMEBUFFER, hdrF); gl.viewport(0, 0, W, H)
      gl.clearColor(0, 0, 0, 1); gl.clear(gl.COLOR_BUFFER_BIT)
      gl.enable(gl.BLEND); gl.blendFunc(gl.ONE, gl.ONE)
      gl.useProgram(P.pts.p); gl.bindVertexArray(empty)
      bind(0, posT[cur]); bind(1, velT[cur]); bind(2, textBox.tex)
      gl.uniform1i(P.pts.u.uPos, 0); gl.uniform1i(P.pts.u.uVel, 1); gl.uniform1i(P.pts.u.uTarget, 2); gl.uniform1i(P.pts.u.uSize, N)
      gl.uniformMatrix4fv(P.pts.u.uVP, false, vp)
      gl.uniform1f(P.pts.u.uAssemble, assembleAt(t)); gl.uniform1f(P.pts.u.uDisperse, disperseAt(t))
      gl.uniform1f(P.pts.u.uFade, smooth(0, 0.9, t))
      // 微粒越少，每颗就画得越大越亮，让整体亮度和 100 万颗时差不多
      const grow = small ? 2.0 : 1.4
      const res = H / 1080
      gl.uniform1f(P.pts.u.uPointScale, 26.0 * grow * res)
      gl.uniform1f(P.pts.u.uMaxSize, Math.max(2, 6.0 * grow * res))
      gl.uniform1f(P.pts.u.uIntensity, (0.2 + 0.07 * kickAt(t)) * (1048576 / COUNT) / (grow * grow))
      gl.drawArrays(gl.POINTS, 0, COUNT)
      gl.disable(gl.BLEND)
      // 泛光
      let src = hdr, sw = W, sh = H
      mips.forEach((m, i) => {
        gl.useProgram(P.down.p); gl.bindFramebuffer(gl.FRAMEBUFFER, m.fa); gl.viewport(0, 0, m.w, m.h)
        bind(0, src); gl.uniform1i(P.down.u.uTex, 0); gl.uniform2f(P.down.u.uTexel, 1 / sw, 1 / sh)
        gl.uniform1f(P.down.u.uThreshold, i === 0 ? 0.85 : 0.0); drawQuad()
        if (i > 0) {
          gl.useProgram(P.blur.p)
          for (let k = 0; k < 2; k++) {
            gl.bindFramebuffer(gl.FRAMEBUFFER, m.fb); bind(0, m.a); gl.uniform1i(P.blur.u.uTex, 0); gl.uniform2f(P.blur.u.uDir, 1.3 / m.w, 0); drawQuad()
            gl.bindFramebuffer(gl.FRAMEBUFFER, m.fa); bind(0, m.b); gl.uniform2f(P.blur.u.uDir, 0, 1.3 / m.h); drawQuad()
          }
        }
        src = m.a; sw = m.w; sh = m.h
      })
      gl.bindFramebuffer(gl.FRAMEBUFFER, null); gl.viewport(0, 0, W, H); gl.useProgram(P.fin.p)
      bind(0, hdr); bind(1, mips[1].a); bind(2, mips[2].a)
      gl.uniform1i(P.fin.u.uHdr, 0); gl.uniform1i(P.fin.u.uB1, 1); gl.uniform1i(P.fin.u.uB2, 2)
      gl.uniform1f(P.fin.u.uT, t); gl.uniform1f(P.fin.u.uFade, 1); gl.uniform2f(P.fin.u.uRes, W, H)
      drawQuad()
      return vp
    }

    // 小字放在字的正下方：把字的下沿投到屏幕上
    const textBottom = vp => {
      const y = textBox.minY - 0.45
      const cy = vp[1] * 0 + vp[5] * y + vp[9] * 0 + vp[13], cw = vp[3] * 0 + vp[7] * y + vp[11] * 0 + vp[15]
      return (1 - (cy / cw * 0.5 + 0.5)) * canvas.clientHeight
    }

    resize()
    // 先让星系自己转一会儿，第一帧就有旋涡的样子
    for (let i = 0; i < 50; i++) step(-0.8 + i / 60, 1 / 60)
    return { resize, step, draw, textBottom }
  }

  // ================= 搭建画面 =================
  const build = () => {
    const el = document.createElement('div')
    el.id = 'wy-splash'
    el.setAttribute('aria-hidden', 'true')
    el.innerHTML = `<canvas></canvas>${SUB ? '<div class="wy-sub"></div>' : ''}<div class="wy-skip">点击任意处进入</div>`
    if (SUB) el.querySelector('.wy-sub').textContent = SUB
    document.body.appendChild(el)

    let world = null
    try { world = startWorld(el.querySelector('canvas')) } catch (e) { console.warn('[splash]', e) }
    if (!world) { root.classList.remove('wy-splash-on'); el.remove(); return }
    window.addEventListener('resize', world.resize)

    let raf = 0, prev = performance.now(), t = 0, frozen = false, subPlaced = false
    const frame = now => {
      let dt = Math.min((now - prev) / 1000, 1 / 30)
      prev = now
      if (freezeAt !== null) {
        // 定格：每帧补算一小段，追到指定时间后停住（一次算太多会让显卡超时丢掉画面）
        if (!frozen) {
          for (let i = 0; i < 12 && t < freezeAt; i++) { world.step(t, 1 / 60); t += 1 / 60 }
          if (t >= freezeAt) frozen = true
        }
        dt = 0
      }
      if (dt > 0) {
        // 掉帧时拆成小步，聚字的弹簧才稳
        const n = Math.ceil(dt / (1 / 60) - 1e-3)
        for (let i = 0; i < n; i++) world.step(t + (dt * i) / n, dt / n)
        t += dt
      }
      const vp = world.draw(t)
      if (SUB && t >= T_SUB - 0.05 && !subPlaced) {
        el.querySelector('.wy-sub').style.top = `${world.textBottom(vp)}px`
        el.classList.add('wy-sub-in'); subPlaced = true
      }
      if (!hold && t >= T_DIS) el.classList.add('wy-dispersing')
      if (!stay && t >= T_OUT) finish(false)
      raf = requestAnimationFrame(frame)
    }
    raf = requestAnimationFrame(frame)

    let done = false
    const finish = fast => {
      if (done) return
      done = true
      ;['click', 'keydown', 'wheel', 'touchstart'].forEach(e => window.removeEventListener(e, skip))
      if (fast) el.classList.add('wy-fast')
      root.classList.remove('wy-splash-on')
      el.classList.add('wy-out') // 画面淡出的同时微粒还在往上飘
      setTimeout(() => {
        cancelAnimationFrame(raf)
        window.removeEventListener('resize', world.resize)
        el.remove()
      }, fast ? 550 : 1150)
    }
    const skip = () => finish(true)
    ;['click', 'keydown', 'wheel', 'touchstart'].forEach(e => window.addEventListener(e, skip, { passive: true }))
  }

  if (document.body) build()
  else document.addEventListener('DOMContentLoaded', build)
})()
