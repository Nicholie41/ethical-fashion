const express = require("express");
const Initiative = require("../models/Initiative");
const { requireAuth, allowRoles } = require("../middleware/auth");

const router = express.Router();

router.get("/", requireAuth, async (_req, res) => {
  const initiatives = await Initiative.find().sort({ updatedAt: -1 });
  return res.status(200).json(initiatives);
});

router.post("/", requireAuth, allowRoles("admin", "analyst"), async (req, res) => {
  try {
    const initiative = await Initiative.create({
      ...req.body,
      createdBy: req.user.userId
    });
    return res.status(201).json(initiative);
  } catch (error) {
    return res.status(400).json({ message: "Failed to create initiative", details: error.message });
  }
});

router.patch("/:id/status", requireAuth, allowRoles("admin", "analyst"), async (req, res) => {
  const { status } = req.body || {};
  const initiative = await Initiative.findByIdAndUpdate(
    req.params.id,
    { status },
    { new: true, runValidators: true }
  );
  if (!initiative) {
    return res.status(404).json({ message: "Initiative not found" });
  }
  return res.status(200).json(initiative);
});

module.exports = router;
