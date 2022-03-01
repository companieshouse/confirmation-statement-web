import { NextFunction, Request, Response } from "express";
import { URL_QUERY_PARAM } from "../types/page.urls";

export const isPscParameterValidationMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const isPscValue: string = req.query[URL_QUERY_PARAM.COMPANY_NUM] as string;

  console.log("******************* ******* * * *  " + typeof isPscValue);
  console.log("******************* ******* * * *  " + isPscValue);

  if (!isPscValue) {
    return next();
  }

  return next();
};
