import { Request, Response } from "express";
import { Templates } from "../types/template.paths";

export const get = (req: Request, res: Response) => {
  return res.render(Templates.CONFIRM_COMPANY);
};
