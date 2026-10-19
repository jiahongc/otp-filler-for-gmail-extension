# Changelog

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
