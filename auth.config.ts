import Google from "next-auth/providers/google"
import GitHub from "next-auth/providers/github";
import type { NextAuthConfig } from "next-auth"
export default {
  providers: [
    GitHub({
      clientId: process.env.AUTH_GITHUB_ID,
      clientSecret: process.env.AUTH_GITHUB_SECRET,
      authorization: { params: { scope: "read:user user:email repo" } }
    }),
    Google({
      clientId: process.env.AUTH_GOOGLE_ID,
      clientSecret: process.env.AUTH_GOOGLE_SECRET,
    })
  ]
} satisfies NextAuthConfig
