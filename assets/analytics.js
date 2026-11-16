(() => {
  'use strict';
  const counter = 114283367;
  const key = 'tehspec_analytics_choice';
  const version = '2026-11-16.v1';
  const lifetime = 180 * 86400000;
  let choice = null;
  let active = false;
  try {
    const saved = JSON.parse(localStorage.getItem(key));
    if (saved && saved.version === version && ['accepted', 'rejected'].includes(saved.value)
      && Number.isFinite(saved.at) && saved.at <= Date.now() && Date.now() - saved.at < lifetime) choice = saved.value;
  } catch (_) { /* При недоступном хранилище запрашиваем выбор заново. */ }

  const panel = document.createElement('section');
  panel.className = 'cookie-panel';
  panel.setAttribute('aria-label', 'Настройки аналитики');
  panel.innerHTML = '<h2>Разрешить аналитику?</h2><p>С вашего согласия Яндекс Метрика использует cookies и данные о посещении, чтобы помочь мне понять, откуда приходят посетители и переходят ли они в бот. Без согласия аналитика не загружается, сайт работает полностью.</p><p><a href="analytics-consent.html">Согласие на аналитику</a> · <a href="privacy.html#analytics">Подробнее в политике</a></p><div class="cookie-actions"><button type="button" data-cookie="accepted">Принять</button><button type="button" data-cookie="rejected">Отклонить</button><button type="button" data-cookie="close" hidden>Закрыть</button></div>';
  document.body.append(panel);
  const settings = document.createElement('button');
  settings.type = 'button'; settings.className = 'cookie-settings'; settings.textContent = 'Настройки cookies';
  (document.querySelector('footer .footer-inner') || document.querySelector('footer') || document.body).append(settings);
  function show() {
    panel.hidden = false;
    panel.querySelector('[data-cookie="close"]').hidden = choice === null;
  }
  settings.addEventListener('click', () => { show(); panel.querySelector('button').focus(); });
  function start() {
    if (active || choice !== 'accepted') return;
    active = true;
    window.ym = window.ym || function () { (window.ym.a = window.ym.a || []).push(arguments); };
    window.ym.l = Date.now();
    const tag = document.createElement('script');
    tag.async = true; tag.src = 'https://mc.yandex.ru/metrika/tag.js';
    document.head.append(tag);
    window.ym(counter, 'init', {clickmap:false, trackLinks:false, accurateTrackBounce:true,
      webvisor:false, ecommerce:false, disableYtm:true, params:{analytics_consent_version:version}});
  }
  function clearAnalyticsCookies() {
    const hosts = location.hostname.split('.');
    const domains = ['', ...hosts.map((_,i) => hosts.slice(i).join('.'))];
    for (const cookie of document.cookie.split(';')) {
      const name = cookie.split('=')[0].trim();
      if (!name.startsWith('_ym')) continue;
      for (const domain of domains) document.cookie = name + '=; Max-Age=0; path=/; SameSite=Lax' + (domain ? '; domain=' + domain : '');
    }
  }
  panel.addEventListener('click', event => {
    const button = event.target.closest('[data-cookie]');
    if (!button) return;
    const value = button.dataset.cookie;
    if (value === 'close') { panel.hidden = true; settings.focus(); return; }
    const wasActive = active;
    choice = value;
    try { localStorage.setItem(key, JSON.stringify({value, version, at:Date.now()})); } catch (_) {}
    panel.hidden = true;
    if (value === 'accepted') start();
    else {
      if (wasActive && typeof window.ym === 'function') window.ym(counter, 'destruct');
      active = false; clearAnalyticsCookies();
      if (wasActive) location.reload();
    }
    settings.focus();
  });
  window.addEventListener('storage', event => { if (event.key === key) location.reload(); });
  document.addEventListener('click', event => {
    const link = event.target.closest('a[href]');
    if (!link || !active || choice !== 'accepted') return;
    const url = new URL(link.href, location.href);
    if (url.hostname === 't.me' && url.pathname.replace(/\/$/, '') === '/tvoytehspecbot')
      window.ym(counter, 'reachGoal', 'bot_click');
  });
  if (choice === null) show(); else panel.hidden = true;
  start();
})();
