'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const Engine = require('../public/engine.js');
const Data = require('../public/data.js');

const ids = (r) => r.findings.map((f) => f.id);

/* ---------- Known scams must be caught ---------- */

test('BISP grant with processing fee on a personal wallet is high risk', () => {
  const r = Engine.analyze(Data.examples.find((e) => e.id === 'bisp_fee').text);
  assert.equal(r.level, 'high');
  assert.ok(ids(r).includes('asks_money'));
  assert.ok(ids(r).includes('contact'));
  const c = r.findings.find((f) => f.id === 'contradiction');
  assert.ok(c, 'should contradict BISP\'s own "no fees" statement');
  assert.equal(c.entity, 'bisp');
});

test('Fake PTA SIM-block notice with a lookalike link is high risk', () => {
  const r = Engine.analyze(Data.examples.find((e) => e.id === 'pta_sim').text);
  assert.equal(r.level, 'high');
  assert.ok(ids(r).includes('threat'));
  assert.ok(ids(r).includes('link_lookalike'));
  assert.ok(ids(r).includes('contradiction'));
});

test('Urdu prize message asking for CNIC and OTP is high risk', () => {
  const r = Engine.analyze(Data.examples.find((e) => e.id === 'urdu_prize').text);
  assert.equal(r.level, 'high');
  assert.ok(ids(r).includes('asks_otp_pin'));
  assert.ok(ids(r).includes('asks_cnic'));
  assert.ok(ids(r).includes('prize'));
});

test('Roman Urdu fake FPSC job with shortened link is high risk', () => {
  const r = Engine.analyze(Data.examples.find((e) => e.id === 'roman_job').text);
  assert.equal(r.level, 'high');
  for (const id of ['asks_money', 'job_offer', 'secrecy', 'link_shortener']) assert.ok(ids(r).includes(id), 'missing ' + id);
});

/* ---------- Genuine-looking messages must not be flagged ---------- */

test('Plain NADRA collection notice finds nothing', () => {
  const r = Engine.analyze(Data.examples.find((e) => e.id === 'ok_nadra').text);
  assert.equal(r.level, 'none');
  assert.equal(r.findings.length, 0);
});

test('A genuine OTP SMS that says "do not share" is not flagged', () => {
  assert.equal(Engine.analyze('Your OTP for transaction is 482913. Do not share it with anyone.').level, 'none');
  assert.equal(Engine.analyze('OTP 482913 - never share it with anyone, including bank staff.').level, 'none');
  assert.equal(Engine.analyze('آپ کا او ٹی پی 482913 ہے۔ اسے کسی کو نہ بتائیں۔').level, 'none');
});

test('Asking for an OTP IS flagged', () => {
  assert.equal(Engine.analyze('Please send your OTP to confirm your account.').level, 'high');
  assert.equal(Engine.analyze('Apna OTP bhejein warna account band ho jayega').level, 'high');
});

test('An official .gov.pk link alone is not a warning sign', () => {
  const r = Engine.analyze('Check your payment status at https://www.bisp.gov.pk');
  assert.equal(r.level, 'none');
  assert.equal(r.findings[0].severity, 'info');
});

test('"Promises a grant" alone does not raise the level', () => {
  assert.equal(Engine.analyze('Your Kafalat installment is released. Visit your nearest retailer.').level, 'none');
});

test('"فیس بک" (Facebook) is not treated as a fee', () => {
  assert.ok(!ids(Engine.analyze('ہمارے فیس بک پیج پر لائک کریں اور شیئر کریں')).includes('asks_money'));
});

test('Roman Urdu "pta" (pata) is not mistaken for PTA', () => {
  const r = Engine.analyze('mujhe pta nahi kya karna hai is baare mein');
  assert.equal(r.entities.length, 0);
});

/* ---------- Link tricks ---------- */

test('bisp.gov.pk.evil-domain.com is NOT official', () => {
  assert.equal(Engine.isOfficialHost('bisp.gov.pk'), true);
  assert.equal(Engine.isOfficialHost('www.bisp.gov.pk'), true);
  assert.equal(Engine.isOfficialHost('bisp.gov.pk.claim-now.com'), false);
  assert.equal(Engine.isOfficialHost('notbisp.gov.pk.com'), false);
  const r = Engine.analyze('Claim your BISP grant at https://bisp.gov.pk.claim-now.com today');
  assert.equal(r.level, 'high');
});

test('user-info trick https://bisp.gov.pk@evil.example.com is caught', () => {
  assert.equal(Engine.parseHost('https://bisp.gov.pk@evil.example.com/login').host, 'evil.example.com');
  const r = Engine.analyze('Verify your BISP account: https://bisp.gov.pk@evil.example.com/login');
  assert.equal(r.level, 'high');
  assert.ok(ids(r).includes('link_lookalike'));
});

test('Spaced-out brand names are still recognised', () => {
  const r = Engine.analyze('B I S P grant: send Rs 500 on jazzcash to receive it');
  assert.ok(r.entities.some((e) => e.id === 'bisp'));
});

test('Unrelated domains with short brand-like prefixes are not called lookalikes', () => {
  const r = Engine.analyze('Read more at hector.com for details about the offer');
  const l = r.links.find((x) => x.host === 'hector.com');
  assert.equal(l.kind, 'unknown');
});

test('PTA contradiction needs a bad link or personal number', () => {
  const r = Engine.analyze('PTA notice: your SIM will be blocked today.');
  assert.ok(!ids(r).includes('contradiction'));
});

/* ---------- Redaction ---------- */

test('CNIC and phone numbers are redacted, including Urdu digits', () => {
  const out = Engine.redact('CNIC 35202-1234567-1, phone 0300-1234567, alt +92 321 7654321, email a.b@x.com');
  assert.ok(!/\d{5}/.test(out), 'digits left: ' + out);
  assert.ok(out.includes('[CNIC]') && out.includes('[PHONE]') && out.includes('[EMAIL]'));
  assert.equal(Engine.redact('۳۵۲۰۲۱۲۳۴۵۶۷۱ ۰۳۰۰۱۲۳۴۵۶۷'), '[CNIC] [PHONE]');
});

test('The payload for the AI step contains no raw identifiers', () => {
  const input = 'Send OTP and CNIC 35202-1234567-1 to 0300-1234567';
  const p = Engine.toExplainPayload(Engine.analyze(input), input, 'en');
  assert.ok(!/35202|1234567/.test(JSON.stringify(p)));
});

/* ---------- Robustness ---------- */

test('Empty and tiny input is handled', () => {
  assert.equal(Engine.analyze('').level, 'empty');
  assert.equal(Engine.analyze('hi').level, 'empty');
  assert.equal(Engine.analyze(null).level, 'empty');
});

test('Very long input does not hang', () => {
  const t0 = Date.now();
  Engine.analyze('send otp '.repeat(20000));
  assert.ok(Date.now() - t0 < 1500);
});

/* ---------- Regression battery: realistic scams and genuine messages ---------- */

const SCAMS = [
  ['Dear customer your Easypaisa account has been blocked. Send CNIC copy to 0345-1234567 to reactivate', 'high'],
  ['BISP 8171 ke tehat aap ko 25000 rupay mil rahay hain. Apna shanakhti card number is link par likhein: bisp-8171.com', 'high'],
  ['FBR Notice: Your income tax refund of Rs 45,000 is pending. Click to claim: tinyurl.com/fbr-refund', 'suspicious'],
  ['ڈیئر کسٹمر آپ کا شناختی کارڈ بلاک ہو گیا ہے۔ نادرا ہیلپ لائن 03211234567 پر رابطہ کریں', 'suspicious'],
  ['Your account is suspended. Verify your account: https://hbl-secure-login.com', 'suspicious'],
  ['FIA notice: case registered against your CNIC for illegal activity. Contact officer on WhatsApp +92 300 1112223 immediately', 'high'],
  ['Ehsaas Rashan Program: Register now and get Rs 10000. Send 300 rupees registration fee to Jazzcash 03451234567', 'high']
];
const RANK = { none: 0, caution: 1, suspicious: 2, high: 3 };

for (const [text, minLevel] of SCAMS) {
  test('scam caught (>= ' + minLevel + '): ' + text.slice(0, 50), () => {
    const r = Engine.analyze(text);
    assert.ok(RANK[r.level] >= RANK[minLevel], 'got ' + r.level + ' (' + ids(r).join(',') + ')');
  });
}

const GENUINE = [
  'Your BISP Kafalat payment of Rs 13500 has been issued. Visit nearest HBL Konnect agent with your CNIC.',
  'Dear customer, your Jazz package has been activated. Dial *111# for details.',
  'NADRA: Please bring your original CNIC and token to the center.',
  'Reminder: FBR deadline for filing returns is 30 September. Visit fbr.gov.pk',
  'PTA: Your device IMEI is not registered. Please register at dirbs.pta.gov.pk within 60 days',
  'Eid Mubarak! Wishing you and your family a blessed Eid. Pta nahi kab milenge.',
  'Meeting at 5pm tomorrow, please send me the report by evening'
];

for (const text of GENUINE) {
  test('genuine not flagged: ' + text.slice(0, 50), () => {
    assert.equal(Engine.analyze(text).level, 'none');
  });
}
