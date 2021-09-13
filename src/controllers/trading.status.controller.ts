import { Request, Response } from "express";
import { Templates } from "../types/template.paths";
import { CONFIRM_COMPANY_PATH, TASK_LIST_PATH, TRADING_STATUS_PATH, urlParams } from "../types/page.urls";
import { RADIO_BUTTON_VALUE, SECTIONS, TRADING_STATUS_ERROR } from "../utils/constants";
import { urlUtils } from "../utils/url";
import { sendUpdate } from "../utils/update.confirmation.statement.submission";
import { SectionStatus } from "@companieshouse/api-sdk-node/dist/services/confirmation-statement";

export const get = (req: Request, res: Response) => {
  const companyNumber: string = getCompanyNumber(req);
  return res.render(Templates.TRADING_STATUS, {
    backLinkUrl: getConfirmCompanyUrl(companyNumber)
  });
};

export const post = async (req: Request, res: Response) => {
  const tradingStatusButtonValue = req.body.tradingStatus;
  const companyNumber = getCompanyNumber(req);

  if (tradingStatusButtonValue === RADIO_BUTTON_VALUE.YES) {
    await sendUpdate(req, SECTIONS.TRADING_STATUS, SectionStatus.CONFIRMED);
    return res.redirect(urlUtils.getUrlToPath(TASK_LIST_PATH, req));
  }

  if (tradingStatusButtonValue === RADIO_BUTTON_VALUE.NO) {
    await sendUpdate(req, SECTIONS.TRADING_STATUS, SectionStatus.NOT_CONFIRMED);
    return res.render(Templates.TRADING_STOP, {
      backLinkUrl: urlUtils.getUrlToPath(TRADING_STATUS_PATH, req)
    });
  }

  return res.render(Templates.TRADING_STATUS, {
    tradingStatusErrorMsg: TRADING_STATUS_ERROR,
    backLinkUrl: getConfirmCompanyUrl(companyNumber),
  });
};

const getCompanyNumber = (req: Request): string => req.params[urlParams.PARAM_COMPANY_NUMBER];

const getConfirmCompanyUrl = (companyNumber: string): string => `${CONFIRM_COMPANY_PATH}?companyNumber=${companyNumber}`;
