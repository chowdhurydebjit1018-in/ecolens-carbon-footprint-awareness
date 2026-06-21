import "express";

declare module "express-serve-static-core" {
  interface Request {
    id?: string;
    user?: {
      uid: string;
      email?: string;
    };
  }
}
