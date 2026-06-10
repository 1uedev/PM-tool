import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import prisma from "./prisma.js";
import { isRateLimited, consumeRateLimit, resetRateLimit } from "./rate-limit.js";

// Brute-force protection: only FAILED attempts count against the limit,
// a successful login resets the counter.
const LOGIN_RATE_LIMIT = { limit: 5, windowMs: 15 * 60 * 1000 };

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "E-Mail", type: "email" },
        password: { label: "Passwort", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        // Emails are stored lowercase — normalize before lookup
        const email = credentials.email.trim().toLowerCase();
        const rateKey = `login:${email}`;
        if (isRateLimited(rateKey)) return null;

        const user = await prisma.user.findUnique({
          where: { email },
        });

        if (!user) {
          consumeRateLimit(rateKey, LOGIN_RATE_LIMIT);
          return null;
        }
        if (user.status === "INACTIVE") return null;

        const passwordValid = await bcrypt.compare(
          credentials.password,
          user.passwordHash
        );

        if (!passwordValid) {
          consumeRateLimit(rateKey, LOGIN_RATE_LIMIT);
          return null;
        }

        resetRateLimit(rateKey);

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          systemRole: user.systemRole,
        };
      },
    }),
  ],

  session: {
    strategy: "jwt",
    // Keep sessions short — server-side guards re-check status/role per
    // request, but a short JWT lifetime limits the exposure window.
    maxAge: 60 * 60 * 24, // 24 hours
  },

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.systemRole = user.systemRole;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id;
        session.user.systemRole = token.systemRole;
      }
      return session;
    },
  },

  pages: {
    signIn: "/login",
    error: "/login",
  },

  secret: process.env.NEXTAUTH_SECRET,
};
