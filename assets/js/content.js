/**
 * 页面内容渲染
 * 首页、学校简介、学校故事、新闻、公告、师资、校园风光、学子风采、
 * 招生简章、更新日志。所有列表内容来自 data/*.json。
 */
(function () {
  'use strict';

  var S = window.Site;
  if (!S) return;
  var cfg = S.cfg;
  var page = S.page;
  var $ = S.$;
  var $$ = S.$$;
  var esc = S.escape;
  var escAttr = S.escapeAttr;

  var ICONS = {
    book: '<path d="M4 19.5A2.5 2.5 0 016.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z"/>',
    users: '<path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/>',
    chart: '<line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/>',
    building: '<path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>',
    heart: '<path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/>',
    globe: '<circle cx="12" cy="12" r="10"/><path d="M2 12h20M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z"/>',
  };

  var CATEGORY_META = {
    all: { label: '全部', icon: '📋', color: '#64748b' },
    academic: { label: '教务通知', icon: '📚', color: '#2563eb' },
    affairs: { label: '校务通知', icon: '🏛️', color: '#7c3aed' },
    urgent: { label: '紧急通知', icon: '🚨', color: '#dc2626' },
    activity: { label: '活动通知', icon: '🎉', color: '#059669' },
    general: { label: '综合通知', icon: '📢', color: '#d97706' },
  };

  var TYPE_LABELS = {
    consultation: { label: '咨询', color: '#2563eb' },
    complaint: { label: '投诉', color: '#dc2626' },
    suggestion: { label: '建议', color: '#059669' },
    report: { label: '举报', color: '#7c3aed' },
  };

  // ------------------------------------------------------------
  // 通用
  // ------------------------------------------------------------
  function iconSvg(name, size) {
    var body = ICONS[name] || ICONS.book;
    var s = size || 32;
    return '<svg width="' + s + '" height="' + s + '" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + body + '</svg>';
  }

  function statCard(item) {
    var decimal = item.decimal ? ' data-decimal="true"' : '';
    var plain = item.plain ? ' data-plain="true"' : '';
    var suffix = item.suffix ? escAttr(item.suffix) : '';
    var initial = formatStatValue(item.value, item);
    return '<div class="stat-card">' +
      '<div class="stat-number" data-target="' + escAttr(item.value) + '"' + decimal + plain + '>' + esc(initial) + '</div>' +
      '<div class="stat-suffix">' + esc(suffix) + '</div>' +
      '<div class="stat-label">' + esc(item.label) + '</div>' +
      '</div>';
  }

  function formatStatValue(value, item) {
    if (item.decimal) return Number(value).toFixed(1);
    if (item.plain) return String(Math.round(Number(value)));
    return Number(value).toLocaleString('zh-CN');
  }

  function renderStats(selector, items) {
    var el = $(selector);
    if (!el || !items) return;
    el.innerHTML = items.map(statCard).join('');
  }

  function emptyState(icon, title, hint, className) {
    return '<div class="' + (className || 'public-replies-empty') + '">' +
      '<div class="' + (className || 'public-replies-empty') + '-icon">' + icon + '</div>' +
      '<p>' + esc(title) + '</p>' +
      (hint ? '<p class="' + (className || 'public-replies-empty') + '-hint">' + esc(hint) + '</p>' : '') +
      '</div>';
  }

  function ensureDetailModal() {
    var modal = $('#detail-modal');
    if (modal) return modal;
    modal = document.createElement('div');
    modal.id = 'detail-modal';
    modal.className = 'news-modal';
    modal.setAttribute('role', 'dialog');
    modal.setAttribute('aria-modal', 'true');
    modal.setAttribute('aria-hidden', 'true');
    modal.innerHTML =
      '<div class="modal-content">' +
        '<button class="close-modal" type="button" aria-label="关闭详情">&times;</button>' +
        '<div class="modal-body" id="detail-body"></div>' +
      '</div>';
    document.body.appendChild(modal);
    modal.addEventListener('click', function (event) {
      if (event.target === modal) closeDetail();
    });
    modal.querySelector('.close-modal').addEventListener('click', closeDetail);
    document.addEventListener('keydown', function (event) {
      if (event.key === 'Escape' && modal.getAttribute('aria-hidden') === 'false') closeDetail();
    });
    return modal;
  }

  function closeDetail() {
    var modal = $('#detail-modal');
    if (!modal) return;
    modal.style.display = 'none';
    modal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  function openDetail(options) {
    var modal = ensureDetailModal();
    var body = $('#detail-body');
    body.innerHTML =
      '<div class="news-detail-header">' +
        (options.tag ? '<span class="news-detail-category">' + esc(options.tag) + '</span>' : '') +
        (options.date ? '<span class="news-detail-date">' + esc(options.date) + '</span>' : '') +
      '</div>' +
      '<h2 style="font-size:26px;line-height:1.4;margin:8px 0 16px;">' + esc(options.title) + '</h2>' +
      (options.meta ? '<p class="news-date" style="margin-bottom:16px;">' + esc(options.meta) + '</p>' : '') +
      (options.image ? '<div class="news-detail-image"><img src="' + escAttr(options.image) + '" alt="' + escAttr(options.title) + '" loading="lazy"></div>' : '') +
      '<div class="news-detail-content">' + S.md(options.content || '') + '</div>' +
      (options.extra || '');
    modal.style.display = 'flex';
    modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    modal.scrollTop = 0;
  }

  // ------------------------------------------------------------
  // 首页
  // ------------------------------------------------------------
  function renderHero() {
    var hero = cfg.hero || {};
    var stats = $('#hero-stats');
    if (stats) {
      stats.innerHTML = (hero.stats || []).map(function (item, index) {
        var initial = formatStatValue(item.value, item);
        return (index ? '<div class="hero-stat-divider"></div>' : '') +
          '<div class="hero-stat">' +
            '<div class="hero-stat-num" data-target="' + escAttr(item.value) + '" data-suffix="' + escAttr(item.suffix || '') + '"' + (item.decimal ? ' data-decimal="true"' : '') + (item.plain ? ' data-plain="true"' : '') + '>' + esc(initial + (item.suffix || '')) + '</div>' +
            '<div class="hero-stat-label">' + esc(item.label) + '</div>' +
          '</div>';
      }).join('');
    }
    var badge = $('#hero-badge-text');
    if (badge) badge.textContent = hero.badge || '';
    var title = $('#hero-title');
    if (title) {
      title.innerHTML = (hero.titleLines || []).map(function (line) {
        return '<span class="hero-title-main">' + esc(line) + '</span>';
      }).join('<span class="hero-title-divider">' + esc(hero.divider || '·') + '</span>');
    }
    var en = $('#hero-subtitle-en');
    if (en) en.textContent = hero.subtitleEn || '';
    var cn = $('#hero-subtitle-cn');
    if (cn) cn.textContent = hero.subtitleCn || '';
    var actions = $('#hero-actions');
    if (actions) {
      actions.innerHTML = (hero.actions || []).map(function (action) {
        return '<a href="' + escAttr(action.href) + '" class="hero-btn hero-btn-' + (action.style || 'primary') + '">' +
          '<span>' + esc(action.label) + '</span>' +
          '</a>';
      }).join('');
    }
  }

  function renderHomeAbout() {
    var about = cfg.about || {};
    var text = $('#home-about-text');
    if (text) {
      text.innerHTML = (about.paragraphs || []).slice(0, 2).map(function (p) {
        return '<p>' + esc(p) + '</p>';
      }).join('') +
        '<a href="about.html" class="hero-btn hero-btn-primary" style="margin-top:24px;"><span>了解更多</span></a>';
    }
    var image = $('#home-about-image');
    if (image && about.image) {
      image.innerHTML = '<img src="' + escAttr(about.image) + '" alt="' + escAttr(about.imageAlt || '') + '" loading="lazy">';
    }
  }

  function renderFeatures() {
    var grid = $('#features-grid');
    if (!grid) return;
    grid.innerHTML = (cfg.features || []).map(function (item) {
      return '<div class="feature-card">' +
        '<div class="feature-icon">' + iconSvg(item.icon) + '</div>' +
        '<h3>' + esc(item.title) + '</h3>' +
        '<p>' + esc(item.desc) + '</p>' +
        '</div>';
    }).join('');
  }

  function newsCard(item, preview) {
    var href = preview ? 'news.html' : '#';
    return '<a href="' + href + '" class="news-item" data-news-id="' + escAttr(item.id) + '">' +
      '<div class="news-image">' +
        '<img src="' + escAttr(item.image || 'assets/img/news-1.svg') + '" alt="' + escAttr(item.title) + '" loading="lazy">' +
        '<span class="news-tag">' + esc(item.category || '校园动态') + '</span>' +
      '</div>' +
      '<div class="news-content">' +
        '<h3>' + esc(item.title) + '</h3>' +
        '<p class="news-date">' + esc(S.formatDate(item.date)) + '</p>' +
        '<p>' + esc(item.summary || '') + '</p>' +
        '<span class="news-arrow">阅读更多 →</span>' +
      '</div>' +
      '</a>';
  }

  function renderHomeNews(items) {
    var grid = $('#home-news-grid');
    if (!grid) return;
    grid.innerHTML = (items || []).slice(0, 3).map(function (item) {
      return newsCard(item, true);
    }).join('');
  }

  function renderHomeGallery(items) {
    var grid = $('#home-gallery-grid');
    if (!grid) return;
    var html = (items || []).slice(0, 4).map(function (item, index) {
      return '<a href="gallery.html" class="gallery-card' + (index === 0 ? ' gallery-card-large' : '') + '">' +
        '<img src="' + escAttr(item.image) + '" alt="' + escAttr(item.title) + '" loading="lazy">' +
        '<div class="gallery-overlay">' +
          '<span class="gallery-tag">' + esc(item.tag || '校园') + '</span>' +
          '<h3>' + esc(item.title) + '</h3>' +
          '<p>' + esc(item.desc || '') + '</p>' +
        '</div>' +
        '</a>';
    }).join('');
    html += '<a href="students.html" class="gallery-card gallery-card-cta">' +
      '<div class="gallery-cta-content">' +
        '<div class="gallery-cta-icon">→</div>' +
        '<h3>查看更多学子风采</h3>' +
        '<p>探索校园生活的精彩瞬间</p>' +
      '</div>' +
      '</a>';
    grid.innerHTML = html;
  }

  function renderCountdown() {
    var grid = $('#countdown-grid');
    if (!grid) return;
    var section = cfg.sections.countdown || {};
    grid.innerHTML = (section.items || []).map(function (item) {
      return '<div class="countdown-item">' +
        '<div class="countdown-icon">' + esc(item.icon || '📅') + '</div>' +
        '<h3>' + esc(item.label) + '</h3>' +
        '<div class="countdown-number" data-countdown="' + escAttr(item.date) + '">--</div>' +
        '<p>天</p>' +
        '</div>';
    }).join('');
  }

  function announcementPreviewCard(item) {
    var meta = CATEGORY_META[item.category] || CATEGORY_META.general;
    var classes = [item.pinned ? 'is-pinned' : '', item.urgent ? 'is-urgent' : ''].filter(Boolean).join(' ');
    var summary = (item.summary || item.content || '').split('\n')[0].slice(0, 80);
    return '<a href="announcements.html" class="home-announce-card ' + classes + '">' +
      '<div class="home-announce-card-head">' +
        '<span class="home-announce-cat">' + meta.icon + ' ' + esc(meta.label.replace('通知', '')) + '</span>' +
        (item.pinned ? '<span class="home-announce-tag pinned">📌 置顶</span>' : '') +
        (item.urgent ? '<span class="home-announce-tag urgent">🚨 紧急</span>' : '') +
        '<span class="home-announce-date">📅 ' + esc(S.formatDate(item.date)) + '</span>' +
      '</div>' +
      '<h3 class="home-announce-title">' + esc(item.title) + '</h3>' +
      '<p class="home-announce-summary">' + esc(summary) + '…</p>' +
      '<span class="home-announce-arrow">查看详情 →</span>' +
      '</a>';
  }

  function renderHomeAnnouncements(items) {
    var list = $('#home-announce-list');
    if (!list) return;
    if (!items || !items.length) {
      list.innerHTML = emptyState('📭', '暂无公告', '在 data/announcements.json 中添加第一条公告', 'home-announce-empty');
      return;
    }
    var sorted = items.slice().sort(function (a, b) {
      var pa = a.pinned ? 1 : 0;
      var pb = b.pinned ? 1 : 0;
      if (pa !== pb) return pb - pa;
      return String(b.date || '').localeCompare(String(a.date || ''));
    });
    list.innerHTML = sorted.slice(0, 3).map(announcementPreviewCard).join('');
  }

  function renderPublicReplies(items) {
    var grid = $('#public-replies-grid');
    if (!grid) return;
    if (!items || !items.length) {
      grid.innerHTML = emptyState('💬', '暂无公开回复', '校长处理并公开后的回复会显示在这里', 'public-replies-empty');
      return;
    }
    grid.innerHTML = items.slice(0, 3).map(function (item) {
      var type = TYPE_LABELS[item.type] || TYPE_LABELS.suggestion;
      var question = item.question || item.message_preview || item.content || '';
      var answer = item.answer || item.reply || '';
      var date = S.formatDate(item.date || item.reply_time || '');
      return '<div class="public-reply-card">' +
        '<div class="public-reply-header">' +
          '<span class="public-reply-type" style="background:' + type.color + '15;color:' + type.color + ';">' + esc(type.label) + '</span>' +
          '<span class="public-reply-date">' + esc(date) + '</span>' +
        '</div>' +
        '<div class="public-reply-question">' +
          '<div class="public-reply-q-label">来信</div>' +
          '<div class="public-reply-q-content">' + esc(question) + '</div>' +
        '</div>' +
        '<div class="public-reply-answer">' +
          '<div class="public-reply-a-label">回复</div>' +
          '<div class="public-reply-a-content">' + esc(answer) + '</div>' +
        '</div>' +
        '</div>';
    }).join('');
  }

  function renderLinks(items) {
    var grid = $('#links-grid');
    if (!grid) return;
    grid.innerHTML = (items || []).map(function (item) {
      return '<a href="' + escAttr(item.url) + '" target="_blank" rel="noopener noreferrer" class="link-card">' +
        '<div class="link-icon" aria-hidden="true">' + esc(item.icon || '🔗') + '</div>' +
        '<span class="link-text">' + esc(item.label) + '</span>' +
        '</a>';
    }).join('');
  }

  async function initHome() {
    renderHero();
    renderHomeAbout();
    renderFeatures();
    renderCountdown();
    var results = await Promise.all([
      S.loadData('news'),
      S.loadData('announcements'),
      S.loadData('gallery'),
      S.loadData('replies'),
      S.loadData('links'),
    ]);
    renderHomeNews(results[0]);
    renderHomeGallery(results[2]);
    renderHomeAnnouncements(results[1]);
    renderPublicReplies(results[3]);
    renderLinks(results[4]);
  }

  // ------------------------------------------------------------
  // 学校简介
  // ------------------------------------------------------------
  function initAbout() {
    var about = cfg.about || {};
    renderStats('#about-stats', cfg.stats && cfg.stats.about);
    var paragraphs = $('#about-detail-body');
    if (paragraphs) {
      paragraphs.innerHTML = (about.detailParagraphs || []).map(function (p) {
        return '<p>' + esc(p) + '</p>';
      }).join('');
    }
    var values = $('#about-values');
    if (values) {
      values.innerHTML = (about.values || []).map(function (item) {
        return '<div class="detail-block">' +
          '<div class="detail-block-icon" style="font-size:24px;">' + esc(item.icon || '✦') + '</div>' +
          '<h3>' + esc(item.title) + '</h3>' +
          '<p>' + esc(item.desc) + '</p>' +
          '</div>';
      }).join('');
    }
    var mottoTitle = $('#motto-title');
    if (mottoTitle && about.motto) mottoTitle.textContent = about.motto.title;
    var mottoDesc = $('#motto-desc');
    if (mottoDesc && about.motto) mottoDesc.textContent = about.motto.desc;
    var image = $('#about-image');
    if (image && about.image) image.innerHTML = '<img src="' + escAttr(about.image) + '" alt="' + escAttr(about.imageAlt || '') + '" loading="lazy">';
  }

  // ------------------------------------------------------------
  // 学校故事
  // ------------------------------------------------------------
  function initStory() {
    var story = cfg.story || {};
    var portrait = story.portrait || {};
    var card = $('#story-portrait');
    if (card) {
      card.innerHTML =
        '<div class="portrait-card">' +
          '<div class="portrait-image">' +
            '<img src="' + escAttr(portrait.image || 'assets/img/teacher-1.svg') + '" alt="' + escAttr(portrait.name || '') + '" loading="lazy">' +
            '<span class="portrait-badge">TEACHER STORY</span>' +
          '</div>' +
          '<div class="portrait-content">' +
            '<span class="portrait-tag">Teacher Story</span>' +
            '<h2>' + esc(portrait.name || '') + '</h2>' +
            '<p class="portrait-subtitle">' + esc(portrait.role || '') + '</p>' +
            '<div class="portrait-quote"><p>' + esc(portrait.quote || '') + '</p></div>' +
            (portrait.paragraphs || []).map(function (p) { return '<p>' + esc(p) + '</p>'; }).join('') +
          '</div>' +
        '</div>';
    }
    var spirit = $('#spirit-cards');
    if (spirit) {
      spirit.innerHTML = ((story.spirit && story.spirit.cards) || []).map(function (item) {
        return '<div class="spirit-card">' +
          '<div class="spirit-icon">' + esc(item.icon || '✦') + '</div>' +
          '<h4>' + esc(item.title) + '</h4>' +
          '<p>' + esc(item.desc) + '</p>' +
          '</div>';
      }).join('');
    }
    var cta = $('#story-cta');
    if (cta && story.cta) {
      cta.innerHTML = '<h2>' + esc(story.cta.title) + '</h2>' +
        '<p>' + esc(story.cta.desc) + '</p>' +
        '<a href="' + escAttr(story.cta.action.href) + '" class="hero-btn hero-btn-primary"><span>' + esc(story.cta.action.label) + '</span></a>';
    }
    S.loadData('timeline').then(function (items) {
      var timeline = $('#story-timeline');
      if (!timeline) return;
      timeline.innerHTML = (items || []).map(function (item) {
        return '<div class="timeline-item">' +
          '<div class="timeline-year">' + esc(item.year) + '</div>' +
          '<div class="timeline-content">' +
            '<h4>' + esc(item.title) + '</h4>' +
            '<p>' + esc(item.desc) + '</p>' +
          '</div>' +
          '</div>';
      }).join('');
    });
  }

  // ------------------------------------------------------------
  // 新闻
  // ------------------------------------------------------------
  function initNews() {
    var grid = $('#news-grid');
    if (!grid) return;
    S.loadData('news').then(function (items) {
      var sorted = (items || []).slice().sort(function (a, b) {
        return String(b.date || '').localeCompare(String(a.date || ''));
      });
      if (!sorted.length) {
        grid.innerHTML = '<p class="error-message">暂无新闻，请在 data/news.json 中添加。</p>';
        return;
      }
      grid.innerHTML = sorted.map(function (item) {
        return '<article class="news-card" data-news-id="' + escAttr(item.id) + '" tabindex="0" role="button" aria-label="阅读：' + escAttr(item.title) + '">' +
          '<div class="news-image">' +
            '<img src="' + escAttr(item.image || 'assets/img/news-1.svg') + '" alt="' + escAttr(item.title) + '" loading="lazy">' +
            (item.isNew ? '<span class="new-badge">最新</span>' : '') +
            '<span class="news-category-badge">' + esc(item.category || '校园动态') + '</span>' +
          '</div>' +
          '<div class="news-content">' +
            '<h3 class="news-title">' + esc(item.title) + '</h3>' +
            '<p class="news-date">📅 ' + esc(S.formatDate(item.date)) + '</p>' +
            '<p class="news-summary">' + esc(item.summary || '') + '</p>' +
            '<span class="news-arrow">阅读详情 →</span>' +
          '</div>' +
          '</article>';
      }).join('');
      $$('.news-card', grid).forEach(function (card) {
        function open() {
          var item = sorted.find(function (x) { return String(x.id) === card.dataset.newsId; });
          if (item) openDetail({ tag: item.category, date: S.formatDate(item.date), title: item.title, image: item.image, content: item.content });
        }
        card.addEventListener('click', open);
        card.addEventListener('keydown', function (event) {
          if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); open(); }
        });
      });
    });
  }

  // ------------------------------------------------------------
  // 公告
  // ------------------------------------------------------------
  function initAnnouncements() {
    var list = $('#announcement-list');
    if (!list) return;
    S.loadData('announcements').then(function (items) {
      var all = items || [];
      var current = 'all';

      function renderFilters() {
        var filters = $('#announcement-filters');
        if (!filters) return;
        var categories = ['all'];
        all.forEach(function (item) {
          if (item.category && categories.indexOf(item.category) === -1) categories.push(item.category);
        });
        filters.innerHTML = categories.map(function (key) {
          var meta = CATEGORY_META[key] || CATEGORY_META.general;
          return '<button class="announcement-filter' + (key === current ? ' active' : '') + '" type="button" data-category="' + escAttr(key) + '" role="tab">' +
            '<span class="announcement-filter-icon">' + meta.icon + '</span><span>' + esc(meta.label) + '</span>' +
            '</button>';
        }).join('');
        $$('.announcement-filter', filters).forEach(function (button) {
          button.addEventListener('click', function () {
            current = button.dataset.category;
            renderFilters();
            renderList();
          });
        });
      }

      function renderList() {
        var filtered = current === 'all' ? all.slice() : all.filter(function (item) { return item.category === current; });
        filtered.sort(function (a, b) {
          var pa = a.pinned ? 1 : 0;
          var pb = b.pinned ? 1 : 0;
          if (pa !== pb) return pb - pa;
          return String(b.date || '').localeCompare(String(a.date || ''));
        });
        var empty = $('#announcement-empty');
        if (!filtered.length) {
          list.innerHTML = '';
          if (empty) empty.style.display = 'block';
          return;
        }
        if (empty) empty.style.display = 'none';
        list.innerHTML = filtered.map(function (item) {
          var meta = CATEGORY_META[item.category] || CATEGORY_META.general;
          var summary = (item.summary || item.content || '').split('\n')[0].slice(0, 90);
          return '<article class="announcement-card ' + (item.urgent ? 'is-urgent' : '') + ' ' + (item.pinned ? 'is-pinned' : '') + '" data-id="' + escAttr(item.id) + '" tabindex="0" role="button" aria-label="查看公告：' + escAttr(item.title) + '">' +
            '<div class="announcement-card-left" aria-hidden="true"><div class="announcement-card-date">' +
              '<span class="announcement-card-day">' + esc(String(item.date || '').slice(8, 10) || '--') + '</span>' +
              '<span class="announcement-card-month">' + esc(String(item.date || '').slice(5, 7) || '--') + '月</span>' +
            '</div></div>' +
            '<div class="announcement-card-body">' +
              '<div class="announcement-card-meta">' +
                '<span class="announcement-card-category" style="color:' + meta.color + ';background:' + meta.color + '12;">' + esc(meta.label) + '</span>' +
                (item.pinned ? '<span class="announcement-card-badge pinned">📌 置顶</span>' : '') +
                (item.urgent ? '<span class="announcement-card-badge urgent">🚨 紧急</span>' : '') +
                '<span class="announcement-card-author">发布人：' + esc(item.author || '校务办公室') + '</span>' +
              '</div>' +
              '<h3 class="announcement-card-title">' + esc(item.title) + '</h3>' +
              '<p class="announcement-card-summary">' + esc(summary) + '…</p>' +
              '<span class="announcement-card-arrow">查看详情 →</span>' +
            '</div>' +
            '</article>';
        }).join('');
        $$('.announcement-card', list).forEach(function (card) {
          function open() {
            var item = all.find(function (x) { return String(x.id) === card.dataset.id; });
            if (!item) return;
            openDetail({
              tag: (CATEGORY_META[item.category] || CATEGORY_META.general).label,
              date: S.formatDate(item.date),
              title: item.title,
              meta: '发布人：' + (item.author || '校务办公室'),
              content: item.content,
            });
          }
          card.addEventListener('click', open);
          card.addEventListener('keydown', function (event) {
            if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); open(); }
          });
        });
      }

      renderFilters();
      renderList();
    });
  }

  // ------------------------------------------------------------
  // 师资
  // ------------------------------------------------------------
  function initTeachers() {
    renderStats('#teachers-stats', cfg.stats && cfg.stats.teachers);
    var grid = $('#teachers-grid');
    if (!grid) return;
    S.loadData('teachers').then(function (items) {
      grid.innerHTML = (items || []).map(function (item) {
        return '<div class="teacher-card">' +
          '<div class="teacher-image">' +
            '<img src="' + escAttr(item.image || 'assets/img/teacher-1.svg') + '" alt="' + escAttr(item.name) + '" loading="lazy">' +
            (item.badge ? '<span class="teacher-badge">' + esc(item.badge) + '</span>' : '') +
          '</div>' +
          '<div class="teacher-info">' +
            '<h3>' + esc(item.name) + '</h3>' +
            '<p class="teacher-subject">' + esc(item.subject) + '</p>' +
            '<p class="teacher-desc">' + esc(item.desc) + '</p>' +
            '<div class="teacher-stats">' + (item.stats || []).map(function (stat) { return '<span>' + esc(stat) + '</span>'; }).join('') + '</div>' +
          '</div>' +
          '</div>';
      }).join('');
    });
  }

  // ------------------------------------------------------------
  // 校园风光
  // ------------------------------------------------------------
  function initGallery() {
    var grid = $('#gallery-grid');
    if (!grid) return;
    S.loadData('gallery').then(function (items) {
      var all = items || [];
      var current = 'all';
      var filters = $('#gallery-filter');

      function render() {
        var list = current === 'all' ? all : all.filter(function (item) { return item.category === current; });
        grid.innerHTML = list.map(function (item) {
          var tall = item.tall ? ' gallery-item-tall' : '';
          return '<div class="gallery-item' + tall + '" data-category="' + escAttr(item.category) + '" data-image="' + escAttr(item.image) + '" data-title="' + escAttr(item.title) + '" tabindex="0" role="button" aria-label="查看图片：' + escAttr(item.title) + '">' +
            '<img src="' + escAttr(item.image) + '" alt="' + escAttr(item.title) + '" loading="lazy">' +
            '<div class="gallery-overlay">' +
              '<span class="gallery-tag">' + esc(item.tag || '校园') + '</span>' +
              '<h3>' + esc(item.title) + '</h3>' +
              '<p>' + esc(item.desc || '') + '</p>' +
            '</div>' +
            '</div>';
        }).join('');
        $$('.gallery-item', grid).forEach(bindLightbox);
      }

      if (filters) {
        var labels = { all: '全部', building: '建筑', nature: '自然', sports: '运动', life: '生活' };
        var keys = ['all'];
        all.forEach(function (item) { if (item.category && keys.indexOf(item.category) === -1) keys.push(item.category); });
        filters.innerHTML = keys.map(function (key) {
          return '<button class="filter-btn' + (key === current ? ' active' : '') + '" type="button" data-filter="' + escAttr(key) + '">' + esc(labels[key] || key) + '</button>';
        }).join('');
        $$('.filter-btn', filters).forEach(function (button) {
          button.addEventListener('click', function () {
            current = button.dataset.filter;
            $$('.filter-btn', filters).forEach(function (b) { b.classList.remove('active'); });
            button.classList.add('active');
            render();
          });
        });
      }

      function bindLightbox(item) {
        function open() {
          openDetail({ title: item.dataset.title, image: item.dataset.image, content: '' });
        }
        item.addEventListener('click', open);
        item.addEventListener('keydown', function (event) {
          if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); open(); }
        });
      }

      render();
    });

    S.loadData('facilities').then(function (items) {
      var cloud = $('#facilities-cloud');
      if (!cloud) return;
      cloud.innerHTML = (items || []).map(function (item) {
        return '<div class="facility-chip"><span class="chip-icon">' + esc(item.icon || '🏫') + '</span><span>' + esc(item.label) + '</span></div>';
      }).join('');
    });
  }

  // ------------------------------------------------------------
  // 学子风采
  // ------------------------------------------------------------
  function initStudents() {
    renderStats('#students-stats', cfg.stats && cfg.stats.students);
    var grid = $('#students-grid');
    if (!grid) return;

    S.loadData('students').then(function (items) {
      var all = items || [];
      var current = 'all';
      function render() {
        var list = current === 'all' ? all : all.filter(function (item) { return item.category === current; });
        grid.innerHTML = list.map(function (item) {
          return '<div class="student-card" data-category="' + escAttr(item.category) + '">' +
            '<div class="student-image">' +
              '<img src="' + escAttr(item.image || 'assets/img/student-1.svg') + '" alt="' + escAttr(item.name) + '" loading="lazy">' +
              (item.medal ? '<div class="student-medal"><span>🏆</span><span>' + esc(item.medal) + '</span></div>' : '') +
            '</div>' +
            '<div class="student-info">' +
              '<h3 class="student-name">' + esc(item.name) + '</h3>' +
              '<p class="student-project">' + esc(item.project) + '</p>' +
              '<div class="student-description"><p>' + esc(item.description) + '</p></div>' +
              '<div class="student-tags">' + (item.tags || []).map(function (tag) { return '<span class="student-tag">' + esc(tag) + '</span>'; }).join('') + '</div>' +
            '</div>' +
            '</div>';
        }).join('');
      }
      $$('.category-tab').forEach(function (tab) {
        tab.addEventListener('click', function () {
          $$('.category-tab').forEach(function (x) { x.classList.remove('active'); });
          tab.classList.add('active');
          current = tab.dataset.category;
          render();
        });
      });
      render();
    });

    S.loadData('clubs').then(function (items) {
      var gridClubs = $('#clubs-grid');
      if (!gridClubs) return;
      gridClubs.innerHTML = (items || []).map(function (item) {
        return '<div class="club-card">' +
          '<div class="club-icon">' + esc(item.icon || '🎭') + '</div>' +
          '<h4>' + esc(item.name) + '</h4>' +
          '<p>' + esc(item.desc) + '</p>' +
          '</div>';
      }).join('');
    });
  }

  // ------------------------------------------------------------
  // 招生
  // ------------------------------------------------------------
  function initAdmission() {
    renderStats('#admission-stats', cfg.stats && cfg.stats.admission);
    var list = $('#recruitment-list');
    if (!list) return;
    var input = $('#recruitment-search-input');
    var clear = $('#recruitment-search-clear');
    var meta = $('#recruitment-search-meta');
    var all = [];

    function render(keyword) {
      var q = String(keyword || '').trim().toLowerCase();
      var filtered = all.filter(function (item) {
        if (!q) return true;
        return [item.title, item.summary, item.content, item.year, (item.tags || []).join(' ')].join(' ').toLowerCase().indexOf(q) !== -1;
      });
      if (meta) {
        meta.textContent = q ? '匹配到 ' + filtered.length + ' 份（关键词：' + keyword + '）' : '共 ' + all.length + ' 份简章';
      }
      if (!filtered.length) {
        list.innerHTML = '<div class="announcement-empty" style="display:block;"><div class="announcement-empty-icon">📄</div><p>没有找到相关简章</p></div>';
        return;
      }
      list.innerHTML = filtered.map(function (item) {
        return '<article class="recruitment-item" data-id="' + escAttr(item.id || item.year) + '" tabindex="0" role="button">' +
          '<div class="recruitment-info">' +
            '<div class="recruitment-header">' +
              '<span class="recruitment-year">' + esc(item.year) + '</span>' +
              '<h3 class="recruitment-title">' + esc(item.title) + '</h3>' +
            '</div>' +
            '<p style="color:var(--text-secondary);font-size:14px;line-height:1.7;margin:8px 0;">' + esc(item.summary || '') + '</p>' +
            '<div class="recruitment-tags">' + (item.tags || []).map(function (tag) { return '<span>' + esc(tag) + '</span>'; }).join('') + '</div>' +
          '</div>' +
          '<span class="recruitment-arrow">查看详情 →</span>' +
          '</article>';
      }).join('');
      $$('.recruitment-item', list).forEach(function (card) {
        function open() {
          var item = filtered.find(function (x) { return String(x.id || x.year) === card.dataset.id; });
          if (!item) return;
          var extra = '';
          if (item.file) {
            var fileUrl = S.apiBase ? S.apiBase + '/api/content/file/' + encodeURIComponent(item.file) : 'files/' + encodeURIComponent(item.file);
            extra += '<p style="margin-top:24px;"><a class="hero-btn hero-btn-primary" href="' + escAttr(fileUrl) + '" target="_blank" rel="noopener noreferrer"><span>下载简章文件</span></a></p>';
          }
          openDetail({ tag: '招生简章', date: S.formatDate(item.date), title: item.title, image: item.image, content: item.content, extra: extra });
        }
        card.addEventListener('click', open);
        card.addEventListener('keydown', function (event) {
          if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); open(); }
        });
      });
    }

    if (input) {
      input.addEventListener('input', function () { render(input.value); });
    }
    if (clear) {
      clear.addEventListener('click', function () {
        if (input) input.value = '';
        render('');
        if (input) input.focus();
      });
    }

    S.loadData('admissions').then(function (items) {
      all = (items || []).slice().sort(function (a, b) { return Number(b.year || 0) - Number(a.year || 0); });
      render('');
    });
  }

  // ------------------------------------------------------------
  // 更新日志
  // ------------------------------------------------------------
  function initChangelog() {
    var list = $('#changelog-list');
    if (!list) return;
    S.loadData('changelog').then(function (data) {
      var versions = (data && data.versions) || [];
      if (!versions.length) {
        list.innerHTML = emptyState('📝', '暂无更新记录', '', 'public-replies-empty');
        return;
      }
      var typeMeta = {
        feature: { label: '新功能', color: '#10b981', icon: '✨' },
        improvement: { label: '优化', color: '#2563eb', icon: '⚡' },
        fix: { label: '修复', color: '#f59e0b', icon: '🐛' },
        security: { label: '安全', color: '#ef4444', icon: '🔒' },
      };
      list.innerHTML = versions.map(function (item, index) {
        return '<article class="changelog-version changelog-version-' + (index % 2 === 0 ? 'left' : 'right') + '">' +
          '<div class="changelog-version-dot" aria-hidden="true"></div>' +
          '<div class="changelog-version-card">' +
            '<header class="changelog-version-header">' +
              '<span class="changelog-version-badge">' + esc(item.version) + '</span>' +
              '<h2 class="changelog-version-title">' + esc(item.title) + '</h2>' +
              '<time class="changelog-version-date">' + esc(item.date) + '</time>' +
            '</header>' +
            '<p class="changelog-version-summary">' + esc(item.summary || '') + '</p>' +
            '<ul class="changelog-changes">' + (item.changes || []).map(function (change) {
              var meta = typeMeta[change.type] || typeMeta.improvement;
              return '<li class="changelog-change changelog-change-' + escAttr(change.type) + '">' +
                '<span class="changelog-change-icon" aria-hidden="true">' + meta.icon + '</span>' +
                '<span class="changelog-change-type" style="background:' + meta.color + '15;color:' + meta.color + ';">' + esc(meta.label) + '</span>' +
                '<span class="changelog-change-text">' + esc(change.text) + '</span>' +
                '</li>';
            }).join('') + '</ul>' +
          '</div>' +
          '</article>';
      }).join('');
    });
  }

  // ------------------------------------------------------------
  // 启动
  // ------------------------------------------------------------
  function init() {
    var tasks = {
      home: initHome,
      about: initAbout,
      story: initStory,
      news: initNews,
      announcements: initAnnouncements,
      teachers: initTeachers,
      gallery: initGallery,
      students: initStudents,
      admission: initAdmission,
      changelog: initChangelog,
    };
    if (tasks[page]) {
      Promise.resolve(tasks[page]()).catch(function (error) {
        console.error('[content] 页面渲染失败', error);
      });
    }
    // 内容渲染完成后再启动数字动画与倒计时
    setTimeout(function () {
      if (S.refreshCounters) S.refreshCounters();
      if (S.refreshCountdown) S.refreshCountdown();
    }, 80);
  }

  document.addEventListener('DOMContentLoaded', init);
})();
