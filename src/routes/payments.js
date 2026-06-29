import { Router } from "express";
import { getStripe } from "../utils/stripe.js";
import Booking from "../models/Booking.js";
import Payment from "../models/Payment.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();

router.post("/create-checkout", requireAuth, async (req, res) => {
  try {
    const { bookingId } = req.body;
    const booking = await Booking.findById(bookingId).populate("ticketId");
    if (!booking) return res.status(404).json({ error: "Booking not found" });
    if (booking.userId.toString() !== req.dbUser._id.toString()) {
      return res.status(403).json({ error: "Not your booking" });
    }
    if (booking.status !== "accepted") {
      return res.status(400).json({ error: "Booking is not accepted yet" });
    }

    const stripe = getStripe();
    if (!stripe) return res.status(500).json({ error: "Stripe not configured" });
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: { name: booking.ticketId.title },
            unit_amount: Math.round(booking.ticketId.price * 100),
          },
          quantity: booking.quantity,
        },
      ],
      mode: "payment",
      success_url: `${process.env.FRONTEND_URL}/dashboard/my-bookings?success=true`,
      cancel_url: `${process.env.FRONTEND_URL}/dashboard/my-bookings?canceled=true`,
      metadata: {
        bookingId: booking._id.toString(),
        userId: req.dbUser._id.toString(),
      },
    });

    res.json({ url: session.url });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/history", requireAuth, async (req, res) => {
  try {
    const payments = await Payment.find({ userId: req.dbUser._id }).sort({ paymentDate: -1 });
    res.json(payments);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
