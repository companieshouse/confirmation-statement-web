import { Request, Response } from "express";
import { Templates } from "../types/template.paths";
import { urlUtils } from "../utils/url";
import { TRADING_STATUS_PATH } from "../types/page.urls";
import { EWF_URL } from "../utils/properties";


export const get = (req: Request, res: Response) => {

  return res.render(Templates.TRADING_STOP, {
    backLinkUrl: urlUtils.getUrlToPath(TRADING_STATUS_PATH, req),
    EWF_URL,
    templateName: Templates.TRADING_STOP
  });
};
