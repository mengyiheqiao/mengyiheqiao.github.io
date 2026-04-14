---
title: 关于我
date: 2026-01-01 12:00:00
type: "about"
comments: true
top_img: false # 建议关闭顶部大图，或者换成一张极简的纯色/噪点图
aside: false # 【关键】关闭侧边栏，实现沉浸式居中阅读
---
<style>
  .about-page {
    max-width: 860px;
    margin: 0 auto;
    padding: 36px 20px 56px;
    text-align: center;
  }

  .hero-img-box {
    margin-bottom: 30px;
    position: relative;
    display: inline-block;
  }

  .hero-img {
    width: 100%;
    max-width: 620px;
    border-radius: 18px;
    box-shadow: 0 18px 40px rgba(15, 23, 42, 0.14);
    transition: transform 0.3s ease;
  }

  .hero-img:hover {
    transform: translateY(-5px);
  }

  .status-card {
    margin-bottom: 28px;
    padding: 20px;
    border: 1px solid rgba(73, 177, 245, 0.16);
    border-radius: 18px;
    background:
      linear-gradient(145deg, rgba(255, 255, 255, 0.9), rgba(240, 247, 255, 0.78));
    box-shadow: 0 10px 30px rgba(73, 177, 245, 0.08);
    text-align: left;
    font-family: 'Consolas', 'Monaco', monospace;
    font-size: 0.9rem;
    line-height: 1.8;
    color: var(--font-color-secondary);
  }

  [data-theme="dark"] .status-card {
    background:
      linear-gradient(145deg, rgba(24, 31, 42, 0.92), rgba(33, 44, 58, 0.82));
    border-color: rgba(73, 177, 245, 0.22);
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.22);
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

  .intro-panel {
    margin-bottom: 26px;
    padding: 24px 22px;
    border-radius: 22px;
    background: rgba(255, 255, 255, 0.8);
    box-shadow: 0 14px 32px rgba(15, 23, 42, 0.07);
  }

  [data-theme="dark"] .intro-panel {
    background: rgba(24, 31, 42, 0.82);
    box-shadow: 0 14px 32px rgba(0, 0, 0, 0.2);
  }

  .intro-title {
    margin: 0 0 12px;
    font-size: clamp(2rem, 4vw, 2.8rem);
    letter-spacing: 0.04em;
  }

  .intro-text {
    margin: 0;
    font-family: 'Georgia', 'Songti SC', serif;
    font-size: 1.08rem;
    line-height: 2;
    color: var(--font-color);
  }

  .intro-text + .intro-text {
    margin-top: 10px;
  }

  .about-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
    gap: 16px;
    margin-bottom: 28px;
  }

  .about-card {
    padding: 22px 20px;
    border-radius: 20px;
    text-align: left;
    border: 1px solid rgba(73, 177, 245, 0.14);
    background: rgba(73, 177, 245, 0.06);
  }

  [data-theme="dark"] .about-card {
    background: rgba(255, 255, 255, 0.04);
    border-color: rgba(73, 177, 245, 0.2);
  }

  .about-card h2 {
    margin: 0 0 12px;
    font-size: 1.04rem;
  }

  .about-card p {
    margin: 0;
    line-height: 1.9;
    color: var(--font-color-secondary);
  }

  .about-links {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    gap: 12px;
  }

  .about-links a {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-width: 132px;
    padding: 11px 20px;
    border-radius: 999px;
    background: rgba(73, 177, 245, 0.12);
    color: var(--font-color);
    text-decoration: none;
    transition: transform 0.24s ease, box-shadow 0.24s ease, background 0.24s ease;
  }

  .about-links a:hover {
    transform: translateY(-2px);
    background: rgba(73, 177, 245, 0.18);
    box-shadow: 0 10px 24px rgba(73, 177, 245, 0.12);
  }
</style>

<div class="about-page">
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

  <section class="intro-panel">
    <h1 class="intro-title">你好，我是 jiayu</h1>
    <p class="intro-text">
      这里不是一个只服务于某个单一主题的博客，更像是我给自己留出的长期空间。
      我会在这里记录生活、写下思考、整理方法，也会保留一些更阶段性的近况。
    </p>
    <p class="intro-text">
      如果你只是第一次路过，最适合的打开方式不是从最新一篇开始，
      而是先看我现在处在什么状态，再决定往哪一条线继续读。
    </p>
  </section>

  <section class="about-grid">
    <article class="about-card">
      <h2>这里写什么</h2>
      <p>生活片段、长文思考、方法沉淀、游戏记录，都会留在这里，但它们最终还是指向同一个人。</p>
    </article>
    <article class="about-card">
      <h2>怎么逛更合适</h2>
      <p>想看“此刻”就去 Now，想快速找到代表作就去开始读，想顺着时间线看变化就翻归档。</p>
    </article>
    <article class="about-card">
      <h2>写这个站的原因</h2>
      <p>为了把会消散的东西留下来，也为了让零散的感受、判断和经验慢慢长成自己的结构。</p>
    </article>
  </section>

  <div class="about-links">
    <a href="/start/">从这里开始读</a>
    <a href="/now/">看现在的我</a>
    <a href="/archives/">按时间归档看</a>
  </div>
</div>
