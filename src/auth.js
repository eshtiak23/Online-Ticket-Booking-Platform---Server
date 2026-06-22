import { betterAuth } from "better-auth";
import { mongodbAdapter } from "better-auth/adapters/mongodb";
import { MongoClient } from "mongodb";
import User from "./models/User.js";

const client = new MongoClient(process.env.MONGODB_URI);
await client.connect();
const db = client.db();

export const auth = betterAuth({
  database: mongodbAdapter(db),
  baseURL: process.env.BETTER_AUTH_URL,
  emailAndPassword: {
    enabled: true,
  },
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    },
  },
  trustedOrigins: [process.env.FRONTEND_URL],
  user: {
    additionalFields: {
      role: {
        type: "string",
        defaultValue: "user",
      },
      isFraud: {
        type: "boolean",
        defaultValue: false,
      },
    },
  },
  databaseHooks: {
    user: {
      create: {
        after: async (user) => {
          try {
            const existing = await User.findOne({ email: user.email });
            if (!existing) {
              await User.create({
                _id: user.id,
                name: user.name,
                email: user.email,
                image: user.image || "",
                role: (user as any).role || "user",
                isFraud: false,
              });
            }
          } catch (err) {
            console.error("Error syncing user to Mongoose:", err);
          }
        },
      },
    },
  },
});
