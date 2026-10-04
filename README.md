# Sach Check (سچ چیک)

Paste a suspicious SMS, WhatsApp message or email. Sach Check tells you whether it matches known Pakistani scam patterns (fake BISP grants, fake PTA SIM-block notices, fake job offers, OTP and CNIC theft), shows *why*, and points you to the real official channels.

**Live site:** https://sachcheck-pk.vercel.app/

- Works with **English, Urdu and Roman Urdu** input, with an English / Urdu (RTL) interface.
- **Checked in the browser.** The message is not uploaded anywhere unless the user taps the optional "Explain in simple words" button. Even then, emails, phone numbers, CNIC and other long numbers are removed first.
- **The verdict comes from fixed rules, not from an AI.** The AI step can only reword it.
- **Free to run:** static site and one serverless function on Vercel, free OpenRouter models, free Upstash Redis for rate limiting.

## How it works

```
message ──► normalise (Urdu digits, spacing, diacritics)
        ──► detect who it claims to be (BISP, NADRA, FBR, PTA ...)
        ──► pattern rules (asks OTP / money / CNIC, threats, prizes, urgency ...)
        ──► link checks (true .gov.pk? lookalike? shortener? user@host trick?)
        ──► contradiction check (does it say what the body officially says it never does?)
        ──► score + level (high / suspicious / caution / none) + reasons + next steps
                                   │
 optional, user-initiated ─────────┴─► /api/explain (redacted text + rule ids)
                                       ─► rate limit (Upstash) ─► OpenRouter ─► plain-language wording
```

| Choice | Why |
|---|---|
| Rules decide, AI only explains | Predictable, auditable, cannot be talked out of a verdict by text inside the message |
| Request-verb check for OTP/PIN/CNIC | "Your OTP is 1234. Do **not** share it" is a genuine SMS and must not be flagged |
| Exact-or-subdomain domain match | `bisp.gov.pk.claim-now.com` and `https://bisp.gov.pk@evil.com` are caught |
| Never says "safe" | A clean result says "no known signs", which is not proof |
| UI text set via `textContent` | Pasted text cannot inject script |

## Project layout

```
public/
  index.html  style.css
  app.js      browser UI (English / Urdu, RTL)
  engine.js   rules engine (pure functions, also runs in Node)
  data.js     all knowledge: official bodies, scam rules, Urdu/English text
api/
  explain.js  optional AI explainer (Vercel Edge Function)
```

To add a scam pattern or an official body, edit `public/data.js`.

## AI explainer and rate limiting

`POST /api/explain` receives the verdict level, the rule IDs and the redacted message, and returns a short plain-language explanation.

- **Provider:** OpenRouter (free `:free` models). If `AI_MODELS` is not set, the function looks up the currently available free models and tries up to three of them in order.
- **Rate limit:** 5 AI explanations per IP address per 60 seconds, counted in Upstash Redis. To change it, edit `RATE_LIMIT_MAX` and `RATE_LIMIT_WINDOW` (in seconds) at the top of `api/explain.js`. For example, set the window to `3600` for a one-hour limit.
- If the limit is hit, the model quota runs out, or the AI service is down, the app still works. The verdict is unaffected and only the AI wording is unavailable.

## Deploy on Vercel

1. Push the repository to GitHub.
2. Import it in Vercel (**Add New → Project**). No build command is needed.
3. Add these environment variables under **Settings → Environment Variables**, then redeploy:

| Variable | Required | Purpose |
|---|---|---|
| `AI_API_KEY` | Yes | OpenRouter API key (from openrouter.ai/keys) |
| `UPSTASH_REDIS_REST_URL` | Recommended | Upstash Redis REST URL, for rate limiting |
| `UPSTASH_REDIS_REST_TOKEN` | Recommended | Upstash Redis REST token |
| `AI_MODELS` | No | Comma-separated model IDs to use instead of automatic selection |
| `AI_BASE_URL` | No | Any OpenAI-compatible endpoint. Default: `https://openrouter.ai/api/v1` |

Environment variable changes only apply to new deployments, so redeploy after editing them. Without the Upstash variables the function still works but has no rate limit.

## Run locally

Quickest preview: open `public/index.html`. The checker works fully offline.

To test the AI button, use the Vercel CLI with the variables above in a `.env.local` file:

```bash
npm install -g vercel
vercel dev
```

## Data accuracy

Facts shown to users were checked against each body's own site on **4 Oct 2026**:

| Body | What is used | Source |
|---|---|---|
| BISP | Helpline 0800-26477 (Mon-Fri 9-5); states it charges no fees | bisp.gov.pk |
| NADRA | Helpline 1777; +92 51 111 786 100 | nadra.gov.pk |
| FBR | States it never sends SMS asking for banking info, PINs or passwords | fbr.gov.pk/beware-fradulant-sms/152600 |
| PTA | DIRBS portal; SMS IMEI to 8484; complaint line 0800-55055; warns about "suspicious activity / SIM suspension" link messages | pta.gov.pk advisory (4 Jul 2024) |

Anything that could not be verified from an official page (FIA / cybercrime contacts, FBR's helpline, BISP's 8171 SMS service) is deliberately left out. Add such details to `public/data.js` only from the official site, with a `source` URL. Helplines change, so re-check this table every few months.

## Privacy

Message text stays in the browser unless the user taps "Explain in simple words". In that case the redacted text is sent to OpenRouter and the model provider behind it. Free models may log or use inputs, so users should not paste sensitive personal details.

## Known limitations

- **Rules miss new scams.** New wording, heavy Roman Urdu spelling variation, or text inside images will slip through. A "none" result is never a guarantee.
- **Some false alarms are possible**, for example a genuine message that contains a non-government link.
- **Urdu text needs review by a native speaker.** AI explanations in Urdu can vary in quality.
- Free AI models have daily request limits and can change or disappear without notice.
- Independent project, not a government service, and not legal advice.
