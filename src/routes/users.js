import { Router } from "express";
import User from "../models/User.js";
import Ticket from "../models/Ticket.js";
import { requireAuth, requireRole } from "../middleware/auth.js";
import { auth } from "../auth.js";
import { fromNodeHeaders } from "better-auth/node";

const router = Router();

router.get("/me", requireAuth, async (req, res) => {
  try {
    const session = await auth.api.getSession({
      headers: fromNodeHeaders(req.headers),
    });
    const dbUser = await User.findById(req.user.id);
    res.json({ user: { ...session.user, role: dbUser?.role || "user", isFraud: dbUser?.isFraud || false } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/", requireAuth, requireRole("admin"), async (req, res) => {
  try {
    const users = await User.find().sort({ createdAt: -1 });
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put("/role/:id", requireAuth, requireRole("admin"), async (req, res) => {
  try {
    const { role } = req.body;
    const user = await User.findByIdAndUpdate(req.params.id, { role }, { new: true });
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put("/fraud/:id", requireAuth, requireRole("admin"), async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ error: "User not found" });
    if (user.role !== "vendor") {
      return res.status(400).json({ error: "Can only mark vendors as fraud" });
    }
    user.isFraud = !user.isFraud;
    await user.save();

    if (user.isFraud) {
      await Ticket.updateMany({ vendorEmail: user.email }, { verificationStatus: "rejected" });
    }

    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/vendor/stats", requireAuth, requireRole("vendor"), async (req, res) => {
  try {
    const totalAdded = await Ticket.countDocuments({ vendorEmail: req.user.email });
    const bookings = await Booking.find({ ticketId: { $in: (await Ticket.find({ vendorEmail: req.user.email }).select("_id")).map(t => t._id) } });
    const totalSold = bookings.filter(b => b.status === "paid").reduce((sum, b) => sum + b.quantity, 0);
    const totalRevenue = bookings.filter(b => b.status === "paid").reduce((sum, b) => sum + b.totalPrice, 0);

    res.json({ totalAdded, totalSold, totalRevenue });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
