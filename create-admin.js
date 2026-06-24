import mongoose from "mongoose";
import bcrypt from "bcrypt";
import dotenv from "dotenv";

dotenv.config();

const email = "eshtiak40992@gmail.com";
const name = "Eshtiak Ahmed Asha";
const password = "Eshtiak12";

async function createAdmin() {
  await mongoose.connect(process.env.MONGODB_URI);
  const db = mongoose.connection.db;

  const userId = new mongoose.Types.ObjectId().toHexString();
  const hashedPassword = await bcrypt.hash(password, 12);

  await db.collection("user").insertOne({
    id: userId,
    name,
    email,
    emailVerified: true,
    image: "",
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  await db.collection("account").insertOne({
    id: new mongoose.Types.ObjectId().toHexString(),
    userId,
    accountId: email,
    providerId: "email",
    password: hashedPassword,
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  const User = mongoose.model("User", new mongoose.Schema({
    name: String, email: String, image: String,
    role: { type: String, default: "user" },
    isFraud: { type: Boolean, default: false },
  }, { timestamps: true }));

  await User.create({
    _id: new mongoose.Types.ObjectId(userId),
    name,
    email,
    image: "",
    role: "admin",
    isFraud: false,
  });

  console.log("Admin created!");
  console.log("Email:", email);
  console.log("Password:", password);
  await mongoose.disconnect();
}

createAdmin();
