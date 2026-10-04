# Sach Check (سچ چیک)

Paste a suspicious SMS, WhatsApp message or email. Sach Check tells you whether it matches known Pakistani scam patterns (fake BISP grants, fake PTA SIM-block notices, fake job offers, OTP and CNIC theft), shows *why*, and points you to the real official channels.

- Works in **English, Urdu and Roman Urdu** (input), with an English / Urdu (RTL) interface.
- **Checked in the browser.** The message is not uploaded anywhere unless the user taps the optional "Explain in simple words" button, and then CNIC, phone and long numbers are removed first.
- **The verdict comes from fixed rules, not from an AI.** The AI step can only reword it.
- **Free to run:** static site + one serverless function on Cloudflare Pages, free Gemini API tier.

## How it works

```
 message ──► normalise (Urdu digits, spacing, diacritics)
         ──► detect who it claims to be (BISP, NADRA, FBR, PTA ...)
         ──► pattern rules (asks OTP / money / CNIC, threats, prizes, urgency ...)
         ──► link checks (true .gov.pk? lookalike? shortener? user@host trick?)
         ──► contradiction check (does it say what the body officially says it never does?)
         ──► score + level (high / suspicious / caution / none) + reasons + next steps
                                        │
        optional, user-initiated ───────┴─► /api/explain (redacted text + rule ids) ─► Gemini ─► plain-language wording
```

Key design choices:

| Choice | Why |
|---|---|
| Rules decide, AI only explains | Predictable, auditable, cannot be talked out of a verdict by text inside the message |
| Request-verb check for OTP/PIN/CNIC | "Your OTP is 1234. Do **not** share it" is a genuine SMS and must not be flagged |
| Domain match is exact-or-subdomain | `bisp.gov.pk.claim-now.com` and `https://bisp.gov.pk@evil.com` are caught |
| "Context-only" signals | "Promises a grant" or "keep it secret" count only when something stronger is also present |
| Never says "safe" | A clean result says "no known signs", which is not proof |
| All UI text set via `textContent` + strict CSP | Pasted text cannot inject script |

## Project layout

```
public/
  index.html  style.css  app.js     browser UI (English / Urdu, RTL)
  engine.js                         rules engine (pure functions, also runs in Node)
  data.js                           ALL knowledge: official bodies, scam rules, Urdu/English text
  _headers                          security headers (CSP) for Cloudflare Pages
functions/api/explain.js            optional AI explainer (Cloudflare Pages Function)
test/                               40 tests (engine, regression battery, serverless function)
```

To add a scam pattern or an official body you only edit `public/data.js`.

## Run it locally

Needs Node 20+ (tested on 22).

```bash
npm test                 # runs all 40 tests, no install needed
```

Quickest preview: double-click `public/index.html`. The checker works fully offline. The AI button needs the function, below.

With the function:

```bash
npm install
cp .dev.vars.example .dev.vars     # put your GEMINI_API_KEY in it
npm run dev                        # http://localhost:8788
```

Get a free key at https://aistudio.google.com (Create API key). Free-tier model names and limits change; if `gemini-2.5-flash` is retired, set `GEMINI_MODEL` to the current free model.

## Deploy for free (about 15 minutes)

1. **GitHub.** Create a free account, a new public repository, then in this folder:
   ```bash
   git init && git add . && git commit -m "Sach Check"
   git branch -M main
   git remote add origin https://github.com/<you>/sach-check.git
   git push -u origin main
   ```
2. **Cloudflare Pages.** Create a free Cloudflare account, then *Workers & Pages → Create → Pages → Connect to Git*, pick the repo, and set:
   - Framework preset: **None**
   - Build command: *(leave empty)*
   - Build output directory: **`public`**

   Cloudflare finds the `functions/` folder on its own.
3. **Add the secret.** *Settings → Variables and Secrets → Add* `GEMINI_API_KEY` (type: Secret) for **Production**, then redeploy.
4. Your site is live at `https://<project>.pages.dev`, with HTTPS, for free.

### About the "free domain"

- `*.pages.dev` is the dependable free option and is what I recommend launching on.
- Free custom subdomain services exist (for example `is-a.dev`, `eu.org`), but each has eligibility rules and approval time, and they can change or disappear. Read their current rules first.
- A real `.pk` domain is not free.
- **Naming matters for this tool in particular.** It teaches people that look-alike domains are scams, so do not pick a name that could be mistaken for a government site (avoid `gov`, `pakistan.gov`, official logos or flag-as-logo). Keep the "independent project, not a government service" line visible.

### Protect your free tier

The function is the only part with a limit (Gemini's free quota). Before sharing widely:
- In Cloudflare: *Security → WAF → Rate limiting rules* → limit `/api/explain` per IP (free plan allows a basic rule).
- Optionally add Cloudflare Turnstile (free) in front of the button.
- When the quota runs out the app degrades gracefully: the verdict still works and only the AI wording is unavailable.

## Data accuracy

Facts shown to users were checked against each body's own site on **4 Oct 2026**:

| Body | What is used | Source |
|---|---|---|
| BISP | Helpline 0800-26477 (Mon-Fri 9-5); states it charges no fees | bisp.gov.pk |
| NADRA | Helpline 1777; +92 51 111 786 100 | nadra.gov.pk |
| FBR | States it never sends SMS asking for banking info, PINs or passwords | fbr.gov.pk/beware-fradulant-sms/152600 |
| PTA | DIRBS portal; SMS IMEI to 8484; complaint line 0800-55055; warns about "suspicious activity / SIM suspension" link messages | pta.gov.pk advisory (4 Jul 2024) |

Deliberately **left out** because I could not verify them from an official page: any FIA / cybercrime agency phone number or portal (the agency's site refused my request), FBR's helpline, and BISP's 8171 SMS service. Add them to `public/data.js` only from the official site, with a `source` URL. Helplines change, so re-check this table every few months.

## Known limitations

- **Rules miss new scams.** Novel wording, heavy Roman Urdu spelling variation, or text inside images will slip through. A "none" result is never a guarantee.
- **Some false alarms are possible**, for example a genuine message that happens to contain a non-government link.
- **Urdu text needs a native-speaker review** before launch. I wrote it carefully but have not had it proofread.
- **Not yet tested** against the live Gemini API (no key here; the function is tested with a stubbed upstream), nor on real phones. Test on a low-end Android device and in Urdu mode.
- Not legal advice, not a government service.

## Ideas for next steps

1. **Community reports** (Cloudflare D1 free tier): "I got this too" counts and a live list of scam waves.
2. **Screenshot input** with in-browser OCR (Tesseract.js with Urdu data), since many people only have screenshots.
3. **Telegram bot** reusing `engine.js` as is.
4. **Auto-updating knowledge base:** a GitHub Actions job that watches the official advisory pages (PTA, FBR, BISP, FIA) and opens a pull request when a new warning appears.
5. Roman Urdu interface, and Pashto / Sindhi / Punjabi.
