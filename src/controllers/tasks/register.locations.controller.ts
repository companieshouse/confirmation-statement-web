import { NextFunction, Request, Response } from "express";
import { urlUtils } from "../../utils/url";
import { REGISTER_LOCATIONS_PATH, TASK_LIST_PATH } from "../../types/page.urls";
import { Templates } from "../../types/template.paths";
import { RADIO_BUTTON_VALUE, REGISTER_LOCATIONS_ERROR, SECTIONS } from "../../utils/constants";
import { sendUpdate } from "../../utils/update.confirmation.statement.submission";
import { SectionStatus } from "private-api-sdk-node/dist/services/confirmation-statement";

export const get = (req: Request, res: Response, next: NextFunction) => {
  try {
    const backLinkUrl = urlUtils.getUrlToPath(TASK_LIST_PATH, req);
    return res.render(Templates.REGISTER_LOCATIONS, {
      templateName: Templates.REGISTER_LOCATIONS,
      backLinkUrl });
  } catch (error) {
    return next(error);
  }
};

export const post = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const registerLocationsButton = req.body.registers;

    if (registerLocationsButton === RADIO_BUTTON_VALUE.YES || registerLocationsButton === RADIO_BUTTON_VALUE.RECENTLY_FILED) {
      await sendUpdate(req, SECTIONS.REGISTER_LOCATIONS, SectionStatus.CONFIRMED)
      return res.redirect(urlUtils.getUrlToPath(TASK_LIST_PATH, req));
    }

    if (registerLocationsButton === RADIO_BUTTON_VALUE.NO) {
      await sendUpdate(req, SECTIONS.REGISTER_LOCATIONS, SectionStatus.NOT_CONFIRMED)
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
