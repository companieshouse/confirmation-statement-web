import { NextFunction, Request, Response } from "express";
import { Templates } from "../types/template.paths";
import { initTaskList, TaskList } from "../types/task.list";
import { CompanyProfile } from "@companieshouse/api-sdk-node/dist/services/company-profile/types";
import { getCompanyProfile } from "../services/company.profile.service";
import { TRADING_STATUS_PATH, urlParams } from "../types/page.urls";
import { isInFuture, toReadableFormat } from "../utils/date";
import { createAndLogError } from "../utils/logger";

export const get = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const companyNumber = req.params[urlParams.PARAM_COMPANY_NUMBER];
    const backLinkUrl = TRADING_STATUS_PATH.replace(`:${urlParams.PARAM_COMPANY_NUMBER}`, companyNumber);
    const company: CompanyProfile = await getCompanyProfile(companyNumber);
    const taskList: TaskList = initTaskList(company.companyNumber);
    taskList.recordDate = calculateFilingDate(taskList.recordDate, company);
    return res.render(Templates.TASK_LIST, {
      backLinkUrl,
      company,
      taskList
    });
  } catch (e) {
    return next(e);
  }
};

const calculateFilingDate = (recordDate: string, companyProfile: CompanyProfile): string => {
  const nextMadeUpToDate = companyProfile.confirmationStatement?.nextMadeUpTo;
  if (nextMadeUpToDate) {
    if (isInFuture(nextMadeUpToDate)) {
      return recordDate;
    } else {
      return toReadableFormat(nextMadeUpToDate);
    }
  }
  throw createAndLogError(`Company Profile is missing confirmationStatement info for company number: ${companyProfile.companyNumber}`);
};
