import { NextFunction, Request, Response } from "express";
import { Templates } from "../types/template.paths";

export const get = (req: Request, res: Response, next: NextFunction) => {
  try {
    return res.render(Templates.SIC);
  } catch (e) {
    return next(e);
  }
};
