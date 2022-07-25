import { Handler, NextFunction, Request, response, Response } from "express";
import { Templates } from "../types/template.paths";
import { SIGNOUT_NO_BUTTON_SELECTED_ERROR, SIGNOUT_RETURN_URL_SESSION_KEY } from "../utils/constants";
import { Session } from "@companieshouse/node-session-handler";
import { ACCOUNTS_SIGNOUT_PATH } from "../types/page.urls";
import { logger } from "../utils/logger";

export const get: Handler = async (req, res) => {
    const returnPage = saveReturnPageInSession(req)

    res.render(Templates.SIGNOUT, {
        backLinkUrl: returnPage
    });
}

export const post = handleError(async (req, res) => {
    const returnPage = getReturnPageFromSession(req.session as Session)

    switch (req.body.signout) {
    case "yes":
        return res.redirect(ACCOUNTS_SIGNOUT_PATH);
    case "no":
        return res.redirect(returnPage);
    default:
        return showMustSelectButtonError(res, returnPage);
    }
})

// For some reason express types don't include an async handler, which plays havok with the static
// analysers complaining that an 'await' call us unecessary when, infact, they are.
type AsyncHandler = (req: Request, res: Response, next: NextFunction) => Promise<unknown>

// Wraps a handler function to catch any exceptions and pass them to the next handler in the chain.
function handleError(handler: AsyncHandler): AsyncHandler {
    return async (req, res, next) => {
        try {
            await handler(req, res, next)
        } catch (e) {
            next(e);
        }
    }
}

function showMustSelectButtonError(res: Response, returnPage: string) {
    res.status(400);
    return res.render(Templates.SIGNOUT, {
        backLinkUrl: returnPage,
        errorMsgText: SIGNOUT_NO_BUTTON_SELECTED_ERROR
    });
}

function saveReturnPageInSession(req: Request): string {
    const returnPageUrl = req.headers.referer!
    req.session?.setExtraData(SIGNOUT_RETURN_URL_SESSION_KEY, returnPageUrl)
    return returnPageUrl
}

function getReturnPageFromSession(session: Session): string {
    const returnPage = session?.getExtraData(SIGNOUT_RETURN_URL_SESSION_KEY) as string | undefined
    if (returnPage !== undefined && typeof returnPage === 'string') return returnPage

    logger.error(`Unable to find page to return the user to. ` 
        + `It should have been a string value stored in the session extra data with key ${SIGNOUT_RETURN_URL_SESSION_KEY}. ` 
        + `However, ${JSON.stringify(returnPage)} was there instead.`)

    throw new Error(`Cannot find url of page to return user to.`)
}