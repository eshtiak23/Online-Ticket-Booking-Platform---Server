import mongoose from "mongoose";

const ticketSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    from: { type: String, required: true },
    to: { type: String, required: true },
    transportType: {
      type: String,
      enum: ["Bus", "Train", "Launch", "Plane"],
      required: true,
    },
    price: { type: Number, required: true },
    quantity: { type: Number, required: true },
    departureDate: { type: String, required: true },
    departureTime: { type: String, required: true },
    perks: [{ type: String }],
    image: { type: String, default: "" },
    vendorName: { type: String, required: true },
    vendorEmail: { type: String, required: true },
    verificationStatus: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
    isAdvertised: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export default mongoose.model("Ticket", ticketSchema);
