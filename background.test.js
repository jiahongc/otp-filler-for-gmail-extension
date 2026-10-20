const test = require("node:test");
const assert = require("node:assert/strict");

const { extractOTP, looksLikeOTPEmail, stripHtml, findLoginLink, senderTrust } = require("./background.js");

test("extracts the numeric code from Garmin-style email copy", () => {
  const text = `
    One-time Use Code
    GARMIN
    Use this one-time code for your account
    029645
    This code will expire after 30 minutes. Don't share this code.
  `;

  assert.equal(extractOTP(text), "029645");
});

test("extracts a standard numeric code after keyword", () => {
  assert.equal(extractOTP("Your verification code: 761283"), "761283");
});

test("extracts an alphanumeric code", () => {
  assert.equal(extractOTP("Use this passcode: ABC123 to continue"), "ABC123");
});

test("extracts a hyphenated code and normalizes it", () => {
  assert.equal(extractOTP("Your code is 123-ABC"), "123ABC");
});

test("ignores lowercase prose after code-related words", () => {
  assert.equal(extractOTP("This code will expire shortly"), null);
});

test("extracts code when HTML wraps each digit in its own element", () => {
  // After stripHtml, per-digit <span>/<td> tags produce space-separated digits
  assert.equal(
    extractOTP("Please enter this secure verification code: 3 2 9 8 5 5"),
    "329855"
  );
});

test("does not extract mixed-case words near keywords in email footers", () => {
  // Uber "new device sign-in" footer: "Want? Verify your account"
  assert.equal(extractOTP("Want? Verify your account"), null);
  assert.equal(
    extractOTP("New device log-in It looks like a new device was used to log in. Want? Verify your account settings."),
    null
  );
});

test("extracts code when zero-width chars are injected between digits", () => {
  // Shop/Shopify emails inject U+034F between digits to poison scrapers
  const cgj = "\u034F";
  const text = `Enter this code to sign in: 0${cgj}5${cgj}6${cgj}9${cgj}3${cgj}0 This code will expire in 10 minutes`;
  assert.equal(extractOTP(text), "056930");
});

test("extracts code when soft hyphens are injected between digits", () => {
  const shy = "\u00AD";
  assert.equal(extractOTP(`Your code: 0${shy}5${shy}6${shy}9${shy}3${shy}0`), "056930");
});

test("extracts code when digits are HTML-entity-encoded", () => {
  // &#48;=0 &#53;=5 &#54;=6 &#57;=9 &#51;=3 &#48;=0
  const html = "<p>Your code: &#48;&#53;&#54;&#57;&#51;&#48;</p>";
  assert.equal(extractOTP(stripHtml(html)), "056930");

  // Hex entities: &#x30;=0 &#x35;=5 &#x36;=6 &#x39;=9 &#x33;=3 &#x30;=0
  const hexHtml = "<p>Your code: &#x30;&#x35;&#x36;&#x39;&#x33;&#x30;</p>";
  assert.equal(extractOTP(stripHtml(hexHtml)), "056930");
});

test("extracts code when keyword is far before code but colon anchors it (Lemonade style)", () => {
  // "one-time password. Use it to log in: 973230"
  assert.equal(
    extractOTP("Here's your one-time password. Use it to log in: 973230 If it wasn't you trying to log in, just ignore this email."),
    "973230"
  );
});

test("extracts Google G-prefixed codes (G-412157)", () => {
  assert.equal(
    extractOTP("G-412157 is your Google verification code."),
    "412157"
  );
});

test("extracts space-grouped codes like 823 815", () => {
  assert.equal(
    extractOTP("Your BuzzSumo verification code is 823 815"),
    "823815"
  );
});

test("extracts quoted codes after 'is'", () => {
  assert.equal(
    extractOTP('Your verification code is "521992"'),
    "521992"
  );
  assert.equal(
    extractOTP("Your code is (7744) — enter it now"),
    "7744"
  );
});

test("extracts confirmation code", () => {
  assert.equal(
    extractOTP("Your Twitter confirmation code is 180298"),
    "180298"
  );
});

test("extracts sign-in code", () => {
  assert.equal(
    extractOTP("Your sign-in code is 456789"),
    "456789"
  );
});

test("extracts Microsoft security code", () => {
  assert.equal(
    extractOTP("Use 5677 as Microsoft account security code"),
    "5677"
  );
});

test("extracts a standalone code when the keyword is a sentence away (SeatGeek)", () => {
  // The code sits alone in a styled box; nearest keyword "code" is a sentence
  // back, separated by the digit run "10 minutes".
  const body =
    "[SeatGeek] Sign into your account Your verification code Hey there, " +
    "Here's the log in code you requested to access your SeatGeek account. " +
    "The code will expire in 10 minutes. 260961 2026 SeatGeek, Inc.";
  assert.equal(extractOTP(body), "260961");
});

test("extracts a passcode after Disney's explanatory copy", () => {
  const body =
    "Use this passcode to verify the email address associated with your account. " +
    "It will expire in 15 minutes. 123456 If you did not make this request, ignore this email.";
  assert.equal(extractOTP(body), "123456");
});

test("does not extract a postal ZIP code from an email footer", () => {
  // Google account-access notification: footer link text ("sign-in & security")
  // follows the Mountain View ZIP, which the proximity pattern would otherwise grab.
  const body =
    "You allowed OTP Filler access to your Google Account. See security activity. " +
    "2026 Google LLC, 1600 Amphitheatre Parkway, Mountain View, CA 94043, USA. " +
    "Manage your sign-in and security settings.";
  assert.equal(extractOTP(body), null);
});

test("does not extract a street number or copyright year from a footer", () => {
  // street number followed by a keyword within range
  assert.equal(
    extractOTP("Need help? 1600 Amphitheatre Parkway — manage your login and security."),
    null
  );
  // copyright year followed by a keyword within range
  assert.equal(
    extractOTP("Thanks. © 2026 Example, Inc. Sign in to verify your account."),
    null
  );
});

test("ignores promo, discount, and coupon codes in marketing emails", () => {
  // Thrifty Traveler newsletter ad
  assert.equal(extractOTP("Get your tickets - use promo code THRIFTY for $10 off! Already a member? Log in to see all your deals"), null);
  assert.equal(extractOTP("Use discount code SAVE20 at checkout"), null);
  assert.equal(extractOTP("Your coupon code: WELCOME10"), null);
  // a real OTP in the same email still wins
  assert.equal(extractOTP("Your verification code is 482915. Use promo code FALL25 for 10% off."), "482915");
});

test("extracts a hyphenated code after 'is:' (NVIDIA)", () => {
  assert.equal(
    extractOTP("NVIDIA Account Your verification code is: 341-598 This verification code will expire in 15 minutes."),
    "341598"
  );
});

test("prefers a short alphanumeric code over a year in a 'Code sent' date line", () => {
  // Airalo: per-character boxes in the body, code intact in the snippet,
  // plus a login-details table with "Code sent 12:18 UTC, 17 October 2026"
  const text =
    "Confirm your Airalo login To finish logging in, enter this code on the device you were logging in from: AB7K " +
    "To finish logging in, enter this code on the device you were logging in from: A B 7 K " +
    "The code expires in 15 minutes. Code sent 12:18 UTC, 17 October 2026 Code expires 12:33 UTC";
  assert.equal(extractOTP(text), "AB7K");
  assert.equal(extractOTP("Your code is X9QZ. Sent Oct 17, 2026"), "X9QZ");
  // a real year-like code with no month before it still wins
  assert.equal(extractOTP("The code is 2008. Do not share this code."), "2008");
});

test("prefilter accepts confirmation/sign-in/login/security keywords", () => {
  assert.equal(looksLikeOTPEmail("Your confirmation code", "", ""), true);
  assert.equal(looksLikeOTPEmail("Sign-in code", "", ""), true);
  assert.equal(looksLikeOTPEmail("", "", "Your login code is 123456"), true);
  assert.equal(looksLikeOTPEmail("", "", "Use 5677 as security code"), true);
});

test("prefilter accepts access-code emails even with generic subject lines", () => {
  const subject = "You've got a package.";
  const snippet = "";
  const body = "ENTER ACCESS CODE 414384 OR SCAN QR CODE";

  assert.equal(looksLikeOTPEmail(subject, snippet, body), true);
  assert.equal(extractOTP(body), "414384");
});

test("finds the sign-in link in a magic-link email (Copilot Money)", () => {
  const html = `<p>If you want to sign in with your account, click this link:</p>
    <p><a href='https://auth.copilot.money/__/auth/action?apiKey=x&amp;mode=signIn&amp;oobCode=abc'>Sign in to Copilot Money</a></p>
    <p><a href="https://copilot.money/privacy">Privacy</a></p>`;
  assert.equal(
    findLoginLink("Sign in to Copilot Money requested at 2026 October 03 01:28 UTC", html),
    "https://auth.copilot.money/__/auth/action?apiKey=x&mode=signIn&oobCode=abc"
  );
});

test("ignores sign-in links in emails that aren't sign-in requests", () => {
  const html = `<a href="https://news.example.com/login">Sign in</a> to read more`;
  assert.equal(findLoginLink("☕ Pepsi challenged", html), null);
  assert.equal(findLoginLink("Sign in to Example", `<a href="https://example.com/help">Help center</a>`), null);
});

const GMAIL_PASS = (domain) =>
  `mx.google.com; dkim=pass header.i=@${domain} header.s=s1; spf=pass smtp.mailfrom=bounce@${domain}; dmarc=pass (p=REJECT) header.from=${domain}`;

test("trust: verified when Gmail authenticates the sender and the link stays on its domain", () => {
  const t = senderTrust({
    authResults: GMAIL_PASS("copilot.money"),
    senderName: "Copilot Money",
    senderEmail: "noreply@copilot.money",
    link: "https://auth.copilot.money/__/auth/action?mode=signIn",
  });
  assert.equal(t.level, "verified");
});

test("trust: matches airline-style initials to the domain (Japan Airlines → jal.com)", () => {
  const t = senderTrust({ authResults: GMAIL_PASS("jal.com"), senderName: "Japan Airlines", senderEmail: "jmb_confirmation@jal.com" });
  assert.equal(t.level, "verified");
});

test("trust: warns when the display name impersonates a brand the domain doesn't match", () => {
  // Real scam in the inbox: authenticated, but "Robinhood™" sent from a CRM domain
  const t = senderTrust({
    authResults: GMAIL_PASS("send.lcmsgsndr.org"),
    senderName: "Robinhood™",
    senderEmail: "564046-email+safeguard.rh@send.lcmsgsndr.org",
  });
  assert.equal(t.level, "check");
});

test("trust: warns when the link leaves the sender's domain", () => {
  const t = senderTrust({
    authResults: GMAIL_PASS("tappandride.com"),
    senderName: "TAPP",
    senderEmail: "donotreply@tappandride.com",
    link: "https://u4892013.ct.sendgrid.net/ls/click?upn=abc",
  });
  assert.equal(t.level, "check");
});

test("trust: blocks when Gmail can't authenticate the sender", () => {
  const failed = "mx.google.com; dkim=fail header.i=@paypal.com; spf=softfail; dmarc=fail (p=REJECT) header.from=paypal.com";
  assert.equal(senderTrust({ authResults: failed, senderName: "PayPal", senderEmail: "service@paypal.com" }).level, "suspicious");
  assert.equal(senderTrust({ authResults: "", senderName: "PayPal", senderEmail: "service@paypal.com" }).level, "suspicious");
  // DKIM passes, but for a different domain than the From address
  const otherDomain = "mx.google.com; dkim=pass header.i=@evil.com; spf=pass; dmarc=none header.from=paypal.com";
  assert.equal(senderTrust({ authResults: otherDomain, senderName: "PayPal", senderEmail: "service@paypal.com" }).level, "suspicious");
});

test("trust: country-code suffixes like co.jp don't let one domain vouch for another", () => {
  const jbus = { senderName: "", senderEmail: "japanbusonline@mail.j-bus.co.jp" };
  assert.equal(senderTrust({ ...jbus, authResults: GMAIL_PASS("mail.j-bus.co.jp") }).level, "verified");
  const spoof = "mx.google.com; dkim=pass header.i=@attacker.co.jp; spf=pass; dmarc=fail header.from=j-bus.co.jp";
  assert.equal(senderTrust({ ...jbus, authResults: spoof }).level, "suspicious");
});

test("trust: blocks unsafe links even from an authenticated sender", () => {
  const base = { authResults: GMAIL_PASS("example.com"), senderName: "Example", senderEmail: "no-reply@example.com" };
  assert.equal(senderTrust({ ...base, link: "http://example.com/login" }).level, "suspicious");
  assert.equal(senderTrust({ ...base, link: "https://192.168.1.4/login" }).level, "suspicious");
  assert.equal(senderTrust({ ...base, link: "https://xn--exmple-cua.com/login" }).level, "suspicious");
});
