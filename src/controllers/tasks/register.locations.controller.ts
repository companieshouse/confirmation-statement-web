import { NextFunction, Request, Response } from "express";
import { urlUtils } from "../../utils/url";
import {
  TASK_LIST_PATH,
  WRONG_REGISTER_LOCATIONS_PATH
} from "../../types/page.urls";
import { Templates } from "../../types/template.paths";
import { RADIO_BUTTON_VALUE, REGISTER_LOCATIONS_ERROR, SECTIONS } from "../../utils/constants";
import { sendUpdate } from "../../utils/update.confirmation.statement.submission";
import { Session } from "@companieshouse/node-session-handler";
import { getRegisterLocationData } from "../../services/register.location.service";
import { RegisterLocation, SectionStatus } from "@companieshouse/api-sdk-node/dist/services/confirmation-statement";
import { formatAddress, formatAddressForDisplay } from "../../utils/format";
import {
  getRadioButtonInvalidValueErrorMessage,
  isRadioButtonValueValid
} from "../../validators/radio.button.validator";

export const get = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const transactionId = urlUtils.getTransactionIdFromRequestParams(req);
    const submissionId = urlUtils.getSubmissionIdFromRequestParams(req);
    const session: Session = req.session as Session;
    const registerLocations: RegisterLocation[] = await getRegisterLocationData(session, transactionId, submissionId);
    const sailAddress = formatSailForDisplay(registerLocations);
    const registers = formatRegisterForDisplay(registerLocations);
    return res.render(Templates.REGISTER_LOCATIONS, {
      templateName: Templates.REGISTER_LOCATIONS,
      backLinkUrl: urlUtils.getUrlToPath(TASK_LIST_PATH, req),
      registers, sailAddress });
  } catch (error) {
    return next(error);
  }
};

export const post = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const transactionId = urlUtils.getTransactionIdFromRequestParams(req);
    const submissionId = urlUtils.getSubmissionIdFromRequestParams(req);
    const session: Session = req.session as Session;
    const registerLocationsButton = req.body.registers;

    if (!isRadioButtonValueValid(registerLocationsButton)) {
      return next(new Error(getRadioButtonInvalidValueErrorMessage(registerLocationsButton)));
    }

    if (registerLocationsButton === RADIO_BUTTON_VALUE.YES || registerLocationsButton === RADIO_BUTTON_VALUE.RECENTLY_FILED) {
      if (registerLocationsButton === RADIO_BUTTON_VALUE.YES) {
        await sendUpdate(req, SECTIONS.REGISTER_LOCATIONS, SectionStatus.CONFIRMED);
      } else if (registerLocationsButton === RADIO_BUTTON_VALUE.RECENTLY_FILED) {
        await sendUpdate(req, SECTIONS.REGISTER_LOCATIONS, SectionStatus.RECENT_FILING);
      }
      return res.redirect(urlUtils.getUrlToPath(TASK_LIST_PATH, req));
    }

    if (registerLocationsButton === RADIO_BUTTON_VALUE.NO) {
      await sendUpdate(req, SECTIONS.REGISTER_LOCATIONS, SectionStatus.NOT_CONFIRMED);
      return res.redirect(urlUtils.getUrlToPath(WRONG_REGISTER_LOCATIONS_PATH, req));
    }

    const registerLocations: RegisterLocation[] = await getRegisterLocationData(session, transactionId, submissionId);
    const sailAddress = formatSailForDisplay(registerLocations);
    const registers = formatRegisterForDisplay(registerLocations);

    return res.render(Templates.REGISTER_LOCATIONS, {
      backLinkUrl: urlUtils.getUrlToPath(TASK_LIST_PATH, req),
      registerLocationsErrorMsg: REGISTER_LOCATIONS_ERROR,
      templateName: Templates.REGISTER_LOCATIONS,
      registers, sailAddress
    });
  } catch (e) {
    return next(e);
  }
};

const formatSailForDisplay = (regLoc: RegisterLocation[]): string => {
  let sailAddress = "";
  if (regLoc.length && regLoc[0].sailAddress) {
    sailAddress = formatAddressForDisplay(formatAddress(regLoc[0].sailAddress));
  }
  return sailAddress;
};

const formatRegisterForDisplay = (regLoc: RegisterLocation[]): Array<string> => {
  const registers = new Array<string>();
  for (const value of Object.values(regLoc)) {
    if (value.registerTypeDesc) {
      registers.push(value.registerTypeDesc);
    }
  }
  return registers;
};
