import { Request, Response } from "express";
import { urlUtils } from "../../utils/url";
import { SHAREHOLDERS_PATH } from "../../types/page.urls";
import { Templates } from "../../types/template.paths";

export const get = (req: Request, res: Response) => {
  return res.render(Templates.WRONG_SHAREHOLDERS, {
    backLinkUrl: urlUtils.getUrlToPath(SHAREHOLDERS_PATH, req),
    templateName: Templates.WRONG_SHAREHOLDERS
  });
};
