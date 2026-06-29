import "dotenv/config";
import express from "express";
import cors from "cors";
import rateLimit from "express-rate-limit";
import connectDB, { getDb } from "./config/db.js";
import { initAuth } from "./auth.js";
import { toNodeHandler } from "better-auth/node";
import { getStripe } from "./utils/stripe.js";
import Booking from "./models/Booking.js";
import Ticket from "./models/Ticket.js";
import Payment from "./models/Payment.js";
import User from "./models/User.js";
import ticketRoutes from "./routes/tickets.js";
import bookingRoutes from "./routes/bookings.js";
import paymentRoutes from "./routes/payments.js";
import userRoutes from "./routes/users.js";
import advertiseRoutes from "./routes/advertise.js";
import cancelRoutes from "./routes/cancel.js";
import { sanitizeBody } from "./middleware/sanitize.js";

const app = express();
const PORT = process.env.PORT || 5000;

const ALLOWED_ORIGINS = [
  process.env.FRONTEND_URL,
  "https://online-ticket-booking-platform-client-5jm1x1fgu.vercel.app",
  "https://online-ticket-booking-platform-client-n3ychi2e0.vercel.app",
  "https://online-ticket-booking-platform-clie-sigma.vercel.app",
  "http://localhost:5173",
];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || ALLOWED_ORIGINS.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  })
);

const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many requests, please try again later" },
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many auth attempts, please try again later" },
});

const bookingLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many booking requests, please try again later" },
});

// Webhook needs raw body — must be before express.json()
app.post("/api/payments/webhook", express.raw({ type: "application/json" }), async (req, res) => {
  const stripe = getStripe();
  if (!stripe) return res.status(500).json({ error: "Stripe not configured" });

  const sig = req.headers["stripe-signature"];
  let event;
  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    return res.status(400).json({ error: `Webhook Error: ${err.message}` });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object;
    const bookingId = session.metadata.bookingId;
    const booking = await Booking.findById(bookingId).populate("ticketId");
    if (booking && booking.status !== "paid") {
      booking.status = "paid";
      await booking.save();

      const ticket = await Ticket.findById(booking.ticketId._id);
      if (ticket) {
        const newQty = ticket.quantity - booking.quantity;
        ticket.quantity = newQty < 0 ? 0 : newQty;
        await ticket.save();
      }

      const user = await User.findOne({ email: booking.userEmail });
      await Payment.create({
        transactionId: session.id,
        userId: user?._id || booking.userId,
        ticketTitle: booking.ticketId.title,
        amount: session.amount_total / 100,
        paymentDate: new Date(),
      });
    }
  }

  res.json({ received: true });
});

app.use(express.json());
app.use(sanitizeBody);

// Connect to DB, init auth, then mount BetterAuth handler
await connectDB();
const auth = initAuth(getDb());
app.all("/api/auth/*", authLimiter, toNodeHandler(auth));

app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

app.use("/api/tickets", generalLimiter, ticketRoutes);
app.use("/api/bookings", bookingLimiter, bookingRoutes);
app.use("/api/payments", generalLimiter, paymentRoutes);
app.use("/api/users", generalLimiter, userRoutes);
app.use("/api/advertise", generalLimiter, advertiseRoutes);
app.use("/api/cancel", bookingLimiter, cancelRoutes);

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: "Something went wrong!" });
});

app.use((req, res) => {
  res.status(404).json({ error: "Route not found" });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
