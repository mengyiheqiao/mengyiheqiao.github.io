---
title: Now
date: 2026-03-19 17:20:00
updated: 2026-03-19 17:20:00
comments: true
aside: false
top_img: false
---

<style>
  .now-page {
    max-width: 860px;
    margin: 0 auto;
    padding: 24px 20px 56px;
  }

  .now-header {
    margin-bottom: 28px;
    text-align: center;
  }

  .now-title {
    margin: 0 0 10px;
    font-size: clamp(2rem, 4vw, 3rem);
    letter-spacing: 0.08em;
  }

  .now-updated {
    margin: 0;
    color: var(--font-color-secondary);
    font-size: 0.95rem;
  }

  .now-intro {
    margin: 0 0 28px;
    padding: 18px 20px;
    border-left: 3px solid var(--theme-color);
    border-radius: 14px;
    background: rgba(73, 177, 245, 0.08);
    line-height: 1.9;
    color: var(--font-color);
  }

  [data-theme="dark"] .now-intro {
    background: rgba(73, 177, 245, 0.14);
  }

  .now-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
    gap: 18px;
  }

  .now-card {
    padding: 22px 20px;
    border: 1px solid rgba(73, 177, 245, 0.14);
    border-radius: 18px;
    background:
      linear-gradient(145deg, rgba(255, 255, 255, 0.9), rgba(240, 247, 255, 0.78));
    box-shadow: 0 10px 30px rgba(73, 177, 245, 0.08);
    backdrop-filter: blur(8px);
  }

  [data-theme="dark"] .now-card {
    background:
      linear-gradient(145deg, rgba(24, 31, 42, 0.92), rgba(33, 44, 58, 0.82));
    border-color: rgba(73, 177, 245, 0.2);
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.22);
  }

  .now-card h2 {
    margin: 0 0 12px;
    font-size: 1.08rem;
    letter-spacing: 0.04em;
  }

  .now-card p {
    margin: 0;
    line-height: 1.9;
  }

  .now-footer {
    margin-top: 26px;
    color: var(--font-color-secondary);
    text-align: center;
    font-size: 0.95rem;
  }
</style>

<div class="now-page">
<div class="now-header">
<h1 class="now-title">Now</h1>
<p class="now-updated">最后更新：2026-03-19</p>
</div>
<div class="now-intro">
这里不写完整的人生简历，只记录我此刻真正靠近的东西。比起“我是谁”，我更想留住“我最近正在成为什么样的人”。
</div>
<div class="now-grid">
<section class="now-card">
<h2>最近状态</h2>
<p>最近的关键词是开荒、规律、修站，还有一点想把自己重新找回来的念头。</p>
</section>
<section class="now-card">
<h2>在玩</h2>
<p>杀戮尖塔 2 开荒中。现在最想做的不是偶尔赢一次，而是摸清它的规律，然后稳定地一直赢。</p>
</section>
<section class="now-card">
<h2>在想</h2>
<p>该如何才能回到一种更纯真的状态。不是变幼稚，而是重新拥有那种直接、清澈、不别扭的感受力。</p>
</section>
<section class="now-card">
<h2>最近更新</h2>
<p>大规模清理了 blog 残留 bug，也新加了几个彩蛋。站点终于更像一个在被认真维护的地方。</p>
</section>
</div>
<p class="now-footer">以后这页会直接在 Obsidian 里继续改。</p>
</div>