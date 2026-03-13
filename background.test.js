const test = require("node:test");
const assert = require("node:assert/strict");

const { extractOTP, looksLikeOTPEmail } = require("./background.js");

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

test("prefilter accepts access-code emails even with generic subject lines", () => {
  const subject = "You've got a package.";
  const snippet = "";
  const body = "ENTER ACCESS CODE 414384 OR SCAN QR CODE";

  assert.equal(looksLikeOTPEmail(subject, snippet, body), true);
  assert.equal(extractOTP(body), "414384");
});
