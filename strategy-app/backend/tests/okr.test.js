const test = require("node:test");
const assert = require("node:assert/strict");
const {
  computeKeyResultProgress,
  deriveKeyResultStatus,
  summarizeOkr
} = require("../utils/okr");

test("computeKeyResultProgress calculates percent completion", () => {
  const progress = computeKeyResultProgress({
    startValue: 0,
    currentValue: 50,
    targetValue: 100
  });
  assert.equal(progress, 50);
});

test("deriveKeyResultStatus marks completed when target reached", () => {
  const status = deriveKeyResultStatus({
    startValue: 0,
    currentValue: 100,
    targetValue: 100
  });
  assert.equal(status, "completed");
});

test("deriveKeyResultStatus marks at-risk for low progress", () => {
  const status = deriveKeyResultStatus({
    startValue: 0,
    currentValue: 10,
    targetValue: 100
  });
  assert.equal(status, "at-risk");
});

test("summarizeOkr returns overall progress average", () => {
  const summary = summarizeOkr({
    _id: "okr-1",
    title: "Grow revenue",
    description: "",
    period: "2026-Q3",
    owner: "Alex",
    status: "active",
    keyResults: [
      { _id: "kr-1", title: "KR 1", startValue: 0, currentValue: 50, targetValue: 100, metricType: "percent" },
      { _id: "kr-2", title: "KR 2", startValue: 0, currentValue: 80, targetValue: 100, metricType: "percent" }
    ],
    linkedInitiativeIds: [],
    createdAt: new Date(),
    updatedAt: new Date()
  });

  assert.equal(summary.overallProgress, 65);
  assert.equal(summary.keyResults.length, 2);
});
