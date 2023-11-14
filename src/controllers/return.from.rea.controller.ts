import { NextFunction, Request, Response } from "express";
import { Session } from "@companieshouse/node-session-handler";
import { Templates } from "../types/template.paths";

export const get = (req: Request, res: Response, next: NextFunction) => {
  try {
    const session: Session = req.session as Session;
    const registeredEmailAddressSubmitted: string = session.getExtraData("registeredEmailAddressSubmitted") as string;

    // todo temp code to show registeredEmailAddressSubmitted value on a temp web page
    return res.render(Templates.RETURN_FROM_REA, { registeredEmailAddressSubmitted: registeredEmailAddressSubmitted });
  } catch (e) {
    return next(e);
  }
};
