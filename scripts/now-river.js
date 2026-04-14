'use strict';

const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');
const { execFileSync } = require('node:child_process');

const NOW_FILE_REL = 'source/now/index.md';
const BACKFILL_FILE_REL = 'source/_data/now-river.json';
const DEFAULT_LIMIT = 24;
const NOTE_LIMIT = 4;

function hash(input) {
  return crypto.createHash('sha1').update(input).digest('hex');
}

function escapeHtml(input = '') {
  return String(input)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function collapseWhitespace(input = '') {
  return String(input).replace(/\r\n/g, '\n').replace(/\s+/g, ' ').trim();
}

function decodeHtmlEntities(input = '') {
  return String(input)
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, '\'');
}

function stripHtml(input = '') {
  return collapseWhitespace(
    decodeHtmlEntities(
      String(input)
        .replace(/<style[\s\S]*?<\/style>/gi, ' ')
        .replace(/<script[\s\S]*?<\/script>/gi, ' ')
        .replace(/<br\s*\/?>/gi, '\n')
        .replace(/<\/p>/gi, '\n')
        .replace(/<\/div>/gi, '\n')
        .replace(/<\/section>/gi, '\n')
        .replace(/<[^>]+>/g, ' ')
        .replace(/\{%\s*now_river[^%]*%\}/gi, ' ')
    )
  );
}

function truncateText(input = '', maxLength = 140) {
  const text = collapseWhitespace(input);
  if (text.length <= maxLength) {
    return text;
  }

  return `${text.slice(0, maxLength - 1).trimEnd()}…`;
}

function removeFrontMatter(raw = '') {
  if (!raw.startsWith('---')) {
    return raw;
  }

  const match = raw.match(/^---\r?\n[\s\S]*?\r?\n---\r?\n?/);
  return match ? raw.slice(match[0].length) : raw;
}

function extractUpdatedLabel(body = '') {
  const match = body.match(/最后更新[:：]\s*([^<\n]+)/);
  return match ? collapseWhitespace(stripHtml(match[1])) : '';
}

function extractIntro(body = '') {
  const match = body.match(/<div class="now-intro">([\s\S]*?)<\/div>/i);
  return match ? truncateText(stripHtml(match[1]), 150) : '';
}

function extractCards(body = '') {
  const cards = [];
  const sectionPattern = /<section class="now-card">([\s\S]*?)<\/section>/gi;
  let sectionMatch = sectionPattern.exec(body);

  while (sectionMatch) {
    const section = sectionMatch[1];
    const titleMatch = section.match(/<h2[^>]*>([\s\S]*?)<\/h2>/i);
    const contentMatch = section.match(/<p[^>]*>([\s\S]*?)<\/p>/i);
    const title = collapseWhitespace(stripHtml(titleMatch ? titleMatch[1] : ''));
    const content = truncateText(stripHtml(contentMatch ? contentMatch[1] : ''), 120);

    if (title || content) {
      cards.push({
        title: title || '片段',
        content
      });
    }

    sectionMatch = sectionPattern.exec(body);
  }

  return cards;
}

function normalizeNotes(notes) {
  if (!Array.isArray(notes)) {
    return [];
  }

  return notes
    .map(note => {
      if (!note || typeof note !== 'object') {
        return null;
      }

      const title = collapseWhitespace(note.title || '');
      const content = truncateText(note.content || '', 120);

      if (!title && !content) {
        return null;
      }

      return {
        title: title || '片段',
        content
      };
    })
    .filter(Boolean)
    .slice(0, NOTE_LIMIT);
}

function buildSnapshot(rawContent, fallbackDate, options = {}) {
  const body = removeFrontMatter(rawContent || '');
  const normalizedNotes = normalizeNotes(options.notes);
  const notes = normalizedNotes.length ? normalizedNotes : extractCards(body);
  const summary = truncateText(
    options.summary || extractIntro(body) || (notes[0] ? notes[0].content : stripHtml(body)),
    150
  );
  const date = collapseWhitespace(options.date || extractUpdatedLabel(body) || fallbackDate || '');
  const label = collapseWhitespace(options.label || '');
  const badge = collapseWhitespace(options.badge || '');
  const plainBody = collapseWhitespace(stripHtml(body));

  return {
    date,
    sortDate: date,
    label,
    badge,
    summary,
    notes: notes.slice(0, NOTE_LIMIT),
    signature: hash(options.signatureSeed || `${date}::${plainBody}`),
    kind: options.kind || 'git'
  };
}

function loadBackfill(hexo) {
  const backfillPath = path.join(hexo.base_dir, BACKFILL_FILE_REL);

  if (!fs.existsSync(backfillPath)) {
    return [];
  }

  try {
    const raw = fs.readFileSync(backfillPath, 'utf8').replace(/^\uFEFF/, '');
    const parsed = JSON.parse(raw);

    if (!Array.isArray(parsed)) {
      hexo.log.warn('[now-river] source/_data/now-river.json must export an array.');
      return [];
    }

    return parsed
      .map(entry => {
        if (!entry || typeof entry !== 'object') {
          return null;
        }

        const date = collapseWhitespace(entry.date || '');
        const summary = truncateText(entry.summary || entry.excerpt || '', 150);
        const notes = normalizeNotes(entry.notes);
        const label = collapseWhitespace(entry.label || entry.title || '');

        if (!date || (!summary && notes.length === 0 && !label)) {
          return null;
        }

        return {
          date,
          sortDate: date,
          label,
          badge: '补档',
          summary,
          notes,
          signature: hash(JSON.stringify(entry)),
          kind: 'manual'
        };
      })
      .filter(Boolean);
  } catch (error) {
    hexo.log.warn(`[now-river] Failed to parse ${BACKFILL_FILE_REL}: ${error.message}`);
    return [];
  }
}

function runGit(hexo, args) {
  try {
    return execFileSync('git', args, {
      cwd: hexo.base_dir,
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore']
    }).trim();
  } catch (error) {
    return '';
  }
}

function loadGitSnapshots(hexo) {
  const logOutput = runGit(hexo, [
    'log',
    '--follow',
    '--date=short',
    '--pretty=format:%H|%ad|%s',
    '--',
    NOW_FILE_REL
  ]);

  if (!logOutput) {
    return [];
  }

  return logOutput
    .split(/\r?\n/)
    .map(line => {
      const firstSep = line.indexOf('|');
      const secondSep = line.indexOf('|', firstSep + 1);

      if (firstSep === -1 || secondSep === -1) {
        return null;
      }

      const commit = line.slice(0, firstSep);
      const date = line.slice(firstSep + 1, secondSep);
      const raw = runGit(hexo, ['show', `${commit}:${NOW_FILE_REL}`]);

      if (!raw) {
        return null;
      }

      return buildSnapshot(raw, date, {
        date,
        badge: '归档',
        kind: 'git',
        signatureSeed: raw
      });
    })
    .filter(Boolean);
}

function loadCurrentSnapshot(hexo) {
  const nowFile = path.join(hexo.base_dir, NOW_FILE_REL);

  if (!fs.existsSync(nowFile)) {
    return null;
  }

  const raw = fs.readFileSync(nowFile, 'utf8');
  const modifiedDate = fs.statSync(nowFile).mtime.toISOString().slice(0, 10);

  return buildSnapshot(raw, modifiedDate, {
    date: modifiedDate,
    label: '此刻',
    badge: '当前',
    kind: 'current',
    signatureSeed: raw
  });
}

function sortByDateDesc(left, right) {
  return String(right.sortDate || '').localeCompare(String(left.sortDate || ''));
}

function renderFragments(notes) {
  if (!notes.length) {
    return '';
  }

  return `
    <div class="now-river-fragments">
      ${notes
        .map(note => {
          const title = escapeHtml(note.title || '片段');
          const content = escapeHtml(note.content || '');
          return `
            <section class="now-river-fragment">
              <h3>${title}</h3>
              <p>${content}</p>
            </section>
          `;
        })
        .join('')}
    </div>
  `;
}

function renderEntry(entry) {
  const label = entry.label ? `<p class="now-river-label">${escapeHtml(entry.label)}</p>` : '';
  const summary = entry.summary
    ? `<p class="now-river-summary">${escapeHtml(entry.summary)}</p>`
    : '<p class="now-river-summary">这一段还没有写下文字，只留下了一个坐标。</p>';

  return `
    <article class="now-river-item now-river-item--${escapeHtml(entry.kind)}">
      <div class="now-river-note">
        <div class="now-river-meta">
          <p class="now-river-date">${escapeHtml(entry.date || '未标注')}</p>
          <span class="now-river-badge">${escapeHtml(entry.badge || '片段')}</span>
        </div>
        ${label}
        ${summary}
        ${renderFragments(entry.notes || [])}
      </div>
    </article>
  `;
}

function renderEmptyState() {
  return `
    <article class="now-river-empty">
      <p>这条河才刚开始流动。以后每次改动 now 页面并提交，都会在这里多一枚便签。</p>
    </article>
  `;
}

function renderTimeline(entries) {
  return `
    <style>
      .now-river {
        --river-line: linear-gradient(180deg, rgba(73, 177, 245, 0.16), rgba(88, 199, 180, 0.36), rgba(247, 181, 92, 0.26));
        --river-note: linear-gradient(160deg, rgba(255, 249, 229, 0.98), rgba(255, 239, 205, 0.94));
        --river-note-alt: linear-gradient(160deg, rgba(237, 248, 255, 0.98), rgba(220, 238, 255, 0.92));
        margin: 68px auto 8px;
        padding-top: 18px;
      }

      .now-river-head {
        margin-bottom: 28px;
        text-align: center;
      }

      .now-river-eyebrow {
        display: inline-flex;
        align-items: center;
        gap: 0.5rem;
        padding: 6px 12px;
        border-radius: 999px;
        background: rgba(73, 177, 245, 0.1);
        color: var(--font-color-secondary);
        font-size: 0.78rem;
        letter-spacing: 0.18em;
      }

      .now-river-head h2 {
        margin: 14px 0 10px;
        font-size: clamp(1.9rem, 4vw, 2.8rem);
        letter-spacing: 0.08em;
      }

      .now-river-head p {
        max-width: 640px;
        margin: 0 auto;
        color: var(--font-color-secondary);
        line-height: 1.9;
      }

      .now-river-track {
        position: relative;
        display: flex;
        flex-direction: column;
        gap: 22px;
        padding-left: 34px;
      }

      .now-river-track::before {
        content: '';
        position: absolute;
        left: 10px;
        top: 0;
        bottom: 0;
        width: 3px;
        border-radius: 999px;
        background: var(--river-line);
      }

      .now-river-item {
        position: relative;
      }

      .now-river-item::before {
        content: '';
        position: absolute;
        left: -29px;
        top: 24px;
        width: 13px;
        height: 13px;
        border-radius: 50%;
        background: var(--theme-color);
        box-shadow: 0 0 0 6px rgba(73, 177, 245, 0.12);
      }

      .now-river-note {
        position: relative;
        padding: 18px 18px 16px;
        border-radius: 20px 20px 20px 10px;
        border: 1px solid rgba(215, 177, 92, 0.42);
        background: var(--river-note);
        box-shadow: 0 18px 40px rgba(25, 41, 72, 0.08);
      }

      .now-river-item:nth-child(even) .now-river-note {
        background: var(--river-note-alt);
        border-color: rgba(73, 177, 245, 0.24);
      }

      .now-river-note::after {
        content: '';
        position: absolute;
        top: -9px;
        right: 18px;
        width: 54px;
        height: 18px;
        border-radius: 999px;
        background: rgba(255, 255, 255, 0.52);
        transform: rotate(-6deg);
      }

      .now-river-item:nth-child(3n) .now-river-note {
        transform: rotate(-0.7deg);
      }

      .now-river-item:nth-child(3n + 1) .now-river-note {
        transform: rotate(0.55deg);
      }

      .now-river-meta {
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        gap: 10px;
        margin-bottom: 12px;
      }

      .now-river-date {
        margin: 0;
        font-size: 0.88rem;
        font-weight: 700;
        letter-spacing: 0.06em;
        color: #6e5327;
      }

      .now-river-badge {
        display: inline-flex;
        align-items: center;
        padding: 4px 10px;
        border-radius: 999px;
        background: rgba(109, 83, 39, 0.1);
        color: #785f32;
        font-size: 0.76rem;
        letter-spacing: 0.08em;
      }

      .now-river-label {
        margin: 0 0 8px;
        color: var(--font-color-secondary);
        font-size: 0.82rem;
        letter-spacing: 0.18em;
        text-transform: uppercase;
      }

      .now-river-summary {
        margin: 0;
        color: var(--font-color);
        line-height: 1.95;
      }

      .now-river-fragments {
        display: grid;
        gap: 10px;
        margin-top: 14px;
      }

      .now-river-fragment {
        padding: 10px 12px;
        border-radius: 14px;
        border: 1px dashed rgba(109, 83, 39, 0.18);
        background: rgba(255, 255, 255, 0.46);
      }

      .now-river-fragment h3 {
        margin: 0 0 6px;
        font-size: 0.9rem;
        letter-spacing: 0.03em;
      }

      .now-river-fragment p {
        margin: 0;
        color: var(--font-color-secondary);
        line-height: 1.8;
      }

      .now-river-empty {
        padding: 18px 20px;
        border-radius: 16px;
        border: 1px dashed rgba(73, 177, 245, 0.3);
        background: rgba(73, 177, 245, 0.06);
        color: var(--font-color-secondary);
        line-height: 1.9;
      }

      .now-river-empty p {
        margin: 0;
      }

      @media (min-width: 920px) {
        .now-river-track {
          padding-left: 0;
        }

        .now-river-track::before {
          left: 50%;
          margin-left: -1.5px;
        }

        .now-river-item {
          width: calc(50% - 30px);
        }

        .now-river-item:nth-child(odd) {
          margin-right: auto;
        }

        .now-river-item:nth-child(even) {
          margin-left: auto;
        }

        .now-river-item::before {
          left: auto;
          right: -37px;
        }

        .now-river-item:nth-child(even)::before {
          left: -37px;
          right: auto;
        }
      }

      [data-theme="dark"] .now-river {
        --river-note: linear-gradient(160deg, rgba(72, 61, 37, 0.94), rgba(56, 47, 29, 0.94));
        --river-note-alt: linear-gradient(160deg, rgba(32, 46, 66, 0.96), rgba(25, 36, 52, 0.92));
      }

      [data-theme="dark"] .now-river-eyebrow {
        background: rgba(73, 177, 245, 0.16);
      }

      [data-theme="dark"] .now-river-note {
        border-color: rgba(255, 219, 131, 0.12);
        box-shadow: 0 18px 36px rgba(0, 0, 0, 0.22);
      }

      [data-theme="dark"] .now-river-note::after {
        background: rgba(255, 255, 255, 0.08);
      }

      [data-theme="dark"] .now-river-date,
      [data-theme="dark"] .now-river-badge {
        color: rgba(255, 236, 194, 0.92);
      }

      [data-theme="dark"] .now-river-badge {
        background: rgba(255, 236, 194, 0.08);
      }

      [data-theme="dark"] .now-river-fragment {
        background: rgba(255, 255, 255, 0.03);
        border-color: rgba(255, 255, 255, 0.08);
      }
    </style>
    <section class="now-river">
      <div class="now-river-head">
        <span class="now-river-eyebrow">LONG NOW</span>
        <h2>光阴长河</h2>
        <p>这里会把每次写下的 now 留成一张便签，沿着同一条时间线往后延伸。以后你每次改完并提交，这条河就会自己长出新的节点。</p>
      </div>
      <div class="now-river-track">
        ${entries.length ? entries.map(renderEntry).join('') : renderEmptyState()}
      </div>
    </section>
  `;
}

hexo.extend.tag.register('now_river', function registerNowRiverTag(args = []) {
  const requestedLimit = Number.parseInt(args[0], 10);
  const limit = Number.isFinite(requestedLimit) && requestedLimit > 0 ? requestedLimit : DEFAULT_LIMIT;
  const currentSnapshot = loadCurrentSnapshot(hexo);
  const historicalSnapshots = loadGitSnapshots(hexo).sort(sortByDateDesc);
  const manualSnapshots = loadBackfill(hexo).sort(sortByDateDesc);
  const entries = [];
  const seen = new Set();

  [currentSnapshot, ...manualSnapshots, ...historicalSnapshots].forEach(entry => {
    if (!entry || seen.has(entry.signature)) {
      return;
    }

    seen.add(entry.signature);
    entries.push(entry);
  });

  return renderTimeline(entries.slice(0, limit));
});



