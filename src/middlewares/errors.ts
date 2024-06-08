import { NextFunction, Request, Response } from "express";

export const errorHandler = (req: Request, res: Response, next: NextFunction) => {
  res.header("content-type", "application/json")
  res.success = (message: string, data: object = {}, statusCode: number = 200) => {
    res.status(statusCode).json({
      status: "success",
      message,
      data
    });
  };

  res.error = (message: string, statusCode: number = 400) => {
    res.status(statusCode).json({
      status: "error",
      message
    });
  };

  next();
};
