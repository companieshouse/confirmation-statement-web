import { Request, Response } from "express";
import { Templates } from "../types/template.paths";
import { EWF_URL } from "../utils/properties";

export const get = (req: Request, res: Response) => {

  return res.render(Templates.DIRS_NOT_VERIFIED, {
    templateName: Templates.DIRS_NOT_VERIFIED,
    EWF_URL
  });
};
