---
title: Hexo博客特定时间流星雨和圣诞下雪教程
date: 2026-03-18 18:10:00
tags:
  - Hexo
  - Butterfly
  - 教程
  - 前端特效
---

最近我给自己的 Hexo 博客加了两组节日特效：

- 每年 12 月 24 日和 12 月 25 日显示圣诞下雪效果
- 每天 23:59 到次日 00:05 显示流星雨效果

这篇文章不是泛泛讲思路，而是直接按我项目里现在的真实落地方式来拆解。你照着做，基本就能复刻出来。

## 先说最终改了哪些文件

这次真正参与实现的源文件一共 4 个：

1. `source/js/christmas-effects.js`
作用：核心逻辑都在这里，包含时间判断、下雪、圣诞帽、流星雨、PJAX 兼容。

2. `source/css/myStyle.css`
作用：给雪花层、流星雨 canvas、圣诞帽补样式和动画。

3. `_config.butterfly.yml`
作用：把自定义 CSS 和 JS 注入到 Butterfly 主题页面里。

4. `source/img/christmas-hat.png`
作用：侧边栏头像上面那顶圣诞帽图片。

如果你执行 `hexo g`，还会自动生成这些发布文件：

- `public/js/christmas-effects.js`
- `public/img/christmas-hat.png`

注意：`public/` 里的东西是生成产物，不是你平时主要编辑的地方。真正要改的是 `source/` 和配置文件。

## 第一步：新建节日特效脚本

我先新建了这个文件：

```text
source/js/christmas-effects.js
```

这个文件一开头先做两件事：

- 用一个立即执行函数包起来，避免污染全局变量
- 建一个 `meteorState` 对象，专门管理流星雨 canvas 的运行状态

代码如下：

```js
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
})()
```

这里这样做的目的很简单：后面流星雨要反复重绘、重置尺寸、销毁动画，如果不用一个状态对象统一管理，很容易越写越乱。

## 第二步：先把“特定时间段”判断写清楚

这个项目里其实有两套时间判断，而且逻辑不一样。

### 1. 圣诞下雪的时间判断

圣诞效果是按“日期”触发的，我写的是每年 12 月 24 日和 12 月 25 日：

```js
const isChristmas = () => {
  const now = new Date()
  const month = now.getMonth() + 1
  const day = now.getDate()
  return month === 12 && (day === 24 || day === 25)
}
```

这里没有限制年份，所以它是“每年循环生效”的写法，不是只在某一年生效一次。

### 2. 流星雨的时间判断

流星雨这部分不是按某个固定节日日期，而是按“每天的具体时段”触发。我现在仓库里写的是：

```js
const isMeteorWindow = (date = new Date()) => {
  const minutes = date.getHours() * 60 + date.getMinutes()
  return minutes >= (23 * 60 + 59) || minutes <= 5
}
```

换成人话就是：

- 每天 23:59 以后开启
- 到次日 00:05 之前都继续显示

为什么要写成 `>= 23:59 || <= 00:05`？

因为它跨了午夜，不能简单写成“开始时间 <= 当前时间 <= 结束时间”。

## 第三步：先做圣诞下雪

时间判断有了之后，我先实现的是下雪效果。

做法不是引第三方库，而是自己往页面里插一个固定定位的图层，然后循环创建一批雪花元素。

代码如下：

```js
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
```

这一段我主要做了 4 件事：

1. 先判断页面里有没有 `snow-layer`
作用：防止重复进入页面或者 PJAX 切页时重复插入一堆雪花。

2. 创建一个全屏固定层 `snow-layer`
作用：让雪花浮在页面最上层，但又不影响点击。

3. 桌面端和移动端使用不同数量的雪花
我这里写的是桌面端 `54` 个，移动端 `28` 个，避免手机太卡。

4. 每片雪花都随机化
随机内容包括大小、起始位置、透明度、下落时长、左右摆动时长和延迟。

这样做出来的效果不会像复制粘贴的一排小白点，而是更自然。

## 第四步：给侧边栏头像加圣诞帽

只有下雪还不够，我又给 Butterfly 侧边栏头像加了一顶圣诞帽。

代码写在同一个脚本文件里：

```js
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
```

这段代码的关键点有两个：

- `#avatar` 是 Butterfly 个人信息卡头像的 DOM id，所以能直接选中
- 我不是直接把帽子塞到头像内部，而是先包一层 `.christmas-avatar-wrap`，再把帽子绝对定位上去

这样帽子的位置会更稳定，也更容易用 CSS 微调。

## 第五步：把圣诞帽图片放到正确位置

为了让下面这行代码生效：

```js
hat.src = '/img/christmas-hat.png'
```

我新增了这个文件：

```text
source/img/christmas-hat.png
```

为什么放这里？

因为 Hexo 生成后会把 `source/img/christmas-hat.png` 变成站点里的：

```text
/img/christmas-hat.png
```

也就是说，JS 里写的访问路径和最终生成路径能直接对上。

## 第六步：给雪花和圣诞帽写 CSS

光有 JS 还不够，雪花和帽子都需要样式支撑，所以我是在这个文件里追加样式：

```text
source/css/myStyle.css
```

### 1. 雪花层样式

```css
.snow-layer {
  position: fixed;
  inset: 0;
  z-index: 9998;
  overflow: hidden;
  pointer-events: none;
}

.snowflake {
  position: absolute;
  top: -12vh;
  border-radius: 50%;
  background: radial-gradient(circle at 30% 30%, #fff 0%, rgba(255, 255, 255, 0.96) 45%, rgba(255, 255, 255, 0.18) 100%);
  box-shadow: 0 0 8px rgba(255, 255, 255, 0.4);
  animation-name: snow-fall, snow-sway;
  animation-timing-function: linear, ease-in-out;
  animation-iteration-count: infinite, infinite;
  will-change: transform, margin-left;
}
```

这里的核心是：

- `position: fixed` 让雪花层覆盖整个页面
- `pointer-events: none` 保证它不挡住页面点击
- `radial-gradient` 让雪花不是死白圆点，而是带一点发光质感

### 2. 雪花动画

```css
@keyframes snow-fall {
  from {
    transform: translateY(0);
  }

  to {
    transform: translateY(112vh);
  }
}

@keyframes snow-sway {
  from {
    margin-left: -10px;
  }

  to {
    margin-left: 10px;
  }
}
```

这里我拆成两个动画：

- `snow-fall` 负责纵向下落
- `snow-sway` 负责左右轻微摆动

两套动画一起跑，雪才会更像真的。

### 3. 圣诞帽样式

```css
.christmas-avatar-wrap {
  position: relative;
  display: inline-block;
}

.christmas-avatar-wrap > #avatar {
  display: block;
}

.christmas-hat {
  position: absolute;
  top: -19%;
  left: 53%;
  z-index: 2;
  width: 64%;
  max-width: none;
  transform: translateX(-50%) rotate(-13deg);
  pointer-events: none;
  filter: drop-shadow(0 6px 12px rgba(0, 0, 0, 0.22));
}
```

这部分重点是：

- 给包裹层加 `position: relative`
- 让帽子绝对定位到头像上方
- 稍微旋转一点，视觉上会比正着摆更自然

移动端我还单独加了一段媒体查询，避免帽子比例过大：

```css
@media (max-width: 768px) {
  .christmas-hat {
    top: -16%;
    width: 60%;
  }
}
```

## 第七步：开始做流星雨

流星雨这块我没有用 DOM 元素一个个飞，而是用了 `canvas`。原因很简单：

- DOM 版雪花适合慢速、数量多的小元素
- 流星雨带拖尾、辉光、爆裂火花，用 canvas 更合适

### 1. 先创建全屏 canvas

```js
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
```

这段主要是在进入时间窗口时：

- 创建 canvas
- 绑定 `2d` 上下文
- 初始化尺寸
- 监听窗口缩放
- 启动动画循环

### 2. 处理高分屏和窗口缩放

```js
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
```

这里如果不处理 `devicePixelRatio`，很多屏幕上 canvas 会发糊。

### 3. 画背景星空和发光

为了让流星雨不是“只有几根线在飞”，我还额外画了三层背景：

- 左侧冷色天空辉光
- 右侧紫色天空辉光
- 一个朦胧月亮

对应代码在：

- `drawMeteorSkyGlow()`
- `drawMeteorStars()`
- `buildMeteorStars()`

这几段的目标是先把氛围铺出来，再让流星进入画面，不然会显得很空。

### 4. 随机生成流星

```js
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
```

这里随机了很多参数：

- 从左上还是右上进入
- 飞行角度
- 速度
- 尾巴长度
- 线条粗细
- 发光颜色

这样流星飞出来不会一模一样，更像自然现象。

### 5. 动画主循环

真正让流星持续动起来的是 `runMeteorFrame()`：

```js
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

  meteorState.animationId = requestAnimationFrame(runMeteorFrame)
}
```

这段就是标准的动画循环思路：

1. 清空上一帧
2. 重画天空背景
3. 如果当前在流星雨时段，就按随机间隔继续生成新流星
4. 更新每颗流星的位置和寿命
5. 超出生命周期的流星就移除
6. 再请求下一帧

另外我还单独做了 `addMeteorBurst()` 和 `drawSpark()`，用于流星消失时偶尔炸开一点碎光，这样画面不会太死。

## 第八步：给流星雨补样式

流星雨的 canvas 也要样式支持，所以我在 `source/css/myStyle.css` 里追加了：

```css
.meteor-shower {
  position: fixed;
  inset: 0;
  z-index: 9997;
  display: block;
  width: 100%;
  height: 100%;
  pointer-events: none;
  mix-blend-mode: screen;
  opacity: 0.95;
}
```

这里有两个点值得记一下：

- `pointer-events: none` 保证它不拦点击
- `mix-blend-mode: screen` 会让发光拖尾叠在页面上时更通透

我把流星雨层级设成 `9997`，雪层设成 `9998`，这样雪会压在流星雨上面，视觉层级更自然。

## 第九步：把脚本和样式注入到 Butterfly

前面的 JS 和 CSS 写完之后，还不能自动生效，因为 Butterfly 不知道你新增了这些文件。

所以我改了：

```text
_config.butterfly.yml
```

加入下面这段：

```yml
inject:
  head:
    - <link rel="stylesheet" href="/css/myStyle.css">

  bottom:
    - <script src="/js/christmas-effects.js"></script>
```

这里要注意两件事：

1. `myStyle.css` 是放在 `head` 里
因为样式最好先加载，页面渲染时就能用到。

2. `christmas-effects.js` 是放在 `bottom` 里
因为脚本要操作 DOM，放在页面底部更稳。

如果你的项目之前已经把 `/css/myStyle.css` 注入过了，那就只需要补这行脚本：

```yml
- <script src="/js/christmas-effects.js"></script>
```

## 第十步：处理初始化和 PJAX 切页

Butterfly 常见一个坑：页面可能不是整页刷新，而是 PJAX 局部切换。

如果你只在首次加载时执行一次脚本，切到别的页面后，特效可能就没了。所以我最后又补了初始化逻辑：

```js
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
```

这一段解决了 3 个问题：

1. 首次打开页面时能正常初始化
2. PJAX 切页后能重新挂载效果
3. 流星雨即使页面一直不刷新，也会每 15 秒重新检查一次时间窗口

这也是为什么我把流星雨写成 `syncMeteorShower()`，而不是一上来直接无脑开启动画。

## 第十一步：本地生成和查看效果

文件都写完后，按正常 Hexo 流程生成就行：

```bash
hexo clean
hexo g
hexo s
```

你会看到：

- `source/js/christmas-effects.js` 生成成 `public/js/christmas-effects.js`
- `source/img/christmas-hat.png` 生成成 `public/img/christmas-hat.png`

然后本地打开站点测试下面两个时间条件：

- 每年 12 月 24 日、12 月 25 日：应该出现雪花和圣诞帽
- 每天 23:59 到次日 00:05：应该出现流星雨

如果你不想真的等到那个时间再测，可以临时把 `isChristmas()` 和 `isMeteorWindow()` 里的判断改成始终返回 `true`，先确认效果没问题，再改回去。

## 最后总结一下实现顺序

如果你只想快速复刻，照这个顺序做最省事：

1. 在 `source/js/` 下新建 `christmas-effects.js`
2. 先写 `isChristmas()` 和 `isMeteorWindow()` 两个时间判断函数
3. 写 `createSnow()`，先把下雪跑起来
4. 写 `attachChristmasHat()`，再做头像节日装饰
5. 把帽子图片放到 `source/img/christmas-hat.png`
6. 在 `source/css/myStyle.css` 里补雪花、帽子、流星雨样式
7. 用 canvas 写流星雨的创建、绘制、动画循环和销毁逻辑
8. 在 `_config.butterfly.yml` 里注入 CSS 和 JS
9. 补上 `DOMContentLoaded`、PJAX 和定时同步逻辑
10. 执行 `hexo g` 和 `hexo s` 检查最终效果

## 这套方案适合什么场景

我这套写法比较适合：

- Hexo + Butterfly 博客
- 想做“只在某个日期或某个时间段出现”的节日特效
- 不想额外引第三方特效库，想把逻辑完全控制在自己手里

后面如果你还想继续扩展，也可以沿着同一套思路加：

- 新年烟花
- 生日彩带
- 某个纪念日的限定背景
- 指定日期范围内的特殊主题

本质上都是同一个套路：先判断时间，再创建 DOM 或 canvas，最后配好 CSS 和主题注入。
