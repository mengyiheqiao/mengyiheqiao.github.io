---
title: 说说
date: 2025-11-13 14:31:56
updated: 2026-04-15 00:27:27
comments: false
aside: false
top_img: false
---
<style>
  #page {
    background: transparent !important;
    box-shadow: none !important;
    border: 0 !important;
  }

  #page .page-title {
    display: none !important;
  }

  #article-container {
    padding: 0 !important;
    overflow: visible !important;
  }

  .shuo-page {
    position: relative;
    z-index: 1;
    max-width: 880px;
    margin: 0 auto;
    padding: 16px 8px 76px;
  }

  .shuo-page::before {
    content: "";
    position: fixed;
    inset: 0;
    z-index: -2;
    pointer-events: none;
    background:
      radial-gradient(circle at 12% 10%, rgba(255, 220, 231, 0.34), transparent 30%),
      radial-gradient(circle at 84% 14%, rgba(220, 214, 255, 0.24), transparent 24%),
      linear-gradient(180deg, rgba(255, 251, 253, 0.72), rgba(255, 255, 255, 0.08));
  }

  [data-theme="dark"] .shuo-page::before {
    background:
      radial-gradient(circle at 12% 10%, rgba(255, 192, 220, 0.12), transparent 28%),
      radial-gradient(circle at 84% 14%, rgba(170, 166, 255, 0.12), transparent 22%),
      linear-gradient(180deg, rgba(30, 31, 44, 0.44), rgba(16, 17, 24, 0.12));
  }

  .shuo-petals-global {
    position: fixed;
    inset: 0;
    z-index: 0;
    overflow: hidden;
    pointer-events: none;
  }

  .shuo-petal {
    --petal-size: 22px;
    --petal-scale: 1;
    --petal-drift: 24px;
    --petal-duration: 14s;
    --petal-delay: 0s;
    position: absolute;
    top: -12%;
    left: 0;
    width: var(--petal-size);
    height: calc(var(--petal-size) * 0.74);
    border-radius: 72% 100% 72% 100%;
    background: linear-gradient(145deg, rgba(255, 246, 250, 0.98), rgba(247, 171, 199, 0.9));
    box-shadow: 0 4px 14px rgba(244, 165, 194, 0.22);
    opacity: 0;
    transform-origin: center center;
    animation: shuo-petal-fall var(--petal-duration) linear infinite;
    animation-delay: var(--petal-delay);
  }

  .shuo-petal::before {
    content: "";
    position: absolute;
    inset: 16% 18% auto auto;
    width: 34%;
    height: 38%;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.32);
    transform: rotate(-18deg);
  }

  .shuo-petal:nth-child(1) { left: 6%; --petal-size: 18px; --petal-scale: 0.82; --petal-drift: 34px; --petal-duration: 11.8s; --petal-delay: -4.2s; filter: blur(0.4px); }
  .shuo-petal:nth-child(2) { left: 16%; --petal-size: 24px; --petal-scale: 1.06; --petal-drift: -18px; --petal-duration: 15.4s; --petal-delay: -9.1s; }
  .shuo-petal:nth-child(3) { left: 30%; --petal-size: 16px; --petal-scale: 0.74; --petal-drift: 46px; --petal-duration: 10.6s; --petal-delay: -2.2s; filter: blur(0.7px); }
  .shuo-petal:nth-child(4) { left: 44%; --petal-size: 22px; --petal-scale: 0.98; --petal-drift: -24px; --petal-duration: 13.8s; --petal-delay: -6.4s; }
  .shuo-petal:nth-child(5) { left: 58%; --petal-size: 26px; --petal-scale: 1.12; --petal-drift: 38px; --petal-duration: 16.2s; --petal-delay: -12.2s; }
  .shuo-petal:nth-child(6) { left: 72%; --petal-size: 17px; --petal-scale: 0.8; --petal-drift: -34px; --petal-duration: 11.5s; --petal-delay: -3.7s; filter: blur(0.5px); }
  .shuo-petal:nth-child(7) { left: 84%; --petal-size: 21px; --petal-scale: 0.94; --petal-drift: 28px; --petal-duration: 14.6s; --petal-delay: -8.8s; }
  .shuo-petal:nth-child(8) { left: 94%; --petal-size: 16px; --petal-scale: 0.72; --petal-drift: -22px; --petal-duration: 10.9s; --petal-delay: -5.1s; filter: blur(0.8px); }

  @keyframes shuo-petal-fall {
    0% {
      transform: translate3d(0, -8vh, 0) rotate(0deg) scale(var(--petal-scale));
      opacity: 0;
    }

    10% {
      opacity: 0.96;
    }

    56% {
      transform: translate3d(calc(var(--petal-drift) * 0.6), 44vh, 0) rotate(170deg) scale(calc(var(--petal-scale) * 0.98));
      opacity: 0.84;
    }

    100% {
      transform: translate3d(var(--petal-drift), 102vh, 0) rotate(320deg) scale(calc(var(--petal-scale) * 0.92));
      opacity: 0;
    }
  }

  .shuo-board {
    position: relative;
    z-index: 1;
  }

  .shuo-hero {
    position: relative;
    overflow: hidden;
    border-radius: 40px 40px 24px 24px;
    background: #eef3fb;
    box-shadow: 0 24px 54px rgba(112, 97, 132, 0.14);
  }

  [data-theme="dark"] .shuo-hero {
    box-shadow: 0 24px 60px rgba(0, 0, 0, 0.24);
  }

  .shuo-hero::after {
    content: "";
    position: absolute;
    left: 0;
    right: 0;
    bottom: 0;
    height: 146px;
    background: linear-gradient(180deg, rgba(255, 255, 255, 0), rgba(255, 255, 255, 0.94));
  }

  [data-theme="dark"] .shuo-hero::after {
    background: linear-gradient(180deg, rgba(26, 29, 39, 0), rgba(26, 29, 39, 0.96));
  }

  .shuo-hero img {
    display: block;
    width: 100%;
    height: clamp(286px, 39vw, 382px);
    object-fit: cover;
    object-position: center top;
    transform: scale(1.02);
  }

  .shuo-paper {
    position: relative;
    width: min(90%, 740px);
    margin: -92px auto 0;
    padding: 32px 22px 48px;
    border-radius: 30px;
    background:
      linear-gradient(180deg, rgba(255, 255, 255, 0.96), rgba(255, 251, 253, 0.9));
    border: 1px solid rgba(223, 209, 219, 0.9);
    box-shadow: 0 18px 40px rgba(132, 116, 146, 0.12);
  }

  .shuo-paper::before {
    content: "";
    position: absolute;
    left: 46px;
    right: 46px;
    top: 18px;
    height: 1px;
    background: linear-gradient(90deg, transparent, rgba(170, 149, 160, 0.24), transparent);
  }

  [data-theme="dark"] .shuo-paper {
    background:
      linear-gradient(180deg, rgba(31, 34, 46, 0.96), rgba(27, 30, 41, 0.9));
    border-color: rgba(116, 108, 128, 0.62);
    box-shadow: 0 18px 46px rgba(0, 0, 0, 0.22);
  }

  .shuo-note {
    position: relative;
    max-width: 484px;
    min-height: 0;
    margin: 0 auto;
    padding: 30px 28px 38px;
    border-radius: 22px;
    background:
      linear-gradient(180deg, rgba(255, 250, 244, 0.98), rgba(255, 255, 249, 0.94));
    border: 1px solid rgba(235, 218, 204, 0.96);
    box-shadow: 0 14px 28px rgba(178, 155, 135, 0.12);
    transform: translateX(-24px) rotate(-2.4deg);
  }

  [data-theme="dark"] .shuo-note {
    background:
      linear-gradient(180deg, rgba(47, 41, 38, 0.96), rgba(38, 34, 32, 0.92));
    border-color: rgba(123, 112, 103, 0.84);
    box-shadow: 0 14px 30px rgba(0, 0, 0, 0.22);
  }

  .shuo-note::before,
  .shuo-note::after {
    content: "";
    position: absolute;
    top: -14px;
    width: 84px;
    height: 24px;
    border-radius: 8px;
    background: rgba(255, 228, 220, 0.66);
    border: 1px solid rgba(232, 202, 193, 0.6);
    box-shadow: 0 4px 10px rgba(211, 180, 170, 0.18);
  }

  .shuo-note::before {
    left: 26px;
    transform: rotate(-11deg);
  }

  .shuo-note::after {
    right: 28px;
    transform: rotate(10deg);
  }

  [data-theme="dark"] .shuo-note::before,
  [data-theme="dark"] .shuo-note::after {
    background: rgba(136, 113, 108, 0.36);
    border-color: rgba(126, 104, 99, 0.42);
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.16);
  }

  .shuo-note-fold {
    position: absolute;
    top: 0;
    right: 0;
    width: 56px;
    height: 56px;
    border-top-right-radius: 22px;
    background: linear-gradient(135deg, rgba(241, 226, 210, 0.96) 0 50%, rgba(255, 255, 255, 0) 50% 100%);
    clip-path: polygon(100% 0, 0 0, 100% 100%);
    opacity: 0.94;
  }

  [data-theme="dark"] .shuo-note-fold {
    background: linear-gradient(135deg, rgba(88, 76, 71, 0.98) 0 50%, rgba(255, 255, 255, 0) 50% 100%);
  }

  .shuo-note-title {
    margin: 0;
    text-align: center;
    font-family: 'Georgia', 'Songti SC', serif;
    font-size: clamp(2.2rem, 4.8vw, 3.4rem);
    letter-spacing: 0.18em;
    color: #5a485c;
    transform: translateX(0.18em);
  }

  [data-theme="dark"] .shuo-note-title {
    color: #f4e8f1;
  }

  .shuo-note-list {
    position: relative;
    margin-top: 26px;
    display: grid;
    gap: 16px;
  }

  .shuo-note-item {
    position: relative;
    padding: 14px 14px 16px;
    border-radius: 18px;
    border: 1px solid rgba(234, 217, 201, 0.84);
    background: rgba(255, 255, 255, 0.58);
    box-shadow: 0 8px 18px rgba(178, 155, 135, 0.08);
  }

  .shuo-note-item:nth-child(3n + 1) {
    transform: translateX(-10px) rotate(-1.8deg);
  }

  .shuo-note-item:nth-child(3n + 2) {
    transform: translateX(12px) rotate(1.2deg);
  }

  .shuo-note-item:nth-child(3n) {
    transform: translateX(-2px) rotate(-0.7deg);
  }

  [data-theme="dark"] .shuo-note-item {
    border-color: rgba(123, 112, 103, 0.72);
    background: rgba(60, 52, 48, 0.46);
    box-shadow: 0 10px 18px rgba(0, 0, 0, 0.18);
  }

  .shuo-note-copy {
    position: relative;
    min-height: 104px;
    padding: 6px 6px 10px;
    color: #5a4f58;
    font-family: 'Georgia', 'Songti SC', serif;
    font-size: 1rem;
    line-height: 2.05;
  }

  .shuo-note-copy::before {
    content: "";
    position: absolute;
    inset: 0;
    background:
      repeating-linear-gradient(
        180deg,
        transparent 0,
        transparent 2.12rem,
        rgba(154, 130, 143, 0.14) 2.12rem,
        rgba(154, 130, 143, 0.14) 2.18rem
      );
    opacity: 0.75;
    pointer-events: none;
  }

  [data-theme="dark"] .shuo-note-copy {
    color: #eee3eb;
  }

  .shuo-note-copy > * {
    position: relative;
    z-index: 1;
  }

  .shuo-note-copy > :first-child {
    margin-top: 0;
  }

  .shuo-note-copy > :last-child {
    margin-bottom: 0;
  }

  .shuo-note-time {
    position: relative;
    z-index: 1;
    margin: 0 0 10px;
    color: rgba(90, 79, 88, 0.62);
    font-size: 0.82rem;
    letter-spacing: 0.08em;
  }

  [data-theme="dark"] .shuo-note-time {
    color: rgba(238, 227, 235, 0.64);
  }

  .shuo-note-copy p,
  .shuo-note-copy ul,
  .shuo-note-copy ol,
  .shuo-note-copy blockquote,
  .shuo-note-copy pre,
  .shuo-note-copy h2,
  .shuo-note-copy h3 {
    margin: 0 0 14px;
  }

  .shuo-note-copy ul,
  .shuo-note-copy ol {
    padding-left: 1.3rem;
  }

  .shuo-note-copy li + li {
    margin-top: 0.35rem;
  }

  .shuo-note-copy h2,
  .shuo-note-copy h3 {
    font-size: 1rem;
    letter-spacing: 0.06em;
    color: #6a536a;
  }

  [data-theme="dark"] .shuo-note-copy h2,
  [data-theme="dark"] .shuo-note-copy h3 {
    color: #f3dfea;
  }

  .shuo-note-copy blockquote {
    padding-left: 14px;
    border-left: 3px solid rgba(154, 130, 143, 0.28);
    color: rgba(90, 79, 88, 0.86);
  }

  [data-theme="dark"] .shuo-note-copy blockquote {
    color: rgba(238, 227, 235, 0.88);
    border-left-color: rgba(244, 232, 241, 0.22);
  }

  .shuo-note-copy a {
    color: #7d5d86;
    text-decoration: underline;
    text-decoration-color: rgba(125, 93, 134, 0.26);
    text-underline-offset: 3px;
  }

  [data-theme="dark"] .shuo-note-copy a {
    color: #f1dceb;
    text-decoration-color: rgba(241, 220, 235, 0.26);
  }

  .shuo-note-copy strong {
    color: #4d3b52;
  }

  [data-theme="dark"] .shuo-note-copy strong {
    color: #fff3fb;
  }

  .shuo-note-copy code {
    padding: 2px 6px;
    border-radius: 6px;
    background: rgba(125, 93, 134, 0.08);
    font-size: 0.92rem;
  }

  [data-theme="dark"] .shuo-note-copy code {
    background: rgba(255, 255, 255, 0.08);
  }

  .shuo-note-empty {
    margin: 0;
    padding-top: 18px;
    text-align: center;
    color: rgba(90, 79, 88, 0.68);
  }

  [data-theme="dark"] .shuo-note-empty {
    color: rgba(238, 227, 235, 0.68);
  }

  @media (max-width: 768px) {
    .shuo-page {
      padding: 8px 0 60px;
    }

    .shuo-hero {
      border-radius: 30px 30px 20px 20px;
    }

    .shuo-hero img {
      height: 250px;
    }

    .shuo-paper {
      width: calc(100% - 14px);
      margin-top: -58px;
      padding: 28px 12px 34px;
      border-radius: 24px;
    }

    .shuo-note {
      min-height: 230px;
      padding: 26px 16px 28px;
      border-radius: 18px;
      transform: translateX(-6px) rotate(-1.6deg);
    }

    .shuo-note-list {
      gap: 12px;
      margin-top: 22px;
    }

    .shuo-note-item {
      padding: 12px 10px 14px;
      border-radius: 14px;
    }

    .shuo-note-item:nth-child(3n + 1),
    .shuo-note-item:nth-child(3n + 2),
    .shuo-note-item:nth-child(3n) {
      transform: none;
    }

    .shuo-note::before,
    .shuo-note::after {
      width: 62px;
      height: 18px;
      top: -11px;
    }

    .shuo-note::before {
      left: 14px;
    }

    .shuo-note::after {
      right: 14px;
    }

    .shuo-note-fold {
      width: 44px;
      height: 44px;
      border-top-right-radius: 18px;
    }

    .shuo-note-title {
      font-size: clamp(1.9rem, 7vw, 2.7rem);
      letter-spacing: 0.14em;
    }

    .shuo-note-copy {
      min-height: 92px;
      font-size: 0.96rem;
    }
  }
</style>

<div class="shuo-page">
  <div class="shuo-petals-global" aria-hidden="true">
    <span class="shuo-petal"></span>
    <span class="shuo-petal"></span>
    <span class="shuo-petal"></span>
    <span class="shuo-petal"></span>
    <span class="shuo-petal"></span>
    <span class="shuo-petal"></span>
    <span class="shuo-petal"></span>
    <span class="shuo-petal"></span>
  </div>

  <section class="shuo-board">
    <div class="shuo-hero">
      <img src="/img/shuoshuo-girl-header.jpg" alt="樱花氛围的说说页顶部插画">
    </div>
    <div class="shuo-paper">
      <div class="shuo-note">
        <span class="shuo-note-fold" aria-hidden="true"></span>
        <h1 class="shuo-note-title">说说</h1>
        {% shuoshuo_content %}
      </div>
    </div>
  </section>
</div>
