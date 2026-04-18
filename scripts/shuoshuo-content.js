'use strict';

const fs = require('node:fs');
const path = require('node:path');

const SHUOSHUO_FILE_REL = 'source/_obsidian/Shuoshuo.md';

function removeFrontMatter(raw = '') {
  if (!raw.startsWith('---')) {
    return raw;
  }

  const match = raw.match(/^---\r?\n[\s\S]*?\r?\n---\r?\n?/);
  return match ? raw.slice(match[0].length) : raw;
}

function removeLeadingComments(raw = '') {
  return String(raw).replace(/^\s*<!--[\s\S]*?-->\s*/, '');
}

function splitEntries(markdown = '') {
  return String(markdown)
    .replace(/\r\n/g, '\n')
    .split(/\n-{3,}\n/g)
    .map(section => section.trim())
    .filter(Boolean);
}

function parseEntry(rawEntry = '') {
  const lines = String(rawEntry).replace(/\r\n/g, '\n').split('\n');
  let time = '';

  while (lines.length && !lines[0].trim()) {
    lines.shift();
  }

  if (lines.length) {
    const firstLine = lines[0].trim();
    const timeMatch = firstLine.match(/^时间\s*[：:]\s*(.+)$/);
    if (timeMatch) {
      time = timeMatch[1].trim();
      lines.shift();

      while (lines.length && !lines[0].trim()) {
        lines.shift();
      }
    }
  }

  return {
    time,
    markdown: lines.join('\n').trim()
  };
}

function renderEmptyState(message) {
  return `
    <div class="shuo-note-list">
      <article class="shuo-note-item">
        <div class="shuo-note-copy">
          <p class="shuo-note-empty">${message}</p>
        </div>
      </article>
    </div>
  `;
}

function renderEntry(entry, filePath) {
  const rendered = hexo.render.renderSync({
    text: entry.markdown,
    path: filePath
  });

  const timeHtml = entry.time ? `<p class="shuo-note-time">${entry.time}</p>` : '';

  return `
    <article class="shuo-note-item">
      <div class="shuo-note-copy">
        ${timeHtml}
        ${rendered}
      </div>
    </article>
  `;
}

hexo.extend.tag.register('shuoshuo_content', function registerShuoshuoContentTag() {
  const filePath = path.join(hexo.base_dir, SHUOSHUO_FILE_REL);

  if (!fs.existsSync(filePath)) {
    return renderEmptyState('还没有找到说说正文文件。');
  }

  try {
    const raw = fs.readFileSync(filePath, 'utf8').replace(/^\uFEFF/, '');
    const markdown = removeLeadingComments(removeFrontMatter(raw)).trim();
    const entries = splitEntries(markdown)
      .map(parseEntry)
      .filter(entry => entry.markdown);

    if (!entries.length) {
      return renderEmptyState('这里暂时还是空白的。');
    }

    return `
      <div class="shuo-note-list">
        ${entries.map(entry => renderEntry(entry, filePath)).join('')}
      </div>
    `;
  } catch (error) {
    hexo.log.warn(`[shuoshuo-content] Failed to render ${SHUOSHUO_FILE_REL}: ${error.message}`);
    return renderEmptyState('说说内容渲染失败，请检查 Markdown 写法。');
  }
});
