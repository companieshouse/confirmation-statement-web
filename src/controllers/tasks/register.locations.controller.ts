import { NextFunction, Request, Response } from "express";
import { urlUtils } from "../../utils/url";
import { REGISTER_LOCATIONS_PATH, TASK_LIST_PATH } from "../../types/page.urls";
import { Templates } from "../../types/template.paths";
import { RADIO_BUTTON_VALUE, REGISTER_LOCATIONS_ERROR } from "../../utils/constants";
import { Session } from "@companieshouse/node-session-handler";
import { getRegisterLocationData } from "../../services/register.location.service";
import { RegisterLocation } from "private-api-sdk-node/dist/services/confirmation-statement";
import { formatAddress, formatAddressForDisplay } from "../../utils/format";

export const get = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const companyNumber = urlUtils.getCompanyNumberFromRequestParams(req);
    const session: Session = req.session as Session;
    const registerLocations: RegisterLocation[] = await getRegisterLocationData(session, companyNumber);
    const sailAddress = formatSailForDisplay(registerLocations);
    const registers = formatRegisterForDisplay(registerLocations);
    const backLinkUrl = urlUtils.getUrlToPath(TASK_LIST_PATH, req);
    return res.render(Templates.REGISTER_LOCATIONS, {
      templateName: Templates.REGISTER_LOCATIONS,
      backLinkUrl, registers, sailAddress });
  } catch (error) {
    return next(error);
  }
};

export const post = (req: Request, res: Response, next: NextFunction) => {
  try {
    const registerLocationsButton = req.body.registers;

    if (registerLocationsButton === RADIO_BUTTON_VALUE.YES || registerLocationsButton === RADIO_BUTTON_VALUE.RECENTLY_FILED) {
      return res.redirect(urlUtils.getUrlToPath(TASK_LIST_PATH, req));
    }

    if (registerLocationsButton === RADIO_BUTTON_VALUE.NO) {
      return res.render(Templates.WRONG_REGISTER_LOCATIONS, {
        backLinkUrl: urlUtils.getUrlToPath(REGISTER_LOCATIONS_PATH, req),
        taskListUrl: urlUtils.getUrlToPath(TASK_LIST_PATH, req),
        templateName: Templates.WRONG_REGISTER_LOCATIONS
      });
    }

    return res.render(Templates.REGISTER_LOCATIONS, {
      backLinkUrl: urlUtils.getUrlToPath(TASK_LIST_PATH, req),
      registerLocationsErrorMsg: REGISTER_LOCATIONS_ERROR,
      templateName: Templates.REGISTER_LOCATIONS
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
  for (const key of Object.values(regLoc)) {
    if (key.registerTypeDesc) {
      registers.push(key.registerTypeDesc);
    }
  }
  return registers;
};
