import { Request, Response } from "express";
import { urlUtils } from "../../utils/url";
import { SHAREHOLDERS_PATH } from "../../types/page.urls";
import { Templates } from "../../types/template.paths";
import { EWF_URL } from "../../utils/properties";


export const get = (req: Request, res: Response) => {
  return res.render(Templates.WRONG_SHAREHOLDERS, {
    EWF_URL,
    backLinkUrl: urlUtils.getUrlToPath(SHAREHOLDERS_PATH, req),
    templateName: Templates.WRONG_SHAREHOLDERS
  });
};
