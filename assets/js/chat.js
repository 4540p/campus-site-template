/**
 * 校务问答 + AI 助手
 * - 未配置 ai.endpoint：使用 data/faq.json 做本地关键词检索
 * - 配置 ai.endpoint：调用后端 /api/chat（也兼容任意返回 {answer} 的接口）
 * - 两种模式共用同一个入口按钮，部署时无需改页面
 */
(function () {
  'use strict';

  var S = window.Site;
  if (!S) return;
  var cfg = S.cfg;
  var $ = S.$;
  var $$ = S.$$;
  var esc = S.escape;
  var escAttr = S.escapeAttr;
  var aiEndpoint = (cfg.ai && cfg.ai.endpoint) || '';
  var apiBase = S.apiBase;

  var faqItems = [];
  var faqLoaded = false;
  var faqBusy = false;
  var aiWelcomeShown = false;
  var aiBusy = false;

  // ------------------------------------------------------------
  // FAQ
  // ------------------------------------------------------------
  function normalize(text) {
    return String(text || '')
      .toLowerCase()
      .replace(/[\s,。！？!?；;：:、,.\"'“”‘’（）()【】\[\]<>《》~]/g, '');
  }

  function bigrams(text) {
    var value = normalize(text);
    var result = [];
    for (var i = 0; i < value.length - 1; i += 1) result.push(value.slice(i, i + 2));
    return result;
  }

  function scoreItem(question, item) {
    var normalizedQuestion = normalize(question);
    var normalizedFaq = normalize(item.question);
    if (!normalizedQuestion) return 0;
    var score = 0;
    if (normalizedFaq === normalizedQuestion) score += 20;
    if (normalizedFaq.indexOf(normalizedQuestion) !== -1 || normalizedQuestion.indexOf(normalizedFaq) !== -1) score += 4;

    (item.keywords || []).forEach(function (keyword) {
      var k = normalize(keyword);
      if (k && normalizedQuestion.indexOf(k) !== -1) score += Math.min(6, k.length + 1);
    });

    bigrams(question).forEach(function (pair) {
      if (normalizedFaq.indexOf(pair) !== -1) score += 1;
    });
    return score;
  }

  function findAnswer(question) {
    if (!faqItems.length) return null;
    var best = null;
    var bestScore = 0;
    faqItems.forEach(function (item) {
      var score = scoreItem(question, item);
      if (score > bestScore) {
        bestScore = score;
        best = item;
      }
    });
    return bestScore >= 2 ? best : null;
  }

  async function loadFAQ() {
    if (faqLoaded || faqBusy) return;
    faqBusy = true;
    try {
      var data = await S.loadData('faq');
      faqItems = Array.isArray(data) ? data : [];
      faqLoaded = true;
      renderFAQMeta();
    } catch (error) {
      faqItems = [];
    } finally {
      faqBusy = false;
    }
  }

  function renderFAQMeta() {
    var status = $('#faq-status-text');
    if (status) status.textContent = faqItems.length ? '已收录 ' + faqItems.length + ' 条常见问题' : '暂无问答数据';
    var suggestions = $('#faq-suggestions');
    if (suggestions) {
      var picks = faqItems.slice(0, 4);
      suggestions.innerHTML = picks.map(function (item) {
        return '<button type="button" class="faq-suggestion" data-q="' + escAttr(item.question) + '">' + esc(item.question) + '</button>';
      }).join('');
      $$('.faq-suggestion', suggestions).forEach(function (button) {
        button.addEventListener('click', function () {
          askFAQ(button.dataset.q);
        });
      });
    }
    renderFAQList('');
  }

  function renderFAQList(keyword) {
    var list = $('#faq-list');
    if (!list) return;
    var q = normalize(keyword);
    var items = faqItems.filter(function (item) {
      if (!q) return true;
      return normalize(item.question + ' ' + item.answer + ' ' + (item.keywords || []).join(' ')).indexOf(q) !== -1;
    });
    if (!items.length) {
      list.innerHTML = '<p style="color:#94a3b8;font-size:12px;padding:12px;">没有找到相关问题</p>';
      return;
    }
    var groups = {};
    items.forEach(function (item) {
      var category = item.category || '常见问题';
      if (!groups[category]) groups[category] = [];
      groups[category].push(item);
    });
    list.innerHTML = Object.keys(groups).map(function (category) {
      return '<div class="faq-category">' +
        '<h4 class="faq-category-title">' + esc(category) + '</h4>' +
        '<ul class="faq-category-list">' +
        groups[category].map(function (item) {
          return '<li class="faq-item" data-q="' + escAttr(item.question) + '">' +
            '<span class="faq-q-icon">💬</span><span class="faq-q-text">' + esc(item.question) + '</span>' +
            '</li>';
        }).join('') +
        '</ul></div>';
    }).join('');
    $$('.faq-item', list).forEach(function (item) {
      item.addEventListener('click', function () { askFAQ(item.dataset.q); });
    });
  }

  function faqMessage(role, html, extra) {
    var body = $('#faq-chat-messages');
    if (!body) return;
    var wrapper = document.createElement('div');
    wrapper.className = 'faq-message ' + (role === 'user' ? 'faq-user' : 'faq-bot');
    wrapper.innerHTML =
      '<div class="faq-msg-avatar">' + (role === 'user' ? '我' : '问') + '</div>' +
      '<div class="faq-msg-content">' + (extra || '') + '<div class="faq-msg-bubble">' + html + '</div></div>';
    body.appendChild(wrapper);
    body.scrollTop = body.scrollHeight;
  }

  async function askFAQ(question) {
    question = String(question || '').trim();
    if (!question) return;
    var modal = $('#faq-modal');
    if (modal && modal.getAttribute('aria-hidden') === 'true') openFAQ();
    await loadFAQ();
    faqMessage('user', esc(question));
    var item = findAnswer(question);
    if (item) {
      faqMessage('bot', S.md(item.answer), '<div class="faq-match-tip">匹配到：' + esc(item.question) + '</div>');
    } else {
      faqMessage('bot',
        '这个问题暂时没有收录。你可以换个说法，或通过 <a href="mailbox.html">校长信箱</a> 留言。',
        '<div class="faq-match-tip">未找到匹配条目</div>');
    }
  }

  function openFAQ() {
    var modal = $('#faq-modal');
    if (!modal) return;
    S.openModal(modal);
    loadFAQ().then(function () {
      var body = $('#faq-chat-messages');
      if (body && !body.children.length) {
        faqMessage('bot', '你好，我是校务问答助手。可以输入问题，或从下面的常见问题中选择。');
      }
      var input = $('#faq-input');
      if (input) input.focus();
    });
  }

  function bindFAQ() {
    var form = $('#faq-input-form');
    if (form) {
      form.addEventListener('submit', function (event) {
        event.preventDefault();
        var input = $('#faq-input');
        if (!input) return;
        askFAQ(input.value);
        input.value = '';
      });
    }
    var search = $('#faq-search-input');
    if (search) {
      search.addEventListener('input', function () { renderFAQList(search.value); });
    }
    var browse = $('.faq-browse');
    if (browse) {
      browse.addEventListener('toggle', function () {
        if (browse.open) renderFAQList(search ? search.value : '');
      });
    }
  }

  // ------------------------------------------------------------
  // AI
  // ------------------------------------------------------------
  function resolveEndpoint() {
    if (!aiEndpoint) return '';
    if (/^https?:\/\//i.test(aiEndpoint)) return aiEndpoint;
    return (apiBase || '') + aiEndpoint;
  }

  function aiMessage(role, html, options) {
    var body = $('#ai-chat-messages');
    if (!body) return null;
    var wrapper = document.createElement('div');
    wrapper.className = 'ai-message ' + (role === 'user' ? 'ai-user' : 'ai-bot');
    if (options && options.loading) wrapper.classList.add('ai-loading');
    wrapper.innerHTML =
      '<div class="ai-message-avatar">' + (role === 'user' ? '我' : 'AI') + '</div>' +
      '<div class="ai-message-content"><div class="ai-message-bubble">' + html + '</div></div>';
    body.appendChild(wrapper);
    body.scrollTop = body.scrollHeight;
    return wrapper;
  }

  function typingHtml() {
    return '<span class="ai-typing-dot"></span><span class="ai-typing-dot"></span><span class="ai-typing-dot"></span>';
  }

  function welcomeAI() {
    if (aiWelcomeShown) return;
    aiWelcomeShown = true;
    aiMessage('bot', S.md((cfg.ai && cfg.ai.welcome) || '你好，请问有什么可以帮你？'));
  }

  function openAI() {
    var modal = $('#ai-chat-modal');
    if (!modal) {
      openFAQ();
      return;
    }
    S.openModal(modal);
    welcomeAI();
    var input = $('#ai-input');
    if (input) input.focus();
  }

  function openAssistant() {
    if (resolveEndpoint()) openAI();
    else openFAQ();
  }

  async function sendAI(question) {
    question = String(question || '').trim();
    if (!question || aiBusy) return;
    var endpoint = resolveEndpoint();
    if (!endpoint) {
      askFAQ(question);
      return;
    }
    aiBusy = true;
    aiMessage('user', esc(question));
    var loading = aiMessage('bot', typingHtml(), { loading: true });
    var sendButton = $('#ai-send-btn');
    if (sendButton) sendButton.disabled = true;

    try {
      var sessionId = '';
      try { sessionId = localStorage.getItem('campus_site_ai_session') || ''; } catch (error) { /* ignore */ }
      if (!sessionId) {
        sessionId = 'sess-' + Date.now() + '-' + Math.random().toString(36).slice(2, 8);
        try { localStorage.setItem('campus_site_ai_session', sessionId); } catch (error) { /* ignore */ }
      }
      var response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: question, session_id: sessionId }),
      });
      var data = await response.json().catch(function () { return {}; });
      if (!response.ok) throw new Error(data.error || data.message || ('HTTP ' + response.status));
      var answer = data.answer || data.content || data.message || '';
      if (!answer) throw new Error('接口没有返回回答');
      if (loading && loading.parentNode) loading.parentNode.removeChild(loading);
      var sources = data.sources || [];
      var answerHtml = S.md(answer);
      if (sources.length) {
        answerHtml += '<div class="ai-message-sources">参考：' + sources.slice(0, 3).map(function (source) {
          var title = source.title || source.file_name || source.source || '知识库';
          return '<span>' + esc(title) + '</span>';
        }).join('') + '</div>';
      }
      aiMessage('bot', answerHtml);
    } catch (error) {
      if (loading && loading.parentNode) loading.parentNode.removeChild(loading);
      var fallback = findAnswer(question);
      if (fallback) {
        aiMessage('bot', S.md(fallback.answer), '<div class="faq-match-tip">AI 服务暂不可用，以下为本地知识库答案</div>');
      } else {
        aiMessage('bot', 'AI 服务暂时不可用。你可以稍后再试，或通过 <a href="mailbox.html">校长信箱</a> 留言。');
      }
    } finally {
      aiBusy = false;
      if (sendButton) sendButton.disabled = false;
    }
  }

  function bindAI() {
    var form = $('#ai-input-form');
    if (form) {
      form.addEventListener('submit', function (event) {
        event.preventDefault();
        var input = $('#ai-input');
        if (!input) return;
        var value = input.value;
        input.value = '';
        sendAI(value);
      });
    }
    var suggestions = $('#ai-suggestions');
    if (suggestions) {
      $$('.ai-suggestion', suggestions).forEach(function (button) {
        button.addEventListener('click', function () {
          sendAI(button.dataset.q);
        });
      });
    }
  }

  function bindTrigger() {
    var trigger = $('#ai-trigger');
    if (!trigger) return;
    trigger.addEventListener('click', function () {
      openAssistant();
      trigger.setAttribute('aria-expanded', 'true');
    });
  }

  function init() {
    bindTrigger();
    bindFAQ();
    bindAI();
    loadFAQ();
  }

  document.addEventListener('DOMContentLoaded', init);

  window.openFAQ = openFAQ;
  window.openAI = openAI;
  window.openAssistant = openAssistant;
  window.askFAQ = askFAQ;
})();
