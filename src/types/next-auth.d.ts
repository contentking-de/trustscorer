import { DefaultSession, DefaultUser } from "next-auth";
import { JWT, DefaultJWT } from "next-auth/jwt";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      publisherId?: string;
    } & DefaultSession["user"];
  }

  interface User extends DefaultUser {
    publisherId?: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT extends DefaultJWT {
    id: string;
    publisherId?: string;
  }
}
