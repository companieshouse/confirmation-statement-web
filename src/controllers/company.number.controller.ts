import { Request, Response } from "express";

export const get = (req: Request, res: Response) => {
  return res.send("This is the company number page.");
};
