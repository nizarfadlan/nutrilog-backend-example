import * as express from "express";

declare global {
  namespace Express {
    interface Response {
      success: (message: string, data?: object, statusCode?: number) => void;
      error: (message: string, data?: object, statusCode?: number) => void;
    }
  }
}
