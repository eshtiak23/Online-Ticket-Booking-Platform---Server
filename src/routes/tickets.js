import { Router } from "express";
import Ticket from "../models/Ticket.js";
import { requireAuth, requireRole } from "../middleware/auth.js";

const router = Router();

router.get("/", async (req, res) => {
  try {
    const { search, transportType, sort, page = 1, limit = 9 } = req.query;
    const query = { verificationStatus: "approved" };

    if (search) {
      const [from, to] = search.split("-").map((s) => s.trim());
      if (from) query.from = { $regex: from, $options: "i" };
      if (to) query.to = { $regex: to, $options: "i" };
    }
    if (transportType) {
      query.transportType = transportType;
    }

    let sortOption = {};
    if (sort === "low") sortOption.price = 1;
    else if (sort === "high") sortOption.price = -1;
    else sortOption.createdAt = -1;

    const total = await Ticket.countDocuments(query);
    const tickets = await Ticket.find(query)
      .sort(sortOption)
      .skip((page - 1) * limit)
      .limit(Number(limit));

    res.json({ tickets, total, page: Number(page), totalPages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/latest", async (req, res) => {
  try {
    const tickets = await Ticket.find({ verificationStatus: "approved" })
      .sort({ createdAt: -1 })
      .limit(8);
    res.json(tickets);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/advertised", async (req, res) => {
  try {
    const tickets = await Ticket.find({ isAdvertised: true, verificationStatus: "approved" }).limit(6);
    res.json(tickets);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/vendor/all", requireAuth, requireRole("vendor"), async (req, res) => {
  try {
    const tickets = await Ticket.find({ vendorEmail: req.user.email }).sort({ createdAt: -1 });
    res.json(tickets);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/:id", requireAuth, async (req, res) => {
  try {
    const ticket = await Ticket.findById(req.params.id);
    if (!ticket) return res.status(404).json({ error: "Ticket not found" });
    res.json(ticket);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const ALLOWED_TICKET_FIELDS = [
  "title", "from", "to", "transportType", "price",
  "quantity", "departureDate", "departureTime", "perks", "image",
];

router.post("/", requireAuth, requireRole("vendor"), async (req, res) => {
  try {
    if (req.dbUser.isFraud) {
      return res.status(403).json({ error: "You are marked as fraud. Cannot add tickets." });
    }
    const filtered = {};
    for (const key of ALLOWED_TICKET_FIELDS) {
      if (req.body[key] !== undefined) filtered[key] = req.body[key];
    }
    const ticket = await Ticket.create({
      ...filtered,
      vendorName: req.user.name,
      vendorEmail: req.user.email,
    });
    res.status(201).json(ticket);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put("/approve/:id", requireAuth, requireRole("admin"), async (req, res) => {
  try {
    const ticket = await Ticket.findByIdAndUpdate(req.params.id, { verificationStatus: "approved" }, { new: true });
    if (!ticket) return res.status(404).json({ error: "Ticket not found" });
    res.json(ticket);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put("/reject/:id", requireAuth, requireRole("admin"), async (req, res) => {
  try {
    const ticket = await Ticket.findByIdAndUpdate(req.params.id, { verificationStatus: "rejected" }, { new: true });
    if (!ticket) return res.status(404).json({ error: "Ticket not found" });
    res.json(ticket);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put("/:id", requireAuth, requireRole("vendor"), async (req, res) => {
  try {
    const ticket = await Ticket.findOne({ _id: req.params.id, vendorEmail: req.user.email });
    if (!ticket) return res.status(404).json({ error: "Ticket not found" });
    if (ticket.verificationStatus === "rejected") {
      return res.status(403).json({ error: "Cannot update a rejected ticket" });
    }
    const filtered = {};
    for (const key of ALLOWED_TICKET_FIELDS) {
      if (req.body[key] !== undefined) filtered[key] = req.body[key];
    }
    Object.assign(ticket, filtered);
    await ticket.save();
    res.json(ticket);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete("/:id", requireAuth, requireRole("vendor"), async (req, res) => {
  try {
    const ticket = await Ticket.findOne({ _id: req.params.id, vendorEmail: req.user.email });
    if (!ticket) return res.status(404).json({ error: "Ticket not found" });
    if (ticket.verificationStatus === "rejected") {
      return res.status(403).json({ error: "Cannot delete a rejected ticket" });
    }
    await ticket.deleteOne();
    res.json({ message: "Ticket deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
