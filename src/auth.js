import { betterAuth } from "better-auth";
import { mongodbAdapter } from "better-auth/adapters/mongodb";
import User from "./models/User.js";

export let auth;

export const initAuth = (db) => {
  auth = betterAuth({
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
    advanced: {
      defaultCookieAttributes: {
        sameSite: "none",
        secure: true,
      },
    },
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
                  authId: user.id,
                  name: user.name,
                  email: user.email,
                  image: user.image || "",
                  role: user.role || "user",
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

  return auth;
};

export { mongodbAdapter } from "better-auth/adapters/mongodb";
