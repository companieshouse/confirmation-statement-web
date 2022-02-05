import { NextFunction, Request, Response } from "express";
import { URL_QUERY_PARAM } from "../types/page.urls";
import url from "url";
import { isCompanyNumberValid } from "../validators/company.number.validator";
import { isBooleanStringValid } from "../validators/boolean.string.validator";

export const urlQueryValidationMiddleware = (req: Request, res: Response, next: NextFunction) => {
  console.log(req.url);
  const queryParams = url.parse(req.url, true).query;
  // queryParams will contain { key1: value1, key2: value2, etc... }

  for (const key in queryParams) {
    const validator: Function = validators[key];
    if (!validator) {
      return next(new Error(`Unexpected URL Query Param found - ${key}`));
    }
    console.log("** validating value " + queryParams[key]);
    if (!validator(queryParams[key])) {
      return next(new Error(`URL Query Param validation error - ${key} not valid`));
    }
  }

  return next();
};


const validators = {
  [URL_QUERY_PARAM.COMPANY_NUM]: isCompanyNumberValid,
  [URL_QUERY_PARAM.IS_PSC]: isBooleanStringValid
};
