const express = require("express");
const rateLimit = require("express-rate-limit");
const bcrypt = require("bcryptjs");
const User = require("../models/User");
const Organization = require("../models/Organization");
const RefreshToken = require("../models/RefreshToken");
const { requireAuth } = require("../middleware/auth");
const { createUniqueOrgSlug } = require("../utils/org");
const { recordAudit } = require("../utils/audit");
const OrgInvite = require("../models/OrgInvite");
const { hashInviteToken } = require("./orgRoutes");
const {
  REFRESH_TOKEN_COOKIE,
  createAccessToken,
  createRefreshTokenValue,
  hashRefreshToken,
  refreshTokenExpiresAt,
  refreshCookieOptions,
  clearRefreshCookieOptions
} = require("../utils/tokens");

const router = express.Router();

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Too many authentication attempts, please try again later" }
});

router.use("/login", authLimiter);
router.use("/register", authLimiter);

function serializeUser(user) {
  return {
    id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    orgId: user.orgId
  };
}

async function persistRefreshToken(userId, refreshToken) {
  await RefreshToken.create({
    userId,
    tokenHash: hashRefreshToken(refreshToken),
    expiresAt: refreshTokenExpiresAt()
  });
}

async function revokeRefreshToken(refreshToken) {
  if (!refreshToken) return;
  await RefreshToken.deleteOne({ tokenHash: hashRefreshToken(refreshToken) });
}

async function revokeAllRefreshTokens(userId) {
  await RefreshToken.deleteMany({ userId });
}

async function issueSession(res, user) {
  const refreshToken = createRefreshTokenValue();
  await persistRefreshToken(user._id, refreshToken);
  res.cookie(REFRESH_TOKEN_COOKIE, refreshToken, refreshCookieOptions());

  return {
    token: createAccessToken(user),
    user: serializeUser(user)
  };
}

router.post("/register", async (req, res) => {
  try {
    const { name, email, password, organizationName, inviteToken, role: requestedRole } = req.body || {};
    if (!name || !email || !password) {
      return res.status(400).json({ message: "name, email, and password are required" });
    }

    if (requestedRole !== undefined) {
      return res.status(400).json({
        message:
          "role cannot be set during registration; org founders are assigned admin and invitees receive the role on their invite"
      });
    }

    if (!organizationName && !inviteToken) {
      return res.status(400).json({ message: "organizationName or inviteToken is required" });
    }

    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      return res.status(409).json({ message: "User already exists" });
    }

    let organization;
    let role = "admin";

    if (inviteToken) {
      const invite = await OrgInvite.findOne({
        tokenHash: hashInviteToken(inviteToken),
        acceptedAt: null,
        expiresAt: { $gt: new Date() }
      });

      if (!invite) {
        return res.status(400).json({ message: "Invalid or expired invite token" });
      }

      if (invite.email !== email.toLowerCase().trim()) {
        return res.status(400).json({ message: "Invite email does not match registration email" });
      }

      organization = await Organization.findById(invite.orgId);
      if (!organization) {
        return res.status(404).json({ message: "Organization not found for invite" });
      }

      role = invite.role;
      invite.acceptedAt = new Date();
      await invite.save();
    } else {
      const slug = await createUniqueOrgSlug(Organization, organizationName);
      organization = await Organization.create({
        name: organizationName.trim(),
        slug
      });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await User.create({
      name,
      email,
      passwordHash,
      role,
      orgId: organization._id
    });

    await recordAudit({
      orgId: organization._id,
      userId: user._id,
      action: inviteToken ? "user.joined_via_invite" : "organization.created",
      entityType: "User",
      entityId: user._id.toString(),
      metadata: { email: user.email, role: user.role }
    });

    const session = await issueSession(res, user);
    return res.status(201).json({
      ...session,
      organization: { id: organization._id, name: organization.name, slug: organization.slug }
    });
  } catch (error) {
    return res.status(500).json({ message: "Failed to register", details: error.message });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body || {};
    if (!email || !password) {
      return res.status(400).json({ message: "email and password are required" });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const isValid = await bcrypt.compare(password, user.passwordHash);
    if (!isValid) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const session = await issueSession(res, user);
    const organization = await Organization.findById(user.orgId).select("name slug");
    return res.status(200).json({
      ...session,
      organization: organization
        ? { id: organization._id, name: organization.name, slug: organization.slug }
        : null
    });
  } catch (error) {
    return res.status(500).json({ message: "Failed to login", details: error.message });
  }
});

router.post("/refresh", async (req, res) => {
  try {
    const refreshToken = req.cookies?.[REFRESH_TOKEN_COOKIE];
    if (!refreshToken) {
      return res.status(401).json({ message: "Refresh token missing" });
    }

    const tokenHash = hashRefreshToken(refreshToken);
    const storedToken = await RefreshToken.findOne({ tokenHash });

    if (storedToken?.consumedAt) {
      await revokeAllRefreshTokens(storedToken.userId);
      res.clearCookie(REFRESH_TOKEN_COOKIE, clearRefreshCookieOptions());
      return res.status(401).json({
        message: "Refresh token reuse detected — all sessions revoked, please sign in again"
      });
    }

    if (!storedToken || storedToken.expiresAt <= new Date()) {
      res.clearCookie(REFRESH_TOKEN_COOKIE, clearRefreshCookieOptions());
      return res.status(401).json({ message: "Invalid or expired refresh token" });
    }

    const user = await User.findById(storedToken.userId);
    if (!user) {
      await RefreshToken.deleteOne({ _id: storedToken._id });
      res.clearCookie(REFRESH_TOKEN_COOKIE, clearRefreshCookieOptions());
      return res.status(401).json({ message: "User not found" });
    }

    storedToken.consumedAt = new Date();
    await storedToken.save();

    const session = await issueSession(res, user);
    const organization = await Organization.findById(user.orgId).select("name slug");
    return res.status(200).json({
      token: session.token,
      user: session.user,
      organization: organization
        ? { id: organization._id, name: organization.name, slug: organization.slug }
        : null
    });
  } catch (error) {
    return res.status(500).json({ message: "Failed to refresh session", details: error.message });
  }
});

router.post("/logout", async (req, res) => {
  try {
    const refreshToken = req.cookies?.[REFRESH_TOKEN_COOKIE];
    await revokeRefreshToken(refreshToken);
    res.clearCookie(REFRESH_TOKEN_COOKIE, clearRefreshCookieOptions());
    return res.status(200).json({ message: "Logged out" });
  } catch (error) {
    return res.status(500).json({ message: "Failed to logout", details: error.message });
  }
});

router.get("/me", requireAuth, async (req, res) => {
  const user = await User.findById(req.user.userId).select("-passwordHash").populate("orgId", "name slug");
  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  return res.status(200).json({
    id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    orgId: user.orgId?._id || user.orgId,
    organization: user.orgId?.name
      ? { id: user.orgId._id, name: user.orgId.name, slug: user.orgId.slug }
      : null
  });
});

module.exports = router;
