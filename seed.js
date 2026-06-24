import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const ticketSchema = new mongoose.Schema({
  title: String, from: String, to: String, transportType: String,
  price: Number, quantity: Number, departureDate: String, departureTime: String,
  perks: [String], image: String, vendorName: String, vendorEmail: String,
  verificationStatus: { type: String, default: "approved" },
  isAdvertised: { type: Boolean, default: false },
}, { timestamps: true });

const Ticket = mongoose.model("Ticket", ticketSchema);

const tickets = [
  {
    title: "Dhaka to Chittagong Express",
    from: "Dhaka", to: "Chittagong", transportType: "Bus",
    price: 850, quantity: 30, departureDate: "2026-07-15", departureTime: "08:00",
    perks: ["AC", "WiFi", "Charging Point"], image: "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=400",
    vendorName: "Green Line", vendorEmail: "vendor@ticketbari.com", isAdvertised: true,
  },
  {
    title: "Dhaka to Sylhet Luxury Train",
    from: "Dhaka", to: "Sylhet", transportType: "Train",
    price: 1200, quantity: 50, departureDate: "2026-07-20", departureTime: "22:00",
    perks: ["AC", "Snacks", "Reading Light"], image: "https://images.unsplash.com/photo-1474487548417-781cb71495f3?w=400",
    vendorName: "Bangladesh Railway", vendorEmail: "vendor@ticketbari.com", isAdvertised: true,
  },
  {
    title: "Dhaka to Cox's Bazar Launch",
    from: "Dhaka", to: "Cox's Bazar", transportType: "Launch",
    price: 1500, quantity: 100, departureDate: "2026-07-25", departureTime: "18:00",
    perks: ["AC", "Lunch", "Dinner", "WiFi"], image: "https://images.unsplash.com/photo-1569263979104-865ab7cd8d13?w=400",
    vendorName: "SR Travels", vendorEmail: "vendor@ticketbari.com", isAdvertised: true,
  },
  {
    title: "Dhaka to Kolkata Flight",
    from: "Dhaka", to: "Kolkata", transportType: "Plane",
    price: 8500, quantity: 25, departureDate: "2026-08-01", departureTime: "10:30",
    perks: ["AC", "Breakfast", "Lunch", "WiFi"], image: "https://images.unsplash.com/photo-1436491865332-7a61a109db05?w=400",
    vendorName: "Biman Bangladesh", vendorEmail: "vendor@ticketbari.com", isAdvertised: true,
  },
  {
    title: "Chittagong to Dhaka AC Bus",
    from: "Chittagong", to: "Dhaka", transportType: "Bus",
    price: 900, quantity: 35, departureDate: "2026-07-18", departureTime: "14:00",
    perks: ["AC", "WiFi", "Snacks"], image: "https://images.unsplash.com/photo-1570125909232-eb263c188f7e?w=400",
    vendorName: "Hanif Enterprise", vendorEmail: "vendor@ticketbari.com", isAdvertised: true,
  },
  {
    title: "Sylhet to Dhaka Express",
    from: "Sylhet", to: "Dhaka", transportType: "Bus",
    price: 800, quantity: 40, departureDate: "2026-07-22", departureTime: "06:00",
    perks: ["AC", "Charging Point", "WiFi"], image: "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=400",
    vendorName: "Shyamoli Paribahan", vendorEmail: "vendor@ticketbari.com", isAdvertised: true,
  },
  {
    title: "Dhaka to Khulna Train",
    from: "Dhaka", to: "Khulna", transportType: "Train",
    price: 650, quantity: 60, departureDate: "2026-08-05", departureTime: "07:00",
    perks: ["Non-AC", "Reading Light"], image: "https://images.unsplash.com/photo-1474487548417-781cb71495f3?w=400",
    vendorName: "Bangladesh Railway", vendorEmail: "vendor@ticketbari.com",
  },
  {
    title: "Dhaka to Rajshahi Launch",
    from: "Dhaka", to: "Rajshahi", transportType: "Launch",
    price: 1100, quantity: 80, departureDate: "2026-08-10", departureTime: "20:00",
    perks: ["AC", "Dinner", "WiFi"], image: "https://images.unsplash.com/photo-1569263979104-865ab7cd8d13?w=400",
    vendorName: "Meghna Transport", vendorEmail: "vendor@ticketbari.com",
  },
  {
    title: "Cox's Bazar to Dhaka Flight",
    from: "Cox's Bazar", to: "Dhaka", transportType: "Plane",
    price: 7200, quantity: 15, departureDate: "2026-08-15", departureTime: "16:00",
    perks: ["AC", "Snacks", "WiFi"], image: "https://images.unsplash.com/photo-1436491865332-7a61a109db05?w=400",
    vendorName: "US-Bangla Airlines", vendorEmail: "vendor@ticketbari.com",
  },
  {
    title: "Dhaka to Barisal Speed Boat",
    from: "Dhaka", to: "Barisal", transportType: "Launch",
    price: 950, quantity: 45, departureDate: "2026-08-20", departureTime: "09:00",
    perks: ["AC", "Snacks", "Charging Point"], image: "https://images.unsplash.com/photo-1569263979104-865ab7cd8d13?w=400",
    vendorName: "Kutubdia Travels", vendorEmail: "vendor@ticketbari.com",
  },
  {
    title: "Dhaka to Rangpur AC Bus",
    from: "Dhaka", to: "Rangpur", transportType: "Bus",
    price: 750, quantity: 55, departureDate: "2026-08-25", departureTime: "21:00",
    perks: ["AC", "WiFi", "Lunch"], image: "https://images.unsplash.com/photo-1570125909232-eb263c188f7e?w=400",
    vendorName: "Rangpur Express", vendorEmail: "vendor@ticketbari.com",
  },
  {
    title: "Dhaka to Mymensingh Train",
    from: "Dhaka", to: "Mymensingh", transportType: "Train",
    price: 350, quantity: 70, departureDate: "2026-09-01", departureTime: "12:00",
    perks: ["Non-AC", "Snacks"], image: "https://images.unsplash.com/photo-1474487548417-781cb71495f3?w=400",
    vendorName: "Bangladesh Railway", vendorEmail: "vendor@ticketbari.com",
  },
];

async function seed() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected to MongoDB");

    await Ticket.deleteMany({});
    console.log("Cleared existing tickets");

    await Ticket.insertMany(tickets);
    console.log(`Seeded ${tickets.length} tickets`);

    await mongoose.disconnect();
    console.log("Done!");
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

seed();
