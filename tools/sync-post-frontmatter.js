'use strict';

const fs = require('node:fs');
const path = require('node:path');

const POSTS_DIR = path.join(__dirname, '..', 'source', '_posts');
const CATEGORY_ALIASES = new Map([
  ['心理学', '思考'],
  ['碎片思考', '思考']
]);

const CATEGORY_RULES = [
  {
    name: '思考',
    tags: new Set(['心理学', '哲学', '思考', '荣格', '阿尼玛', '诗歌'])
  },
  {
    name: '方法',
    tags: new Set(['AI', '方法', '规则', 'Hexo', 'Butterfly', '教程', '博客', '前端特效'])
  },
  {
    name: '游戏',
    tags: new Set(['游戏', '游玩'])
  },
  {
    name: '生活',
    tags: new Set(['生活', '校园', '吐槽', '情绪', '开始', '知乎', '回忆存档', '朝花夕拾', '乱七八糟', '崩溃', '攻击'])
  }
];

const CATEGORY_PRIORITY = ['思考', '方法', '游戏', '生活'];

function splitFrontMatter(raw) {
  const match = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/);
  if (!match) {
    return null;
  }

  return {
    frontMatter: match[1],
    body: match[2]
  };
}

function stripOuterQuotes(value) {
  const trimmed = String(value || '').trim();
  if (!trimmed) {
    return '';
  }

  if (trimmed.startsWith('"') && trimmed.endsWith('"')) {
    try {
      return JSON.parse(trimmed).trim();
    } catch (error) {
      return trimmed.slice(1, -1).trim();
    }
  }

  if (trimmed.startsWith('\'') && trimmed.endsWith('\'')) {
    return trimmed.slice(1, -1).replace(/''/g, '\'').trim();
  }

  return trimmed;
}

function parseListValue(value) {
  const trimmed = stripOuterQuotes(value);
  if (!trimmed || trimmed === '[]') {
    return [];
  }

  const inlineListMatch = trimmed.match(/^\[(.*)\]$/);
  if (inlineListMatch) {
    return inlineListMatch[1]
      .split(/[,，]/)
      .map(item => stripOuterQuotes(item))
      .filter(Boolean);
  }

  return [trimmed];
}

function parseFrontMatter(frontMatter) {
  const meta = {
    title: '',
    date: '',
    categories: [],
    tags: [],
    description: ''
  };

  let currentKey = '';

  for (const line of frontMatter.split(/\r?\n/)) {
    const keyMatch = line.match(/^([A-Za-z_]+):\s*(.*)$/);
    if (keyMatch) {
      const [, key, value] = keyMatch;
      currentKey = key;

      if (key === 'title' || key === 'date' || key === 'description') {
        meta[key] = stripOuterQuotes(value);
      } else if (key === 'tags' || key === 'categories') {
        meta[key] = parseListValue(value);
      }

      continue;
    }

    const listMatch = line.match(/^\s*-\s*(.+)$/);
    if (listMatch && (currentKey === 'tags' || currentKey === 'categories')) {
      meta[currentKey].push(...parseListValue(listMatch[1]));
      continue;
    }

    currentKey = '';
  }

  meta.tags = meta.tags.filter(Boolean);
  meta.categories = meta.categories.filter(Boolean);
  return meta;
}

function escapeYamlString(value) {
  return JSON.stringify(String(value || ''));
}

function collapseWhitespace(value) {
  return String(value || '').replace(/\s+/g, ' ').trim();
}

function stripMarkdown(value) {
  return collapseWhitespace(
    String(value || '')
      .replace(/```[\s\S]*?```/g, ' ')
      .replace(/\{%[\s\S]*?%\}/g, ' ')
      .replace(/<style[\s\S]*?<\/style>/gi, ' ')
      .replace(/<script[\s\S]*?<\/script>/gi, ' ')
      .replace(/!\[[^\]]*]\([^)]+\)/g, ' ')
      .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
      .replace(/<[^>]+>/g, ' ')
      .replace(/^\s{0,3}#{1,6}\s*/gm, '')
      .replace(/^\s*[-*+]\s+/gm, '')
      .replace(/^\s*\d+[.:：)]\s*/gm, '')
      .replace(/[`>*_~]/g, ' ')
      .replace(/\r?\n+/g, ' ')
  );
}

function truncate(value, maxLength) {
  if (value.length <= maxLength) {
    return value;
  }

  return `${value.slice(0, maxLength - 1).trimEnd()}…`;
}

function normalizeCategory(category) {
  const normalized = stripOuterQuotes(category);
  return CATEGORY_ALIASES.get(normalized) || normalized;
}

function pickCategory(meta) {
  if (meta.categories.length > 0) {
    return normalizeCategory(meta.categories[0]) || '生活';
  }

  const scores = new Map(CATEGORY_RULES.map(rule => [rule.name, 0]));
  for (const tag of meta.tags) {
    for (const rule of CATEGORY_RULES) {
      if (rule.tags.has(tag)) {
        scores.set(rule.name, scores.get(rule.name) + 1);
      }
    }
  }

  const maxScore = Math.max(...scores.values());
  if (maxScore <= 0) {
    return '生活';
  }

  for (const category of CATEGORY_PRIORITY) {
    if (scores.get(category) === maxScore) {
      return category;
    }
  }

  return '生活';
}

function buildDescription(body, title) {
  const plainText = stripMarkdown(body);
  if (!plainText) {
    return title || '';
  }

  return truncate(plainText, 96);
}

function renderFrontMatter(meta, description, lineEnding) {
  const lines = [
    '---',
    `title: ${meta.title}`,
    `date: ${meta.date}`,
    'categories:',
    `  - ${pickCategory(meta)}`,
    meta.tags.length > 0 ? 'tags:' : 'tags: []'
  ];

  if (meta.tags.length > 0) {
    for (const tag of meta.tags) {
      lines.push(`  - ${tag}`);
    }
  }

  lines.push(`description: ${escapeYamlString(description)}`);
  lines.push('---');
  return lines.join(lineEnding);
}

function updatePost(filePath) {
  const raw = fs.readFileSync(filePath, 'utf8').replace(/^\uFEFF/, '');
  const parts = splitFrontMatter(raw);
  if (!parts) {
    return false;
  }

  const lineEnding = raw.includes('\r\n') ? '\r\n' : '\n';
  const meta = parseFrontMatter(parts.frontMatter);
  const description = meta.description || buildDescription(parts.body, meta.title);
  const body = parts.body.replace(/^\r?\n/, '');
  const nextRaw = `${renderFrontMatter(meta, description, lineEnding)}${lineEnding}${body}`;

  if (nextRaw === raw) {
    return false;
  }

  fs.writeFileSync(filePath, nextRaw, 'utf8');
  return true;
}

function main() {
  const changed = [];
  for (const entry of fs.readdirSync(POSTS_DIR, { withFileTypes: true })) {
    if (!entry.isFile() || !entry.name.endsWith('.md')) {
      continue;
    }

    const filePath = path.join(POSTS_DIR, entry.name);
    if (updatePost(filePath)) {
      changed.push(entry.name);
    }
  }

  if (changed.length === 0) {
    console.log('No post front matter changes were needed.');
    return;
  }

  console.log(`Updated ${changed.length} posts:`);
  for (const name of changed) {
    console.log(`- ${name}`);
  }
}

main();
