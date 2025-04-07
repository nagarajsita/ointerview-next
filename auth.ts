import NextAuth from "next-auth";
import GitHub from "next-auth/providers/github";
import { client } from "./sanity/lib/client";
import { writeClient } from "./sanity/lib/write-client";
import { INTERVIEWER_BY_GITHUB_ID_QUERY } from "./sanity/lib/queries";

export const { auth, handlers, signIn, signOut } = NextAuth({
  providers: [GitHub],
  pages: {
    signIn: "/signin",
  },
  callbacks: {
    async signIn({
      user: { name, email, image },
      profile: { id, login, bio },
    }) {
      const existingUser = await client.withConfig({useCdn:false}).fetch(INTERVIEWER_BY_GITHUB_ID_QUERY, {
        id,
      });

      if (!existingUser) {
        await writeClient.create({
          _type: "interviewer",
          id,
          name,
          username: login,
          email,
          image,
          bio: bio || "",
        });
      }
      return true;
    },
    async jwt({ token, account, profile }) {
      if (profile && account) {
        const user = await client.withConfig({useCdn:false}).fetch(INTERVIEWER_BY_GITHUB_ID_QUERY, {
          id: profile?.id,
        });
        token.id = user?._id;
      }
      return token;
    },
    async session({ session, token }) {
      Object.assign(session, { id: token.id });
      return session;
    },
  },
});
