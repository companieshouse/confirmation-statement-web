import { NextFunction, Request, Response } from "express";
import { urlUtils } from "../../utils/url";
import { TASK_LIST_PATH, REGISTERED_OFFICE_ADDRESS_PATH, CHANGE_ROA_PATH, urlParams } from "../../types/page.urls";
import { Templates } from "../../types/template.paths";
import { CompanyProfile, RegisteredOfficeAddress } from "@companieshouse/api-sdk-node/dist/services/company-profile/types";
import { getCompanyProfile } from "../../services/company.profile.service";
import { RADIO_BUTTON_VALUE, REGISTERED_OFFICE_ADDRESS_ERROR, sessionCookieConstants } from "../../utils/constants";
import { Session } from "@companieshouse/node-session-handler";
import {
  ConfirmationStatementSubmission,
  RegisteredOfficeAddressData,
  SectionStatus
} from "private-api-sdk-node/dist/services/confirmation-statement";
import { getConfirmationStatement, updateConfirmationStatement } from "../../services/confirmation.statement.service";

export const get = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const companyNumber = urlUtils.getCompanyNumberFromRequestParams(req);
    const companyProfile: CompanyProfile = await getCompanyProfile(companyNumber);
    const backLinkUrl = urlUtils.getUrlToPath(TASK_LIST_PATH, req);
    const registeredOfficeAddress = companyProfile.registeredOfficeAddress;
    req.sessionCookie[sessionCookieConstants.REGISTERED_OFFICE_ADDRESS_KEY] = registeredOfficeAddress;
    return res.render(Templates.REGISTERED_OFFICE_ADDRESS, {
      templateName: Templates.REGISTERED_OFFICE_ADDRESS,
      backLinkUrl,
      registeredOfficeAddress
    });
  } catch (error) {
    return next(error);
  }
};

export const post = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const roaButtonValue = req.body.registeredOfficeAddress;
    const transactionId = req.params[urlParams.PARAM_TRANSACTION_ID];
    const submissionId = req.params[urlParams.PARAM_SUBMISSION_ID];
    const registeredOfficeAddress: RegisteredOfficeAddress = req.sessionCookie[sessionCookieConstants.REGISTERED_OFFICE_ADDRESS_KEY];

    if (roaButtonValue === RADIO_BUTTON_VALUE.YES) {
      await sendUpdate(transactionId, submissionId, req, SectionStatus.CONFIRMED);
      return res.redirect(urlUtils.getUrlToPath(TASK_LIST_PATH, req));
    }

    if (roaButtonValue === RADIO_BUTTON_VALUE.NO) {
      await sendUpdate(transactionId, submissionId, req, SectionStatus.NOT_CONFIRMED);
      return res.render(Templates.WRONG_RO, {
        backLinkUrl: urlUtils.getUrlToPath(REGISTERED_OFFICE_ADDRESS_PATH, req),
        taskListUrl: urlUtils.getUrlToPath(TASK_LIST_PATH, req),
        changeRoaUrl: urlUtils.getUrlToPath(CHANGE_ROA_PATH, req)
      });
    }

    return res.render(Templates.REGISTERED_OFFICE_ADDRESS, {
      backLinkUrl: urlUtils.getUrlToPath(TASK_LIST_PATH, req),
      roaErrorMsg: REGISTERED_OFFICE_ADDRESS_ERROR,
      templateName: Templates.REGISTERED_OFFICE_ADDRESS,
      registeredOfficeAddress
    });
  } catch (e) {
    return next(e);
  }
};

const sendUpdate = async (transactionId: string, submissionId: string, req: Request, status: SectionStatus ) => {
  const session = req.session as Session;
  const currentCsSubmission: ConfirmationStatementSubmission = await getConfirmationStatement(session, transactionId, submissionId);
  const csSubmission = updateCsSubmission(currentCsSubmission, status);
  await updateConfirmationStatement(session, transactionId, submissionId, csSubmission);
};

const updateCsSubmission = (currentCsSubmission: ConfirmationStatementSubmission, status: SectionStatus ):
    ConfirmationStatementSubmission => {
  const newRoaData: RegisteredOfficeAddressData = {
    sectionStatus: status,
  };
  if (!currentCsSubmission.data) {
    currentCsSubmission.data = {};
  }

  currentCsSubmission.data.registeredOfficeAddressData = newRoaData;

  return currentCsSubmission;
};
