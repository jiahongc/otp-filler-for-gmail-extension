# Changelog

## 1.3.3

Fixes from an audit of every email in the inbox from Oct 6–20, 2026 (481 messages): all 34 false positives found are gone, and every real code is still found.

- Ignore URLs in plain-text email parts: link query strings were read as codes (Google "Sign in with Google" notices, Going, Kalshi, Experian, Capital One, Amazon).
- `2fa` and `code` now match only as whole words, so `%2FA…` and `referralCode=` no longer count.
- Ignore digits that are part of a longer number: order numbers, phone numbers, decimals, and thousands (Amazon, Fidelity, Wally).
- Ignore marketing and ID values: "use code X for 15% off", gift, authorization, and mail codes, account/order/confirmation numbers, masked cards (`***2042`, `XXXXX2409`), and amounts (`28340 Yen`).
- Ignore ZIP codes without a country (`New York, NY 10285`) and dates like `Nov-06-2026`.
- Find codes placed a sentence or two after a "login code" heading (Wally).
- Sign-in links need a sign-in subject; appointment "Confirm your…" emails no longer get a link card.

## 1.3.2

- Fix: times like Google's "11:21 AM" (written with a narrow no-break space) are no longer read as a code ("21AM"). That space was being deleted along with invisible characters, gluing "21" to "AM".

## 1.3.1

- Fix: promo, discount, coupon, voucher, referral, and offer codes in marketing emails (e.g. "use promo code THRIFTY") are no longer shown as OTPs.

## 1.3.0

- **Sign-in links:** emails that sign you in with a link instead of a code (e.g. Copilot Money) now show a card with the link's destination and an **Open** button. Links open only when you click.
- **Sender check on every card:** each card shows the sender's email and a badge:
  - ✓ **Verified** — Gmail authenticated the sender (DMARC/DKIM) and any link stays on the sender's domain.
  - ⚠ **Check** — the display name doesn't match the sending domain (e.g. a "Robinhood™" email from an unrelated domain), or the link goes to another domain. Still usable.
  - ✕ **Blocked** — Gmail couldn't authenticate the sender, or the link is unsafe (not HTTPS, a bare IP, or a look-alike `xn--` domain). Can't be copied, filled, or opened.
- Fix: a year in a date line (e.g. "Code sent … 17 October 2026") no longer beats the real code.
- Fix: codes written as "code is: 341-598" are now extracted.

## 1.2.1

- Fill verification codes into textarea and explicitly labeled contenteditable controls.
- Skip disabled and read-only controls, and retain conservative auto-submit behavior for rich-text fields.
