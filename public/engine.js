/*
 * Sach Check - rules engine.
 *
 * Pure functions, no network, no DOM. Runs in the browser and in Node (tests).
 * The verdict is decided here, deterministically. The optional AI explainer
 * can only re-word it; it can never change it.
 */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory(require('./data.js'));
  else root.SachEngine = factory(root.SachData);
})(typeof self !== 'undefined' ? self : this, function (Data) {
  'use strict';

  const MAX_INPUT = 5000;

  /* ------------------------------------------------------------------ */
  /* Text normalisation                                                  */
  /* ------------------------------------------------------------------ */
  function normalize(input) {
    let t = String(input == null ? '' : input).slice(0, MAX_INPUT).normalize('NFC');
    t = t.replace(/[​-‏‪-‮⁠﻿]/g, ''); // zero-width and bidi marks
    t = t.replace(/[ً-ْٰ]/g, ''); // Arabic diacritics (keeps U+0653 madda)
    t = t.replace(/[٠-٩]/g, (d) => String(d.charCodeAt(0) - 0x0660)); // Arabic-Indic digits
    t = t.replace(/[۰-۹]/g, (d) => String(d.charCodeAt(0) - 0x06f0)); // Urdu/Persian digits
    t = t.replace(/ي/g, 'ی').replace(/ك/g, 'ک'); // Arabic yeh/kaf -> Urdu forms
    t = t.replace(/ۀ/g, 'ہ'); // heh with yeh above -> heh goal
    t = t.replace(/[ \t\r\f\v ]+/g, ' ');
    return t.trim();
  }

  // "B I S P" / "B.I.S.P" -> "BISP" so spaced-out brand names are still caught.
  function joinSpacedLetters(t) {
    return t.replace(/\b(?:[a-z][ .\-_]+){2,}[a-z]\b/gi, (m) => m.replace(/[ .\-_]+/g, ''));
  }

  /* ------------------------------------------------------------------ */
  /* Redaction (used before anything is sent to the optional AI step)    */
  /* ------------------------------------------------------------------ */
  const CNIC_RE = /(^|[^\d])(\d{5}[- ]?\d{7}[- ]?\d)(?!\d)/g;
  const PHONE_RE = /(^|[^\d])((?:\+?92|0092|0)[- ]?3\d{2}[- ]?\d{7})(?!\d)/g;
  const EMAIL_RE = /[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}/gi;
  const IBAN_RE = /\bPK\d{2}[A-Z]{4}\d{16}\b/gi;
  const LONG_NUM_RE = /(^|[^\d])(\d[ -]?){9,}\d(?!\d)/g;

  function redact(input) {
    let t = normalize(input);
    t = t.replace(IBAN_RE, '[IBAN]');
    t = t.replace(EMAIL_RE, '[EMAIL]');
    t = t.replace(CNIC_RE, (m, pre) => pre + '[CNIC]');
    t = t.replace(PHONE_RE, (m, pre) => pre + '[PHONE]');
    t = t.replace(LONG_NUM_RE, (m, pre) => pre + '[NUMBER]');
    return t;
  }

  /* ------------------------------------------------------------------ */
  /* Extraction                                                          */
  /* ------------------------------------------------------------------ */
  const TLDS =
    'com|net|org|info|xyz|top|online|site|click|link|pk|co|me|io|app|live|shop|store|club|vip|cc|tk|ml|ga|cf|gq|biz|us|in|ly|gl|ws|icu|work|buzz|fun|win|bid|loan|help|support';
  const EXPLICIT_URL_RE = /\b(?:https?:\/\/|www\.)[^\s<>"'،۔]+/gi;
  const BARE_URL_RE = new RegExp(
    '\\b(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\\.)+(?:' + TLDS + ')(?:\\/[^\\s<>"\'،۔]*)?(?![a-z0-9-])',
    'gi'
  );

  function collect(re, text, out) {
    re.lastIndex = 0;
    let m;
    while ((m = re.exec(text))) {
      if (m[0].length === 0) {
        re.lastIndex++;
        continue;
      }
      const raw = m[0].replace(/[.,;:!?)\]}'"]+$/, '');
      if (raw && !out.includes(raw)) out.push(raw);
    }
  }

  function extractLinks(text) {
    const out = [];
    // Pass 1: links with a scheme or www. Done first so that a trick like
    // https://bisp.gov.pk@evil.com/ is not mistaken for an e-mail address.
    collect(EXPLICIT_URL_RE, text, out);
    // Pass 2: bare domains (bit.ly/abc, pta-verify.online). E-mail addresses
    // and the links already found are blanked out first.
    const rest = text.replace(EXPLICIT_URL_RE, ' ').replace(EMAIL_RE, ' ');
    collect(BARE_URL_RE, rest, out);
    return out;
  }

  function parseHost(raw) {
    let s = raw.trim().replace(/^[a-z][a-z0-9+.-]*:\/\//i, '');
    s = s.split(/[\/?#]/)[0];
    let deceptive = false;
    if (s.includes('@')) {
      deceptive = true; // https://bisp.gov.pk@evil.com/  -> real host is evil.com
      s = s.slice(s.lastIndexOf('@') + 1);
    }
    s = s.replace(/:\d+$/, '').toLowerCase().replace(/\.$/, '');
    return { host: s, deceptive };
  }

  function extractPhones(text) {
    const noCnic = text.replace(CNIC_RE, (m, pre) => pre + ' ');
    const out = [];
    PHONE_RE.lastIndex = 0;
    let m;
    while ((m = PHONE_RE.exec(noCnic))) {
      if (!out.includes(m[2])) out.push(m[2]);
    }
    return out;
  }

  /* ------------------------------------------------------------------ */
  /* Official-domain logic                                               */
  /* ------------------------------------------------------------------ */
  function hostIs(host, domain) {
    // exact match or a true subdomain. "bisp.gov.pk.evil.com" must NOT pass.
    return host === domain || host.endsWith('.' + domain);
  }

  function isOfficialHost(host) {
    if (host === 'gov.pk' || host.endsWith('.gov.pk')) return true;
    return Data.entities.some((e) => e.domains.some((d) => hostIs(host, d)));
  }

  const ALL_BRANDS = Array.from(new Set(Data.entities.flatMap((e) => e.brands)));
  const SCAM_WORDS = ['refund', 'tax', 'verify', 'gov', 'pk', 'online', 'help', 'portal', 'claim', 'login', 'update', 'grant', 'sim', 'notice', 'support', 'payment', 'pay', 'check', 'official', 'card', 'status'];

  function findBrandToken(host) {
    const tokens = host.split(/[^a-z]+/).filter(Boolean);
    if (tokens.includes('gov')) return 'gov';
    for (const brand of ALL_BRANDS) {
      for (const t of tokens) {
        if (t === brand) return brand;
        if (brand.length >= 4 && (t.startsWith(brand) || t.endsWith(brand)) && t.length <= brand.length + 12) return brand;
        if (brand.length < 4 && t.startsWith(brand) && SCAM_WORDS.includes(t.slice(brand.length))) return brand;
      }
    }
    return null;
  }

  function classifyLink(raw, claimed) {
    const { host, deceptive } = parseHost(raw);
    if (!host || !host.includes('.')) return null;
    if (deceptive) return { raw, host, kind: 'lookalike', weight: 55, critical: true };
    if (isOfficialHost(host)) return { raw, host, kind: 'official', weight: 0 };
    if (Data.shorteners.some((s) => hostIs(host, s))) return { raw, host, kind: 'shortener', weight: claimed.length ? 40 : 30 };
    if (Data.messagingHosts.some((s) => hostIs(host, s))) return { raw, host, kind: 'messaging', weight: 25 };
    if (host.includes('xn--')) return { raw, host, kind: 'punycode', weight: 45, critical: true };
    if (/^\d{1,3}(\.\d{1,3}){3}$/.test(host)) return { raw, host, kind: 'ip', weight: 35 };
    const brand = findBrandToken(host);
    if (brand) {
      const strong = brand.length >= 4 || claimed.length > 0;
      return { raw, host, kind: 'lookalike', weight: strong ? 55 : 40, critical: strong, brand };
    }
    if (claimed.length) return { raw, host, kind: 'unofficial', weight: 40 };
    const tld = host.split('.').pop();
    return { raw, host, kind: 'unknown', weight: Data.cheapTlds.includes(tld) ? 25 : 15 };
  }

  /* ------------------------------------------------------------------ */
  /* Pattern rules                                                       */
  /* ------------------------------------------------------------------ */
  const compiled = Data.rules.map((rule) => ({ rule, res: rule.patterns.map((p) => new RegExp(p, 'gi')) }));

  const REQ_RE = new RegExp(
    [
      '\\b(?:share|send|provide|give|tell|reply|enter|confirm|submit|verify|update|type|fill|forward|read out)\\b',
      '\\b(?:bhej\\w*|bata\\w*|batao|share kar\\w*|likh\\w*|reply kar\\w*|dein|dijiye|dijie)\\b',
      'بھیج|بتائ|بتا\\s*دیں|بتادیں|شیئر|ارسال|دیں|دیجئ|دیجیے|لکھ|درج\\s*کر|فراہم|کنفرم|تصدیق\\s*کر'
    ].join('|'),
    'gi'
  );
  const NEG_RE = /(?:(?:^|[^a-z])(?:not|never|don'?t|dont|nahi+n?|na|mat|kabhi na)|(?:^|[\s،,])(?:نہ|نہیں|ہرگز|مت))\s*(?:to\s+|ever\s+|kisi ko\s+)?$/i;

  function isBoundary(text, i) {
    const c = text[i];
    if (c === '!' || c === '?' || c === '\n' || c === '۔' || c === '؟') return true;
    if (c === '.') return i + 1 >= text.length || /\s/.test(text[i + 1]);
    return false;
  }

  function requestNear(text, from, to) {
    let s = from;
    while (s > 0 && !isBoundary(text, s - 1)) s--;
    let e = to;
    while (e < text.length && !isBoundary(text, e)) e++;
    const sentence = text.slice(s, e);
    REQ_RE.lastIndex = 0;
    let m;
    while ((m = REQ_RE.exec(sentence))) {
      if (m[0].length === 0) {
        REQ_RE.lastIndex++;
        continue;
      }
      const before = sentence.slice(Math.max(0, m.index - 16), m.index);
      if (!NEG_RE.test(before)) return true; // a request verb that is not negated
    }
    return false;
  }

  function evaluateRule(entry, text) {
    const hits = [];
    for (const re of entry.res) {
      re.lastIndex = 0;
      let m;
      while ((m = re.exec(text))) {
        if (m[0].length === 0) {
          re.lastIndex++;
          continue;
        }
        if (!entry.rule.requireRequest || requestNear(text, m.index, m.index + m[0].length)) {
          const snippet = m[0].trim().slice(0, 60);
          if (!hits.includes(snippet)) hits.push(snippet);
        }
        if (hits.length >= 3) break;
      }
      if (hits.length >= 3) break;
    }
    return hits.length ? hits : null;
  }

  /* ------------------------------------------------------------------ */
  /* Who does the message claim to be?                                   */
  /* ------------------------------------------------------------------ */
  function escapeRe(s) {
    return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  function detectEntities(norm, lower) {
    const spaceless = norm.replace(/\s+/g, '');
    return Data.entities.filter((e) => {
      const latin = e.keywords.some((k) => new RegExp('\\b' + escapeRe(k) + '\\b', 'i').test(lower));
      const cs = e.keywordsCS.some((k) => new RegExp('\\b' + escapeRe(k) + '\\b').test(norm));
      const ur = e.keywordsUr.some((k) => spaceless.includes(k));
      return latin || cs || ur;
    });
  }

  /* ------------------------------------------------------------------ */
  /* Main entry point                                                    */
  /* ------------------------------------------------------------------ */
  function severityOf(weight, critical) {
    if (critical || weight >= 40) return 'high';
    if (weight >= 25) return 'medium';
    return 'low';
  }

  function analyze(input) {
    const norm = normalize(input);
    if (norm.length < 8) return { level: 'empty', score: 0, findings: [], entities: [], links: [], phones: [], steps: [], channels: [] };

    const lower = joinSpacedLetters(norm).toLowerCase();
    const textForRules = lower;
    const claimed = detectEntities(joinSpacedLetters(norm), lower);
    const claimedIds = claimed.map((e) => e.id);

    const findings = [];
    const triggered = new Set();

    // 1. Pattern rules
    for (const entry of compiled) {
      const evidence = evaluateRule(entry, textForRules);
      if (!evidence) continue;
      triggered.add(entry.rule.id);
      findings.push({
        id: entry.rule.id,
        weight: entry.rule.weight,
        critical: !!entry.rule.critical,
        contextOnly: !!entry.rule.contextOnly,
        evidence,
        title: entry.rule.title,
        why: entry.rule.why
      });
    }

    // 2. Links
    const links = extractLinks(norm).map((raw) => classifyLink(raw, claimedIds)).filter(Boolean);
    const seenKinds = new Set();
    for (const l of links) {
      if (seenKinds.has(l.kind)) continue;
      seenKinds.add(l.kind);
      const text = Data.findingText[l.kind];
      findings.push({
        id: 'link_' + l.kind,
        weight: l.weight,
        critical: !!l.critical,
        info: l.kind === 'official',
        evidence: links.filter((x) => x.kind === l.kind).map((x) => x.host).slice(0, 3),
        title: text.title,
        why: text.why
      });
    }
    const hasBadLink = links.some((l) => l.kind !== 'official');

    // 3. Personal phone numbers
    const phones = extractPhones(norm);
    if (phones.length) {
      let w = 0;
      if (claimed.length) w = 35;
      else if (['asks_money', 'prize', 'job_offer', 'offers_benefit', 'threat'].some((id) => triggered.has(id))) w = 25;
      if (w) {
        findings.push({ id: 'contact', weight: w, critical: false, evidence: phones.slice(0, 3), title: Data.findingText.contact.title, why: Data.findingText.contact.why });
      }
    }

    // 4. Contradictions with what the claimed body has said officially
    for (const e of claimed) {
      if (!e.never.length || !e.neverText) continue;
      if (!e.never.some((id) => triggered.has(id))) continue;
      if (e.neverNeedsContact && !(hasBadLink || phones.length)) continue;
      findings.push({
        id: 'contradiction',
        weight: 40,
        critical: false,
        entity: e.id,
        evidence: [],
        title: Data.findingText.contradiction.title,
        why: e.neverText,
        source: e.source
      });
    }

    // 5. Score
    // Context-only signals ("promises a grant", "keep it secret") appear in
    // genuine messages too, so they are shown and scored only when something
    // stronger is also present.
    const hasStrong = findings.some((f) => !f.info && !f.contextOnly);
    if (!hasStrong) {
      for (let i = findings.length - 1; i >= 0; i--) if (findings[i].contextOnly) findings.splice(i, 1);
    }
    const real = findings.filter((f) => !f.info);
    let score = Math.min(100, real.reduce((sum, f) => sum + f.weight, 0));

    const anyCritical = real.some((f) => f.critical);
    let level = 'none';
    if (anyCritical || score >= 70) level = 'high';
    else if (score >= 40) level = 'suspicious';
    else if (score >= 10) level = 'caution';

    for (const f of findings) f.severity = f.info ? 'info' : severityOf(f.weight, f.critical);
    findings.sort((a, b) => b.weight - a.weight);

    // 6. Next steps
    const S = Data.steps;
    const steps = [];
    if (level === 'none') {
      steps.push(S.verify);
    } else {
      steps.push(S.dontEngage);
      if (['asks_otp_pin', 'asks_cnic', 'asks_bank', 'asks_money'].some((id) => triggered.has(id))) steps.push(S.neverShare);
      steps.push(S.verify, S.report);
      if (level === 'high' || triggered.has('asks_money') || triggered.has('asks_otp_pin')) steps.push(S.alreadyPaid);
      if (level === 'high') steps.push(S.shareWarning);
    }

    // 7. Official channels for the bodies the message named
    const channels = claimed.filter((e) => e.websites.length || e.helplines.length).map((e) => ({ id: e.id, name: e.name, websites: e.websites, helplines: e.helplines, source: e.source }));

    return {
      level,
      score,
      verdict: Data.verdicts[level],
      findings,
      entities: claimed.map((e) => ({ id: e.id, name: e.name })),
      links: links.map((l) => ({ raw: l.raw, host: l.host, kind: l.kind })),
      phones,
      steps,
      channels
    };
  }

  /* What the optional AI explainer is allowed to see: redacted text + rule ids. */
  function toExplainPayload(result, input, lang) {
    return {
      lang: lang === 'ur' ? 'ur' : 'en',
      level: result.level,
      findings: result.findings.map((f) => f.id),
      entities: result.entities.map((e) => e.id),
      text: redact(input).slice(0, 1200)
    };
  }

  return { analyze, redact, normalize, extractLinks, parseHost, isOfficialHost, classifyLink, toExplainPayload };
});
