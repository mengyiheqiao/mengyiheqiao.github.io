---
title: 开始读
date: 2026-04-12 19:20:00
updated: 2026-04-12 19:20:00
comments: false
aside: false
top_img: false
---

<style>
  .start-page {
    max-width: 980px;
    margin: 0 auto;
    padding: 28px 20px 60px;
  }

  .start-hero {
    margin-bottom: 28px;
    text-align: center;
  }

  .start-kicker {
    margin: 0 0 10px;
    color: var(--font-color-secondary);
    font-size: 0.82rem;
    letter-spacing: 0.28em;
    text-transform: uppercase;
  }

  .start-title {
    margin: 0 0 12px;
    font-size: clamp(2.3rem, 4vw, 3.4rem);
    letter-spacing: 0.04em;
  }

  .start-subtitle {
    max-width: 680px;
    margin: 0 auto;
    color: var(--font-color-secondary);
    font-size: 1rem;
    line-height: 1.9;
  }

  .start-intro {
    margin-bottom: 26px;
    padding: 22px 24px;
    border: 1px solid rgba(73, 177, 245, 0.16);
    border-radius: 22px;
    background:
      linear-gradient(135deg, rgba(255, 255, 255, 0.94), rgba(241, 247, 255, 0.82));
    box-shadow: 0 14px 36px rgba(73, 177, 245, 0.08);
  }

  [data-theme="dark"] .start-intro {
    background:
      linear-gradient(135deg, rgba(24, 31, 42, 0.94), rgba(31, 42, 57, 0.82));
    border-color: rgba(73, 177, 245, 0.2);
    box-shadow: 0 14px 36px rgba(0, 0, 0, 0.2);
  }

  .start-intro p {
    margin: 0;
    line-height: 1.95;
  }

  .start-links {
    display: flex;
    flex-wrap: wrap;
    gap: 12px;
    margin-top: 18px;
  }

  .start-links a {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-width: 120px;
    padding: 11px 18px;
    border-radius: 999px;
    background: rgba(73, 177, 245, 0.12);
    color: var(--font-color);
    text-decoration: none;
    transition: transform 0.24s ease, box-shadow 0.24s ease, background 0.24s ease;
  }

  .start-links a:hover {
    transform: translateY(-2px);
    background: rgba(73, 177, 245, 0.18);
    box-shadow: 0 10px 24px rgba(73, 177, 245, 0.12);
  }

  .start-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: 18px;
  }

  .route-card {
    position: relative;
    overflow: hidden;
    padding: 24px 22px 20px;
    border-radius: 22px;
    border: 1px solid rgba(20, 24, 31, 0.08);
    background: rgba(255, 255, 255, 0.9);
    box-shadow: 0 16px 34px rgba(16, 24, 40, 0.08);
  }

  [data-theme="dark"] .route-card {
    border-color: rgba(255, 255, 255, 0.08);
    background: rgba(24, 31, 42, 0.9);
    box-shadow: 0 16px 34px rgba(0, 0, 0, 0.22);
  }

  .route-card::before {
    content: "";
    position: absolute;
    inset: 0 0 auto;
    height: 4px;
    border-radius: 22px 22px 0 0;
    background: var(--route-accent, #49b1f5);
  }

  .route-card h2 {
    margin: 0 0 8px;
    font-size: 1.18rem;
    letter-spacing: 0.03em;
  }

  .route-lead {
    margin: 0 0 16px;
    color: var(--font-color-secondary);
    line-height: 1.85;
  }

  .route-list {
    display: grid;
    gap: 14px;
  }

  .route-item {
    padding: 14px 14px 12px;
    border-radius: 16px;
    background: rgba(73, 177, 245, 0.06);
  }

  [data-theme="dark"] .route-item {
    background: rgba(255, 255, 255, 0.04);
  }

  .route-item a {
    color: var(--font-color);
    font-weight: 600;
    text-decoration: none;
  }

  .route-item a:hover {
    color: var(--theme-color);
  }

  .route-item p {
    margin: 8px 0 0;
    color: var(--font-color-secondary);
    line-height: 1.8;
    font-size: 0.95rem;
  }

  .route-card[data-tone="life"] {
    --route-accent: #7fb685;
  }

  .route-card[data-tone="thought"] {
    --route-accent: #5b8def;
  }

  .route-card[data-tone="method"] {
    --route-accent: #ec8f5e;
  }

  .route-card[data-tone="game"] {
    --route-accent: #8d6ae1;
  }

  .start-footer {
    margin: 28px 0 0;
    text-align: center;
    color: var(--font-color-secondary);
    line-height: 1.9;
  }
</style>

<div class="start-page">
  <header class="start-hero">
    <p class="start-kicker">First Entry</p>
    <h1 class="start-title">开始读</h1>
    <p class="start-subtitle">
      这个站不是单线主题博客，更像一份持续更新的个人记录系统。第一次来时，不必按时间线硬翻，
      从这里挑一条你最感兴趣的路线就够了。
    </p>
  </header>

  <section class="start-intro">
    <p>
      如果你想先认识人，可以从最早的自我介绍和最近的近况开始；如果你更想看长文思考、实用方法或游戏记录，
      下面已经帮你分好了入口。站内还保留了一页 <a href="/now/">Now</a>，用来记录此刻，而不是完整人生。
    </p>
    <div class="start-links">
      <a href="/about/">先认识我</a>
      <a href="/now/">看此刻状态</a>
      <a href="/archives/">按时间归档看</a>
    </div>
  </section>

  <section class="start-grid">
    <article class="route-card" data-tone="life">
      <h2>生活与近况</h2>
      <p class="route-lead">先看人，再看观点。这一组更接近这个站最原始的气质。</p>
      <div class="route-list">
        <div class="route-item">
          <a href="/2025/11/04/%E5%BE%88%E9%AB%98%E5%85%B4%E8%AE%A4%E8%AF%86%E4%BD%A0jiayu/">很高兴认识你 jiayu</a>
          <p>这个站的起点。适合第一次来时先看，知道这里最初为什么被建起来。</p>
        </div>
        <div class="route-item">
          <a href="/2025/11/25/%E5%9B%9E%E6%9D%A5%E4%BA%86/">回来之有关最近</a>
          <p>一篇很典型的近况文，能直接感受到这个站的“生活流”写法。</p>
        </div>
        <div class="route-item">
          <a href="/2025/12/31/19%E5%B2%81/">19岁</a>
          <p>更接近阶段性回望。看完后会更容易理解这个站为什么会反复写“时间”和“变化”。</p>
        </div>
      </div>
    </article>
    <article class="route-card" data-tone="thought">
      <h2>思考与长文</h2>
      <p class="route-lead">这里更偏分析、抽象和延展，不一定轻，但比较能看出你在意什么。</p>
      <div class="route-list">
        <div class="route-item">
          <a href="/2026/04/09/jung-anima/">从夏娃到索菲亚：深度研究阿尼玛</a>
          <p>目前最适合作为长文代表作的入口，完成度和结构都比较强。</p>
        </div>
        <div class="route-item">
          <a href="/2025/12/24/%E8%BF%91%E4%BB%A3%E5%8F%B2%E5%A4%8D%E4%B9%A0%E5%BC%95%E5%8F%91%E7%9A%84%E8%AE%A4%E7%9F%A5%E7%AD%96%E7%95%A5%E5%8F%8D%E6%80%9D/">近代史复习引发的认知策略反思</a>
          <p>从具体材料出发，走向更抽象的认知框架，是这类文章的典型路径。</p>
        </div>
        <div class="route-item">
          <a href="/2025/11/06/%E6%97%A0%E8%81%8A%20or%E4%B8%8E%E8%99%9A%E6%97%A0%E6%97%A7%E6%83%85%E5%A4%8D%E7%87%83%EF%BC%9F/">无聊 or 与虚无旧情复燃</a>
          <p>更偏情绪与哲学边缘地带，适合想看“念头怎么扩散成文章”的读者。</p>
        </div>
      </div>
    </article>
    <article class="route-card" data-tone="method">
      <h2>方法与工具</h2>
      <p class="route-lead">如果你更想看实用内容，就从这一列开始。这里的文章更偏问题导向。</p>
      <div class="route-list">
        <div class="route-item">
          <a href="/2026/01/10/Gemini%20%E5%88%BB%E6%84%8F%E7%BB%83%E4%B9%A0-%E5%A6%82%E4%BD%95%E6%8F%90%E9%97%AE/">Gemini 刻意练习</a>
          <p>关于提问和练习方式的短文，很适合作为方法类入口。</p>
        </div>
        <div class="route-item">
          <a href="/2025/11/26/%EF%BC%88%E6%80%BB%E7%BB%93%EF%BC%89deepseek%E4%BD%BF%E7%94%A8%E6%96%B9%E6%B3%95/">（总结）deepseek使用方法</a>
          <p>更偏整理和复盘，能看出你是怎么把零散经验压成可复用的方法。</p>
        </div>
        <div class="route-item">
          <a href="/2026/03/18/Hexo%E5%8D%9A%E5%AE%A2%E7%89%B9%E5%AE%9A%E6%97%B6%E9%97%B4%E6%B5%81%E6%98%9F%E9%9B%A8%E5%92%8C%E5%9C%A3%E8%AF%9E%E4%B8%8B%E9%9B%AA%E6%95%99%E7%A8%8B/">Hexo 博客特定时间流星雨和圣诞下雪教程</a>
          <p>偏实操，适合想看你在博客和工具层面的折腾过程。</p>
        </div>
      </div>
    </article>
    <article class="route-card" data-tone="game">
      <h2>游戏与游玩</h2>
      <p class="route-lead">这一列更像你的侧写，游戏在这里不只是娱乐，也常常连到情绪和判断。</p>
      <div class="route-list">
        <div class="route-item">
          <a href="/2025/11/09/%E6%8E%A8%E8%8D%90%E6%B8%B8%E6%88%8F/">真正的男人，只有在了解一切之后才可以落下眼泪</a>
          <p>从标题到内容都很有个人表达，是游戏线里辨识度比较高的一篇。</p>
        </div>
        <div class="route-item">
          <a href="/2026/02/02/%E8%BF%99%E9%87%8C%E5%9F%8B%E8%91%AC%E4%BA%86Jiayu%E6%AF%AB%E6%97%A0%E6%84%8F%E4%B9%89%E7%9A%84%E5%87%A0%E5%8D%81%E4%B8%AA%E5%B0%8F%E6%97%B6%EF%BC%8C%E5%92%8C%E5%8E%9F%E6%9C%AC%E5%8F%AF%E4%BB%A5%E5%BF%AB%E4%B9%90%E7%9A%84%E5%9B%9B%E4%BA%BA%E8%81%94%E6%9C%BA%E6%97%B6%E5%85%89/">这里埋葬了 Jiayu 毫无意义的几十个小时</a>
          <p>更像一次带情绪的记录，能看出游戏、关系和时间损耗是怎样被写到一起的。</p>
        </div>
        <div class="route-item">
          <a href="/2026/01/12/csgo%20%E5%8F%AF%E8%A7%86%E5%8C%96%20demo%20%E8%AE%B0%E5%BD%95/">csgo 可视化 demo 记录</a>
          <p>带一点折腾味，也说明你在“玩”和“研究”之间切换得很自然。</p>
        </div>
      </div>
    </article>
  </section>

  <p class="start-footer">
    如果你只想用一句话概括这个站：这里记录正在发生的生活，也记录它如何被理解。
  </p>
</div>
