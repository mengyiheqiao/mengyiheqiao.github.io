---
title: Now
date: 2026-03-19 17:20:00
updated: 2026-04-12 00:00:00
comments: true
aside: false
top_img: false
---

<!--
Now 填写提示
1. 状态明显变化时再改，不用每天更新。
2. 每个卡片写 1-2 句，像便签，不像日记。
3. 更新时记得同时改上面的 updated 和下面的“最后更新”日期。
4. 想让这次状态永久进入光阴长河，改完后记得提交 Git。
-->
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
<p class="now-updated">最后更新：2026-04-12</p>
</div>
<div class="now-intro">
这一页只记录此刻，不追求完整，只给未来的自己留一张短笺。
</div>
<div class="now-grid">
<section class="now-card">
<h2>最近状态</h2>
<p>睡觉，修站，</p>
</section>
<section class="now-card">
<h2>在玩</h2>
<p>素晴日，codex</p>
</section>
<section class="now-card">
<h2>在想</h2>
<p>该如何快速掌握并运用规律呢</p>
</section>
<section class="now-card">
<h2>最近更新</h2>
<p>加入了光阴长河</p>
</section>
</div>
<p class="now-footer">每次修改都会在下面的光阴长河里留下一张便签。</p>
</div>

{% now_river %}


