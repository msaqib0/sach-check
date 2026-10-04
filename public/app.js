/* Sach Check - browser UI. All checking happens locally via SachEngine. */
(function () {
  'use strict';

  const E = window.SachEngine;
  const D = window.SachData;

  const UI = {
    en: {
      skip: 'Skip to main content',
      appName: 'Sach Check',
      langBtn: 'اردو',
      langAria: 'Switch language to Urdu',
      heroTitle: 'Got a suspicious message?',
      heroSub: 'Paste the text of an SMS, WhatsApp or email and see if it matches known scams, before you click, reply or pay. English, Urdu and Roman Urdu all work.',
      label: 'Message text',
      placeholder: 'Paste the message here...',
      check: 'Check message',
      clear: 'Clear',
      examples: 'Try an example:',
      privacy: 'Checked in your browser. Your message is not sent anywhere unless you tap "Explain in simple words".',
      tooShort: 'Please paste at least one full sentence of the message.',
      claims: 'The message claims to be from:',
      why: 'Why it looks suspicious',
      whyNone: 'What we looked at',
      noneList: 'No known scam patterns, fake links or personal numbers were found in the text.',
      foundIn: 'Found in the message:',
      sev: { high: 'High risk', medium: 'Medium', low: 'Low', info: 'Good sign' },
      channels: 'Official channels (verify for yourself)',
      helpline: 'Helpline',
      website: 'Website',
      source: 'Source',
      nextSteps: 'What to do now',
      explainBtn: 'Explain in simple words (AI)',
      explaining: 'Explaining...',
      explainNote: 'Written by AI, so it can be wrong. The verdict above comes from fixed rules, not from the AI. CNIC, phone and long numbers are removed before sending.',
      explainFail: 'The explanation is not available right now. The verdict above still stands.',
      copy: 'Copy summary to share',
      copied: 'Copied',
      disclaimer: 'Independent project, not a government service. This is guidance, not proof: always confirm fees, dates and helplines on the official department\'s own website. A message that shows no warning signs is not guaranteed to be genuine.'
    },
    ur: {
      skip: 'مرکزی مواد پر جائیں',
      appName: 'سچ چیک',
      langBtn: 'English',
      langAria: 'Switch language to English',
      heroTitle: 'کوئی مشکوک پیغام ملا ہے؟',
      heroSub: 'ایس ایم ایس، واٹس ایپ یا ای میل کا متن یہاں پیسٹ کریں اور کلک کرنے، جواب دینے یا رقم بھیجنے سے پہلے دیکھیں کہ کہیں یہ معروف فراڈ سے تو نہیں ملتا۔ اردو، رومن اردو اور انگریزی تینوں چلتی ہیں۔',
      label: 'پیغام کا متن',
      placeholder: 'یہاں پیغام پیسٹ کریں...',
      check: 'پیغام جانچیں',
      clear: 'صاف کریں',
      examples: 'مثال آزمائیں:',
      privacy: 'جانچ آپ کے اپنے براؤزر میں ہوتی ہے۔ جب تک آپ "آسان الفاظ میں سمجھائیں" نہ دبائیں، آپ کا پیغام کہیں نہیں بھیجا جاتا۔',
      tooShort: 'براہ کرم پیغام کا کم از کم ایک مکمل جملہ پیسٹ کریں۔',
      claims: 'پیغام ان اداروں کی طرف سے ہونے کا دعویٰ کرتا ہے:',
      why: 'یہ مشکوک کیوں لگتا ہے',
      whyNone: 'ہم نے کیا دیکھا',
      noneList: 'متن میں کوئی معروف فراڈ پیٹرن، جعلی لنک یا ذاتی نمبر نہیں ملا۔',
      foundIn: 'پیغام میں ملا:',
      sev: { high: 'زیادہ خطرہ', medium: 'درمیانہ', low: 'کم', info: 'اچھی علامت' },
      channels: 'سرکاری ذرائع (خود تصدیق کریں)',
      helpline: 'ہیلپ لائن',
      website: 'ویب سائٹ',
      source: 'ماخذ',
      nextSteps: 'اب کیا کریں',
      explainBtn: 'آسان الفاظ میں سمجھائیں (اے آئی)',
      explaining: 'سمجھایا جا رہا ہے...',
      explainNote: 'یہ وضاحت اے آئی نے لکھی ہے، اس لیے غلط بھی ہو سکتی ہے۔ اوپر کا فیصلہ مقررہ اصولوں سے آیا ہے، اے آئی سے نہیں۔ بھیجنے سے پہلے شناختی کارڈ، فون اور لمبے نمبر ہٹا دیے جاتے ہیں۔',
      explainFail: 'اس وقت وضاحت دستیاب نہیں۔ اوپر کا فیصلہ اپنی جگہ برقرار ہے۔',
      copy: 'خلاصہ شیئر کرنے کے لیے کاپی کریں',
      copied: 'کاپی ہو گیا',
      disclaimer: 'یہ ایک آزاد منصوبہ ہے، سرکاری سروس نہیں۔ یہ رہنمائی ہے، ثبوت نہیں: فیس، تاریخیں اور ہیلپ لائن ہمیشہ متعلقہ محکمے کی اپنی سرکاری ویب سائٹ پر دوبارہ دیکھ لیں۔ جس پیغام میں کوئی خطرے کی علامت نہ ہو اس کے اصلی ہونے کی ضمانت نہیں۔'
    }
  };

  /* ---------------- state ---------------- */
  const $ = (id) => document.getElementById(id);
  const state = { lang: 'en', result: null, input: '', explain: null };

  function safeGet(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }
  function safeSet(k, v) { try { localStorage.setItem(k, v); } catch (e) { /* storage blocked: fine */ } }

  function initialLang() {
    const saved = safeGet('sach.lang');
    if (saved === 'en' || saved === 'ur') return saved;
    return /^ur\b/i.test(navigator.language || '') ? 'ur' : 'en';
  }

  const t = (k) => UI[state.lang][k];
  const L = (obj) => (obj ? obj[state.lang] || obj.en : '');

  /* ---------------- tiny DOM helper (text only, never innerHTML) ---------------- */
  function h(tag, props, ...kids) {
    const el = document.createElement(tag);
    if (props) {
      for (const [k, v] of Object.entries(props)) {
        if (v == null || v === false) continue;
        if (k === 'class') el.className = v;
        else if (k === 'text') el.textContent = v;
        else if (k.startsWith('on')) el.addEventListener(k.slice(2), v);
        else el.setAttribute(k, v === true ? '' : v);
      }
    }
    for (const kid of kids.flat(Infinity)) {
      if (kid == null || kid === false) continue;
      el.appendChild(typeof kid === 'string' ? document.createTextNode(kid) : kid);
    }
    return el;
  }

  /* ---------------- fonts: only load the Urdu font when needed ---------------- */
  let fontLoaded = false;
  function ensureUrduFont() {
    if (fontLoaded) return;
    fontLoaded = true;
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://fonts.googleapis.com/css2?family=Noto+Nastaliq+Urdu:wght@400;700&display=swap';
    document.head.appendChild(link);
  }

  /* ---------------- static text ---------------- */
  function applyLang() {
    const lang = state.lang;
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === 'ur' ? 'rtl' : 'ltr';
    if (lang === 'ur') ensureUrduFont();

    document.querySelectorAll('[data-i18n]').forEach((el) => { el.textContent = t(el.getAttribute('data-i18n')); });
    document.querySelectorAll('[data-i18n-placeholder]').forEach((el) => { el.setAttribute('placeholder', t(el.getAttribute('data-i18n-placeholder'))); });

    const btn = $('langBtn');
    btn.textContent = t('langBtn');
    btn.setAttribute('aria-label', t('langAria'));
    btn.setAttribute('lang', lang === 'ur' ? 'en' : 'ur');

    renderExamples();
    if (state.result) renderResult();
  }

  function renderExamples() {
    const box = $('exampleList');
    box.textContent = '';
    for (const ex of D.examples) {
      box.appendChild(h('button', { type: 'button', class: 'chip', onclick: () => { $('msg').value = ex.text; run(); } }, L(ex.label)));
    }
  }

  /* ---------------- results ---------------- */
  function renderResult() {
    const r = state.result;
    const out = $('result');
    out.textContent = '';
    if (!r) return;

    const v = r.verdict;
    const heading = h('h2', { id: 'verdictHeading', tabindex: '-1' }, L(v.title));
    const verdict = h('div', { class: 'verdict ' + r.level }, heading, h('p', null, L(v.detail)));
    if (r.entities.length) {
      verdict.appendChild(h('p', { class: 'claims' }, t('claims') + ' ' + r.entities.map((e) => L(e.name)).join(state.lang === 'ur' ? '، ' : ', ')));
    }
    out.appendChild(verdict);

    // findings
    const sec = h('div', { class: 'section' });
    sec.appendChild(h('h3', null, r.level === 'none' ? t('whyNone') : t('why')));
    const real = r.findings;
    if (!real.length) {
      sec.appendChild(h('p', { class: 'sub' }, t('noneList')));
    }
    for (const f of real) {
      const card = h('div', { class: 'finding ' + f.severity },
        h('div', { class: 'finding-head' },
          h('h4', null, L(f.title)),
          h('span', { class: 'tag ' + f.severity }, t('sev')[f.severity])
        ),
        h('p', null, L(f.why))
      );
      if (f.evidence && f.evidence.length) {
        card.appendChild(h('div', { class: 'found' }, t('foundIn') + ' ', f.evidence.map((e, i) => [i ? ' ' : '', h('code', null, e)])));
      }
      if (f.source) {
        card.appendChild(h('div', { class: 'found' }, t('source') + ': ', h('a', { href: f.source, target: '_blank', rel: 'noopener noreferrer' }, f.source.replace(/^https?:\/\//, ''))));
      }
      sec.appendChild(card);
    }
    out.appendChild(sec);

    // next steps
    const steps = h('div', { class: 'section' }, h('h3', null, t('nextSteps')), h('ol', { class: 'steps' }, r.steps.map((s) => h('li', null, L(s)))));
    out.appendChild(steps);

    // official channels
    if (r.channels.length) {
      const ch = h('div', { class: 'section' }, h('h3', null, t('channels')));
      for (const c of r.channels) {
        const items = [];
        for (const w of c.websites) items.push(h('li', null, t('website') + ': ', h('span', { class: 'num' }, w)));
        for (const hl of c.helplines) items.push(h('li', null, L(hl.label) + ': ', h('span', { class: 'num' }, hl.value)));
        ch.appendChild(h('div', { class: 'channel' }, h('h4', null, L(c.name)), h('ul', null, items)));
      }
      out.appendChild(ch);
    }

    // AI explanation (optional) + copy summary
    const explainBox = h('div', { id: 'explainBox' });
    if (state.explain) {
      explainBox.appendChild(h('div', { class: 'ai-box', role: 'status' }, state.explain));
      explainBox.appendChild(h('div', { class: 'ai-note' }, t('explainNote')));
    }
    out.appendChild(explainBox);

    const row = h('div', { class: 'row' },
      r.level !== 'empty' ? h('button', { type: 'button', id: 'explainBtn', class: 'btn ghost', onclick: explain }, t('explainBtn')) : null,
      h('button', { type: 'button', id: 'copyBtn', class: 'btn ghost', onclick: copySummary }, t('copy'))
    );
    out.appendChild(row);
  }

  /* ---------------- actions ---------------- */
  function showHint(msg) {
    const el = $('hint');
    el.hidden = !msg;
    el.textContent = msg || '';
  }

  function run() {
    const text = $('msg').value;
    const r = E.analyze(text);
    if (r.level === 'empty') {
      showHint(t('tooShort'));
      return;
    }
    showHint('');
    state.input = text;
    state.result = r;
    state.explain = null;
    renderResult();
    const hd = $('verdictHeading');
    if (hd) {
      hd.focus({ preventScroll: true });
      const reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      hd.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' });
    }
  }

  function clearAll() {
    $('msg').value = '';
    state.result = null;
    state.input = '';
    state.explain = null;
    showHint('');
    $('result').textContent = '';
    $('msg').focus();
  }

  async function explain() {
    const btn = $('explainBtn');
    if (!btn || !state.result) return;
    btn.disabled = true;
    const original = btn.textContent;
    btn.textContent = t('explaining');
    const box = $('explainBox');
    box.textContent = '';
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), 20000);
    try {
      const payload = E.toExplainPayload(state.result, state.input, state.lang);
      const res = await fetch('/api/explain', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        signal: ctrl.signal
      });
      if (!res.ok) throw new Error('status ' + res.status);
      const data = await res.json();
      if (!data || typeof data.text !== 'string' || !data.text.trim()) throw new Error('empty');
      state.explain = data.text.trim();
      box.appendChild(h('div', { class: 'ai-box', role: 'status' }, state.explain));
      box.appendChild(h('div', { class: 'ai-note' }, t('explainNote')));
    } catch (err) {
      box.appendChild(h('div', { class: 'ai-note', role: 'status' }, t('explainFail')));
    } finally {
      clearTimeout(timer);
      btn.disabled = false;
      btn.textContent = original;
    }
  }

  async function copySummary() {
    const r = state.result;
    if (!r) return;
    // The summary never includes the original message text.
    const lines = [L(r.verdict.title)];
    for (const f of r.findings.filter((x) => x.severity !== 'info').slice(0, 5)) lines.push('- ' + L(f.title));
    lines.push('', location.origin);
    const text = lines.join('\n');
    const btn = $('copyBtn');
    try {
      await navigator.clipboard.writeText(text);
      btn.textContent = t('copied');
    } catch (e) {
      const ta = h('textarea', { 'aria-hidden': 'true' });
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      try { document.execCommand('copy'); btn.textContent = t('copied'); } catch (e2) { /* ignore */ }
      ta.remove();
    }
    setTimeout(() => { btn.textContent = t('copy'); }, 1800);
  }

  /* ---------------- init ---------------- */
  function init() {
    state.lang = initialLang();
    $('checkBtn').addEventListener('click', run);
    $('clearBtn').addEventListener('click', clearAll);
    $('langBtn').addEventListener('click', () => {
      state.lang = state.lang === 'en' ? 'ur' : 'en';
      state.explain = null; // explanation is language-specific
      safeSet('sach.lang', state.lang);
      applyLang();
    });
    $('msg').addEventListener('keydown', (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') run();
    });
    applyLang();
  }

  init();
})();
