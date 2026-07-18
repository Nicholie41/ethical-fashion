const test = require("node:test");
const assert = require("node:assert/strict");
const { requireAuth, requireOrg, validateRegistrationRole, validateInviteRole } = require("../middleware/auth");

function mockResponse() {
  const res = {
    statusCode: 200,
    body: null,
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(payload) {
      this.body = payload;
      return this;
    }
  };
  return res;
}

test("requireAuth rejects missing token", () => {
  const req = { headers: {} };
  const res = mockResponse();
  let nextCalled = false;

  requireAuth(req, res, () => {
    nextCalled = true;
  });

  assert.equal(nextCalled, false);
  assert.equal(res.statusCode, 401);
  assert.equal(res.body.message, "Missing or invalid authorization token");
});

test("requireAuth rejects invalid bearer token", () => {
  const req = { headers: { authorization: "Bearer not-a-valid-token" } };
  const res = mockResponse();
  let nextCalled = false;

  requireAuth(req, res, () => {
    nextCalled = true;
  });

  assert.equal(nextCalled, false);
  assert.equal(res.statusCode, 401);
  assert.equal(res.body.message, "Unauthorized");
});

test("validateRegistrationRole rejects admin role", () => {
  const result = validateRegistrationRole("admin");
  assert.equal(result.ok, false);
  assert.match(result.message, /analyst or executive/i);
});

test("validateRegistrationRole defaults to executive", () => {
  const result = validateRegistrationRole(undefined);
  assert.equal(result.ok, true);
  assert.equal(result.role, "executive");
});

test("validateRegistrationRole allows analyst", () => {
  const result = validateRegistrationRole("analyst");
  assert.equal(result.ok, true);
  assert.equal(result.role, "analyst");
});

test("requireOrg rejects missing organization context", () => {
  const req = { user: { userId: "user-123" } };
  const res = mockResponse();
  let nextCalled = false;

  requireOrg(req, res, () => {
    nextCalled = true;
  });

  assert.equal(nextCalled, false);
  assert.equal(res.statusCode, 403);
  assert.match(res.body.message, /organization context/i);
});
