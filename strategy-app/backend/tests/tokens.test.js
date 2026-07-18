const test = require("node:test");
const assert = require("node:assert/strict");
const jwt = require("jsonwebtoken");
const {
  createAccessToken,
  createRefreshTokenValue,
  hashRefreshToken,
  refreshCookieOptions,
  assertJwtSecretConfigured,
  ACCESS_TOKEN_TTL
} = require("../utils/tokens");

test("createAccessToken signs a short-lived JWT with org context", () => {
  const user = {
    _id: { toString: () => "user-123" },
    orgId: { toString: () => "org-456" },
    email: "lead@strategy.com",
    role: "executive",
    name: "Strategy Lead"
  };

  const token = createAccessToken(user);
  const payload = jwt.verify(token, process.env.JWT_SECRET || "dev-secret");

  assert.equal(payload.userId, "user-123");
  assert.equal(payload.orgId, "org-456");
  assert.equal(payload.email, "lead@strategy.com");
  assert.equal(payload.role, "executive");
  assert.equal(payload.name, "Strategy Lead");
  assert.equal(ACCESS_TOKEN_TTL, "15m");
});

test("refresh token values are unique and hashed consistently", () => {
  const first = createRefreshTokenValue();
  const second = createRefreshTokenValue();

  assert.notEqual(first, second);
  assert.equal(hashRefreshToken(first), hashRefreshToken(first));
  assert.notEqual(hashRefreshToken(first), hashRefreshToken(second));
});

test("refresh cookie options are secure by default", () => {
  const options = refreshCookieOptions();

  assert.equal(options.httpOnly, true);
  assert.equal(options.sameSite, "strict");
  assert.equal(options.path, "/api/auth");
});

test("assertJwtSecretConfigured throws in production without JWT_SECRET", () => {
  const originalEnv = process.env.NODE_ENV;
  const originalSecret = process.env.JWT_SECRET;

  process.env.NODE_ENV = "production";
  delete process.env.JWT_SECRET;

  assert.throws(() => assertJwtSecretConfigured(), /JWT_SECRET must be set/);

  process.env.NODE_ENV = originalEnv;
  if (originalSecret === undefined) {
    delete process.env.JWT_SECRET;
  } else {
    process.env.JWT_SECRET = originalSecret;
  }
});
