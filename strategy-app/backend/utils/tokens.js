const crypto = require("crypto");
const jwt = require("jsonwebtoken");

const ACCESS_TOKEN_TTL = process.env.ACCESS_TOKEN_TTL || "15m";
const REFRESH_TOKEN_DAYS = Number(process.env.REFRESH_TOKEN_DAYS || 7);
const REFRESH_TOKEN_MS = REFRESH_TOKEN_DAYS * 24 * 60 * 60 * 1000;
const REFRESH_TOKEN_COOKIE = "refreshToken";

function jwtSecret() {
  return process.env.JWT_SECRET || "dev-secret";
}

function assertJwtSecretConfigured() {
  if (process.env.NODE_ENV === "production" && !process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET must be set when NODE_ENV is production");
  }
}

function createAccessToken(user) {
  return jwt.sign(
    {
      userId: user._id.toString(),
      email: user.email,
      role: user.role,
      name: user.name,
      orgId: user.orgId.toString()
    },
    jwtSecret(),
    { expiresIn: ACCESS_TOKEN_TTL }
  );
}

function createRefreshTokenValue() {
  return crypto.randomBytes(32).toString("hex");
}

function hashRefreshToken(token) {
  return crypto.createHash("sha256").update(token).digest("hex");
}

function refreshTokenExpiresAt() {
  return new Date(Date.now() + REFRESH_TOKEN_MS);
}

function refreshCookieOptions() {
  const secure =
    process.env.COOKIE_SECURE === "true" ||
    (process.env.NODE_ENV === "production" && process.env.COOKIE_SECURE !== "false");

  return {
    httpOnly: true,
    secure,
    sameSite: "strict",
    maxAge: REFRESH_TOKEN_MS,
    path: "/api/auth"
  };
}

function clearRefreshCookieOptions() {
  return { ...refreshCookieOptions(), maxAge: 0 };
}

module.exports = {
  ACCESS_TOKEN_TTL,
  REFRESH_TOKEN_DAYS,
  REFRESH_TOKEN_MS,
  REFRESH_TOKEN_COOKIE,
  jwtSecret,
  assertJwtSecretConfigured,
  createAccessToken,
  createRefreshTokenValue,
  hashRefreshToken,
  refreshTokenExpiresAt,
  refreshCookieOptions,
  clearRefreshCookieOptions
};
