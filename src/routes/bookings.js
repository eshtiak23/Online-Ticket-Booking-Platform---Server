import { Router } from "express";
import Booking from "../models/Booking.js";
import Ticket from "../models/Ticket.js";
import { requireAuth, requireRole } from "../middleware/auth.js";

const router = Router();

router.post("/", requireAuth, async (req, res) => {
  try {
    const { ticketId, quantity } = req.body;
    const ticket = await Ticket.findById(ticketId);
    if (!ticket) return res.status(404).json({ error: "Ticket not found" });

    if (ticket.quantity < quantity) {
      return res.status(400).json({ error: "Not enough tickets available" });
    }

    const booking = await Booking.create({
      userId: req.user.id,
      ticketId,
      userEmail: req.user.email,
      userName: req.user.name,
      quantity,
      totalPrice: ticket.price * quantity,
    });

    res.status(201).json(booking);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/user", requireAuth, async (req, res) => {
  try {
    const bookings = await Booking.find({ userId: req.user.id })
      .populate("ticketId")
      .sort({ createdAt: -1 });
    res.json(bookings);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/vendor", requireAuth, requireRole("vendor"), async (req, res) => {
  try {
    const vendorTickets = await Ticket.find({ vendorEmail: req.user.email }).select("_id");
    const ticketIds = vendorTickets.map((t) => t._id);
    const bookings = await Booking.find({ ticketId: { $in: ticketIds } })
      .populate("ticketId")
      .sort({ createdAt: -1 });
    res.json(bookings);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put("/accept/:id", requireAuth, requireRole("vendor"), async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id).populate("ticketId");
    if (!booking) return res.status(404).json({ error: "Booking not found" });
    if (booking.ticketId.vendorEmail !== req.user.email) {
      return res.status(403).json({ error: "Not your ticket" });
    }
    booking.status = "accepted";
    await booking.save();
    res.json(booking);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put("/reject/:id", requireAuth, requireRole("vendor"), async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id).populate("ticketId");
    if (!booking) return res.status(404).json({ error: "Booking not found" });
    if (booking.ticketId.vendorEmail !== req.user.email) {
      return res.status(403).json({ error: "Not your ticket" });
    }
    booking.status = "rejected";
    await booking.save();
    res.json(booking);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
