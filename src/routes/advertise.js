import { Router } from "express";
import Ticket from "../models/Ticket.js";
import { requireAuth, requireRole } from "../middleware/auth.js";

const router = Router();

router.get("/", requireAuth, requireRole("admin"), async (req, res) => {
  try {
    const tickets = await Ticket.find({ verificationStatus: "approved" }).sort({ createdAt: -1 });
    res.json(tickets);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put("/:id", requireAuth, requireRole("admin"), async (req, res) => {
  try {
    const ticket = await Ticket.findById(req.params.id);
    if (!ticket) return res.status(404).json({ error: "Ticket not found" });

    if (!ticket.isAdvertised) {
      const advertisedCount = await Ticket.countDocuments({ isAdvertised: true });
      if (advertisedCount >= 6) {
        return res.status(400).json({ error: "Cannot advertise more than 6 tickets" });
      }
    }

    ticket.isAdvertised = !ticket.isAdvertised;
    await ticket.save();
    res.json(ticket);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
