const express = require("express");
const OKR = require("../models/OKR");
const Initiative = require("../models/Initiative");
const User = require("../models/User");
const Organization = require("../models/Organization");
const { requireAuth, requireOrg } = require("../middleware/auth");
const { summarizeOkr } = require("../utils/okr");
const { postAnalytics } = require("../utils/analyticsClient");

const router = express.Router();

router.use(requireAuth, requireOrg);

router.get("/executive", async (req, res) => {
  const orgId = req.user.orgId;
  const [okrs, initiatives, members, organization] = await Promise.all([
    OKR.find({ orgId, status: "active" }).sort({ updatedAt: -1 }),
    Initiative.find({ orgId }).sort({ updatedAt: -1 }),
    User.countDocuments({ orgId }),
    Organization.findById(orgId).select("name slug")
  ]);

  const summaries = okrs.map(summarizeOkr);
  const atRiskKeyResults = summaries.reduce(
    (count, okr) => count + okr.keyResults.filter((kr) => kr.status === "at-risk" || kr.status === "behind").length,
    0
  );
  const totalInvestment = initiatives.reduce((sum, item) => sum + (item.investment || 0), 0);
  const avgRoi =
    initiatives.length === 0
      ? 0
      : initiatives.reduce((sum, item) => sum + (item.expectedROI || 0), 0) / initiatives.length;

  return res.status(200).json({
    organization,
    members,
    okrSummary: {
      totalObjectives: summaries.length,
      averageProgress:
        summaries.length === 0
          ? 0
          : Math.round((summaries.reduce((sum, okr) => sum + okr.overallProgress, 0) / summaries.length) * 10) / 10,
      atRiskKeyResults
    },
    initiativeSummary: {
      total: initiatives.length,
      inProgress: initiatives.filter((item) => item.status === "in-progress").length,
      totalInvestment,
      averageRoi: Math.round(avgRoi * 1000) / 10
    },
    okrs: summaries,
    initiatives: initiatives.map((item) => ({
      id: item._id,
      name: item.name,
      status: item.status,
      investment: item.investment,
      expectedROI: item.expectedROI,
      owner: item.owner
    }))
  });
});

router.get("/status", async (_req, res) => {
  const { ANALYTICS_URL } = require("../utils/analyticsClient");
  let analytics = { status: "unknown" };

  try {
    const response = await fetch(`${ANALYTICS_URL}/health`);
    if (response.ok) {
      analytics = await response.json();
    } else {
      analytics = { status: "error", message: `HTTP ${response.status}` };
    }
  } catch (error) {
    analytics = { status: "down", message: error.message };
  }

  return res.status(200).json({
    backend: "ok",
    analyticsUrl: ANALYTICS_URL,
    analytics
  });
});

router.get("/visuals", async (req, res) => {
  try {
    const orgId = req.user.orgId;
    const [okrs, initiatives, organization] = await Promise.all([
      OKR.find({ orgId }).sort({ updatedAt: -1 }),
      Initiative.find({ orgId }).sort({ updatedAt: -1 }),
      Organization.findById(orgId).select("name")
    ]);

    const okrSummaries = okrs.map(summarizeOkr);
    const visuals = await postAnalytics("/visuals/executive-dashboard", {
      organizationName: organization?.name || "Organization",
      okrs: okrSummaries,
      initiatives: initiatives.map((item) => ({
        name: item.name,
        status: item.status,
        investment: item.investment,
        expectedROI: item.expectedROI
      }))
    });

    return res.status(200).json(visuals);
  } catch (error) {
    return res.status(502).json({ message: "Failed to generate Python visuals", details: error.message });
  }
});

router.get("/visuals/revenue", async (req, res) => {
  try {
    const visuals = await postAnalytics("/visuals/revenue", {});
    return res.status(200).json(visuals);
  } catch (error) {
    return res.status(502).json({ message: "Failed to generate revenue chart", details: error.message });
  }
});

module.exports = router;
