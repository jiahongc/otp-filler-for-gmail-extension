const test = require("node:test");
const assert = require("node:assert/strict");

const { extractOTP, looksLikeOTPEmail, stripHtml } = require("./background.js");

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
