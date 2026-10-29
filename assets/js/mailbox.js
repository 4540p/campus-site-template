/**
 * 校长信箱
 * - 配置了 api.base：走后端持久化接口
 * - 纯静态模式：保存到 localStorage，便于模板演示
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
  var API = S.apiBase;
  var mode = (cfg.mailbox && cfg.mailbox.mode) || 'auto';
  var STORAGE_KEY = 'campus_site_mailbox_demo';
  var useApi = mode === 'api' || (mode === 'auto' && !!API);

  var TYPE_LABELS = {
    consultation: '咨询',
    complaint: '投诉',
    suggestion: '建议',
    report: '举报',
  };

  function readLocal() {
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      var list = raw ? JSON.parse(raw) : [];
      return Array.isArray(list) ? list : [];
    } catch (error) {
      return [];
    }
  }

  function writeLocal(list) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
    } catch (error) {
      /* 隐私模式下忽略 */
    }
  }

  function makeCode() {
    var alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    var code = '';
    for (var i = 0; i < 8; i += 1) {
      code += alphabet.charAt(Math.floor(Math.random() * alphabet.length));
    }
    return code;
  }

  function nowText() {
    var now = new Date();
    var y = now.getFullYear();
    var m = String(now.getMonth() + 1).padStart(2, '0');
    var d = String(now.getDate()).padStart(2, '0');
    var h = String(now.getHours()).padStart(2, '0');
    var min = String(now.getMinutes()).padStart(2, '0');
    return y + '-' + m + '-' + d + ' ' + h + ':' + min;
  }

  function statusHtml(status) {
    if (status === 'replied') {
      return '<span class="mailbox-status replied">已回复</span>';
    }
    return '<span class="mailbox-status pending">待回复</span>';
  }

  function resultHtml(data, queryCode) {
    var reply = data.reply || '';
    return '<div class="mailbox-result">' +
      '<div class="mailbox-result-head">' +
        '<span class="mailbox-result-code">查询码：' + esc(data.id || queryCode) + '</span>' +
        statusHtml(data.status) +
      '</div>' +
      '<div class="mailbox-result-block">' +
        '<div class="mailbox-result-label">留言内容</div>' +
        '<p>' + esc(data.content || '') + '</p>' +
      '</div>' +
      (reply
        ? '<div class="mailbox-result-block mailbox-result-reply">' +
            '<div class="mailbox-result-label">学校回复</div>' +
            '<p>' + esc(reply) + '</p>' +
            (data.reply_time ? '<time>' + esc(data.reply_time) + '</time>' : '') +
          '</div>'
        : '<p class="mailbox-result-tip">学校尚未回复，请稍后再查询。</p>') +
      '</div>';
  }

  function showResult(target, html) {
    var el = typeof target === 'string' ? $(target) : target;
    if (!el) return;
    el.innerHTML = html;
    el.classList.add('is-visible');
  }

  async function query(code, target) {
    code = String(code || '').trim().toUpperCase();
    if (!code) {
      showResult(target, '<div class="mailbox-result is-error">请输入查询码。</div>');
      return;
    }
    if (!useApi) {
      var item = readLocal().find(function (x) { return String(x.id).toUpperCase() === code; });
      if (!item) {
        showResult(target, '<div class="mailbox-result is-error">未找到该查询码。演示模式下，请使用本浏览器提交后生成的查询码。</div>');
        return;
      }
      showResult(target, resultHtml(item, code));
      return;
    }
    try {
      var response = await fetch(API + '/api/mailbox/query/' + encodeURIComponent(code));
      var data = await response.json();
      if (!response.ok || !data.ok) throw new Error(data.error || '查询失败');
      showResult(target, resultHtml(data, code));
    } catch (error) {
      showResult(target, '<div class="mailbox-result is-error">' + esc(error.message || '查询失败，请稍后再试。') + '</div>');
    }
  }

  function bindHomeQuery() {
    var button = $('#check-btn');
    var input = $('#query-code');
    if (!button || !input) return;
    function run() { query(input.value, '#check-result'); }
    button.addEventListener('click', run);
    input.addEventListener('keydown', function (event) {
      if (event.key === 'Enter') { event.preventDefault(); run(); }
    });
  }

  function renderHistory() {
    var list = $('#history-list');
    if (!list) return;
    var items = readLocal();
    if (!items.length) {
      list.innerHTML = '<p class="mailbox-history-empty">暂无查询记录 · 提交留言后会显示在这里</p>';
      return;
    }
    list.innerHTML = items.map(function (item) {
      return '<div class="mailbox-history-card" data-code="' + escAttr(item.id) + '">' +
        '<div class="mailbox-history-main">' +
          '<div class="mailbox-history-top">' +
            '<span class="mailbox-history-code">' + esc(item.id) + '</span>' +
            '<span class="mailbox-history-type">' + esc(TYPE_LABELS[item.type] || '留言') + '</span>' +
            statusHtml(item.status) +
          '</div>' +
          '<p>' + esc(String(item.content || '').slice(0, 80)) + (String(item.content || '').length > 80 ? '…' : '') + '</p>' +
          '<time>' + esc(item.submit_time || '') + '</time>' +
        '</div>' +
        '<div class="mailbox-history-actions">' +
          '<button type="button" class="mailbox-history-btn" data-action="query">查询</button>' +
          '<button type="button" class="mailbox-history-btn danger" data-action="delete">删除</button>' +
        '</div>' +
        '</div>';
    }).join('');
    $$('.mailbox-history-card', list).forEach(function (card) {
      card.addEventListener('click', function (event) {
        var action = event.target && event.target.dataset ? event.target.dataset.action : '';
        if (action === 'delete') {
          writeLocal(readLocal().filter(function (x) { return String(x.id) !== card.dataset.code; }));
          renderHistory();
          return;
        }
        if (action === 'query') {
          query(card.dataset.code, '#history-result');
        }
      });
    });
  }

  function renderFormIntro() {
    var box = $('#mailbox-intro');
    if (!box) return;
    var mailbox = cfg.mailbox || {};
    box.innerHTML = '<h3>' + esc(mailbox.introTitle || '给学校的一封信') + '</h3>' +
      (mailbox.intro || []).map(function (p) { return '<p>' + esc(p) + '</p>'; }).join('');
  }

  function renderTypes() {
    var box = $('#mailbox-types');
    if (!box) return;
    var types = (cfg.mailbox && cfg.mailbox.types) || [];
    box.innerHTML = types.map(function (item, index) {
      return '<label class="type-option">' +
        '<input type="radio" name="msg_type" value="' + escAttr(item.value) + '"' + (index === 0 ? ' required' : '') + '>' +
        '<span class="type-option-content">' +
          '<span class="type-option-icon">' + esc(item.icon || '💬') + '</span>' +
          '<span class="type-option-text"><strong>' + esc(item.label) + '</strong><small>' + esc(item.hint || '') + '</small></span>' +
        '</span>' +
        '</label>';
    }).join('');
  }

  function setFormMessage(text, type) {
    var el = $('#result-message');
    if (!el) return;
    el.textContent = text;
    el.className = 'mailbox-form-message ' + (type || '');
  }

  function bindForm() {
    var form = $('#mailbox-form');
    if (!form) return;
    form.addEventListener('submit', async function (event) {
      event.preventDefault();
      var typeInput = form.querySelector('input[name="msg_type"]:checked');
      var content = (form.querySelector('#mailbox-content') || {}).value || '';
      var name = (form.querySelector('#mailbox-name') || {}).value || '';
      var contact = (form.querySelector('#mailbox-contact') || {}).value || '';
      var anonymous = !!(form.querySelector('#mailbox-anonymous') || {}).checked;

      if (!typeInput) { setFormMessage('请选择留言类型。', 'error'); return; }
      if (content.trim().length < 5) { setFormMessage('留言内容至少 5 个字。', 'error'); return; }
      if (content.length > 2000) { setFormMessage('留言内容不超过 2000 字。', 'error'); return; }

      var submitButton = form.querySelector('button[type="submit"]');
      if (submitButton) submitButton.disabled = true;
      setFormMessage('正在提交…', '');

      var payload = {
        type: typeInput.value,
        name: anonymous ? '匿名' : name.trim(),
        contact: anonymous ? '' : contact.trim(),
        content: content.trim(),
        anonymous: anonymous,
      };

      try {
        if (useApi) {
          var response = await fetch(API + '/api/mailbox/submit', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
          });
          var data = await response.json();
          if (!response.ok || !data.ok) throw new Error(data.error || '提交失败');
          if (data.ai_redirect) {
            setFormMessage('咨询类问题建议使用校务问答，已为你打开。', 'success');
            if (window.openAssistant) window.openAssistant();
            return;
          }
          if (data.no_query_code) {
            setFormMessage('匿名留言已提交。由于未生成查询码，请通过其他渠道关注后续回复。', 'success');
            form.reset();
            return;
          }
          setFormMessage('提交成功，查询码：' + data.query_code + '（请妥善保存）', 'success');
          addHistory({
            id: data.query_code,
            type: payload.type,
            content: payload.content,
            submit_time: nowText(),
            status: 'pending',
          });
        } else {
          var code = makeCode();
          var item = {
            id: code,
            type: payload.type,
            name: payload.name,
            contact: payload.contact,
            content: payload.content,
            anonymous: anonymous,
            submit_time: nowText(),
            status: 'pending',
            reply: '',
          };
          writeLocal([item].concat(readLocal()).slice(0, 20));
          setFormMessage('提交成功（演示模式），查询码：' + code + '。数据仅保存在本浏览器。', 'success');
          addHistory(item);
        }
        form.reset();
        renderHistory();
      } catch (error) {
        setFormMessage(error.message || '提交失败，请稍后再试。', 'error');
      } finally {
        if (submitButton) submitButton.disabled = false;
      }
    });
  }

  function addHistory(item) {
    if (useApi) {
      // API 模式下后端已有数据，这里只维护本地查询码，便于再次查询。
      var list = readLocal().filter(function (x) { return x.id !== item.id; });
      list.unshift(item);
      writeLocal(list.slice(0, 20));
    }
  }

  function init() {
    renderFormIntro();
    renderTypes();
    bindForm();
    bindHomeQuery();
    renderHistory();

    var badge = $('#mailbox-mode-note');
    if (badge) {
      badge.textContent = useApi
        ? '已连接后端服务'
        : '演示模式：留言仅保存在本浏览器，配置 api.base 后可持久化';
    }
  }

  document.addEventListener('DOMContentLoaded', init);

  window.Mailbox = { query: query };
})();
