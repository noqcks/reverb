import NextAuth from "next-auth";
import { authOptions } from "../../../../lib/auth";

// Create and export the route handler
const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };