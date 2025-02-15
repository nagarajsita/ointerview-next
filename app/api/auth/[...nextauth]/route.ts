import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";

const handler = NextAuth({
  providers: [
    GoogleProvider({
        clientId: process.env.GOOGLE_CLIENT_ID as string,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    }),
    
  ],
  secret: process.env.NEXTAUTH_SECRET,
  pages:{
    signIn: "/signin",
  }
});

export { handler as POST, handler as GET };
