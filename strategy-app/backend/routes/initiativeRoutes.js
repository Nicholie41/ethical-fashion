const express = require("express");
const Initiative = require("../models/Initiative");
const { requireAuth, allowRoles, requireOrg } = require("../middleware/auth");
const { recordAudit } = require("../utils/audit");

const router = express.Router();

router.use(requireAuth, requireOrg);

router.get("/", async (req, res) => {
  const initiatives = await Initiative.find({ orgId: req.user.orgId }).sort({ updatedAt: -1 });
  return res.status(200).json(initiatives);
});

router.get("/summary", async (req, res) => {
  const initiatives = await Initiative.find({ orgId: req.user.orgId });
  const totalInvestment = initiatives.reduce((sum, item) => sum + (item.investment || 0), 0);
  const avgRoi =
    initiatives.length === 0
      ? 0
      : initiatives.reduce((sum, item) => sum + (item.expectedROI || 0), 0) / initiatives.length;

  return res.status(200).json({
    total: initiatives.length,
    byStatus: {
      planned: initiatives.filter((item) => item.status === "planned").length,
      "in-progress": initiatives.filter((item) => item.status === "in-progress").length,
      completed: initiatives.filter((item) => item.status === "completed").length,
      "on-hold": initiatives.filter((item) => item.status === "on-hold").length
    },
    totalInvestment,
    averageRoi: Math.round(avgRoi * 1000) / 10
  });
});

router.get("/:id", async (req, res) => {
  const initiative = await Initiative.findOne({ _id: req.params.id, orgId: req.user.orgId });
  if (!initiative) {
    return res.status(404).json({ message: "Initiative not found" });
  }
  return res.status(200).json(initiative);
});

router.post("/", allowRoles("admin", "analyst"), async (req, res) => {
  try {
    const initiative = await Initiative.create({
      ...req.body,
      orgId: req.user.orgId,
      createdBy: req.user.userId
    });

    await recordAudit({
      orgId: req.user.orgId,
      userId: req.user.userId,
      action: "initiative.created",
      entityType: "Initiative",
      entityId: initiative._id.toString(),
      metadata: { name: initiative.name, status: initiative.status }
    });

    return res.status(201).json(initiative);
  } catch (error) {
    return res.status(400).json({ message: "Failed to create initiative", details: error.message });
  }
});

router.patch("/:id", allowRoles("admin", "analyst"), async (req, res) => {
  const allowedFields = ["name", "owner", "workstream", "status", "investment", "expectedROI", "kpis", "milestones"];
  const updates = {};
  for (const field of allowedFields) {
    if (req.body?.[field] !== undefined) {
      updates[field] = req.body[field];
    }
  }

  const initiative = await Initiative.findOneAndUpdate(
    { _id: req.params.id, orgId: req.user.orgId },
    updates,
    { new: true, runValidators: true }
  );

  if (!initiative) {
    return res.status(404).json({ message: "Initiative not found" });
  }

  await recordAudit({
    orgId: req.user.orgId,
    userId: req.user.userId,
    action: "initiative.updated",
    entityType: "Initiative",
    entityId: initiative._id.toString(),
    metadata: updates
  });

  return res.status(200).json(initiative);
});

router.patch("/:id/status", allowRoles("admin", "analyst"), async (req, res) => {
  const { status } = req.body || {};
  const initiative = await Initiative.findOneAndUpdate(
    { _id: req.params.id, orgId: req.user.orgId },
    { status },
    { new: true, runValidators: true }
  );
  if (!initiative) {
    return res.status(404).json({ message: "Initiative not found" });
  }

  await recordAudit({
    orgId: req.user.orgId,
    userId: req.user.userId,
    action: "initiative.status_changed",
    entityType: "Initiative",
    entityId: initiative._id.toString(),
    metadata: { status }
  });

  return res.status(200).json(initiative);
});

router.delete("/:id", allowRoles("admin"), async (req, res) => {
  const initiative = await Initiative.findOneAndDelete({ _id: req.params.id, orgId: req.user.orgId });
  if (!initiative) {
    return res.status(404).json({ message: "Initiative not found" });
  }

  await recordAudit({
    orgId: req.user.orgId,
    userId: req.user.userId,
    action: "initiative.deleted",
    entityType: "Initiative",
    entityId: initiative._id.toString(),
    metadata: { name: initiative.name }
  });

  return res.status(200).json({ message: "Initiative deleted" });
});

module.exports = router;
