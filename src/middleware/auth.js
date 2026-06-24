import { auth } from "../auth.js";
import { fromNodeHeaders } from "better-auth/node";
import User from "../models/User.js";

export async function requireAuth(req, res, next) {
  try {
    const session = await auth.api.getSession({
      headers: fromNodeHeaders(req.headers),
    });
    if (!session) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    req.user = session.user;

    const dbUser = await User.findOne({ email: session.user.email });
    if (dbUser) {
      req.dbUser = dbUser;
      req.user.role = dbUser.role;
      req.user.isFraud = dbUser.isFraud;
    }

    next();
  } catch (err) {
    return res.status(401).json({ error: "Unauthorized" });
  }
}

export function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ error: "Forbidden" });
    }
    next();
  };
}
