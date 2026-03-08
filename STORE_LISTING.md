# Chrome Web Store Listing

## Name

Gmail OTP Filler

## Short Description (132 char max)

Automatically extracts verification codes from your Gmail and fills them into web forms with one click. Multi-account supported.

## Detailed Description

Stop switching tabs to copy verification codes. Gmail OTP Filler reads your recent emails, finds OTP and verification codes, and fills them directly into the page you're on.

**How it works:**
1. Click the extension icon
2. Your recent verification codes appear instantly
3. Click "Fill & Submit" to auto-fill the code into the current page

**Features:**
- Extracts OTP, verification, and 2FA codes from Gmail automatically
- Fills codes directly into input fields on any website
- Supports multiple Gmail accounts with easy switching
- Auto-copies the most recent code to your clipboard
- Works with numeric codes, alphanumeric codes, and hyphenated codes (e.g. 123-456)
- Scans emails from the last 10 minutes so you always get the freshest code
- Clean, minimal popup UI

**Supported code formats:**
- 4–8 digit numeric codes (e.g. 761283)
- Alphanumeric codes (e.g. ABC123)
- Hyphenated codes (e.g. 123-ABC, 761-283)

**Privacy & Security:**
- Only requests read-only access to Gmail — cannot modify or send emails
- No data is sent to any third-party server
- Tokens are stored locally in your browser
- No analytics or tracking
- Open source: https://github.com/jiahongc/gmail-otp-filler

## Category

Productivity

## Language

English

## Privacy Practices

### Single Purpose Description

This extension reads recent Gmail messages to extract one-time verification codes (OTP) and fills them into input fields on the active web page.

### Host Permission Justification

- `https://www.googleapis.com/*` — Required to call the Gmail API to fetch recent messages and extract verification codes.

### Permission Justifications

| Permission | Justification |
|---|---|
| `identity` | Required to authenticate with Google OAuth and obtain an access token for the Gmail API. |
| `storage` | Required to store linked Gmail account information and access tokens locally. |
| `activeTab` | Required to inject the OTP code into the input field on the user's current tab when they click "Fill & Submit". |
| `scripting` | Required to inject the content script into the active tab if it is not already loaded, so the code can be filled into the page. |

### Data Usage Disclosure

- **Personally identifiable information:** Email address is collected and stored locally to manage linked accounts. It is not transmitted to any external server.
- **Authentication information:** OAuth access tokens are stored locally and used only to communicate with the Gmail API.
- **Email contents:** Email subject lines, snippets, and body text are read in-memory to extract verification codes. No email content is stored or transmitted externally.

This extension does not:
- Sell user data to third parties
- Transfer data for purposes unrelated to the extension's core functionality
- Use data for creditworthiness or lending purposes

## Screenshots (suggested captions)

1. **One-click OTP filling** — Your verification codes appear instantly. Click to fill.
2. **Multi-account support** — Switch between Gmail accounts with filter chips.
3. **Manage accounts** — Add or remove Gmail accounts at any time.

## Promotional Tile Text (if needed)

Never copy-paste a verification code again.
