import { Request, Response } from "express";
import { Templates } from "../types/template.paths";

export const get = (req: Request, res: Response) => {
  return res.render(Templates.START, {CHS_URL : process.env.CHS_URL});
};
