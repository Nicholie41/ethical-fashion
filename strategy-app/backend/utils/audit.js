const AuditLog = require("../models/AuditLog");

async function recordAudit({ orgId, userId, action, entityType, entityId = "", metadata = {} }) {
  try {
    await AuditLog.create({ orgId, userId, action, entityType, entityId, metadata });
  } catch (error) {
    console.error("Audit log failed:", error.message);
  }
}

module.exports = { recordAudit };
