import { betterAuth } from "better-auth";
import { MongoClient } from "mongodb";
import { mongodbAdapter } from "better-auth/adapters/mongodb";

const client = new MongoClient(process.env.MONGODB_URI!);
export const db = client.db();

db.collection("user")
  .createIndex(
    { name: 1 },
    { unique: true, collation: { locale: "en", strength: 2 } }
  )
  .catch((error) => {
    console.error(
      "Failed to create unique index on user.name — check for existing duplicate names",
      error
    );
  });

export const auth = betterAuth({
  database: mongodbAdapter(db, {
    client
  }),
  baseURL: process.env.BETTER_AUTH_URL,
  basePath: "/api/auth",
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    }
  },
  rateLimit: {
    enabled: true,
    window: 60,
    max: 100,
  },
  session: {
    cookieCache: {
      enabled: true,
      maxAge: 30 * 60,
    },
    expiresIn: 60 * 60 * 24 * 3,
    updateAge: 60 * 60 * 24 * 3,
  },
  user: {
    additionalFields: {
      isAcceptingMessages: {
        type: "boolean",
        defaultValue: false,
        required: true,
        input: false,
      }
    }
  }
});