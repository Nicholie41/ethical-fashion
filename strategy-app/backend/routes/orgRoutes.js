const express = require("express");
const crypto = require("crypto");
const OrgInvite = require("../models/OrgInvite");
const User = require("../models/User");
const Organization = require("../models/Organization");
const { requireAuth, allowRoles, requireOrg, validateInviteRole } = require("../middleware/auth");
const { recordAudit } = require("../utils/audit");

const router = express.Router();
const INVITE_TTL_MS = 7 * 24 * 60 * 60 * 1000;

function hashInviteToken(token) {
  return crypto.createHash("sha256").update(token).digest("hex");
}

function createInviteToken() {
  return crypto.randomBytes(24).toString("hex");
}

router.use(requireAuth, requireOrg);

router.get("/profile", async (req, res) => {
  const [organization, memberCount, pendingInvites] = await Promise.all([
    Organization.findById(req.user.orgId).select("name slug createdAt"),
    User.countDocuments({ orgId: req.user.orgId }),
    OrgInvite.countDocuments({ orgId: req.user.orgId, acceptedAt: null, expiresAt: { $gt: new Date() } })
  ]);

  if (!organization) {
    return res.status(404).json({ message: "Organization not found" });
  }

  return res.status(200).json({
    id: organization._id,
    name: organization.name,
    slug: organization.slug,
    memberCount,
    pendingInvites,
    createdAt: organization.createdAt
  });
});

router.get("/members", allowRoles("admin"), async (req, res) => {
  const members = await User.find({ orgId: req.user.orgId }).select("name email role createdAt").sort({ createdAt: 1 });
  return res.status(200).json(members);
});

router.get("/invites", allowRoles("admin"), async (req, res) => {
  const invites = await OrgInvite.find({ orgId: req.user.orgId, acceptedAt: null })
    .sort({ createdAt: -1 })
    .populate("createdBy", "name email");

  return res.status(200).json(
    invites.map((invite) => ({
      id: invite._id,
      email: invite.email,
      role: invite.role,
      expiresAt: invite.expiresAt,
      createdAt: invite.createdAt,
      createdBy: invite.createdBy
        ? { name: invite.createdBy.name, email: invite.createdBy.email }
        : null
    }))
  );
});

router.post("/invites", allowRoles("admin"), async (req, res) => {
  try {
    const { email, role = "executive" } = req.body || {};
    if (!email) {
      return res.status(400).json({ message: "email is required" });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const existingUser = await User.findOne({ email: normalizedEmail, orgId: req.user.orgId });
    if (existingUser) {
      return res.status(409).json({ message: "User is already a member of this organization" });
    }

    const rawToken = createInviteToken();
    const invite = await OrgInvite.create({
      orgId: req.user.orgId,
      email: normalizedEmail,
      role,
      tokenHash: hashInviteToken(rawToken),
      expiresAt: new Date(Date.now() + INVITE_TTL_MS),
      createdBy: req.user.userId
    });

    await recordAudit({
      orgId: req.user.orgId,
      userId: req.user.userId,
      action: "invite.created",
      entityType: "OrgInvite",
      entityId: invite._id.toString(),
      metadata: { email: normalizedEmail, role }
    });

    return res.status(201).json({
      id: invite._id,
      email: invite.email,
      role: invite.role,
      expiresAt: invite.expiresAt,
      inviteToken: rawToken
    });
  } catch (error) {
    return res.status(500).json({ message: "Failed to create invite", details: error.message });
  }
});

router.delete("/invites/:id", allowRoles("admin"), async (req, res) => {
  const invite = await OrgInvite.findOneAndDelete({
    _id: req.params.id,
    orgId: req.user.orgId,
    acceptedAt: null
  });

  if (!invite) {
    return res.status(404).json({ message: "Invite not found" });
  }

  await recordAudit({
    orgId: req.user.orgId,
    userId: req.user.userId,
    action: "invite.revoked",
    entityType: "OrgInvite",
    entityId: invite._id.toString(),
    metadata: { email: invite.email }
  });

  return res.status(200).json({ message: "Invite revoked" });
});

module.exports = { router, hashInviteToken };
