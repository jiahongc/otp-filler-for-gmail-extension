# Privacy Policy — OTP Filler for Gmail

**Last updated:** March 8, 2026

## Overview

OTP Filler for Gmail is a browser extension that extracts one-time verification codes from your Gmail inbox and fills them into web forms. Your privacy is important — this extension is designed to work entirely on your device with no external data collection.

## Data We Access

- **Gmail messages:** The extension reads your most recent emails (last 10 minutes) via the Gmail API using read-only access. Email content is processed in-memory to find verification codes and is never stored or transmitted externally.
- **Email address and name:** Used to display your linked accounts within the extension popup. Stored locally in your browser's extension storage.
- **OAuth access tokens:** Used to authenticate with the Gmail API. Stored locally in your browser's extension storage and never shared.

## Data We Do NOT Collect

- We do not collect, store, or transmit any personal data to external servers.
- We do not use analytics, telemetry, or tracking of any kind.
- We do not read, store, or log the content of your emails beyond extracting verification codes in-memory.
- We do not sell, share, or transfer any user data to third parties.

## Permissions

| Permission | Why it's needed |
|---|---|
| `identity` | To authenticate with your Google account via OAuth. |
| `storage` | To store your linked account info and tokens locally in the browser. |
| `activeTab` | To inject the verification code into the input field on your current tab. |
| `scripting` | To run the code-filling script on the active page when you click "Fill & Submit". |
| `https://www.googleapis.com/*` | To call the Gmail API and fetch recent messages. |

## Data Storage

All data is stored locally using Chrome's `chrome.storage.local` API. No data leaves your browser. You can remove all stored data by removing the extension or by removing your accounts from the extension's settings.

## Third-Party Services

The only external service this extension communicates with is the **Google Gmail API** (`https://www.googleapis.com`), using your OAuth token, to fetch your recent emails. No other third-party services are contacted.

## Children's Privacy

This extension is not directed at children under 13 and does not knowingly collect data from children.

## Changes to This Policy

If this policy is updated, the changes will be posted here with a revised date.

## Contact

If you have questions about this privacy policy, please open an issue at:
https://github.com/jiahongc/otp-filler-for-gmail-extension/issues
