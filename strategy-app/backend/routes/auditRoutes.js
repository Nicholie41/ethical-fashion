const express = require("express");
const crypto = require("crypto");
const AuditLog = require("../models/AuditLog");
const { requireAuth, allowRoles, requireOrg } = require("../middleware/auth");

const router = express.Router();

router.use(requireAuth, requireOrg);

router.get("/", allowRoles("admin"), async (req, res) => {
  const limit = Math.min(Number(req.query.limit || 50), 200);
  const logs = await AuditLog.find({ orgId: req.user.orgId })
    .sort({ createdAt: -1 })
    .limit(limit)
    .populate("userId", "name email role");

  return res.status(200).json(
    logs.map((log) => ({
      id: log._id,
      action: log.action,
      entityType: log.entityType,
      entityId: log.entityId,
      metadata: log.metadata,
      createdAt: log.createdAt,
      user: log.userId
        ? { id: log.userId._id, name: log.userId.name, email: log.userId.email, role: log.userId.role }
        : null
    }))
  );
});

module.exports = router;
