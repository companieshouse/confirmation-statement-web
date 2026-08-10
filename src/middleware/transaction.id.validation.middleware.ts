import { NextFunction, Request, Response } from "express";
import { logger } from "../utils/logger";
import { isUrlIdValid } from "../validators/url.id.validator";
import { urlParams } from "../types/page.urls";
import { urlUtils } from "../utils/url";
import { Templates } from "../types/template.paths";
import { logCSRFToken } from "../utils/session";

export const transactionIdValidationMiddleware = (req: Request, res: Response, next: NextFunction) => {
    logger.debug("Execute URL transaction id validation middleware checks");

    const transactionId: string = req.params[urlParams.PARAM_TRANSACTION_ID];

    logger.debug("Check transaction id");
    logCSRFToken(req, "start transactionIdValidationMiddleware");
    if (!isUrlIdValid(transactionId)) {
        urlUtils.sanitiseReqUrls(req);
        logger.errorRequest(req, `No Valid Transaction Id in URL: ${req.originalUrl}`);
        return res
            .status(400)
            .render(Templates.SERVICE_OFFLINE_MID_JOURNEY, { templateName: Templates.SERVICE_OFFLINE_MID_JOURNEY });
    }
    logCSRFToken(req, "end transactionIdValidationMiddleware");

    return next();
};
