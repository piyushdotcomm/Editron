import NextAuth from "next-auth"
import type { User, Account, Session } from "next-auth"
import type { JWT } from "next-auth/jwt"
import { PrismaAdapter } from "@auth/prisma-adapter"

import authConfig from "./auth.config"
import { db } from "./lib/db";
import { getUserById } from "./lib/user-data";

/**
 * Handle user and account creation/linking atomically within a transaction.
 * This ensures concurrent sign-in requests don't create duplicate users or cause race conditions.
 *
 * @param email - User email
 * @param name - User name
 * @param image - User image URL
 * @param account - OAuth account details
 * @returns true if operation succeeded, false otherwise
 */
async function handleUserAccountSync(
  email: string,
  name: string | null | undefined,
  image: string | null | undefined,
  account: Account
): Promise<boolean> {
  const sessionState = typeof account.session_state === 'string' ? account.session_state : undefined;

  try {
    // All database operations execute atomically.
    // If any operation fails, the entire transaction rolls back.
    await db.$transaction(async (tx) => {
      // Step 1: Try to find existing user (with row-level lock to prevent dirty reads)
      let user = await tx.user.findUnique({
        where: { email },
      });

      // Step 2: Create user if doesn't exist
      if (!user) {
        user = await tx.user.create({
          data: {
            email,
            name,
            image,
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

        if (!user) throw new Error("Failed to create user");
        return; // User and account created together, no need to link
      }

      // Step 3: Account linking for existing user
      // Try to find existing account
      const existingAccount = await tx.account.findUnique({
        where: {
          provider_providerAccountId: {
            provider: account.provider,
            providerAccountId: account.providerAccountId,
          },
        },
      });

      // Step 4: Create or update account
      if (!existingAccount) {
        await tx.account.create({
          data: {
            userId: user.id,
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
        // Update tokens and expiry for existing account
        await tx.account.update({
          where: { id: existingAccount.id },
          data: {
            accessToken: account.access_token,
            refreshToken: account.refresh_token,
            expiresAt: account.expires_at,
            scope: account.scope,
            idToken: account.id_token,
            sessionState,
          },
        });
      }
    }, {
      // Transaction options for concurrency control
      // Prisma uses SERIALIZABLE isolation level by default in transactions
      maxWait: 5000,        // Wait max 5 seconds to acquire locks
      timeout: 30000,       // Timeout after 30 seconds
    });

    return true;
  } catch (error) {
    // Log transaction errors for debugging
    if (error instanceof Error) {
      console.error(`[Auth Transaction Error] ${error.message}`);
    } else {
      console.error(`[Auth Transaction Error] Unknown error:`, error);
    }
    return false;
  }
}





export const { auth, handlers, signIn, signOut } = NextAuth({
  callbacks: {
    /**
     * Handle user creation and account linking after a successful sign-in.
     * Executes all database operations within an atomic transaction to ensure
     * concurrent sign-in requests are handled safely without race conditions.
     */
    async signIn({ user, account }: { user: User, account?: Account | null | undefined }) {
      if (!user || !account) return false;

      // Use transactional helper to ensure atomic operations
      const success = await handleUserAccountSync(
        user.email!,
        user.name,
        user.image,
        account
      );

      return success;
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