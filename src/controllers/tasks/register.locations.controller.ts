import { NextFunction, Request, Response } from "express";
import { urlUtils } from "../../utils/url";
import { REGISTER_LOCATIONS_PATH, TASK_LIST_PATH } from "../../types/page.urls";
import { Templates } from "../../types/template.paths";
import { RADIO_BUTTON_VALUE, REGISTER_LOCATIONS_ERROR, SECTIONS } from "../../utils/constants";
import { sendUpdate } from "../../utils/update.confirmation.statement.submission";
import { Session } from "@companieshouse/node-session-handler";
import { getRegisterLocationData } from "../../services/register.location.service";
import { RegisterLocation, SectionStatus } from "@companieshouse/api-sdk-node/dist/services/confirmation-statement";
import { formatAddress, formatAddressForDisplay } from "../../utils/format";

export const get = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const companyNumber = urlUtils.getCompanyNumberFromRequestParams(req);
    const session: Session = req.session as Session;
    const registerLocations: RegisterLocation[] = await getRegisterLocationData(session, companyNumber);
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
    const companyNumber = urlUtils.getCompanyNumberFromRequestParams(req);
    const session: Session = req.session as Session;
    const registerLocationsButton = req.body.registers;

    if (registerLocationsButton === RADIO_BUTTON_VALUE.YES || registerLocationsButton === RADIO_BUTTON_VALUE.RECENTLY_FILED) {
      await sendUpdate(req, SECTIONS.REGISTER_LOCATIONS, SectionStatus.CONFIRMED);
      return res.redirect(urlUtils.getUrlToPath(TASK_LIST_PATH, req));
    }

    if (registerLocationsButton === RADIO_BUTTON_VALUE.NO) {
      await sendUpdate(req, SECTIONS.REGISTER_LOCATIONS, SectionStatus.NOT_CONFIRMED);
      return res.render(Templates.WRONG_REGISTER_LOCATIONS, {
        backLinkUrl: urlUtils.getUrlToPath(REGISTER_LOCATIONS_PATH, req),
        taskListUrl: urlUtils.getUrlToPath(TASK_LIST_PATH, req),
        templateName: Templates.WRONG_REGISTER_LOCATIONS
      });
    }

    const registerLocations: RegisterLocation[] = await getRegisterLocationData(session, companyNumber);
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
