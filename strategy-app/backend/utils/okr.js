function computeKeyResultProgress(keyResult) {
  const start = Number(keyResult.startValue ?? 0);
  const current = Number(keyResult.currentValue ?? 0);
  const target = Number(keyResult.targetValue ?? 0);
  const span = target - start;

  if (span === 0) {
    return current >= target ? 100 : 0;
  }

  const raw = ((current - start) / span) * 100;
  return Math.max(0, Math.min(100, Math.round(raw * 10) / 10));
}

function deriveKeyResultStatus(keyResult) {
  const progress = computeKeyResultProgress(keyResult);
  const current = Number(keyResult.currentValue ?? 0);
  const target = Number(keyResult.targetValue ?? 0);

  if (current >= target) {
    return "completed";
  }
  if (progress < 40) {
    return "at-risk";
  }
  if (progress < 70) {
    return "behind";
  }
  return "on-track";
}

function summarizeOkr(okr) {
  const keyResults = okr.keyResults || [];
  const progressValues = keyResults.map(computeKeyResultProgress);
  const overallProgress =
    progressValues.length === 0
      ? 0
      : Math.round((progressValues.reduce((sum, value) => sum + value, 0) / progressValues.length) * 10) / 10;

  return {
    id: okr._id,
    title: okr.title,
    description: okr.description,
    period: okr.period,
    owner: okr.owner,
    status: okr.status,
    overallProgress,
    keyResults: keyResults.map((keyResult) => ({
      id: keyResult._id,
      title: keyResult.title,
      metricType: keyResult.metricType,
      startValue: keyResult.startValue,
      targetValue: keyResult.targetValue,
      currentValue: keyResult.currentValue,
      owner: keyResult.owner,
      status: deriveKeyResultStatus(keyResult),
      progress: computeKeyResultProgress(keyResult)
    })),
    linkedInitiativeIds: okr.linkedInitiativeIds || [],
    createdAt: okr.createdAt,
    updatedAt: okr.updatedAt
  };
}

module.exports = {
  computeKeyResultProgress,
  deriveKeyResultStatus,
  summarizeOkr
};
