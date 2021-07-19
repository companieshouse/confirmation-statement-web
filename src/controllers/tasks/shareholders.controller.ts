import { Templates } from "../../types/template.paths";
import { Request, Response } from "express";
import { TASK_LIST_PATH, urlParams, SHAREHOLDERS_PATH } from "../../types/page.urls";
import { urlUtils } from "../../utils/url";
import { RADIO_BUTTON_VALUE } from "../../utils/constants";

export const get = (req: Request, res: Response) => {
  const companyNumber = req.params[urlParams.PARAM_COMPANY_NUMBER];
  const backLinkUrl = urlUtils.getUrlWithCompanyNumber(TASK_LIST_PATH, companyNumber);
  return res.render(Templates.SHAREHOLDERS, { backLinkUrl });
};

export const post = (req: Request, res: Response) => {
  const shareholderButtonValue = req.body.shareholders;
  const companyNumber = req.params[urlParams.PARAM_COMPANY_NUMBER];

  if (shareholderButtonValue === RADIO_BUTTON_VALUE.NO) {
    return res.render(Templates.WRONG_SHAREHOLDERS, {
      backLinkUrl: urlUtils.getUrlWithCompanyNumber(SHAREHOLDERS_PATH, companyNumber),
      templateName: Templates.WRONG_SHAREHOLDERS,
    });
  }
};
