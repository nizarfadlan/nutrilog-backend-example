import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

export const authHandler = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.error("Unauthorized", 401);
  }

  const token = authHeader.split(" ")[1];
  try {
    // The ignoreExpiration option is used to ignore the expiration of the token
    // This is useful when you want to check if the token is valid but don't want to throw an error if it's expired
    const decoded = jwt.verify(token, process.env.JWT_SECRET, { ignoreExpiration: true }) as Request["user"];
    req.user = decoded;

    next();
  } catch (err) {
    if (err instanceof jwt.JsonWebTokenError) {
      return res.error("Token expired", 401);
    } else {
      return res.error("Internal server error", 500);
    }
  }
};
