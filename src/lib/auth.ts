import { betterAuth } from "better-auth";
import { MongoClient } from "mongodb";
import { mongodbAdapter } from "better-auth/adapters/mongodb";
import { sendEmail } from "@/config/resend";
import { emailOTP } from "better-auth/plugins"

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
  emailAndPassword: {
    enabled: true,
    
  },
    rateLimit: {
    enabled: true,
    window: 60,
    max: 100,
    customRules: {
      "/email-otp/send-verification-otp": {
        window: 120,
        max: 1,
      },
    },
  },
  session: {
    cookieCache: {
      enabled: true,
      maxAge: 30 * 60,
    },
    expiresIn: 60 * 60 * 24 * 3,
    updateAge: 60 * 60 * 24 * 3,
  },
  plugins: [
    emailOTP({
      overrideDefaultEmailVerification: true,
			async sendVerificationOTP({ email, otp, type }) {
				await sendEmail(email, otp, type)
			},
			expiresIn: 300, 
			otpLength: 6,
		})
	],
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