import { UserRole } from "@prisma/client";


export type ExtendedUser = DefaultSession["user"] & {
    role:UserRole
}

declare module "next-auth"{
    interface Session{
        user:ExtendedUser
    }
}

import { JWT as _JWT} from "next-auth/jwt";


declare module "next-auth/jwt"{
    interface JWT{
        role:UserRole;
    }
}