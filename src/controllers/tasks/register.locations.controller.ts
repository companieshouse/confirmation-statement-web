import { NextFunction, Request, Response } from "express";
import { urlUtils } from "../../utils/url";
import { TASK_LIST_PATH } from "../../types/page.urls";
import { Templates } from "../../types/template.paths";
import { Session } from "@companieshouse/node-session-handler";
import { getRegisterLocationData } from "../../services/register.location.service";
import { RegisterLocation } from "private-api-sdk-node/dist/services/confirmation-statement";
import { formatAddress, formatAddressForDisplay } from "../../utils/format";

export const get = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const companyNumber = urlUtils.getCompanyNumberFromRequestParams(req);
    const session: Session = req.session as Session;
    const registerLocations: RegisterLocation[] = await getRegisterLocationData(session, companyNumber);
    console.log("JSON OBJECT: " + JSON.stringify(registerLocations));
    const sailAddress = formatSailForDisplay(registerLocations);
    const registers = formatRegisterForDisplay(registerLocations);
    console.log("registers: " + registers + " length: " + registers.length);
    const backLinkUrl = urlUtils.getUrlToPath(TASK_LIST_PATH, req);
    return res.render(Templates.REGISTER_LOCATIONS, {
      templateName: Templates.REGISTER_LOCATIONS,
      backLinkUrl, registers, sailAddress });
  } catch (error) {
    return next(error);
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
