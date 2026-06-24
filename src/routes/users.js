import { Router } from "express";
import User from "../models/User.js";
import Ticket from "../models/Ticket.js";
import { requireAuth, requireRole } from "../middleware/auth.js";

const router = Router();

router.get("/me", requireAuth, async (req, res) => {
  try {
    res.json({
      user: {
        id: req.user.id,
        name: req.user.name,
        email: req.user.email,
        image: req.user.image,
        role: req.dbUser?.role || "user",
        isFraud: req.dbUser?.isFraud || false,
      },
    });
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
    if (!["user", "vendor", "admin"].includes(role)) {
      return res.status(400).json({ error: "Invalid role. Must be user, vendor, or admin" });
    }
    const user = await User.findByIdAndUpdate(req.params.id, { role }, { new: true });
    if (!user) return res.status(404).json({ error: "User not found" });
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

    const vendorTickets = await Ticket.find({ vendorEmail: req.user.email }).select("_id");
    const ticketIds = vendorTickets.map((t) => t._id);

    const stats = await Booking.aggregate([
      { $match: { ticketId: { $in: ticketIds }, status: "paid" } },
      {
        $group: {
          _id: null,
          totalSold: { $sum: "$quantity" },
          totalRevenue: { $sum: "$totalPrice" },
        },
      },
    ]);

    res.json({
      totalAdded,
      totalSold: stats[0]?.totalSold || 0,
      totalRevenue: stats[0]?.totalRevenue || 0,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
