const test = require("node:test");
const assert = require("node:assert/strict");

const { extractOTP } = require("./background.js");

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
