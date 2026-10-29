/**
 * 站点外壳与公共交互
 * - 根据 config.js 生成导航、页脚、聊天入口
 * - 主题色、SEO、数字动画、倒计时、移动端菜单
 *
 * 页面只需要：
 *   <body data-page="home">
 *   <div data-site-header></div>
 *   <main id="main">...</main>
 *   <div data-site-footer></div>
 *   <div data-site-modals></div>
 */
(function () {
  'use strict';

  var cfg = window.SITE_CONFIG || {};
  var pageKey = (document.body && document.body.dataset.page) || 'home';
  var apiBase = (cfg.api && cfg.api.base) || '';
  var dataCache = new Map();
  var currentYear = new Date().getFullYear();

  // ------------------------------------------------------------
  // 基础工具
  // ------------------------------------------------------------
  function $(selector, root) {
    return (root || document).querySelector(selector);
  }

  function $$(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function escapeHtml(value) {
    if (value === null || value === undefined) return '';
    return String(value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function escapeAttr(value) {
    return escapeHtml(value).replace(/\n/g, ' ');
  }

  function formatDate(value, withTime) {
    if (!value) return '';
    var date = new Date(String(value).replace(/-/g, '/'));
    if (isNaN(date.getTime())) return String(value);
    var y = date.getFullYear();
    var m = String(date.getMonth() + 1).padStart(2, '0');
    var d = String(date.getDate()).padStart(2, '0');
    if (!withTime) return y + '-' + m + '-' + d;
    return y + '-' + m + '-' + d + ' ' + String(date.getHours()).padStart(2, '0') + ':' + String(date.getMinutes()).padStart(2, '0');
  }

  function relativeDate(value) {
    var date = new Date(String(value).replace(/-/g, '/'));
    if (isNaN(date.getTime())) return '';
    var diff = Date.now() - date.getTime();
    var day = 86400000;
    if (diff < day) return '今天';
    if (diff < day * 2) return '昨天';
    if (diff < day * 7) return Math.floor(diff / day) + ' 天前';
    return formatDate(value);
  }

  /**
   * 轻量 Markdown -> HTML，足够展示新闻/公告/招生简章。
   * 先转义再解析，避免把编辑内容当 HTML 执行。
   */
  function mdToHtml(text) {
    if (!text) return '';
    var safe = escapeHtml(String(text)).replace(/\r\n/g, '\n');
    var lines = safe.split('\n');
    var html = [];
    var listType = '';

    function closeList() {
      if (listType) {
        html.push('</' + listType + '>');
        listType = '';
      }
    }

    lines.forEach(function (raw) {
      var line = raw.trim();
      if (!line) {
        closeList();
        return;
      }

      var heading = line.match(/^(#{1,4})\s+(.+)$/);
      if (heading) {
        closeList();
        var level = Math.min(4, heading[1].length + 1);
        html.push('<h' + level + '>' + inline(heading[2]) + '</h' + level + '>');
        return;
      }

      if (/^---+$/.test(line)) {
        closeList();
        html.push('<hr>');
        return;
      }

      var unordered = line.match(/^[-*+]\s+(.+)$/);
      if (unordered) {
        if (listType !== 'ul') {
          closeList();
          listType = 'ul';
          html.push('<ul>');
        }
        html.push('<li>' + inline(unordered[1]) + '</li>');
        return;
      }

      var ordered = line.match(/^\d+[.)]\s+(.+)$/);
      if (ordered) {
        if (listType !== 'ol') {
          closeList();
          listType = 'ol';
          html.push('<ol>');
        }
        html.push('<li>' + inline(ordered[1]) + '</li>');
        return;
      }

      var quote = line.match(/^&gt;\s?(.+)$/);
      if (quote) {
        closeList();
        html.push('<blockquote>' + inline(quote[1]) + '</blockquote>');
        return;
      }

      closeList();
      var tableCells = line.split('|').map(function (cell) { return cell.trim(); });
      if (tableCells.length > 2 && /^\|?\s*[-: ]+/.test(lines[lines.indexOf(raw) + 1] || '')) {
        // 表格交给内容作者使用简单段落即可，这里不做复杂解析。
      }
      html.push('<p>' + inline(line) + '</p>');
    });

    closeList();
    return html.join('');
  }

  function inline(text) {
    return text
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.+?)\*/g, '<em>$1</em>')
      .replace(/\x60([^\x60]+?)\x60/g, '<code>$1</code>')
      .replace(/\[([^\]]+)\]\((https?:\/\/[^)\s]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>');
  }

  // ------------------------------------------------------------
  // 主题色：从一个主色生成完整色阶
  // ------------------------------------------------------------
  function hexToRgb(hex) {
    var value = String(hex || '').replace('#', '').trim();
    if (value.length === 3) {
      value = value.split('').map(function (c) { return c + c; }).join('');
    }
    if (!/^[0-9a-fA-F]{6}$/.test(value)) return { r: 30, g: 64, b: 175 };
    return {
      r: parseInt(value.slice(0, 2), 16),
      g: parseInt(value.slice(2, 4), 16),
      b: parseInt(value.slice(4, 6), 16),
    };
  }

  function rgbToHex(rgb) {
    return '#' + [rgb.r, rgb.g, rgb.b].map(function (n) {
      return Math.max(0, Math.min(255, Math.round(n))).toString(16).padStart(2, '0');
    }).join('');
  }

  function mix(color, target, weight) {
    var a = hexToRgb(color);
    var b = hexToRgb(target);
    return rgbToHex({
      r: a.r + (b.r - a.r) * weight,
      g: a.g + (b.g - a.g) * weight,
      b: a.b + (b.b - a.b) * weight,
    });
  }

  function applyTheme() {
    var theme = cfg.theme || {};
    var primary = theme.primary || '#1e40af';
    var dark = theme.primaryDark || mix(primary, '#000000', 0.32);
    var accent = theme.accent || '#06b6d4';
    var root = document.documentElement;
    var shades = {
      '--primary-50': mix(primary, '#ffffff', 0.92),
      '--primary-100': mix(primary, '#ffffff', 0.8),
      '--primary-200': mix(primary, '#ffffff', 0.6),
      '--primary-400': mix(primary, '#ffffff', 0.18),
      '--primary-500': primary,
      '--primary-600': mix(primary, '#000000', 0.12),
      '--primary-700': dark,
      '--primary-900': mix(primary, '#000000', 0.62),
      '--accent': accent,
      '--accent-light': mix(accent, '#ffffff', 0.38),
    };
    Object.keys(shades).forEach(function (name) {
      root.style.setProperty(name, shades[name]);
    });
    var themeColor = $('meta[name="theme-color"]');
    if (themeColor) themeColor.setAttribute('content', primary);
  }

  // ------------------------------------------------------------
  // SEO
  // ------------------------------------------------------------
  function setMeta() {
    var pages = cfg.pages || {};
    var page = pages[pageKey] || {};
    var site = cfg.meta || {};
    var title = page.title || site.siteName || document.title;
    document.title = title;

    setMetaTag('name', 'description', page.description || site.description || '');
    setMetaTag('name', 'keywords', (site.keywords || []).join(','));
    setMetaTag('name', 'author', site.siteName || '');
    setMetaTag('property', 'og:type', 'website');
    setMetaTag('property', 'og:title', title);
    setMetaTag('property', 'og:description', page.description || site.description || '');
    setMetaTag('property', 'og:site_name', site.siteName || '');
    setMetaTag('property', 'og:locale', site.locale || 'zh-CN');
    setMetaTag('property', 'og:image', absoluteUrl(site.ogImage || (cfg.brand && cfg.brand.logo) || ''));
    setMetaTag('name', 'twitter:card', 'summary_large_image');
    setMetaTag('name', 'twitter:title', title);
    setMetaTag('name', 'twitter:description', page.description || site.description || '');
    setMetaTag('name', 'twitter:image', absoluteUrl(site.ogImage || ''));

    var canonical = $('link[rel="canonical"]');
    var pageUrl = site.url ? site.url.replace(/\/$/, '') + '/' + (pageKey === 'home' ? '' : pageKey + '.html') : '';
    if (canonical && pageUrl) canonical.setAttribute('href', pageUrl);

    var icon = $('link[rel="icon"]');
    if (icon && cfg.brand && cfg.brand.logo) icon.setAttribute('href', cfg.brand.logo);

    var ld = $('#site-jsonld');
    if (!ld) {
      ld = document.createElement('script');
      ld.type = 'application/ld+json';
      ld.id = 'site-jsonld';
      document.head.appendChild(ld);
    }
    ld.textContent = JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'EducationalOrganization',
      name: site.siteName || '',
      alternateName: site.shortName || '',
      url: site.url || '',
      logo: absoluteUrl((cfg.brand && cfg.brand.logo) || ''),
      description: site.description || '',
      slogan: site.slogan || '',
      foundingDate: site.founded || '',
      address: {
        '@type': 'PostalAddress',
        streetAddress: (cfg.contact && cfg.contact.address) || '',
        addressCountry: 'CN',
      },
    });
  }

  function setMetaTag(attr, key, value) {
    var el = document.querySelector('meta[' + attr + '="' + key + '"]');
    if (!el) {
      el = document.createElement('meta');
      el.setAttribute(attr, key);
      document.head.appendChild(el);
    }
    el.setAttribute('content', value || '');
  }

  function absoluteUrl(value) {
    if (!value) return '';
    if (/^https?:\/\//.test(value)) return value;
    var base = (cfg.meta && cfg.meta.url) || '';
    return base ? base.replace(/\/$/, '') + '/' + value.replace(/^\//, '') : value;
  }

  // ------------------------------------------------------------
  // 静态文案占位符
  // ------------------------------------------------------------
  function hydrateText() {
    var site = cfg.meta || {};
    var contact = cfg.contact || {};
    var values = {
      'site-name': site.siteName || '',
      'site-short': site.shortName || '',
      'site-slogan': site.slogan || '',
      'site-slogan-en': site.sloganEn || '',
      'site-description': site.description || '',
      'site-founded': site.founded || '',
      'site-type': site.type || '',
      'site-address': contact.address || '',
      'site-phone': contact.phone || '',
      'site-email': contact.email || '',
      'site-hours': contact.officeHours || '',
      'site-year': String(currentYear),
    };
    Object.keys(values).forEach(function (key) {
      $$('[data-' + key + ']').forEach(function (el) {
        el.textContent = values[key];
      });
    });
    $$('[data-site-phone-link]').forEach(function (el) {
      el.setAttribute('href', 'tel:' + String(contact.phone || '').replace(/[^0-9+]/g, ''));
    });
    $$('[data-site-email-link]').forEach(function (el) {
      el.setAttribute('href', 'mailto:' + (contact.email || ''));
    });
    $$('[data-site-logo]').forEach(function (el) {
      if (cfg.brand && cfg.brand.logo) {
        el.setAttribute('src', cfg.brand.logo);
        el.setAttribute('alt', cfg.brand.logoAlt || site.siteName || '');
      }
    });
  }

  function renderPageHero() {
    var page = (cfg.pages || {})[pageKey];
    if (!page) return;
    var badge = $('[data-page-badge]');
    var title = $('[data-page-title]');
    var subtitle = $('[data-page-subtitle]');
    var desc = $('[data-page-desc]');
    if (badge && page.badge) badge.textContent = page.badge;
    if (title && page.titleHtml) title.innerHTML = page.titleHtml;
    if (subtitle && page.subtitle) subtitle.textContent = page.subtitle;
    if (desc && page.desc) desc.textContent = page.desc;
  }

  function hydrateSections() {
    $$('[data-section]').forEach(function (el) {
      var path = el.dataset.section.split('.');
      var section = cfg;
      for (var i = 0; i < path.length; i += 1) {
        section = section && section[path[i]];
      }
      if (!section) return;
      el.innerHTML =
        (section.tag ? '<span class="section-tag">' + escapeHtml(section.tag) + '</span>' : '') +
        (section.titleHtml ? '<h2>' + section.titleHtml + '</h2>' : '') +
        (section.subtitle ? '<p class="section-subtitle">' + escapeHtml(section.subtitle) + '</p>' : '');
    });
  }

  // ------------------------------------------------------------
  // 导航与页脚
  // ------------------------------------------------------------
  function isActive(item) {
    if (item.key === pageKey) return true;
    if (item.children) {
      return item.children.some(function (child) { return child.key === pageKey; });
    }
    return false;
  }

  function renderHeader() {
    var mount = $('[data-site-header]');
    if (!mount) return;
    var site = cfg.meta || {};
    var aiReady = !!(cfg.modules && cfg.modules.ai && cfg.ai && cfg.ai.endpoint);
    var faqReady = cfg.modules && cfg.modules.faq;
    var assistantLabel = aiReady ? 'AI 助手' : (faqReady ? '校务问答' : '');
    var assistantIcon = aiReady ? sparkleIcon() : chatIcon();

    var nav = (cfg.nav || []).map(function (item) {
      var active = isActive(item) ? ' active' : '';
      if (item.children && item.children.length) {
        var children = item.children.map(function (child) {
          return '<li role="none"><a href="' + escapeAttr(child.href) + '" role="menuitem"' +
            (child.key === pageKey ? ' class="active"' : '') + '>' + escapeHtml(child.label) + '</a></li>';
        }).join('');
        return '<li class="dropdown" role="none">' +
          '<a href="' + escapeAttr(item.children[0].href) + '" class="dropdown-toggle' + active + '" role="menuitem" aria-haspopup="true" aria-expanded="false">' +
          escapeHtml(item.label) + '</a>' +
          '<ul class="dropdown-menu" role="menu" aria-label="' + escapeAttr(item.label) + '子菜单">' + children + '</ul>' +
          '</li>';
      }
      return '<li role="none"><a href="' + escapeAttr(item.href) + '" role="menuitem" class="' + active.trim() + '">' +
        escapeHtml(item.label) + '</a></li>';
    }).join('');

    mount.innerHTML =
      '<nav class="navbar" role="banner" aria-label="主导航">' +
        '<div class="container">' +
          '<div class="logo">' +
            '<a href="index.html" aria-label="返回首页">' +
              '<img data-site-logo src="' + escapeAttr((cfg.brand && cfg.brand.logo) || '') + '" alt="' + escapeAttr((cfg.brand && cfg.brand.logoAlt) || site.siteName || '') + '">' +
            '</a>' +
            '<span class="logo-text">' + escapeHtml(site.siteName || '') + '</span>' +
          '</div>' +
          '<ul class="nav-links" role="menubar" aria-label="主菜单">' + nav + '</ul>' +
          '<div class="nav-actions">' +
            (assistantLabel
              ? '<button class="ai-trigger" type="button" id="ai-trigger" aria-label="打开' + escapeAttr(assistantLabel) + '" aria-expanded="false" aria-controls="' + (aiReady ? 'ai-chat-modal' : 'faq-modal') + '">' +
                  assistantIcon +
                  '<span class="ai-trigger-text">' + escapeHtml(assistantLabel) + '</span>' +
                  '<span class="ai-trigger-dot" aria-hidden="true"></span>' +
                '</button>'
              : '') +
            '<button class="hamburger" type="button" aria-label="打开菜单" aria-expanded="false" aria-controls="nav-links">' +
              '<span></span><span></span><span></span>' +
            '</button>' +
          '</div>' +
        '</div>' +
      '</nav>';
  }

  function sparkleIcon(size) {
    var s = size || 20;
    return '<svg class="ai-trigger-icon" width="' + s + '" height="' + s + '" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
      '<path d="M12 2L13.5 8.5L20 10L13.5 11.5L12 18L10.5 11.5L4 10L10.5 8.5L12 2Z"/>' +
      '<path d="M19 16L19.7 18.3L22 19L19.7 19.7L19 22L18.3 19.7L16 19L18.3 18.3L19 16Z" fill="currentColor"/>' +
      '</svg>';
  }

  function chatIcon() {
    return '<svg class="ai-trigger-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
      '<path d="M21 11.5a8.38 8.38 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7 8.38 8.38 0 01-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 01-.9-3.8 8.5 8.5 0 014.7-7.6 8.38 8.38 0 013.8-.9h.5a8.48 8.48 0 018 8v.5z"/>' +
      '</svg>';
  }

  function renderFooter() {
    var mount = $('[data-site-footer]');
    if (!mount) return;
    var site = cfg.meta || {};
    var contact = cfg.contact || {};
    var footer = cfg.footer || {};
    var links = (footer.quickLinks || []).map(function (link) {
      return '<li><a href="' + escapeAttr(link.href) + '">' + escapeHtml(link.label) + '</a></li>';
    }).join('');
    var copyright = footer.copyright || ('© ' + currentYear + ' ' + (site.siteName || '') + '. 保留所有权利。');
    var icp = footer.icp ? '<p class="footer-icp"><a href="https://beian.miit.gov.cn/" target="_blank" rel="noopener noreferrer">' + escapeHtml(footer.icp) + '</a></p>' : '';

    mount.innerHTML =
      '<footer class="footer" role="contentinfo">' +
        '<div class="container">' +
          '<div class="footer-content">' +
            '<div class="footer-info">' +
              '<h3>' + escapeHtml(site.siteName || '') + '</h3>' +
              '<p>' + escapeHtml(contact.address || '') + '</p>' +
              '<p>电话：' + escapeHtml(contact.phone || '') + '</p>' +
              '<p>邮箱：' + escapeHtml(contact.email || '') + '</p>' +
            '</div>' +
            '<div class="footer-links">' +
              '<h4>快速链接</h4>' +
              '<ul>' + links + '</ul>' +
            '</div>' +
            '<div class="footer-links">' +
              '<h4>联系我们</h4>' +
              '<ul>' +
                '<li><a href="mailto:' + escapeAttr(contact.email || '') + '">' + escapeHtml(contact.email || '') + '</a></li>' +
                '<li><a href="tel:' + escapeAttr(String(contact.phone || '').replace(/[^0-9+]/g, '')) + '">' + escapeHtml(contact.phone || '') + '</a></li>' +
                '<li><a href="mailbox.html">校长信箱</a></li>' +
                '<li><a href="changelog.html">更新日志</a></li>' +
              '</ul>' +
            '</div>' +
          '</div>' +
          '<div class="footer-bottom">' +
            '<p>' + escapeHtml(copyright) + '</p>' + icp +
          '</div>' +
        '</div>' +
      '</footer>';
  }

  // ------------------------------------------------------------
  // 模态框
  // ------------------------------------------------------------
  function renderModals() {
    var mount = $('[data-site-modals]');
    if (!mount) return;
    var html = '';
    var aiReady = !!(cfg.modules && cfg.modules.ai && cfg.ai && cfg.ai.endpoint);
    var faqReady = cfg.modules && cfg.modules.faq;

    if (aiReady) {
      var suggestions = ((cfg.ai && cfg.ai.suggestions) || []).map(function (item) {
        return '<button class="ai-suggestion" type="button" data-q="' + escapeAttr(item.question) + '">' + escapeHtml(item.label) + '</button>';
      }).join('');
      html +=
        '<div id="ai-chat-modal" class="ai-modal" role="dialog" aria-modal="true" aria-labelledby="ai-chat-title" aria-hidden="true">' +
          '<div class="ai-modal-card" role="document">' +
            '<header class="ai-modal-header">' +
              '<div class="ai-modal-title">' +
                '<div class="ai-avatar" aria-hidden="true">' + sparkleIcon(24) + '</div>' +
                '<div>' +
                  '<h2 id="ai-chat-title">' + escapeHtml((cfg.ai && cfg.ai.name) || 'AI 助手') + '</h2>' +
                  '<p class="ai-modal-subtitle"><span class="ai-status-dot" aria-hidden="true"></span><span id="ai-status-text">' +
                    escapeHtml((cfg.ai && cfg.ai.statusText) || '在线') + '</span></p>' +
                '</div>' +
              '</div>' +
              '<button class="ai-modal-close" type="button" id="ai-modal-close" aria-label="关闭 AI 助手">' + closeIcon() + '</button>' +
            '</header>' +
            '<div class="ai-modal-body" id="ai-chat-messages" aria-live="polite" aria-atomic="false"></div>' +
            '<footer class="ai-modal-footer">' +
              '<div class="ai-suggestions" id="ai-suggestions">' + suggestions + '</div>' +
              '<form class="ai-input-form" id="ai-input-form" autocomplete="off">' +
                '<input type="text" id="ai-input" name="q" placeholder="问我关于学校的任何问题..." aria-label="向 AI 助手提问" maxlength="500" required>' +
                '<button type="submit" class="ai-send-btn" id="ai-send-btn" aria-label="发送问题">' + sendIcon() + '</button>' +
              '</form>' +
              '<p class="ai-disclaimer">' + escapeHtml((cfg.ai && cfg.ai.disclaimer) || '回答由 AI 生成，仅供参考。') + '</p>' +
            '</footer>' +
          '</div>' +
        '</div>';
    }

    if (faqReady) {
      html +=
        '<div id="faq-modal" class="faq-modal" role="dialog" aria-modal="true" aria-labelledby="faq-modal-title" aria-hidden="true">' +
          '<div class="faq-modal-card" role="document">' +
            '<header class="faq-modal-header">' +
              '<div class="faq-modal-title">' +
                '<div class="faq-avatar" aria-hidden="true">📚</div>' +
                '<div>' +
                  '<h2 id="faq-modal-title">' + escapeHtml((cfg.faq && cfg.faq.title) || '校务问答') + '</h2>' +
                  '<p class="faq-modal-subtitle"><span class="faq-status-dot" aria-hidden="true"></span><span id="faq-status-text">加载中...</span></p>' +
                '</div>' +
              '</div>' +
              '<button class="faq-modal-close" type="button" id="faq-modal-close" aria-label="关闭校务问答">' + closeIcon() + '</button>' +
            '</header>' +
            '<div class="faq-modal-body" id="faq-chat-messages" aria-live="polite" aria-atomic="false"></div>' +
            '<footer class="faq-modal-footer">' +
              '<div class="faq-suggestions" id="faq-suggestions"></div>' +
              '<form class="faq-input-form" id="faq-input-form" autocomplete="off">' +
                '<input type="text" id="faq-input" name="q" placeholder="' + escapeAttr((cfg.faq && cfg.faq.placeholder) || '输入你的问题...') + '" aria-label="向校务问答提问" maxlength="200" required>' +
                '<button type="submit" class="faq-send-btn" id="faq-send-btn" aria-label="发送问题">' + sendIcon() + '</button>' +
              '</form>' +
              '<details class="faq-browse">' +
                '<summary>📖 浏览全部问题</summary>' +
                '<input type="text" id="faq-search-input" placeholder="🔍 筛选问题..." aria-label="筛选问题" maxlength="100" style="width:100%;padding:6px 10px;border:1px solid #e2e8f0;border-radius:6px;font-size:12px;margin-top:6px;outline:none;">' +
                '<div id="faq-list" class="faq-list"></div>' +
              '</details>' +
              '<p class="faq-disclaimer">' + escapeHtml((cfg.faq && cfg.faq.disclaimer) || '') + '</p>' +
            '</footer>' +
          '</div>' +
        '</div>';
    }

    if (cfg.modules && cfg.modules.mailbox) {
      html +=
        '<div class="mailbox-float-btn" id="mailbox-float-btn" role="button" tabindex="0" aria-label="打开校长信箱">' +
          '<span class="mailbox-icon" aria-hidden="true">📩</span>' +
          '<span class="mailbox-tooltip">校长信箱</span>' +
        '</div>';
    }

    mount.innerHTML = html;
  }

  function closeIcon() {
    return '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>';
  }

  function sendIcon() {
    return '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>';
  }

  var lastFocused = null;

  function openModal(modal) {
    if (!modal) return;
    lastFocused = document.activeElement;
    modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    var focusTarget = modal.querySelector('input, button');
    if (focusTarget) {
      setTimeout(function () { focusTarget.focus(); }, 50);
    }
  }

  function closeModal(modal) {
    if (!modal) return;
    modal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    if (lastFocused && typeof lastFocused.focus === 'function') lastFocused.focus();
  }

  function initModalBasics() {
    $$('.ai-modal, .faq-modal').forEach(function (modal) {
      modal.addEventListener('click', function (event) {
        if (event.target === modal) closeModal(modal);
      });
    });
    var closeButtons = ['#ai-modal-close', '#faq-modal-close'];
    closeButtons.forEach(function (selector) {
      var button = $(selector);
      if (button) {
        button.addEventListener('click', function () {
          closeModal(button.closest('.ai-modal, .faq-modal'));
        });
      }
    });
    document.addEventListener('keydown', function (event) {
      if (event.key === 'Escape') {
        $$('.ai-modal[aria-hidden="false"], .faq-modal[aria-hidden="false"]').forEach(closeModal);
      }
    });
  }

  // ------------------------------------------------------------
  // 公共交互
  // ------------------------------------------------------------
  function initMobileNav() {
    var hamburger = $('.hamburger');
    var navLinks = $('.nav-links');
    if (!hamburger || !navLinks) return;
    hamburger.addEventListener('click', function () {
      var open = navLinks.classList.toggle('active');
      hamburger.classList.toggle('active', open);
      hamburger.setAttribute('aria-expanded', String(open));
    });
    $$('.nav-links a').forEach(function (link) {
      link.addEventListener('click', function () {
        if (window.innerWidth <= 980) {
          navLinks.classList.remove('active');
          hamburger.classList.remove('active');
          hamburger.setAttribute('aria-expanded', 'false');
        }
      });
    });
    $$('.dropdown-toggle').forEach(function (toggle) {
      toggle.addEventListener('click', function (event) {
        if (window.innerWidth <= 980) {
          event.preventDefault();
          var dropdown = toggle.closest('.dropdown');
          var menu = dropdown && dropdown.querySelector('.dropdown-menu');
          if (menu) {
            var open = menu.style.display !== 'flex';
            menu.style.display = open ? 'flex' : 'none';
            toggle.setAttribute('aria-expanded', String(open));
          }
        }
      });
    });
  }

  function initCounters() {
    var numbers = $$('[data-target]');
    if (!numbers.length) return;
    var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    function animate(el) {
      if (el.dataset.counted === '1') return;
      el.dataset.counted = '1';
      var target = parseFloat(el.dataset.target || '0');
      var decimal = el.dataset.decimal === 'true' || !Number.isInteger(target);
      var suffix = el.dataset.suffix || '';
      var duration = reduceMotion ? 0 : 1200;
      var start = performance.now();
      function tick(now) {
        var progress = duration === 0 ? 1 : Math.min(1, (now - start) / duration);
        var eased = 1 - Math.pow(1 - progress, 3);
        var value = target * eased;
        el.textContent = (decimal
          ? value.toFixed(1)
          : (el.dataset.plain === 'true' ? String(Math.round(value)) : Math.round(value).toLocaleString('zh-CN'))) + suffix;
        if (progress < 1) requestAnimationFrame(tick);
      }
      requestAnimationFrame(tick);
    }

    if (!('IntersectionObserver' in window)) {
      numbers.forEach(animate);
      return;
    }
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          animate(entry.target);
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.2 });
    numbers.forEach(function (el) { observer.observe(el); });
  }

  function initCountdown() {
    var nodes = $$('[data-countdown]');
    if (!nodes.length) return;
    function update() {
      nodes.forEach(function (node) {
        var target = new Date(String(node.dataset.countdown).replace(/-/g, '/'));
        if (isNaN(target.getTime())) {
          node.textContent = '--';
          return;
        }
        var now = new Date();
        var next = new Date(target.getTime());
        while (next < now) next.setFullYear(next.getFullYear() + 1);
        var days = Math.ceil((next - now) / 86400000);
        node.textContent = String(Math.max(0, days));
      });
    }
    update();
    setInterval(update, 60000);
  }

  function initMailboxFloat() {
    var button = $('#mailbox-float-btn');
    if (!button) return;
    function go() {
      window.location.href = 'mailbox.html';
    }
    button.addEventListener('click', go);
    button.addEventListener('keydown', function (event) {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        go();
      }
    });
  }

  function initAnchors() {
    $$('a[href^="#"]').forEach(function (link) {
      link.addEventListener('click', function (event) {
        var id = link.getAttribute('href');
        if (!id || id === '#') return;
        var target = $(id);
        if (!target) return;
        event.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
    });
  }

  // ------------------------------------------------------------
  // 数据读取
  // ------------------------------------------------------------
  function endpointFor(name) {
    if (!apiBase) return '';
    if (name === 'news') return apiBase + '/api/content/news';
    if (name === 'announcements') return apiBase + '/api/content/announcements';
    if (name === 'admissions' || name === 'recruitments') return apiBase + '/api/content/recruitments';
    if (name === 'replies') return apiBase + '/api/mailbox/public';
    return '';
  }

  async function loadData(name) {
    if (dataCache.has(name)) return dataCache.get(name);
    var remote = endpointFor(name);
    var local = 'data/' + (name === 'admissions' ? 'recruitments' : name) + '.json';
    var urls = remote ? [remote, local] : [local];
    var lastError = null;

    for (var i = 0; i < urls.length; i += 1) {
      try {
        var response = await fetch(urls[i], { cache: 'no-store' });
        if (!response.ok) throw new Error('HTTP ' + response.status);
        var json = await response.json();
        if (json && json.items) json = json.items;
        if (json && json.versions) {
          // changelog 保持原结构
        }
        dataCache.set(name, json);
        return json;
      } catch (error) {
        lastError = error;
      }
    }
    console.warn('[site] 无法加载 ' + name + '，请用本地服务器打开页面。', lastError);
    dataCache.set(name, []);
    return [];
  }

  // ------------------------------------------------------------
  // 启动
  // ------------------------------------------------------------
  function boot() {
    applyTheme();
    renderHeader();
    renderFooter();
    renderModals();
    hydrateText();
    renderPageHero();
    hydrateSections();
    setMeta();
    initModalBasics();
    initMobileNav();
    initCounters();
    initCountdown();
    initMailboxFloat();
    initAnchors();
    document.dispatchEvent(new CustomEvent('site:ready'));
  }

  window.Site = {
    cfg: cfg,
    page: pageKey,
    apiBase: apiBase,
    $: $,
    $$: $$,
    escape: escapeHtml,
    escapeAttr: escapeAttr,
    formatDate: formatDate,
    relativeDate: relativeDate,
    md: mdToHtml,
    loadData: loadData,
    openModal: openModal,
    closeModal: closeModal,
    applyTheme: applyTheme,
    refreshCounters: initCounters,
    refreshCountdown: initCountdown,
    href: function (path) { return path; },
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
