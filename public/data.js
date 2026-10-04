/*
 * Sach Check - knowledge base.
 *
 * Everything here is data, not logic. To add a new scam pattern or a new
 * official body, edit this file only. The engine (engine.js) reads it.
 *
 * VERIFIED fields (helplines, domains, "never asks") were checked against the
 * body's own website. Anything you add MUST come from the official site and
 * carry a `source` URL. If you cannot verify it, leave it out.
 */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.SachData = factory();
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  /* ------------------------------------------------------------------ */
  /* Official bodies                                                     */
  /* ------------------------------------------------------------------ */
  const entities = [
    {
      id: 'bisp',
      name: { en: 'BISP (Benazir Income Support Programme)', ur: 'بی آئی ایس پی (بینظیر انکم سپورٹ پروگرام)' },
      domains: ['bisp.gov.pk'],
      brands: ['bisp', 'benazir', 'kafalat', 'kafaalat', 'ehsaas'],
      keywords: ['bisp', 'benazir', 'kafalat', 'kafaalat', 'ehsaas', 'ehsas program'],
      keywordsCS: [],
      keywordsUr: ['بینظیر', 'بےنظیر', 'کفالت', 'احساسپروگرام', 'بیآئیایسپی'],
      helplines: [{ label: { en: 'Helpline (Mon-Fri, 9am-5pm)', ur: 'ہیلپ لائن (پیر تا جمعہ، صبح 9 تا شام 5)' }, value: '0800-26477' }],
      websites: ['www.bisp.gov.pk'],
      never: ['asks_money'],
      neverNeedsContact: false,
      neverText: {
        en: 'BISP states that it charges no fees for its services. A message that asks you to pay anything to receive a BISP payment does not come from BISP.',
        ur: 'بی آئی ایس پی کے مطابق وہ اپنی خدمات کے لیے کوئی فیس نہیں لیتا۔ جو پیغام بی آئی ایس پی کی رقم کے لیے آپ سے کچھ بھی ادا کرنے کو کہے وہ بی آئی ایس پی کی طرف سے نہیں ہے۔'
      },
      source: 'https://www.bisp.gov.pk'
    },
    {
      id: 'nadra',
      name: { en: 'NADRA', ur: 'نادرا' },
      domains: ['nadra.gov.pk'],
      brands: ['nadra', 'pakid'],
      keywords: ['nadra', 'pak identity', 'pak id', 'pakid'],
      keywordsCS: [],
      keywordsUr: ['نادرا'],
      helplines: [
        { label: { en: 'Helpline (24/7)', ur: 'ہیلپ لائن (24 گھنٹے)' }, value: '1777' },
        { label: { en: 'Phone', ur: 'فون' }, value: '+92 51 111 786 100' }
      ],
      websites: ['www.nadra.gov.pk'],
      never: [],
      neverNeedsContact: false,
      neverText: null,
      source: 'https://www.nadra.gov.pk'
    },
    {
      id: 'fbr',
      name: { en: 'FBR (Federal Board of Revenue)', ur: 'ایف بی آر (فیڈرل بورڈ آف ریونیو)' },
      domains: ['fbr.gov.pk'],
      brands: ['fbr'],
      keywords: ['fbr', 'federal board of revenue'],
      keywordsCS: [],
      keywordsUr: ['ایفبیآر', 'فیڈرلبورڈآفریونیو'],
      helplines: [],
      websites: ['fbr.gov.pk'],
      never: ['asks_otp_pin', 'asks_bank'],
      neverNeedsContact: false,
      neverText: {
        en: 'FBR states that it never sends SMS to taxpayers asking for banking information, PINs or passwords, or asking you to call a number to give such details.',
        ur: 'ایف بی آر کے مطابق وہ ٹیکس دہندگان کو ایسے ایس ایم ایس نہیں بھیجتا جن میں بینکنگ معلومات، پن یا پاس ورڈ مانگے جائیں، یا ایسی معلومات دینے کے لیے کسی نمبر پر کال کرنے کو کہا جائے۔'
      },
      source: 'https://www.fbr.gov.pk/beware-fradulant-sms/152600'
    },
    {
      id: 'pta',
      name: { en: 'PTA (Pakistan Telecommunication Authority)', ur: 'پی ٹی اے (پاکستان ٹیلی کمیونیکیشن اتھارٹی)' },
      domains: ['pta.gov.pk', 'dirbs.pta.gov.pk', 'complaint.pta.gov.pk'],
      brands: ['pta', 'dirbs'],
      keywords: ['pakistan telecommunication authority', 'dirbs'],
      keywordsCS: ['PTA'], // 'pta' is also Roman Urdu for "pata", so only match upper-case
      keywordsUr: ['پیٹیاے', 'پاکستانٹیلیکمیونیکیشناتھارٹی'],
      helplines: [{ label: { en: 'Complaint helpline (toll-free)', ur: 'شکایت ہیلپ لائن (ٹول فری)' }, value: '0800-55055' }],
      websites: ['dirbs.pta.gov.pk', 'complaint.pta.gov.pk'],
      never: ['threat'],
      neverNeedsContact: true, // only contradict when there is also a bad link / personal number
      neverText: {
        en: 'PTA has warned that messages claiming "suspicious activity" or threatening to suspend your SIM or phone, with a link, are phishing. To check a device, use dirbs.pta.gov.pk, or SMS the IMEI to 8484 from your own registered number.',
        ur: 'پی ٹی اے نے خبردار کیا ہے کہ "مشکوک سرگرمی" یا سم/فون بند ہونے کی دھمکی والے پیغامات، جن میں لنک ہو، فراڈ ہیں۔ ڈیوائس چیک کرنے کے لیے dirbs.pta.gov.pk استعمال کریں یا اپنے رجسٹرڈ نمبر سے آئی ایم ای آئی 8484 پر ایس ایم ایس کریں۔'
      },
      source: 'https://pta.gov.pk/category/pta-cautions-public-on-deceptive-links-urges-public-vigilance-use-of-official-platforms-for-services-345516644-2024-07-04'
    },
    {
      id: 'ecp',
      name: { en: 'Election Commission of Pakistan', ur: 'الیکشن کمیشن آف پاکستان' },
      domains: ['ecp.gov.pk'],
      brands: ['ecp'],
      keywords: ['election commission'],
      keywordsCS: ['ECP'],
      keywordsUr: ['الیکشنکمیشن'],
      helplines: [],
      websites: ['ecp.gov.pk'],
      never: [],
      neverNeedsContact: false,
      neverText: null,
      source: 'https://ecp.gov.pk'
    },
    {
      id: 'fpsc',
      name: { en: 'FPSC (Federal Public Service Commission)', ur: 'ایف پی ایس سی (فیڈرل پبلک سروس کمیشن)' },
      domains: ['fpsc.gov.pk'],
      brands: ['fpsc'],
      keywords: ['fpsc', 'federal public service commission'],
      keywordsCS: [],
      keywordsUr: ['ایفپیایسسی', 'فیڈرلپبلکسروسکمیشن'],
      helplines: [],
      websites: ['fpsc.gov.pk'],
      never: [],
      neverNeedsContact: false,
      neverText: null,
      source: 'https://fpsc.gov.pk'
    },
    {
      id: 'hec',
      name: { en: 'HEC (Higher Education Commission)', ur: 'ایچ ای سی (ہائر ایجوکیشن کمیشن)' },
      domains: ['hec.gov.pk'],
      brands: ['hec'],
      keywords: ['higher education commission'],
      keywordsCS: ['HEC'],
      keywordsUr: ['ہائرایجوکیشنکمیشن'],
      helplines: [],
      websites: ['hec.gov.pk'],
      never: [],
      neverNeedsContact: false,
      neverText: null,
      source: 'https://hec.gov.pk'
    },
    {
      id: 'fia',
      name: { en: 'FIA (Federal Investigation Agency)', ur: 'ایف آئی اے (وفاقی تحقیقاتی ادارہ)' },
      domains: [],
      brands: ['fia'],
      keywords: ['federal investigation agency'],
      keywordsCS: ['FIA'],
      keywordsUr: ['ایفآئیاے', 'وفاقیتحقیقاتیادارہ'],
      helplines: [], // not verified: add only from the agency's own site
      websites: [],
      never: [],
      neverNeedsContact: false,
      neverText: null,
      source: null
    },
    {
      // Generic "government of Pakistan" claim. No domains: any *.gov.pk host
      // is already treated as an official domain by the engine.
      id: 'gov',
      name: { en: 'the Government of Pakistan', ur: 'حکومتِ پاکستان' },
      domains: [],
      brands: ['govpk', 'pakgov', 'pakistangov'],
      keywords: ['government of pakistan', 'govt of pakistan', 'govt. of pakistan', 'pakistan government', 'prime minister', 'laptop scheme', 'pm relief'],
      keywordsCS: [],
      keywordsUr: ['حکومتپاکستان', 'وزیراعظم', 'وفاقیحکومت', 'صوبائیحکومت'],
      helplines: [],
      websites: ['www.pakistan.gov.pk'],
      never: [],
      neverNeedsContact: false,
      neverText: null,
      source: 'https://www.pakistan.gov.pk'
    }
  ];

  /* ------------------------------------------------------------------ */
  /* Pattern rules                                                       */
  /* ------------------------------------------------------------------ */
  /*
   * patterns: regex SOURCE strings, matched case-insensitively against text
   *           that has been normalised (Urdu digits -> ASCII, diacritics
   *           removed, zero-width chars removed, spaced letters joined).
   * requireRequest: the match only counts if the same sentence also contains
   *           a request verb (send/share/bhejein/بھیجیں...) that is not negated
   *           ("do not share"). This stops genuine "Your OTP is 1234, never
   *           share it" messages from being flagged.
   * weight:   how much this adds to the 0-100 risk score.
   * critical: any single critical finding makes the verdict "high".
   */
  const rules = [
    {
      id: 'asks_otp_pin',
      weight: 50,
      critical: true,
      requireRequest: true,
      patterns: [
        '\\b(otp|one[- ]time (?:password|pin|code)|pin|password|passcode|cvv|cvc|verification code|security code|login code)\\b',
        'او\\s*ٹی\\s*پی|پن\\s*کوڈ|\\bپن\\b|پاس\\s*ورڈ|سیکیورٹی\\s*کوڈ|تصدیقی\\s*کوڈ|ویریفکیشن\\s*کوڈ'
      ],
      title: { en: 'Asks for your OTP, PIN or password', ur: 'آپ سے او ٹی پی، پن یا پاس ورڈ مانگا جا رہا ہے' },
      why: {
        en: 'An OTP, PIN or password is meant for you alone. No bank, wallet or government body needs you to read it out, reply with it or type it into a link they sent. Sharing it lets someone take over your account or approve a payment.',
        ur: 'او ٹی پی، پن یا پاس ورڈ صرف آپ کے لیے ہوتا ہے۔ کسی بینک، والٹ یا سرکاری ادارے کو اسے بتانے، جواب میں بھیجنے یا بھیجے گئے لنک میں لکھنے کی ضرورت نہیں ہوتی۔ اسے شیئر کرنے سے کوئی بھی آپ کا اکاؤنٹ سنبھال سکتا ہے یا ادائیگی منظور کر سکتا ہے۔'
      }
    },
    {
      id: 'asks_cnic',
      weight: 30,
      requireRequest: true,
      patterns: [
        '\\b(cnic|id card|identity card|shanakhti card|smart card)\\b',
        'شناختی\\s*کارڈ|سی\\s*این\\s*آئی\\s*سی'
      ],
      title: { en: 'Asks you to send your CNIC or ID details', ur: 'آپ سے شناختی کارڈ یا شناختی معلومات مانگی جا رہی ہیں' },
      why: {
        en: 'Your CNIC number and photo can be used to register SIMs, open wallet accounts or take loans in your name. Share them only on an official portal that you opened yourself.',
        ur: 'آپ کے شناختی کارڈ کا نمبر اور تصویر آپ کے نام پر سم رجسٹر کرنے، والٹ اکاؤنٹ کھولنے یا قرض لینے میں استعمال ہو سکتی ہے۔ انہیں صرف ایسے سرکاری پورٹل پر دیں جسے آپ نے خود کھولا ہو۔'
      }
    },
    {
      id: 'asks_bank',
      weight: 40,
      requireRequest: true,
      patterns: [
        '\\b(bank account|account number|iban|card number|debit card|credit card|account details|bank details|atm card)\\b',
        'بینک\\s*اکاؤنٹ|اکاؤنٹ\\s*نمبر|کارڈ\\s*نمبر|ڈیبٹ\\s*کارڈ|کریڈٹ\\s*کارڈ|آئی\\s*بی\\s*اے\\s*این|بینک\\s*کی\\s*تفصیل'
      ],
      title: { en: 'Asks for your bank or card details', ur: 'آپ سے بینک یا کارڈ کی تفصیلات مانگی جا رہی ہیں' },
      why: {
        en: 'Giving your account number, card number or card details to an unknown sender is how people lose money. A real payer only needs the details you gave on the official form.',
        ur: 'نامعلوم بھیجنے والے کو اکاؤنٹ نمبر، کارڈ نمبر یا کارڈ کی تفصیلات دینے سے ہی لوگ اپنی رقم کھو بیٹھتے ہیں۔ اصل ادارے کو صرف وہی معلومات چاہیے ہوتی ہیں جو آپ نے سرکاری فارم میں دی ہوں۔'
      }
    },
    {
      id: 'asks_money',
      weight: 35,
      requireRequest: false,
      patterns: [
        '\\b(processing|registration|release|clearance|security|advance|activation|delivery|admin|verification|tax)\\s+(fees?|charges?|amount|deposit)\\b',
        '\\b(pay|send|deposit|transfer|load)\\s+(?:rs\\.?|pkr|rupees)?\\s*\\d',
        '\\b(easypaisa|easy paisa|jazzcash|jazz cash|sadapay|nayapay)\\b',
        '\\b(fees?|charges?|paise|paisay|rupay|rupees)\\s+(jama|bhej|bhejein|bhejain|bhejen|transfer|send)\\w*',
        '\\bjama\\s+(karwa|karao|karain|kara|kar)',
        'فیس(?!\\s*بک)|جمع\\s*(کروا|کرا)|رقم\\s*(بھیج|ارسال)|ایزی\\s*پیسہ|جاز\\s*کیش|چارجز|پراسیسنگ'
      ],
      title: { en: 'Asks you to pay money first', ur: 'پہلے پیسے بھیجنے کا مطالبہ' },
      why: {
        en: 'Scammers ask for an "advance" or "processing" fee, often to a mobile wallet or a personal account, before releasing a grant, job, prize or refund. Official fees are paid only through the channels listed on the department\'s own website.',
        ur: 'فراڈ کرنے والے گرانٹ، نوکری، انعام یا ریفنڈ جاری کرنے سے پہلے "ایڈوانس" یا "پراسیسنگ" فیس مانگتے ہیں، اکثر موبائل والٹ یا ذاتی اکاؤنٹ میں۔ سرکاری فیس صرف اسی طریقے سے ادا ہوتی ہے جو متعلقہ محکمے کی اپنی ویب سائٹ پر درج ہو۔'
      }
    },
    {
      id: 'urgency',
      weight: 15,
      requireRequest: false,
      patterns: [
        '\\b(urgent(?:ly)?|immediately|within\\s+\\d+\\s*(?:hours?|hrs?|minutes?)|within\\s+[1-3]\\s*days?|last chance|final notice|final warning|expires? (?:today|soon|tonight)|act now|today only|will be (?:blocked|suspended|cancel+ed|deactivated|terminated))\\b',
        '\\b(foran|fori|jaldi se|aaj hi|24 ghante|warna)\\b',
        'فوری|فوراً|فوراََ|جلد\\s*از\\s*جلد|آخری\\s*موقع|24\\s*گھنٹ|بلاک\\s*ہو|بند\\s*ہو\\s*جائ|معطل'
      ],
      title: { en: 'Pushes you to act in a hurry', ur: 'جلدی کرنے کا دباؤ' },
      why: {
        en: 'Pressure to act "within 24 hours" is designed to stop you from checking. Real offices give written notice and a way to verify.',
        ur: '"24 گھنٹوں میں" جیسا دباؤ اس لیے ڈالا جاتا ہے کہ آپ تصدیق نہ کر سکیں۔ اصل دفاتر تحریری نوٹس دیتے ہیں اور تصدیق کا طریقہ بھی بتاتے ہیں۔'
      }
    },
    {
      id: 'call_to_action',
      weight: 15,
      requireRequest: false,
      patterns: [
        '\\b(?:click|tap|open|visit)\\s+(?:here|the link|this link|below|to (?:claim|verify|confirm|update|unlock|activate))\\b',
        '\\b(?:claim|verify|login|log in)\\s+(?:now|here)\\b',
        '\\blink\\s+par\\s+click\\b|\\bclick\\s+karein\\b',
        'لنک\\s*پر\\s*کلک|کلک\\s*کریں'
      ],
      title: { en: 'Tells you to tap a link to claim or verify', ur: 'دعویٰ کرنے یا تصدیق کے لیے لنک دبانے کا کہا جا رہا ہے' },
      why: {
        en: 'Real offices do not ask you to tap a link in a message to claim money or verify your identity. Open the official website yourself instead.',
        ur: 'اصل دفاتر پیغام میں دیے گئے لنک کو دبا کر رقم وصول کرنے یا شناخت کی تصدیق کا نہیں کہتے۔ اس کے بجائے سرکاری ویب سائٹ خود کھولیں۔'
      }
    },
    {
      id: 'prize',
      weight: 30,
      requireRequest: false,
      patterns: [
        '\\b(congratulations?|you (?:have )?won|winner|lucky draw|you (?:have been|are) selected|prize|lottery|bonanza|you are eligible)\\b',
        '\\b(inaam|inam|aap ne jeet|lucky draw)\\b',
        'مبارک\\s*ہو|انعام|لکی\\s*ڈرا|قرعہ\\s*اندازی|آپ\\s*منتخب'
      ],
      title: { en: 'Says you won a prize or were "selected"', ur: 'انعام نکلنے یا "منتخب" ہونے کا دعویٰ' },
      why: {
        en: 'You cannot win a draw you never entered. Unexpected prize or lucky-draw messages are one of the most common scams in Pakistan.',
        ur: 'جس قرعہ اندازی میں آپ نے حصہ ہی نہیں لیا اس میں انعام نہیں نکل سکتا۔ اچانک انعام یا لکی ڈرا کے پیغامات پاکستان میں فراڈ کی سب سے عام قسموں میں سے ہیں۔'
      }
    },
    {
      id: 'offers_benefit',
      weight: 10,
      contextOnly: true, // only counts when something else is also wrong
      requireRequest: false,
      patterns: [
        '\\b(grant|cash (?:prize|reward)|loan (?:approved|sanctioned)|payment (?:approved|released)|refund[^.]{0,30}(?:approved|pending|ready|released)|installment (?:approved|released)|qist|kafalat|scholarship (?:awarded|approved))\\b',
        'گرانٹ|قسط|کفالت|ریفنڈ|قرض\\s*منظور|وظیفہ'
      ],
      title: { en: 'Promises a grant, refund or payment', ur: 'گرانٹ، ریفنڈ یا ادائیگی کا وعدہ' },
      why: {
        en: 'Messages that promise government money are a favourite bait. On its own this is only a mild sign; it matters when combined with a payment request, a link or a personal number.',
        ur: 'سرکاری رقم کا وعدہ فراڈ میں عام طور پر استعمال ہونے والا لالچ ہے۔ اکیلے یہ معمولی علامت ہے؛ ادائیگی کے مطالبے، لنک یا ذاتی نمبر کے ساتھ یہ اہم ہو جاتی ہے۔'
      }
    },
    {
      id: 'threat',
      weight: 30,
      requireRequest: false,
      patterns: [
        '\\b(arrest(?:ed)?|fir (?:has been )?(?:registered|lodged|filed)|case (?:has been )?(?:registered|filed)|legal action|court notice|warrant|sim (?:will be |is )?(?:blocked|suspended)|your sim|illegal activit(?:y|ies)|suspicious activit(?:y|ies)|device (?:will be |is )?blocked|(?:account|cnic|card) (?:has been |is |will be )?(?:blocked|suspended|locked|deactivated))\\b',
        '\\b(giraftar|muqadma|fir darj|sim band|sim block)\\w*',
        'گرفتار|مقدمہ\\s*درج|ایف\\s*آئی\\s*آر|قانونی\\s*کارروائی|وارنٹ|سم\\s*بلاک|سم\\s*بند|شناختی\\s*کارڈ\\s*(?:بلاک|بند|معطل)|مشکوک\\s*سرگرم'
      ],
      title: { en: 'Threatens arrest, a case or SIM blocking', ur: 'گرفتاری، مقدمے یا سم بلاک ہونے کی دھمکی' },
      why: {
        en: 'Fake "FIA", "PTA" or "court" notices threaten you so that you panic and follow their link or call their number. Real notices come in writing from a traceable office.',
        ur: 'جعلی "ایف آئی اے"، "پی ٹی اے" یا "عدالت" کے نوٹس اس لیے دھمکاتے ہیں کہ آپ گھبرا کر ان کے لنک پر جائیں یا ان کے نمبر پر کال کریں۔ اصل نوٹس کسی قابلِ شناخت دفتر کی طرف سے تحریری ملتے ہیں۔'
      }
    },
    {
      id: 'job_offer',
      weight: 20,
      requireRequest: false,
      patterns: [
        '\\b(job offer|hiring|vacanc(?:y|ies)|recruitment|work from home|earn\\s+(?:rs\\.?|pkr)?\\s*\\d|per (?:day|month)|visa (?:available|approved)|overseas job|appointment letter|selected for (?:the )?(?:post|job))\\b',
        '\\b(naukri|bharti|ghar baithe|visa lagwa)\\w*',
        'نوکری|ملازمت|بھرتی|گھر\\s*بیٹھے|ویزا'
      ],
      title: { en: 'Looks like a job or visa offer', ur: 'نوکری یا ویزے کی پیشکش لگتی ہے' },
      why: {
        en: 'Fake job and visa offers often use a real department\'s name. Genuine government jobs are announced on the commission\'s own website and never need a fee sent to a personal account.',
        ur: 'جعلی نوکری اور ویزے کی پیشکشیں اکثر کسی اصل محکمے کا نام استعمال کرتی ہیں۔ سرکاری نوکریوں کا اعلان متعلقہ کمیشن کی اپنی ویب سائٹ پر ہوتا ہے اور ان کے لیے کسی ذاتی اکاؤنٹ میں فیس نہیں بھیجنی پڑتی۔'
      }
    },
    {
      id: 'chain_forward',
      weight: 15,
      requireRequest: false,
      patterns: [
        '\\b(forward|share)\\s+(?:this\\s+)?(?:message\\s+)?(?:to|with)\\s+(?:\\d+|all|your|everyone)',
        '\\b(forward karein|aage bhej\\w*|10 logon)\\b',
        'آگے\\s*(?:بھیج|فارورڈ)|دوسروں\\s*کو\\s*بھیج|10\\s*لوگوں'
      ],
      title: { en: 'Asks you to forward it to others', ur: 'اسے دوسروں کو آگے بھیجنے کا کہا جا رہا ہے' },
      why: {
        en: 'Chain messages that promise a reward for forwarding are used to spread scams and to collect phone numbers.',
        ur: 'آگے بھیجنے پر انعام کا وعدہ کرنے والے چین میسج فراڈ پھیلانے اور فون نمبر جمع کرنے کے لیے استعمال ہوتے ہیں۔'
      }
    },
    {
      id: 'secrecy',
      weight: 15,
      contextOnly: true, // genuine OTP/bank SMS also say "tell no one", so only count it alongside other signs
      requireRequest: false,
      patterns: [
        '\\b(do not tell anyone|don\'t tell anyone|keep (?:this )?(?:confidential|secret)|do not inform|strictly confidential)\\b',
        '\\b(kisi ko na batain|kisi ko mat batana)\\b',
        'کسی\\s*کو\\s*(?:نہ|مت)\\s*بتا|خفیہ\\s*رکھ'
      ],
      title: { en: 'Tells you to keep it secret', ur: 'اسے راز رکھنے کا کہا جا رہا ہے' },
      why: {
        en: 'Scammers isolate you so that no family member or friend can warn you. A real office has no reason to ask for secrecy.',
        ur: 'فراڈ کرنے والے آپ کو الگ تھلگ کرتے ہیں تاکہ کوئی گھر والا یا دوست آپ کو خبردار نہ کر سکے۔ اصل دفتر کو رازداری کی ضرورت نہیں ہوتی۔'
      }
    }
  ];

  /* ------------------------------------------------------------------ */
  /* Link classification data                                            */
  /* ------------------------------------------------------------------ */
  const shorteners = [
    'bit.ly', 'tinyurl.com', 't.co', 'goo.gl', 'cutt.ly', 'rb.gy', 'is.gd',
    'shorturl.at', 'ow.ly', 'tiny.cc', 'rebrand.ly', 'bit.do', 'v.gd', 'buff.ly'
  ];
  const messagingHosts = ['wa.me', 'api.whatsapp.com', 'chat.whatsapp.com', 't.me', 'telegram.me', 'telegram.dog'];
  const cheapTlds = ['xyz', 'top', 'click', 'online', 'site', 'vip', 'club', 'tk', 'ml', 'ga', 'cf', 'gq', 'cc', 'icu', 'buzz', 'fun', 'work', 'live', 'shop', 'store', 'link', 'biz', 'info'];

  /* ------------------------------------------------------------------ */
  /* Finding text that is not driven by regex patterns                   */
  /* ------------------------------------------------------------------ */
  const findingText = {
    lookalike: {
      title: { en: 'Link imitates an official name', ur: 'لنک کسی سرکاری ادارے کے نام کی نقل کرتا ہے' },
      why: {
        en: 'The web address contains the name of a government body but is not that body\'s real domain. Real government sites end in .gov.pk (for example bisp.gov.pk). Anything else, such as bisp-grant.online, is a copy.',
        ur: 'ویب ایڈریس میں کسی سرکاری ادارے کا نام ہے مگر یہ اس ادارے کا اصل ڈومین نہیں۔ اصل سرکاری ویب سائٹس .gov.pk پر ختم ہوتی ہیں (مثلاً bisp.gov.pk)۔ اس کے علاوہ کوئی بھی ایڈریس، جیسے bisp-grant.online، نقل ہے۔'
      }
    },
    punycode: {
      title: { en: 'Link uses disguised lookalike characters', ur: 'لنک میں بہروپ والے ملتے جلتے حروف ہیں' },
      why: {
        en: 'The address uses an encoded form (xn--) that is often used to imitate a real site with look-alike letters.',
        ur: 'ایڈریس میں انکوڈڈ شکل (xn--) ہے جو اکثر اصلی سائٹ کی نقل کے لیے ملتے جلتے حروف کے ساتھ استعمال ہوتی ہے۔'
      }
    },
    unofficial: {
      title: { en: 'Link is not an official government address', ur: 'لنک کوئی سرکاری ایڈریس نہیں ہے' },
      why: {
        en: 'The message claims to come from a government body, but its link does not end in .gov.pk.',
        ur: 'پیغام سرکاری ادارے کی طرف سے ہونے کا دعویٰ کرتا ہے مگر اس کا لنک .gov.pk پر ختم نہیں ہوتا۔'
      }
    },
    shortener: {
      title: { en: 'Link hides its real destination', ur: 'لنک اپنی اصل منزل چھپاتا ہے' },
      why: {
        en: 'Shortened links (bit.ly, tinyurl and similar) hide where they lead. Government bodies publish their full website address.',
        ur: 'مختصر لنک (bit.ly، tinyurl وغیرہ) یہ چھپاتے ہیں کہ وہ کہاں لے جائیں گے۔ سرکاری ادارے اپنی مکمل ویب سائٹ کا پتہ خود شائع کرتے ہیں۔'
      }
    },
    messaging: {
      title: { en: 'Moves you to WhatsApp or Telegram', ur: 'آپ کو واٹس ایپ یا ٹیلی گرام پر بلاتا ہے' },
      why: {
        en: 'Scammers move victims to private chats. Government services are not delivered through a stranger\'s WhatsApp or Telegram chat.',
        ur: 'فراڈ کرنے والے متاثرین کو نجی چیٹ میں لے جاتے ہیں۔ سرکاری خدمات کسی اجنبی کی واٹس ایپ یا ٹیلی گرام چیٹ کے ذریعے نہیں دی جاتیں۔'
      }
    },
    ip: {
      title: { en: 'Link is a raw IP address', ur: 'لنک ایک سادہ آئی پی ایڈریس ہے' },
      why: {
        en: 'Genuine services use a named website, not a string of numbers.',
        ur: 'اصل خدمات کسی نام والی ویب سائٹ پر ہوتی ہیں، نمبروں کی لڑی پر نہیں۔'
      }
    },
    unknown: {
      title: { en: 'Contains a link you cannot verify', ur: 'ایسا لنک جس کی تصدیق نہیں ہو سکتی' },
      why: {
        en: 'This web address is not on the list of official government domains. Do not open it from a message.',
        ur: 'یہ ویب ایڈریس سرکاری ڈومینز کی فہرست میں نہیں ہے۔ اسے پیغام سے نہ کھولیں۔'
      }
    },
    official: {
      title: { en: 'Link points to an official government domain', ur: 'لنک ایک سرکاری ڈومین کی طرف جاتا ہے' },
      why: {
        en: 'The address ends in .gov.pk. That is a good sign, but sender names on SMS and WhatsApp can be faked, so type the address in your browser yourself instead of tapping the link.',
        ur: 'ایڈریس .gov.pk پر ختم ہوتا ہے۔ یہ اچھی علامت ہے، لیکن ایس ایم ایس اور واٹس ایپ پر بھیجنے والے کا نام جعلی ہو سکتا ہے، اس لیے لنک دبانے کے بجائے ایڈریس خود براؤزر میں ٹائپ کریں۔'
      }
    },
    contact: {
      title: { en: 'Asks you to contact a personal mobile number', ur: 'ذاتی موبائل نمبر پر رابطے کا کہا جا رہا ہے' },
      why: {
        en: 'Government bodies publish helplines and short codes. A personal 03xx number, especially one that takes payments, is not an official channel.',
        ur: 'سرکاری ادارے ہیلپ لائن اور شارٹ کوڈ شائع کرتے ہیں۔ ذاتی 03xx نمبر، خاص طور پر وہ جس پر رقم لی جائے، سرکاری ذریعہ نہیں ہوتا۔'
      }
    },
    contradiction: {
      title: { en: 'Contradicts what the official body says', ur: 'ادارے کے اپنے بیان کے خلاف ہے' },
      why: { en: '', ur: '' } // filled from entity.neverText
    }
  };

  /* ------------------------------------------------------------------ */
  /* Verdicts and next steps                                             */
  /* ------------------------------------------------------------------ */
  const verdicts = {
    high: {
      title: { en: 'Very likely a scam', ur: 'بہت امکان ہے کہ یہ فراڈ ہے' },
      detail: { en: 'Do not click, reply, call or pay. Follow the steps below.', ur: 'کلک نہ کریں، جواب نہ دیں، کال نہ کریں اور رقم نہ بھیجیں۔ نیچے دیے گئے اقدامات کریں۔' }
    },
    suspicious: {
      title: { en: 'Suspicious. Do not act on it.', ur: 'مشکوک۔ اس پر عمل نہ کریں۔' },
      detail: { en: 'Several warning signs match known scams. Verify through an official channel before doing anything.', ur: 'کئی علامات معروف فراڈز سے ملتی ہیں۔ کوئی بھی قدم اٹھانے سے پہلے سرکاری ذریعے سے تصدیق کریں۔' }
    },
    caution: {
      title: { en: 'Some warning signs', ur: 'کچھ خطرے کی علامات موجود ہیں' },
      detail: { en: 'Not conclusive, but treat it with care and verify before acting.', ur: 'حتمی نہیں، مگر احتیاط کریں اور عمل سے پہلے تصدیق کریں۔' }
    },
    none: {
      title: { en: 'No known scam signs found', ur: 'کوئی معروف فراڈ علامت نہیں ملی' },
      detail: { en: 'That does not prove the message is genuine. Confirm through the official channel before you act.', ur: 'اس کا یہ مطلب نہیں کہ پیغام اصلی ہے۔ کوئی قدم اٹھانے سے پہلے سرکاری ذرائع سے تصدیق کریں۔' }
    }
  };

  const steps = {
    dontEngage: { en: 'Do not click any link, call back, or reply.', ur: 'کسی لنک پر کلک نہ کریں، واپس کال نہ کریں اور جواب نہ دیں۔' },
    neverShare: { en: 'Never share an OTP, PIN, password or a photo of your CNIC with anyone who contacts you.', ur: 'آپ سے رابطہ کرنے والے کسی بھی شخص کو او ٹی پی، پن، پاس ورڈ یا شناختی کارڈ کی تصویر نہ دیں۔' },
    verify: { en: 'Check the claim yourself: type the department\'s official website into your browser, or call its official helpline listed below.', ur: 'خود تصدیق کریں: متعلقہ ادارے کی سرکاری ویب سائٹ کا پتہ براؤزر میں ٹائپ کریں یا نیچے دی گئی سرکاری ہیلپ لائن پر کال کریں۔' },
    report: { en: 'Report the sender to PTA: toll-free 0800-55055 or complaint.pta.gov.pk.', ur: 'بھیجنے والے کی پی ٹی اے کو شکایت کریں: ٹول فری 0800-55055 یا complaint.pta.gov.pk۔' },
    alreadyPaid: { en: 'If you already paid, or shared a code or ID details: call your bank or wallet provider immediately and ask them to block the transaction or account, and file a complaint with the cybercrime authority.', ur: 'اگر آپ رقم بھیج چکے ہیں یا کوڈ/شناختی معلومات دے چکے ہیں: فوراً اپنے بینک یا والٹ فراہم کنندہ کو کال کر کے ٹرانزیکشن یا اکاؤنٹ بلاک کروائیں اور سائبر کرائم کے ادارے میں شکایت درج کروائیں۔' },
    shareWarning: { en: 'Warn family members. Older relatives are targeted most often.', ur: 'گھر والوں کو خبردار کریں۔ بزرگ رشتہ داروں کو سب سے زیادہ نشانہ بنایا جاتا ہے۔' }
  };

  /* ------------------------------------------------------------------ */
  /* Example messages shown as one-tap samples in the UI                 */
  /* ------------------------------------------------------------------ */
  const examples = [
    {
      id: 'bisp_fee',
      label: { en: 'BISP grant fee', ur: 'بی آئی ایس پی گرانٹ فیس' },
      text: 'Congratulations! Your BISP Kafalat grant of Rs. 25,000 is approved. Send Rs. 500 processing fee on JazzCash 0300-1234567 within 24 hours or your payment will be cancelled.'
    },
    {
      id: 'pta_sim',
      label: { en: 'PTA SIM block', ur: 'پی ٹی اے سم بلاک' },
      text: 'PTA Notice: Your SIM will be blocked in 24 hours due to suspicious activity. Verify now: http://pta-verify.online/sim'
    },
    {
      id: 'urdu_prize',
      label: { en: 'Urdu prize message', ur: 'اردو انعامی پیغام' },
      text: 'مبارک ہو! آپ کا بینظیر انکم سپورٹ کا انعام نکلا ہے۔ اپنا شناختی کارڈ نمبر اور او ٹی پی فوراً بھیجیں۔'
    },
    {
      id: 'roman_job',
      label: { en: 'Roman Urdu job offer', ur: 'رومن اردو نوکری' },
      text: 'FPSC mein naukri ke liye select hue hain. Registration fees 3000 easypaisa par jama karwayein aur kisi ko na batain. https://bit.ly/fpsc-job'
    },
    {
      id: 'ok_nadra',
      label: { en: 'Normal-looking message', ur: 'عام سا پیغام' },
      text: 'NADRA: Your ID card application is ready for collection. Please visit your nearest NADRA Registration Centre with your token slip.'
    }
  ];

  return { entities, rules, shorteners, messagingHosts, cheapTlds, findingText, verdicts, steps, examples };
});
