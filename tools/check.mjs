/**
 * 模板自检：JSON、内部链接、页面外壳、敏感信息残留。
 *   npm run check
 */
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const errors = [];
const warnings = [];

function walk(dir, files = []) {
  for (const name of fs.readdirSync(dir)) {
    if (['node_modules', '.git', '__pycache__', 'venv', '.venv', 'chroma_db'].includes(name)) continue;
    const full = path.join(dir, name);
    const stat = fs.statSync(full);
    if (stat.isDirectory()) walk(full, files);
    else files.push(full);
  }
  return files;
}

function rel(file) {
  return path.relative(root, file).replace(/\\/g, '/');
}

const files = walk(root);
const htmlFiles = files.filter((f) => f.endsWith('.html'));
const jsonFiles = files.filter((f) => f.endsWith('.json'));

// 1. JSON
for (const file of jsonFiles) {
  try {
    JSON.parse(fs.readFileSync(file, 'utf8'));
  } catch (error) {
    errors.push('JSON 解析失败: ' + rel(file) + ' -> ' + error.message);
  }
}

// 2. config
const configFile = path.join(root, 'assets/js/config.js');
if (!fs.existsSync(configFile)) {
  errors.push('缺少 assets/js/config.js');
} else {
  const sandbox = { window: {} };
  try {
    vm.runInNewContext(fs.readFileSync(configFile, 'utf8'), sandbox, { filename: configFile });
    const cfg = sandbox.window.SITE_CONFIG;
    if (!cfg) errors.push('config.js 没有导出 window.SITE_CONFIG');
    else {
      if (!cfg.meta || !cfg.meta.siteName || cfg.meta.siteName === '青禾中学') {
        warnings.push('仍在用示例校名“青禾中学”，发布前请修改 config.meta.siteName');
      }
      if (cfg.meta && /example\.com/.test(cfg.meta.url || '')) {
        warnings.push('meta.url 仍是 example.com，发布前请替换为真实域名');
      }
      if (cfg.api && cfg.api.base) {
        warnings.push('已配置 api.base，请确认后端已启动或已部署');
      }
    }
  } catch (error) {
    errors.push('config.js 解析失败: ' + error.message);
  }
}

// 3. 页面外壳
const requiredScripts = ['assets/js/config.js', 'assets/js/site.js', 'assets/js/content.js', 'assets/js/chat.js'];
for (const file of htmlFiles) {
  const html = fs.readFileSync(file, 'utf8');
  const isUtilityPage = rel(file).startsWith('tools/') || rel(file).startsWith('server/admin/') || rel(file) === 'admin.html';
  if (!isUtilityPage) {
    if (!/data-page="[a-z-]+"/.test(html)) errors.push(rel(file) + ' 缺少 body[data-page]');
    for (const script of requiredScripts) {
      if (!html.includes(script)) errors.push(rel(file) + ' 缺少脚本 ' + script);
    }
    if (!html.includes('data-site-header')) errors.push(rel(file) + ' 缺少 data-site-header');
    if (!html.includes('data-site-footer')) errors.push(rel(file) + ' 缺少 data-site-footer');
    if (!html.includes('data-site-modals')) errors.push(rel(file) + ' 缺少 data-site-modals');
  }

  // 内部链接
  const attrPattern = /(?:href|src)="([^"]+)"/g;
  let match;
  while ((match = attrPattern.exec(html))) {
    const value = match[1];
    if (!value || /^(#|\/|https?:|mailto:|tel:|javascript:|data:)/i.test(value)) continue;
    const clean = value.split('#')[0].split('?')[0];
    if (!clean) continue;
    const target = path.resolve(path.dirname(file), clean);
    if (!fs.existsSync(target)) errors.push(rel(file) + ' 链接不存在: ' + value);
  }
}

// 4. 数据中的图片
for (const file of jsonFiles) {
  let data;
  try { data = JSON.parse(fs.readFileSync(file, 'utf8')); } catch { continue; }
  const text = JSON.stringify(data);
  const imagePattern = /"(?:image|logo|ogImage)"\s*:\s*"([^"]+)"/g;
  let match;
  while ((match = imagePattern.exec(text))) {
    const value = match[1];
    if (/^https?:/.test(value)) continue;
    const target = path.resolve(root, value);
    if (!fs.existsSync(target)) errors.push(rel(file) + ' 图片不存在: ' + value);
  }
}

// 5. 敏感信息 / 真实学校残留
const forbidden = [
  /望谟/,
  /刘秀祥/,
  /wmxsgaozhong/i,
  /sygz123/i,
  /MAILBOX_ADMIN_HASH\s*=\s*[0-9a-f]{32,}/i,
  /sk-[A-Za-z0-9]{20,}/,
];
for (const file of files) {
  if (!/\.(html|js|json|md|css|py|txt|example)$/.test(file)) continue;
  if (rel(file).startsWith('tools/')) continue;
  const content = fs.readFileSync(file, 'utf8');
  for (const pattern of forbidden) {
    if (pattern.test(content)) errors.push(rel(file) + ' 命中敏感/真实信息规则: ' + pattern);
  }
}

// 6. 不该提交的运行时文件
for (const name of ['.env', 'cache_store.json', 'chroma.sqlite3']) {
  if (files.some((f) => rel(f) === name || rel(f).endsWith('/' + name))) {
    errors.push('发现运行时敏感文件: ' + name);
  }
}

console.log('');
console.log('Campus Site Template · check');
console.log('  HTML: ' + htmlFiles.length + ' 个');
console.log('  JSON: ' + jsonFiles.length + ' 个');
if (warnings.length) {
  console.log('');
  warnings.forEach((item) => console.log('  [提示] ' + item));
}
if (errors.length) {
  console.log('');
  errors.forEach((item) => console.log('  [错误] ' + item));
  process.exit(1);
}
console.log('');
console.log('  ✓ 通过');
