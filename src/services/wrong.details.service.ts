import { Request } from "express";
import { Templates } from "../types/template.paths";
import { urlUtils } from "../utils/url";

export const buildWrongDetails = (req: Request, backLink: string, returnPath: string,
                                  stepOneHeading: string, pageHeading: string) => {
  return {
    templateName: Templates.WRONG_DETAILS,
    backLinkUrl: urlUtils.getUrlToPath(backLink, req),
    returnToTaskListUrl: urlUtils.getUrlToPath(returnPath, req),
    stepOneHeading: stepOneHeading,
    pageHeading: pageHeading,
  };
};
