import { Request, Response } from "express";
import { Templates } from "../types/template.paths";

export const get = (req: Request, res: Response) => {
  res.render(Templates.INVALID_COMPANY_STATUS, {
    companyName: "company"
  });
};
