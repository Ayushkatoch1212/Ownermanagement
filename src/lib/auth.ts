import {
  getServerSession,
  type NextAuthOptions,
} from "next-auth";

import CredentialsProvider from "next-auth/providers/credentials";

import bcrypt from "bcryptjs";

import { connectDB } from "@/lib/db";

import User from "@/models/User";

export const authOptions: NextAuthOptions = {
  session: {
    strategy: "jwt",
  },

  secret: process.env.NEXTAUTH_SECRET,

  providers: [
    CredentialsProvider({
      name: "Credentials",

      credentials: {
        email: {
          label: "Email",
          type: "email",
        },

        password: {
          label: "Password",
          type: "password",
        },
      },

      async authorize(credentials) {
        if (
          !credentials?.email ||
          !credentials?.password
        ) {
          console.log("AUTH: Email or password missing");
          return null;
        }

        await connectDB();

        const email = credentials.email
          .toLowerCase()
          .trim();

        console.log("AUTH: Looking for user:", email);

        const user = await User.findOne({
          email,
        }).select("+password");

        if (!user) {
          console.log("AUTH: User not found");
          return null;
        }

        console.log("AUTH: User found:", user.email);
        console.log(
          "AUTH: Password exists:",
          !!user.password
        );

        const valid = await bcrypt.compare(
          credentials.password,
          user.password
        );

        console.log("AUTH: Password valid:", valid);

        if (!valid) {
          console.log("AUTH: Invalid password");
          return null;
        }

        console.log("AUTH: Login successful");

        return {
          id: String(user._id),
          name: user.name,
          email: user.email,
          role: user.role,
        };
      },
    }),
  ],

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = (user as any).role;
      }

      return token;
    },

    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub!;
        session.user.role = token.role as string;
      }

      return session;
    },
  },

  pages: {
    signIn: "/login",
  },
};

export async function requireSession() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    throw new Error("UNAUTHORIZED");
  }

  return session;
}