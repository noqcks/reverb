import NextAuth from "next-auth";
import type { DefaultSession } from "next-auth";
import { authOptions } from "../../../../lib/auth";

declare module "next-auth" {
  interface Session extends DefaultSession {
    accessToken?: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    accessToken?: string;
  }
}

// Create and export the route handler
const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };