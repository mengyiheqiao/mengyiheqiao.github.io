---
title: 关于我
date: 2026-01-01 12:00:00
type: "about"
comments: true
top_img: false # 建议关闭顶部大图，或者换成一张极简的纯色/噪点图
aside: false # 【关键】关闭侧边栏，实现沉浸式居中阅读
---
<style>
  /* 容器：限制宽度，居中，增加呼吸感 */
  .soul-container {
    max-width: 800px;
    margin: 0 auto;
    padding: 40px 20px;
    text-align: center;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", "Helvetica Neue", Lato, Roboto, "PingFang SC", "Microsoft YaHei", sans-serif;
  }

  /* 第一层：图片 */
  .hero-img-box {
    margin-bottom: 40px;
    position: relative;
    display: inline-block;
  }
  .hero-img {
    width: 100%;
    max-width: 600px; /* 控制图片最大宽度 */
    border-radius: 12px; /* 圆角 */
    box-shadow: 0 10px 30px rgba(0,0,0,0.15); /* 柔和的阴影 */
    transition: transform 0.3s ease;
  }
  .hero-img:hover {
    transform: translateY(-5px); /* 鼠标悬停轻微上浮 */
  }

  /* 第二层：Now 状态栏 (仿终端/玻璃拟态风格) */
  .status-card {
    background: rgba(128, 128, 128, 0.05); /* 极淡的灰色背景 */
    border: 1px solid rgba(128, 128, 128, 0.1);
    border-radius: 8px;
    padding: 20px;
    margin-bottom: 50px;
    text-align: left; /* 内部文字左对齐，像代码终端 */
    font-family: 'Consolas', 'Monaco', monospace; /* 等宽字体，强调极客感 */
    font-size: 0.9rem;
    line-height: 1.8;
    color: #666;
  }
  /* 暗黑模式适配 (Butterfly主题自带的类名通常是[data-theme="dark"]) */
  [data-theme="dark"] .status-card {
    background: rgba(0, 0, 0, 0.2);
    border-color: #333;
    color: #aaa;
  }
  
  .status-item {
    display: flex;
    align-items: center;
    margin-bottom: 8px;
  }
  .status-icon {
    margin-right: 12px;
    width: 20px;
    text-align: center;
  }
  .status-label {
    font-weight: bold;
    margin-right: 8px;
    opacity: 0.8;
  }

  /* 第三层：灵魂独白 */
  .confession-text {
    font-family: 'Georgia', 'Songti SC', serif; /* 衬线体，更具文学感 */
    font-size: 1.1rem;
    line-height: 2;
    color: #444;
    margin-bottom: 40px;
  }
  [data-theme="dark"] .confession-text {
    color: #ccc;
  }
  
  .highlight {
    color: #49b1f5; /* 你的主题色，或者用低饱和度的莫兰迪蓝 */
    font-weight: bold;
  }
</style>

<div class="soul-container">

  <div class="hero-img-box">
    <img class="hero-img" src="/img/1.jpg" alt="精神角落">
  </div>

  <div class="status-card">
    <div class="status-item">
      <span class="status-icon">🎮</span>
      <span class="status-label">Playing:</span>
      <span>Helldivers 2 (Diff 7: Suicide Mission)</span>
    </div>
    <div class="status-item">
      <span class="status-icon">🎵</span>
      <span class="status-label">Listening:</span>
      <span>Vance Joy - Riptide </span>
    </div>
    <div class="status-item">
      <span class="status-icon">🧠</span>
      <span class="status-label">Thinking:</span>
      <span>感性与理性的共存与合作共赢</span>
    </div>
    <div class="status-item">
      <span class="status-icon">📍</span>
      <span class="status-label">Location:</span>
      <span>Earth Online (Server: CN) </span>
    </div>
  </div>

  <div class="confession-text">
    <p>
      你好，我是 <span class="highlight">jiayu</span>。
    </p>
    <p>
      一位永远在路上的普通人
  </div>

  <hr style="border: 0; height: 1px; background-image: linear-gradient(to right, rgba(0, 0, 0, 0), rgba(0, 0, 0, 0.1), rgba(0, 0, 0, 0)); margin: 40px 0;">

</div>