import { Request, Response } from "express";
import { urlUtils } from "../../utils/url";
import { SIC_PATH } from "../../types/page.urls";
import { Templates } from "../../types/template.paths";

export const get = (req: Request, res: Response) => {
  return res.render(Templates.WRONG_SIC, {
    backLinkUrl: urlUtils.getUrlToPath(SIC_PATH, req),
    templateName: Templates.WRONG_SIC
  });
};
