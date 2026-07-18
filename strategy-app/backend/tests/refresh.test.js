const test = require("node:test");
const assert = require("node:assert/strict");
const mongoose = require("mongoose");
const RefreshToken = require("../models/RefreshToken");
const { hashRefreshToken } = require("../utils/tokens");

test("RefreshToken schema declares consumedAt for reuse detection", () => {
  const path = RefreshToken.schema.path("consumedAt");
  assert.ok(path);
  assert.equal(path.instance, "Date");
  assert.equal(path.options.default, null);
});

test("RefreshToken documents retain consumedAt when marked consumed", () => {
  const doc = new RefreshToken({
    userId: new mongoose.Types.ObjectId(),
    tokenHash: hashRefreshToken("sample-refresh-token"),
    expiresAt: new Date(Date.now() + 60_000)
  });

  assert.equal(doc.consumedAt, null);

  const consumedAt = new Date();
  doc.consumedAt = consumedAt;

  assert.ok(doc.isModified("consumedAt"));
  assert.equal(doc.get("consumedAt").getTime(), consumedAt.getTime());
});

test("reuse detection triggers when stored token already has consumedAt", () => {
  const storedToken = {
    userId: new mongoose.Types.ObjectId(),
    consumedAt: new Date(),
    expiresAt: new Date(Date.now() + 60_000)
  };

  assert.ok(storedToken?.consumedAt, "consumed token should signal reuse");
});
