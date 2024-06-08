import type { User } from "@prisma/client"
import * as express from "express";

declare global {
  namespace Express {
    interface Response {
      success: (message: string, data?: object, statusCode?: number) => void;
      error: (message: string, statusCode?: number) => void;
    }
    interface Request {
      user: {
        id: string;
      };
    }
  }
}
