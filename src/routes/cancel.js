import { Router } from "express";
import Booking from "../models/Booking.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();

router.put("/:id", requireAuth, async (req, res) => {
  try {
    const booking = await Booking.findOne({ _id: req.params.id, userId: req.user.id });
    if (!booking) return res.status(404).json({ error: "Booking not found" });
    if (booking.status !== "pending") {
      return res.status(400).json({ error: "Can only cancel pending bookings" });
    }
    booking.status = "cancelled";
    await booking.save();
    res.json(booking);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
