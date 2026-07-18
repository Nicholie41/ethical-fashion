const express = require("express");
const OKR = require("../models/OKR");
const Initiative = require("../models/Initiative");
const { requireAuth, allowRoles, requireOrg } = require("../middleware/auth");
const { summarizeOkr } = require("../utils/okr");
const { recordAudit } = require("../utils/audit");

const router = express.Router();

router.use(requireAuth, requireOrg);

router.get("/", async (req, res) => {
  const { period } = req.query;
  const filter = { orgId: req.user.orgId };
  if (period) {
    filter.period = period;
  }

  const okrs = await OKR.find(filter).sort({ updatedAt: -1 });
  return res.status(200).json(okrs.map(summarizeOkr));
});

router.get("/at-risk", async (req, res) => {
  const okrs = await OKR.find({ orgId: req.user.orgId, status: "active" }).sort({ updatedAt: -1 });
  const summaries = okrs
    .map(summarizeOkr)
    .map((okr) => ({
      ...okr,
      keyResults: okr.keyResults.filter((kr) => kr.status === "at-risk" || kr.status === "behind")
    }))
    .filter((okr) => okr.keyResults.length > 0);

  return res.status(200).json(summaries);
});

router.get("/summary", async (req, res) => {
  const okrs = await OKR.find({ orgId: req.user.orgId, status: "active" }).sort({ updatedAt: -1 });
  const summaries = okrs.map(summarizeOkr);
  const atRiskCount = summaries.reduce(
    (count, okr) => count + okr.keyResults.filter((keyResult) => keyResult.status === "at-risk").length,
    0
  );

  return res.status(200).json({
    totalObjectives: summaries.length,
    averageProgress:
      summaries.length === 0
        ? 0
        : Math.round((summaries.reduce((sum, okr) => sum + okr.overallProgress, 0) / summaries.length) * 10) / 10,
    atRiskKeyResults: atRiskCount,
    objectives: summaries
  });
});

router.post("/", allowRoles("admin", "analyst"), async (req, res) => {
  try {
    const { title, description, period, owner, keyResults, linkedInitiativeIds } = req.body || {};
    if (!title || !period || !owner) {
      return res.status(400).json({ message: "title, period, and owner are required" });
    }

    const okr = await OKR.create({
      orgId: req.user.orgId,
      title,
      description: description || "",
      period,
      owner,
      keyResults: keyResults || [],
      linkedInitiativeIds: linkedInitiativeIds || [],
      createdBy: req.user.userId
    });

    await recordAudit({
      orgId: req.user.orgId,
      userId: req.user.userId,
      action: "okr.created",
      entityType: "OKR",
      entityId: okr._id.toString(),
      metadata: { title, period }
    });

    return res.status(201).json(summarizeOkr(okr));
  } catch (error) {
    return res.status(400).json({ message: "Failed to create OKR", details: error.message });
  }
});

router.patch("/:id", allowRoles("admin", "analyst"), async (req, res) => {
  const allowedFields = ["title", "description", "period", "owner", "status", "linkedInitiativeIds"];
  const updates = {};
  for (const field of allowedFields) {
    if (req.body?.[field] !== undefined) {
      updates[field] = req.body[field];
    }
  }

  const okr = await OKR.findOneAndUpdate({ _id: req.params.id, orgId: req.user.orgId }, updates, {
    new: true,
    runValidators: true
  });

  if (!okr) {
    return res.status(404).json({ message: "OKR not found" });
  }

  await recordAudit({
    orgId: req.user.orgId,
    userId: req.user.userId,
    action: "okr.updated",
    entityType: "OKR",
    entityId: okr._id.toString(),
    metadata: updates
  });

  return res.status(200).json(summarizeOkr(okr));
});

router.delete("/:id", allowRoles("admin"), async (req, res) => {
  const okr = await OKR.findOneAndDelete({ _id: req.params.id, orgId: req.user.orgId });
  if (!okr) {
    return res.status(404).json({ message: "OKR not found" });
  }

  await recordAudit({
    orgId: req.user.orgId,
    userId: req.user.userId,
    action: "okr.deleted",
    entityType: "OKR",
    entityId: okr._id.toString(),
    metadata: { title: okr.title }
  });

  return res.status(200).json({ message: "OKR deleted" });
});

router.patch("/:id/key-results/:keyResultId", allowRoles("admin", "analyst"), async (req, res) => {
  const { currentValue, title, targetValue, startValue, owner, metricType } = req.body || {};
  const okr = await OKR.findOne({ _id: req.params.id, orgId: req.user.orgId });
  if (!okr) {
    return res.status(404).json({ message: "OKR not found" });
  }

  const keyResult = okr.keyResults.id(req.params.keyResultId);
  if (!keyResult) {
    return res.status(404).json({ message: "Key result not found" });
  }

  if (currentValue !== undefined) keyResult.currentValue = currentValue;
  if (title !== undefined) keyResult.title = title;
  if (targetValue !== undefined) keyResult.targetValue = targetValue;
  if (startValue !== undefined) keyResult.startValue = startValue;
  if (owner !== undefined) keyResult.owner = owner;
  if (metricType !== undefined) keyResult.metricType = metricType;

  await okr.save();

  await recordAudit({
    orgId: req.user.orgId,
    userId: req.user.userId,
    action: "okr.checkin",
    entityType: "KeyResult",
    entityId: keyResult._id.toString(),
    metadata: { okrId: okr._id.toString(), currentValue: keyResult.currentValue }
  });

  return res.status(200).json(summarizeOkr(okr));
});

router.post("/:id/key-results", allowRoles("admin", "analyst"), async (req, res) => {
  const { title, metricType, startValue, targetValue, currentValue, owner } = req.body || {};
  if (!title || targetValue === undefined) {
    return res.status(400).json({ message: "title and targetValue are required" });
  }

  const okr = await OKR.findOne({ _id: req.params.id, orgId: req.user.orgId });
  if (!okr) {
    return res.status(404).json({ message: "OKR not found" });
  }

  okr.keyResults.push({
    title,
    metricType: metricType || "percent",
    startValue: startValue ?? 0,
    targetValue,
    currentValue: currentValue ?? startValue ?? 0,
    owner: owner || okr.owner
  });

  await okr.save();
  return res.status(201).json(summarizeOkr(okr));
});

router.post("/:id/link-initiative/:initiativeId", allowRoles("admin", "analyst"), async (req, res) => {
  const initiative = await Initiative.findOne({ _id: req.params.initiativeId, orgId: req.user.orgId });
  if (!initiative) {
    return res.status(404).json({ message: "Initiative not found in this organization" });
  }

  const okr = await OKR.findOne({ _id: req.params.id, orgId: req.user.orgId });
  if (!okr) {
    return res.status(404).json({ message: "OKR not found" });
  }

  if (!okr.linkedInitiativeIds.some((id) => id.toString() === initiative._id.toString())) {
    okr.linkedInitiativeIds.push(initiative._id);
    await okr.save();
  }

  return res.status(200).json(summarizeOkr(okr));
});

module.exports = router;
