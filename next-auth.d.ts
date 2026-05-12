import { UserRole } from "@prisma/client";
import _NextAuth , {type DefaultSession} from "next-auth"


export type ExtendedUser = DefaultSession["user"] & {
    role:UserRole
}

declare module "next-auth"{
    interface Session{
        user:ExtendedUser
    }
}

import {_JWT} from "next-auth/jwt";


declare module "next-auth/jwt"{
    interface JWT{
        role:UserRole;
    }
}