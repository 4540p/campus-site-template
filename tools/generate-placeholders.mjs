/**
 * Generate the neutral SVG artwork shipped with the template.
 * Everything is vector, offline and free to modify.
 *
 *   node tools/generate-placeholders.mjs
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const outDir = path.join(root, 'assets', 'img');
fs.mkdirSync(outDir, { recursive: true });

const palettes = {
  ocean: ['#081a3a', '#123c7a', '#2563eb', '#7dd3fc'],
  teal: ['#062f2d', '#0f766e', '#14b8a6', '#99f6e4'],
  violet: ['#211047', '#5b21b6', '#8b5cf6', '#ddd6fe'],
  amber: ['#3d2507', '#b45309', '#f59e0b', '#fde68a'],
  rose: ['#3f0a1b', '#be123c', '#fb7185', '#fecdd3'],
  slate: ['#111827', '#334155', '#64748b', '#e2e8f0'],
};

const list = Object.entries(palettes);

function pick(i) {
  return list[i % list.length][1];
}

function defs(p) {
  return [
    '<defs>',
    '<linearGradient id="sky" x1="0" y1="0" x2="1" y2="1">',
    '<stop offset="0" stop-color="' + p[0] + '"/>',
    '<stop offset=".55" stop-color="' + p[1] + '"/>',
    '<stop offset="1" stop-color="' + p[2] + '"/>',
    '</linearGradient>',
    '<linearGradient id="glass" x1="0" y1="0" x2="0" y2="1">',
    '<stop offset="0" stop-color="#ffffff" stop-opacity=".96"/>',
    '<stop offset="1" stop-color="#e2e8f0" stop-opacity=".86"/>',
    '</linearGradient>',
    '<linearGradient id="fade" x1="0" y1="0" x2="0" y2="1">',
    '<stop offset="0" stop-color="' + p[3] + '" stop-opacity=".55"/>',
    '<stop offset="1" stop-color="' + p[1] + '" stop-opacity=".05"/>',
    '</linearGradient>',
    '<radialGradient id="glow"><stop offset="0" stop-color="' + p[3] + '" stop-opacity=".9"/><stop offset="1" stop-color="' + p[3] + '" stop-opacity="0"/></radialGradient>',
    '<pattern id="grid" width="48" height="48" patternUnits="userSpaceOnUse">',
    '<path d="M48 0H0V48" fill="none" stroke="#ffffff" stroke-opacity=".055"/>',
    '</pattern>',
    '</defs>',
  ].join('');
}

function frame(w, h, p, body) {
  return [
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ' + w + ' ' + h + '" width="' + w + '" height="' + h + '" role="img">',
    defs(p),
    '<rect width="' + w + '" height="' + h + '" fill="url(#sky)"/>',
    '<rect width="' + w + '" height="' + h + '" fill="url(#grid)"/>',
    '<circle cx="' + Math.round(w * 0.82) + '" cy="' + Math.round(h * 0.18) + '" r="' + Math.round(Math.min(w, h) * 0.34) + '" fill="url(#glow)" opacity=".55"/>',
    '<circle cx="' + Math.round(w * 0.16) + '" cy="' + Math.round(h * 0.78) + '" r="' + Math.round(Math.min(w, h) * 0.3) + '" fill="' + p[3] + '" opacity=".07"/>',
    body.join(''),
    '</svg>',
  ].join('');
}

function sun(w, h, p) {
  return '<circle cx="' + w * 0.79 + '" cy="' + h * 0.2 + '" r="' + Math.min(w, h) * 0.055 + '" fill="' + p[3] + '" opacity=".95"/>' +
    '<circle cx="' + w * 0.79 + '" cy="' + h * 0.2 + '" r="' + Math.min(w, h) * 0.1 + '" fill="none" stroke="' + p[3] + '" stroke-opacity=".35"/>';
}

function hills(w, h, p) {
  return '<path d="M0 ' + h * 0.72 + ' Q ' + w * 0.2 + ' ' + h * 0.52 + ' ' + w * 0.42 + ' ' + h * 0.7 + ' T ' + w + ' ' + h * 0.62 + ' V ' + h + ' H 0 Z" fill="' + p[1] + '" opacity=".85"/>' +
    '<path d="M0 ' + h * 0.8 + ' Q ' + w * 0.3 + ' ' + h * 0.64 + ' ' + w * 0.58 + ' ' + h * 0.78 + ' T ' + w + ' ' + h * 0.72 + ' V ' + h + ' H 0 Z" fill="' + p[0] + '" opacity=".72"/>';
}

function windows(x, y, cols, rows, cw, ch, gap) {
  const parts = [];
  for (let r = 0; r < rows; r += 1) {
    for (let c = 0; c < cols; c += 1) {
      const fill = (r + c) % 3 === 0 ? '#93c5fd' : '#dbeafe';
      parts.push('<rect x="' + (x + c * (cw + gap)) + '" y="' + (y + r * (ch + gap)) + '" width="' + cw + '" height="' + ch + '" rx="' + Math.min(4, cw / 4) + '" fill="' + fill + '" opacity="' + (0.55 + ((r * 7 + c * 3) % 4) * 0.1) + '"/>');
    }
  }
  return parts.join('');
}

function tree(x, y, s, p) {
  return '<rect x="' + (x - 3 * s) + '" y="' + y + '" width="' + 6 * s + '" height="' + 30 * s + '" rx="2" fill="' + p[0] + '" opacity=".8"/>' +
    '<circle cx="' + x + '" cy="' + (y - 8 * s) + '" r="' + 18 * s + '" fill="' + p[2] + '" opacity=".9"/>' +
    '<circle cx="' + (x - 13 * s) + '" cy="' + (y + 2 * s) + '" r="' + 12 * s + '" fill="' + p[1] + '" opacity=".9"/>' +
    '<circle cx="' + (x + 14 * s) + '" cy="' + (y + 1 * s) + '" r="' + 13 * s + '" fill="' + p[1] + '" opacity=".9"/>';
}

function campus(w, h, p) {
  const b = [];
  b.push(sun(w, h, p));
  b.push(hills(w, h, p));
  b.push('<rect x="0" y="' + h * 0.74 + '" width="' + w + '" height="' + h * 0.26 + '" fill="' + p[0] + '" opacity=".5"/>');
  b.push('<rect x="' + w * 0.2 + '" y="' + h * 0.4 + '" width="' + w * 0.48 + '" height="' + h * 0.34 + '" rx="8" fill="url(#glass)" opacity=".93"/>');
  b.push('<rect x="' + w * 0.24 + '" y="' + h * 0.36 + '" width="' + w * 0.4 + '" height="' + h * 0.05 + '" rx="4" fill="' + p[2] + '"/>');
  b.push(windows(w * 0.245, h * 0.46, 5, 3, w * 0.055, h * 0.06, w * 0.018));
  b.push('<rect x="' + w * 0.42 + '" y="' + h * 0.62 + '" width="' + w * 0.04 + '" height="' + h * 0.12 + '" fill="' + p[1] + '" opacity=".8"/>');
  b.push('<rect x="' + w * 0.72 + '" y="' + h * 0.5 + '" width="' + w * 0.16 + '" height="' + h * 0.24 + '" rx="6" fill="url(#glass)" opacity=".82"/>');
  b.push(windows(w * 0.735, h * 0.54, 3, 2, w * 0.036, h * 0.05, w * 0.012));
  b.push(tree(w * 0.1, h * 0.78, Math.min(w, h) / 340, p));
  b.push(tree(w * 0.93, h * 0.76, Math.min(w, h) / 400, p));
  b.push('<path d="M ' + w * 0.42 + ' ' + h + ' L ' + w * 0.48 + ' ' + h * 0.74 + ' L ' + w * 0.56 + ' ' + h * 0.74 + ' L ' + w * 0.66 + ' ' + h + ' Z" fill="#ffffff" opacity=".16"/>');
  return b;
}

function gate(w, h, p) {
  const b = [sun(w, h, p), hills(w, h, p)];
  b.push('<rect x="0" y="' + h * 0.78 + '" width="' + w + '" height="' + h * 0.22 + '" fill="' + p[0] + '" opacity=".55"/>');
  b.push('<rect x="' + w * 0.22 + '" y="' + h * 0.36 + '" width="' + w * 0.56 + '" height="' + h * 0.05 + '" rx="6" fill="' + p[3] + '" opacity=".95"/>');
  b.push('<rect x="' + w * 0.25 + '" y="' + h * 0.41 + '" width="' + w * 0.04 + '" height="' + h * 0.37 + '" fill="#e2e8f0" opacity=".9"/>');
  b.push('<rect x="' + w * 0.71 + '" y="' + h * 0.41 + '" width="' + w * 0.04 + '" height="' + h * 0.37 + '" fill="#e2e8f0" opacity=".9"/>');
  b.push('<rect x="' + w * 0.31 + '" y="' + h * 0.43 + '" width="' + w * 0.38 + '" height="' + h * 0.035 + '" rx="3" fill="' + p[2] + '"/>');
  b.push('<path d="M ' + w * 0.46 + ' ' + h + ' L ' + w * 0.48 + ' ' + h * 0.78 + ' L ' + w * 0.52 + ' ' + h * 0.78 + ' L ' + w * 0.54 + ' ' + h + ' Z" fill="#ffffff" opacity=".18"/>');
  b.push(tree(w * 0.15, h * 0.8, Math.min(w, h) / 330, p));
  b.push(tree(w * 0.85, h * 0.8, Math.min(w, h) / 330, p));
  return b;
}

function library(w, h, p) {
  const b = [];
  b.push('<rect width="' + w + '" height="' + h + '" fill="' + p[0] + '" opacity=".25"/>');
  b.push('<rect x="' + w * 0.12 + '" y="' + h * 0.16 + '" width="' + w * 0.34 + '" height="' + h * 0.6 + '" rx="8" fill="' + p[1] + '" opacity=".72"/>');
  b.push('<rect x="' + w * 0.54 + '" y="' + h * 0.16 + '" width="' + w * 0.34 + '" height="' + h * 0.6 + '" rx="8" fill="' + p[1] + '" opacity=".72"/>');
  for (let shelf = 0; shelf < 3; shelf += 1) {
    b.push('<rect x="' + w * 0.14 + '" y="' + (h * 0.25 + shelf * h * 0.17) + '" width="' + w * 0.3 + '" height="6" fill="' + p[3] + '" opacity=".5"/>');
    b.push('<rect x="' + w * 0.56 + '" y="' + (h * 0.25 + shelf * h * 0.17) + '" width="' + w * 0.3 + '" height="6" fill="' + p[3] + '" opacity=".5"/>');
    for (let i = 0; i < 7; i += 1) {
      const bw = w * (0.012 + (i % 3) * 0.006);
      const bh = h * (0.075 + ((i * 5 + shelf) % 4) * 0.012);
      b.push('<rect x="' + (w * 0.155 + i * w * 0.04) + '" y="' + (h * 0.25 + shelf * h * 0.17 - bh) + '" width="' + bw + '" height="' + bh + '" rx="2" fill="' + p[2] + '" opacity="' + (0.55 + (i % 4) * 0.1) + '"/>');
      b.push('<rect x="' + (w * 0.575 + i * w * 0.04) + '" y="' + (h * 0.25 + shelf * h * 0.17 - bh) + '" width="' + bw + '" height="' + bh + '" rx="2" fill="' + p[3] + '" opacity="' + (0.45 + (i % 3) * 0.1) + '"/>');
    }
  }
  b.push('<rect x="0" y="' + h * 0.78 + '" width="' + w + '" height="' + h * 0.22 + '" fill="' + p[0] + '" opacity=".6"/>');
  b.push('<rect x="' + w * 0.3 + '" y="' + h * 0.82 + '" width="' + w * 0.4 + '" height="' + h * 0.04 + '" rx="10" fill="' + p[3] + '" opacity=".85"/>');
  b.push('<circle cx="' + w * 0.5 + '" cy="' + h * 0.3 + '" r="' + Math.min(w, h) * 0.16 + '" fill="url(#fade)" opacity=".5"/>');
  return b;
}

function garden(w, h, p) {
  const b = [sun(w, h, p), hills(w, h, p)];
  b.push('<rect x="0" y="' + h * 0.76 + '" width="' + w + '" height="' + h * 0.24 + '" fill="' + p[0] + '" opacity=".45"/>');
  b.push('<path d="M ' + w * 0.44 + ' ' + h + ' C ' + w * 0.36 + ' ' + h * 0.86 + ' ' + w * 0.62 + ' ' + h * 0.78 + ' ' + w * 0.54 + ' ' + h * 0.68 + ' L ' + w * 0.6 + ' ' + h * 0.68 + ' C ' + w * 0.7 + ' ' + h * 0.8 + ' ' + w * 0.62 + ' ' + h * 0.9 + ' ' + w * 0.68 + ' ' + h + ' Z" fill="#ffffff" opacity=".2"/>');
  b.push(tree(w * 0.16, h * 0.82, Math.min(w, h) / 240, p));
  b.push(tree(w * 0.82, h * 0.84, Math.min(w, h) / 280, p));
  b.push(tree(w * 0.32, h * 0.72, Math.min(w, h) / 430, p));
  b.push(tree(w * 0.68, h * 0.72, Math.min(w, h) / 450, p));
  for (let i = 0; i < 16; i += 1) {
    const x = w * (0.08 + i * 0.056);
    const y = h * (0.9 - (i % 3) * 0.035);
    b.push('<circle cx="' + x + '" cy="' + y + '" r="' + (3 + (i % 3) * 1.5) + '" fill="' + (i % 2 ? p[3] : p[2]) + '" opacity=".75"/>');
  }
  return b;
}

function sports(w, h, p) {
  const b = [sun(w, h, p), hills(w, h, p)];
  b.push('<rect x="0" y="' + h * 0.68 + '" width="' + w + '" height="' + h * 0.32 + '" fill="' + p[0] + '" opacity=".45"/>');
  b.push('<ellipse cx="' + w * 0.5 + '" cy="' + h * 0.84 + '" rx="' + w * 0.42 + '" ry="' + h * 0.13 + '" fill="' + p[2] + '" opacity=".28"/>');
  b.push('<ellipse cx="' + w * 0.5 + '" cy="' + h * 0.84 + '" rx="' + w * 0.36 + '" ry="' + h * 0.095 + '" fill="none" stroke="#ffffff" stroke-opacity=".6" stroke-width="6"/>');
  b.push('<ellipse cx="' + w * 0.5 + '" cy="' + h * 0.84 + '" rx="' + w * 0.22 + '" ry="' + h * 0.04 + '" fill="none" stroke="#ffffff" stroke-opacity=".4" stroke-width="4"/>');
  b.push('<rect x="' + w * 0.42 + '" y="' + h * 0.74 + '" width="' + w * 0.16 + '" height="' + h * 0.02 + '" fill="#ffffff" opacity=".5"/>');
  b.push('<path d="M ' + w * 0.17 + ' ' + h * 0.67 + ' L ' + w * 0.17 + ' ' + h * 0.77 + ' M ' + w * 0.17 + ' ' + h * 0.67 + ' L ' + w * 0.3 + ' ' + h * 0.67 + ' M ' + w * 0.3 + ' ' + h * 0.67 + ' L ' + w * 0.3 + ' ' + h * 0.77 + ' M ' + w * 0.17 + ' ' + h * 0.77 + ' L ' + w * 0.3 + ' ' + h * 0.77 + '" stroke="#ffffff" stroke-opacity=".55" stroke-width="5" fill="none"/>');
  b.push('<path d="M ' + w * 0.7 + ' ' + h * 0.77 + ' L ' + w * 0.83 + ' ' + h * 0.77 + ' M ' + w * 0.7 + ' ' + h * 0.67 + ' L ' + w * 0.83 + ' ' + h * 0.67 + ' M ' + w * 0.7 + ' ' + h * 0.67 + ' L ' + w * 0.7 + ' ' + h * 0.77 + ' M ' + w * 0.83 + ' ' + h * 0.67 + ' L ' + w * 0.83 + ' ' + h * 0.77 + '" stroke="#ffffff" stroke-opacity=".55" stroke-width="5" fill="none"/>');
  return b;
}

function lab(w, h, p) {
  const b = [];
  b.push('<rect width="' + w + '" height="' + h + '" fill="' + p[0] + '" opacity=".2"/>');
  b.push('<rect x="' + w * 0.1 + '" y="' + h * 0.62 + '" width="' + w * 0.8 + '" height="' + h * 0.04 + '" rx="8" fill="' + p[3] + '" opacity=".7"/>');
  const beakers = [0.25, 0.44, 0.65];
  for (let i = 0; i < beakers.length; i += 1) {
    const x = w * beakers[i];
    const y = h * 0.28;
    b.push('<path d="M ' + (x - 28) + ' ' + y + ' L ' + (x - 28) + ' ' + (y + 40) + ' L ' + (x - 44) + ' ' + (y + 150) + ' Q ' + (x - 48) + ' ' + (y + 180) + ' ' + (x - 14) + ' ' + (y + 180) + ' L ' + (x + 14) + ' ' + (y + 180) + ' Q ' + (x + 48) + ' ' + (y + 180) + ' ' + (x + 44) + ' ' + (y + 150) + ' L ' + (x + 28) + ' ' + (y + 40) + ' L ' + (x + 28) + ' ' + y + '" fill="#e0f2fe" fill-opacity=".18" stroke="' + p[3] + '" stroke-width="5" stroke-linejoin="round"/>');
    b.push('<path d="M ' + (x - 41) + ' ' + (y + 122) + ' Q ' + x + ' ' + (y + 108) + ' ' + (x + 41) + ' ' + (y + 122) + ' L ' + (x + 44) + ' ' + (y + 150) + ' Q ' + (x + 48) + ' ' + (y + 180) + ' ' + (x + 14) + ' ' + (y + 180) + ' L ' + (x - 14) + ' ' + (y + 180) + ' Q ' + (x - 48) + ' ' + (y + 180) + ' ' + (x - 44) + ' ' + (y + 150) + ' Z" fill="' + p[2] + '" opacity=".7"/>');
    b.push('<circle cx="' + (x + 10) + '" cy="' + (y + 145) + '" r="7" fill="#ffffff" opacity=".4"/>');
    b.push('<circle cx="' + (x + 22) + '" cy="' + (y + 120) + '" r="4" fill="#ffffff" opacity=".35"/>');
  }
  b.push('<circle cx="' + w * 0.52 + '" cy="' + h * 0.2 + '" r="' + Math.min(w, h) * 0.2 + '" fill="url(#fade)" opacity=".45"/>');
  return b;
}

function gym(w, h, p) {
  const b = [sun(w, h, p), hills(w, h, p)];
  b.push('<rect x="0" y="' + h * 0.78 + '" width="' + w + '" height="' + h * 0.22 + '" fill="' + p[0] + '" opacity=".5"/>');
  b.push('<path d="M ' + w * 0.22 + ' ' + h * 0.7 + ' Q ' + w * 0.5 + ' ' + h * 0.28 + ' ' + w * 0.78 + ' ' + h * 0.7 + ' Z" fill="url(#glass)" opacity=".92"/>');
  b.push('<path d="M ' + w * 0.26 + ' ' + h * 0.68 + ' Q ' + w * 0.5 + ' ' + h * 0.34 + ' ' + w * 0.74 + ' ' + h * 0.68 + '" fill="none" stroke="' + p[2] + '" stroke-width="10" opacity=".8"/>');
  b.push('<rect x="' + w * 0.22 + '" y="' + h * 0.7 + '" width="' + w * 0.56 + '" height="' + h * 0.16 + '" fill="' + p[1] + '" opacity=".85"/>');
  b.push(windows(w * 0.28, h * 0.73, 6, 2, w * 0.045, h * 0.03, w * 0.012));
  b.push('<rect x="' + w * 0.47 + '" y="' + h * 0.78 + '" width="' + w * 0.06 + '" height="' + h * 0.08 + '" fill="' + p[0] + '" opacity=".7"/>');
  return b;
}

function dorm(w, h, p) {
  const b = [sun(w, h, p), hills(w, h, p)];
  b.push('<rect x="0" y="' + h * 0.8 + '" width="' + w + '" height="' + h * 0.2 + '" fill="' + p[0] + '" opacity=".5"/>');
  b.push('<rect x="' + w * 0.26 + '" y="' + h * 0.2 + '" width="' + w * 0.48 + '" height="' + h * 0.62 + '" rx="10" fill="url(#glass)" opacity=".94"/>');
  for (let floor = 0; floor < 4; floor += 1) {
    b.push('<rect x="' + w * 0.26 + '" y="' + (h * 0.28 + floor * h * 0.13) + '" width="' + w * 0.48 + '" height="7" fill="' + p[2] + '" opacity=".35"/>');
    b.push(windows(w * 0.29, h * 0.235 + floor * h * 0.13, 5, 1, w * 0.055, h * 0.055, w * 0.028));
  }
  b.push('<rect x="' + w * 0.47 + '" y="' + h * 0.72 + '" width="' + w * 0.06 + '" height="' + h * 0.1 + '" fill="' + p[1] + '" opacity=".75"/>');
  b.push(tree(w * 0.14, h * 0.82, Math.min(w, h) / 320, p));
  b.push(tree(w * 0.87, h * 0.82, Math.min(w, h) / 340, p));
  return b;
}

function panorama(w, h, p) {
  const b = [sun(w, h, p), hills(w, h, p)];
  b.push('<rect x="0" y="' + h * 0.74 + '" width="' + w + '" height="' + h * 0.26 + '" fill="' + p[0] + '" opacity=".5"/>');
  const towers = [
    [0.12, 0.48, 0.14, 0.3],
    [0.3, 0.38, 0.19, 0.4],
    [0.55, 0.46, 0.15, 0.32],
    [0.74, 0.54, 0.12, 0.24],
  ];
  for (let i = 0; i < towers.length; i += 1) {
    const t = towers[i];
    b.push('<rect x="' + w * t[0] + '" y="' + h * t[1] + '" width="' + w * t[2] + '" height="' + h * t[3] + '" rx="6" fill="url(#glass)" opacity="' + (0.82 + i * 0.03) + '"/>');
    b.push(windows(w * t[0] + w * 0.018, h * t[1] + h * 0.05, 4, 3, w * 0.018, h * 0.04, w * 0.012));
  }
  b.push(tree(w * 0.07, h * 0.82, Math.min(w, h) / 300, p));
  b.push(tree(w * 0.93, h * 0.84, Math.min(w, h) / 330, p));
  return b;
}

function portrait(w, h, p) {
  return [
    '<circle cx="' + w * 0.5 + '" cy="' + h * 0.38 + '" r="' + w * 0.34 + '" fill="' + p[3] + '" opacity=".12"/>',
    '<circle cx="' + w * 0.5 + '" cy="' + h * 0.38 + '" r="' + w * 0.26 + '" fill="none" stroke="' + p[3] + '" stroke-opacity=".3" stroke-width="2"/>',
    '<circle cx="' + w * 0.5 + '" cy="' + h * 0.36 + '" r="' + w * 0.16 + '" fill="' + p[0] + '" opacity=".7"/>',
    '<path d="M ' + w * 0.18 + ' ' + h * 0.92 + ' C ' + w * 0.2 + ' ' + h * 0.68 + ' ' + w * 0.34 + ' ' + h * 0.6 + ' ' + w * 0.5 + ' ' + h * 0.6 + ' C ' + w * 0.66 + ' ' + h * 0.6 + ' ' + w * 0.8 + ' ' + h * 0.68 + ' ' + w * 0.82 + ' ' + h * 0.92 + ' Z" fill="' + p[0] + '" opacity=".72"/>',
    '<rect x="' + w * 0.34 + '" y="' + h * 0.71 + '" width="' + w * 0.32 + '" height="' + h * 0.035 + '" rx="20" fill="' + p[2] + '" opacity=".8"/>',
    '<circle cx="' + w * 0.12 + '" cy="' + h * 0.18 + '" r="' + w * 0.05 + '" fill="' + p[2] + '" opacity=".55"/>',
    '<circle cx="' + w * 0.88 + '" cy="' + h * 0.74 + '" r="' + w * 0.07 + '" fill="' + p[3] + '" opacity=".3"/>',
  ];
}

function newsArt(w, h, p, kind) {
  const b = [sun(w, h, p), hills(w, h, p)];
  b.push('<rect x="0" y="' + h * 0.76 + '" width="' + w + '" height="' + h * 0.24 + '" fill="' + p[0] + '" opacity=".5"/>');
  if (kind === 0) {
    b.push('<rect x="' + w * 0.32 + '" y="' + h * 0.28 + '" width="' + w * 0.36 + '" height="' + h * 0.4 + '" rx="12" fill="url(#glass)" opacity=".94"/>');
    b.push('<rect x="' + w * 0.32 + '" y="' + h * 0.28 + '" width="' + w * 0.05 + '" height="' + h * 0.4 + '" fill="' + p[2] + '" opacity=".9"/>');
    b.push('<rect x="' + w * 0.42 + '" y="' + h * 0.36 + '" width="' + w * 0.2 + '" height="10" rx="5" fill="' + p[1] + '" opacity=".55"/>');
    b.push('<rect x="' + w * 0.42 + '" y="' + h * 0.44 + '" width="' + w * 0.16 + '" height="8" rx="4" fill="' + p[1] + '" opacity=".35"/>');
    b.push('<circle cx="' + w * 0.6 + '" cy="' + h * 0.58 + '" r="' + h * 0.07 + '" fill="' + p[2] + '" opacity=".8"/>');
  } else if (kind === 1) {
    b.push('<path d="M ' + w * 0.38 + ' ' + h * 0.24 + ' L ' + w * 0.62 + ' ' + h * 0.24 + ' L ' + w * 0.56 + ' ' + h * 0.46 + ' L ' + w * 0.66 + ' ' + h * 0.7 + ' L ' + w * 0.34 + ' ' + h * 0.7 + ' L ' + w * 0.44 + ' ' + h * 0.46 + ' Z" fill="' + p[3] + '" opacity=".25" stroke="' + p[3] + '" stroke-width="5"/>');
    b.push('<path d="M ' + w * 0.4 + ' ' + h * 0.5 + ' L ' + w * 0.6 + ' ' + h * 0.5 + '" stroke="' + p[3] + '" stroke-width="5" opacity=".7"/>');
    b.push('<circle cx="' + w * 0.5 + '" cy="' + h * 0.34 + '" r="' + h * 0.035 + '" fill="' + p[3] + '" opacity=".85"/>');
  } else {
    b.push('<path d="M ' + w * 0.28 + ' ' + h * 0.3 + ' L ' + w * 0.66 + ' ' + h * 0.38 + ' L ' + w * 0.62 + ' ' + h * 0.52 + ' L ' + w * 0.4 + ' ' + h * 0.56 + ' Z" fill="url(#glass)" opacity=".9"/>');
    b.push('<path d="M ' + w * 0.4 + ' ' + h * 0.56 + ' L ' + w * 0.5 + ' ' + h * 0.74 + ' L ' + w * 0.34 + ' ' + h * 0.7 + ' Z" fill="' + p[2] + '" opacity=".75"/>');
    b.push('<path d="M ' + w * 0.38 + ' ' + h * 0.36 + ' Q ' + w * 0.5 + ' ' + h * 0.3 + ' ' + w * 0.6 + ' ' + h * 0.4 + '" fill="none" stroke="' + p[2] + '" stroke-width="7" opacity=".75"/>');
  }
  b.push(tree(w * 0.12, h * 0.84, Math.min(w, h) / 300, p));
  b.push(tree(w * 0.88, h * 0.84, Math.min(w, h) / 320, p));
  return b;
}

function logo(p) {
  return [
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" width="256" height="256" role="img">',
    '<defs><linearGradient id="lg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="' + p[2] + '"/><stop offset="1" stop-color="' + p[1] + '"/></linearGradient></defs>',
    '<rect width="256" height="256" rx="58" fill="url(#lg)"/>',
    '<circle cx="198" cy="58" r="26" fill="' + p[3] + '" opacity=".9"/>',
    '<path d="M64 86 C 88 70, 112 78, 128 92 C 144 78, 168 70, 192 86 L 192 170 C 168 156, 144 164, 128 178 C 112 164, 88 156, 64 170 Z" fill="#ffffff" opacity=".96"/>',
    '<path d="M128 92 L 128 178" stroke="' + p[1] + '" stroke-width="7" stroke-linecap="round" opacity=".55"/>',
    '<path d="M82 112 C 98 104, 112 108, 120 116" fill="none" stroke="' + p[2] + '" stroke-width="5" stroke-linecap="round" opacity=".5"/>',
    '<path d="M82 130 C 98 122, 112 126, 120 134" fill="none" stroke="' + p[2] + '" stroke-width="5" stroke-linecap="round" opacity=".5"/>',
    '<path d="M136 116 C 144 108, 158 104, 174 112" fill="none" stroke="' + p[2] + '" stroke-width="5" stroke-linecap="round" opacity=".5"/>',
    '<path d="M136 134 C 144 126, 158 122, 174 130" fill="none" stroke="' + p[2] + '" stroke-width="5" stroke-linecap="round" opacity=".5"/>',
    '</svg>',
  ].join('');
}

const scenes = { campus, gate, library, garden, sports, lab, gym, dorm, panorama };

function write(name, svg, w, h) {
  fs.writeFileSync(path.join(outDir, name), svg, 'utf8');
  console.log('  ' + name + '  ' + w + 'x' + h);
}

console.log('Generating SVG placeholders...');
write('logo.svg', logo(pick(0)), 256, 256);

const heroScenes = ['campus', 'library', 'sports', 'garden'];
heroScenes.forEach((scene, i) => {
  const p = pick(i);
  write('hero-' + (i + 1) + '.svg', frame(1600, 900, p, scenes[scene](1600, 900, p)), 1600, 900);
});

const campusScenes = ['gate', 'campus', 'library', 'garden', 'sports', 'lab', 'gym', 'dorm', 'panorama'];
campusScenes.forEach((scene, i) => {
  const p = pick(i + 1);
  write('campus-' + (i + 1) + '.svg', frame(1200, 800, p, scenes[scene](1200, 800, p)), 1200, 800);
});

for (let i = 0; i < 3; i += 1) {
  const p = pick(i + 2);
  write('news-' + (i + 1) + '.svg', frame(800, 500, p, newsArt(800, 500, p, i)), 800, 500);
}

for (let i = 0; i < 6; i += 1) {
  const p = pick(i + 1);
  write('teacher-' + (i + 1) + '.svg', frame(600, 750, p, portrait(600, 750, p)), 600, 750);
}

for (let i = 0; i < 6; i += 1) {
  const p = pick(i + 4);
  write('student-' + (i + 1) + '.svg', frame(600, 750, p, portrait(600, 750, p)), 600, 750);
}

const pAbout = pick(2);
write('about-campus.svg', frame(1200, 900, pAbout, panorama(1200, 900, pAbout)), 1200, 900);
const pOg = pick(0);
write('og-cover.svg', frame(1200, 630, pOg, campus(1200, 630, pOg)), 1200, 630);

console.log('Done.');
