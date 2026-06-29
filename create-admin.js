import mongoose from "mongoose";
import bcrypt from "bcrypt";
import dotenv from "dotenv";

dotenv.config();

const email = "eshtiak40992@gmail.com";
const name = "Md Eshtiak Asha";
const password = "Eshtiak123..";

async function createAdmin() {
  await mongoose.connect(process.env.MONGODB_URI);
  const db = mongoose.connection.db;

  const hashedPassword = await bcrypt.hash(password, 12);

  const existingUser = await db.collection("user").findOne({ email });

  if (existingUser) {
    const userId = existingUser.id;

    await db.collection("account").updateOne(
      { userId },
      { $set: { password: hashedPassword } }
    );

    const User = mongoose.model("User", new mongoose.Schema({
      name: String, email: String, image: String,
      role: { type: String, default: "user" },
      isFraud: { type: Boolean, default: false },
    }, { timestamps: true }));

    await User.findOneAndUpdate({ email }, { role: "admin", name });

    console.log("Existing user promoted to admin!");
  } else {
    const userId = new mongoose.Types.ObjectId().toHexString();

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
      providerId: "credential",
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
  }

  console.log("Email:", email);
  console.log("Password:", password);
  await mongoose.disconnect();
}

createAdmin();
