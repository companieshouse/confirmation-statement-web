import { NextFunction, Request, Response } from "express";
import { Templates } from "../../types/template.paths";
import { ACTIVE_DIRECTORS_PATH, TASK_LIST_PATH } from "../../types/page.urls";
import { urlUtils } from "../../utils/url";
import {
  DIRECTOR_DETAILS_ERROR,
  RADIO_BUTTON_VALUE,
  sessionCookieConstants,
  WRONG_DETAILS_UPDATE_DIRECTOR,
  WRONG_DETAILS_UPDATE_OFFICERS } from "../../utils/constants";
import { Session } from "@companieshouse/node-session-handler";
import {
  ActiveDirectorDetails,
  ConfirmationStatementSubmission,
  ActiveDirectorDetailsData,
  SectionStatus,
  Address } from "private-api-sdk-node/dist/services/confirmation-statement";
import { getActiveDirectorDetailsData } from "../../services/active.director.details.service";
import { getConfirmationStatement, updateConfirmationStatement } from "../../services/confirmation.statement.service";
import { formatTitleCase } from "../../utils/format";

export const get = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const companyNumber = urlUtils.getCompanyNumberFromRequestParams(req);
    const session: Session = req.session as Session;
    const directorDetails: ActiveDirectorDetails = await getActiveDirectorDetailsData(session, companyNumber);
    const activeDirectorDetails = formatDirectorDetails(directorDetails);
    const serviceAddress = formatAddressForDisplay(activeDirectorDetails.serviceAddress);
    const residentialAddress = formatAddressForDisplay(activeDirectorDetails.residentialAddress);
    req.sessionCookie[sessionCookieConstants.ACTIVE_DIRECTOR_DETAILS_KEY] = activeDirectorDetails;

    return res.render(Templates.ACTIVE_DIRECTORS, {
      templateName: Templates.ACTIVE_DIRECTORS,
      backLinkUrl: urlUtils.getUrlToPath(TASK_LIST_PATH, req),
      activeDirectorDetails,
      serviceAddress,
      residentialAddress
    });
  } catch (e) {
    return next(e);
  }
};

export const post = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const activeDirectorDetailsBtnValue = req.body.activeDirectors;
    const transactionId = urlUtils.getTransactionIdFromRequestParams(req);
    const submissionId = urlUtils.getSubmissionIdFromRequestParams(req);
    if (activeDirectorDetailsBtnValue === RADIO_BUTTON_VALUE.YES) {
      await sendUpdate(transactionId, submissionId, req, SectionStatus.CONFIRMED);
      return res.redirect(urlUtils.getUrlToPath(TASK_LIST_PATH, req));
    } else if (activeDirectorDetailsBtnValue === RADIO_BUTTON_VALUE.NO) {
      await sendUpdate(transactionId, submissionId, req, SectionStatus.NOT_CONFIRMED);
      return res.render(Templates.WRONG_DETAILS, {
        templateName: Templates.WRONG_DETAILS,
        backLinkUrl: urlUtils.getUrlToPath(ACTIVE_DIRECTORS_PATH, req),
        returnToTaskListUrl: urlUtils.getUrlToPath(TASK_LIST_PATH, req),
        stepOneHeading: WRONG_DETAILS_UPDATE_DIRECTOR,
        pageHeading: WRONG_DETAILS_UPDATE_OFFICERS,
      });
    } else {
      const activeDirectorDetails: ActiveDirectorDetails = req.sessionCookie[sessionCookieConstants.ACTIVE_DIRECTOR_DETAILS_KEY];
      const serviceAddress = formatAddressForDisplay(activeDirectorDetails.serviceAddress);
      const residentialAddress = formatAddressForDisplay(activeDirectorDetails.residentialAddress);
      return res.render(Templates.ACTIVE_DIRECTORS, {
        backLinkUrl: urlUtils.getUrlToPath(TASK_LIST_PATH, req),
        directorErrorMsg: DIRECTOR_DETAILS_ERROR,
        templateName: Templates.ACTIVE_DIRECTORS,
        activeDirectorDetails,
        serviceAddress,
        residentialAddress
      });
    }
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
  const newActiveDirectorDetailsData: ActiveDirectorDetailsData = {
    sectionStatus: status,
  };
  if (!currentCsSubmission.data) {
    currentCsSubmission.data = {};
  }

  currentCsSubmission.data.activeDirectorDetailsData = newActiveDirectorDetailsData;

  return currentCsSubmission;
};

export const formatDirectorDetails = (directorDetails: ActiveDirectorDetails): ActiveDirectorDetails => {
  const clone: ActiveDirectorDetails = JSON.parse(JSON.stringify(directorDetails));

  clone.foreName1 = formatTitleCase(directorDetails.foreName1);
  clone.nationality = formatTitleCase(directorDetails.nationality);
  clone.occupation = formatTitleCase(directorDetails.occupation);
  clone.serviceAddress = formatAddress(directorDetails.serviceAddress);
  clone.residentialAddress = formatAddress(directorDetails.residentialAddress);

  return clone;
};

const formatAddress = (address: Address): Address => {
  const addressClone: Address = JSON.parse(JSON.stringify(address));
  return {
    careOf: formatTitleCase(addressClone.careOf),
    addressLine1: formatTitleCase(addressClone.addressLine1),
    addressLine2: formatTitleCase(addressClone.addressLine2),
    poBox: formatTitleCase(addressClone.poBox),
    country: formatTitleCase(addressClone.country),
    locality: formatTitleCase(addressClone.locality),
    premises: formatTitleCase(addressClone.premises),
    region: formatTitleCase(addressClone.region),
    postalCode: addressClone.postalCode?.toUpperCase()
  };
};

const formatAddressForDisplay = (address: Address): string => {
  let addressStr = "";
  for (const line of Object.values(address)) {
    if (line) {
      addressStr = addressStr + line + ", ";
    }
  }
  return addressStr.slice(0, -2);
};
