import { Request, Response } from "express";

export const get = (req: Request, res: Response) => {
  return res.send("Hello Confirmation statement");
};
