import { NextFunction, Request, Response } from "express";
import { PEOPLE_WITH_SIGNIFICANT_CONTROL_PATH } from "../../types/page.urls";
import { Templates } from "../../types/template.paths";
import { urlUtils } from "../../utils/url";

export const get = (req: Request, res: Response, next: NextFunction) => {
  try {

    const pscStatement = undefined;

    return res.render(Templates.PSC_STATEMENT, {
      backLinkUrl: urlUtils.getUrlToPath(PEOPLE_WITH_SIGNIFICANT_CONTROL_PATH, req),
      pscStatement,
      templateName: Templates.PSC_STATEMENT,
    });
  } catch (e) {
    return next(e);
  }
};
