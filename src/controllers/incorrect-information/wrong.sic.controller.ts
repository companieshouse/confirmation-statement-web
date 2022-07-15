import { Request, Response } from "express";
import { urlUtils } from "../../utils/url";
import { SIC_PATH } from "../../types/page.urls";
import { Templates } from "../../types/template.paths";
import { EWF_URL } from "../../utils/properties";


export const get = (req: Request, res: Response) => {
  return res.render(Templates.WRONG_SIC, {
    EWF_URL,
    backLinkUrl: urlUtils.getUrlToPath(SIC_PATH, req),
    templateName: Templates.WRONG_SIC
  });
};
