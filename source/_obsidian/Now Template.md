---
title: Now
date: {{date}}
updated: {{date}}
comments: true
aside: false
top_img: false
---

<!--
Now 填写原则
1. 每次只留阶段快照，不写成长日记。
2. 每个卡片控制在 1-2 句，能一眼认出这段时间就够了。
3. 更新后如果想进入“光阴长河”，记得提交 Git。
-->

<div class="now-page">
<div class="now-header">
<h1 class="now-title">Now</h1>
<p class="now-updated">最后更新：{{date:YYYY-MM-DD}}</p>
</div>
<div class="now-intro">
一句给此刻的总注解。比如：最近像是在重新开荒，想把生活和站点都慢慢理顺。
</div>
<div class="now-grid">
<section class="now-card">
<h2>最近状态</h2>
<p>最近的关键词是___、___、___。</p>
</section>
<section class="now-card">
<h2>在玩</h2>
<p>最近在玩___，偶尔也会___。</p>
</section>
<section class="now-card">
<h2>在想</h2>
<p>最近反复在想：___？</p>
</section>
<section class="now-card">
<h2>最近更新</h2>
<p>这段时间做了___，也刚把___补上了。</p>
</section>
</div>
<p class="now-footer">每次修改都会在下面的光阴长河里留下一张便签。</p>
</div>

{% now_river %}
