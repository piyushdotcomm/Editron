import NextAuth from "next-auth"
import type { User, Account, Session } from "next-auth"
import type { JWT } from "next-auth/jwt"
import { PrismaAdapter } from "@auth/prisma-adapter"

import authConfig from "./auth.config"
import { db } from "./lib/db";
import { getUserById } from "./lib/user-data";





export const { auth, handlers, signIn, signOut } = NextAuth({
  callbacks: {
    /**
     * Handle user creation and account linking after a successful sign-in
     */
    async signIn({ user, account }: { user: User, account: Account | null | undefined }) {
      if (!user || !account) return false;

      const sessionState = account && typeof account.session_state === 'string' ? account.session_state : undefined;

      // Check if the user already exists
      const existingUser = await db.user.findUnique({
        where: { email: user.email! },
      });

      // If user does not exist, create a new one
      if (!existingUser) {
        const newUser = await db.user.create({
          data: {
            email: user.email!,
            name: user.name,
            image: user.image,

            accounts: {
              create: {
                type: account.type,
                provider: account.provider,
                providerAccountId: account.providerAccountId,
                refreshToken: account.refresh_token,
                accessToken: account.access_token,
                expiresAt: account.expires_at,
                tokenType: account.token_type,
                scope: account.scope,
                idToken: account.id_token,
                sessionState,
              },
            },
          },
        });

        if (!newUser) return false; // Return false if user creation fails
      } else {
        // Link the account if user exists
        const existingAccount = await db.account.findUnique({
          where: {
            provider_providerAccountId: {
              provider: account.provider,
              providerAccountId: account.providerAccountId,
            },
          },
        });

        // If the account does not exist, create it
        if (!existingAccount) {
          await db.account.create({
            data: {
              userId: existingUser.id,
              type: account.type,
              provider: account.provider,
              providerAccountId: account.providerAccountId,
              refreshToken: account.refresh_token,
              accessToken: account.access_token,
              expiresAt: account.expires_at,
              tokenType: account.token_type,
              scope: account.scope,
              idToken: account.id_token,
              sessionState,
            },
          });
        } else {
          // Update the access token and other details for existing accounts
          await db.account.update({
            where: { id: existingAccount.id },
            data: {
              accessToken: account.access_token,
              refreshToken: account.refresh_token,
              expiresAt: account.expires_at,
              scope: account.scope,
              idToken: account.id_token,
              sessionState,
            }
          });
        }
      }

      return true;
    },

    async jwt({ token, user: _user, account: _account }: { token: JWT, user?: User, account?: Account | null }) {
      if (!token.sub) return token;

      // Optimization: If token already has role and picture, skip DB call
      if (token.role && token.picture) {
        return token;
      }

      const existingUser = await getUserById(token.sub)

      if (!existingUser) return token;


      token.name = existingUser.name;
      token.email = existingUser.email;
      token.role = existingUser.role;
      token.picture = existingUser.image; // Add image to token

      return token;
    },

    async session({ session, token }: { session: Session, token: JWT }) {
      // Attach the user ID from the token to the session
      if (token.sub && session.user) {
        session.user.id = token.sub
      }

      if (token.sub && session.user) {
        session.user.role = token.role
      }

      // Add name and image to session
      if (session.user) {
        session.user.name = token.name;
        session.user.image = token.picture as string | null | undefined;
      }

      return session;
    },
  },

  secret: process.env.AUTH_SECRET,
  adapter: PrismaAdapter(db),
  session: { strategy: "jwt" },
  ...authConfig,
})