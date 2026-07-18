const jwt = require("jsonwebtoken");
const { jwtSecret } = require("../utils/tokens");

// Self-registration allows analyst/executive only; admin must be seeded or assigned separately.
const ALLOWED_REGISTRATION_ROLES = ["analyst", "executive"];

function validateRegistrationRole(role) {
  const requestedRole = role || "executive";
  if (!ALLOWED_REGISTRATION_ROLES.includes(requestedRole)) {
    return {
      ok: false,
      message: "Registration allowed only for analyst or executive roles"
    };
  }
  return { ok: true, role: requestedRole };
}

function validateInviteRole(role) {
  if (role === "admin") {
    return { ok: true, role: "admin" };
  }
  return validateRegistrationRole(role);
}

function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization || "";
  const [scheme, token] = authHeader.split(" ");

  if (scheme !== "Bearer" || !token) {
    return res.status(401).json({ message: "Missing or invalid authorization token" });
  }

  try {
    const payload = jwt.verify(token, jwtSecret());
    req.user = payload;
    return next();
  } catch (_error) {
    return res.status(401).json({ message: "Unauthorized" });
  }
}

function allowRoles(...roles) {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ message: "Forbidden for this role" });
    }
    return next();
  };
}

function requireOrg(req, res, next) {
  if (!req.user?.orgId) {
    return res.status(403).json({ message: "Organization context required" });
  }
  return next();
}

module.exports = {
  requireAuth,
  allowRoles,
  requireOrg,
  validateRegistrationRole,
  validateInviteRole,
  ALLOWED_REGISTRATION_ROLES
};
