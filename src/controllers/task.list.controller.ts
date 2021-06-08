import { Request, Response } from "express";
import { Templates } from "../types/template.paths";
import { initTaskList, TaskList } from "../types/task.list";
import { CompanyProfile } from "@companieshouse/api-sdk-node/dist/services/company-profile/types";
import { getCompanyProfile } from "../services/company.profile.service";
import { TRADING_STATUS_PATH, urlParams } from "../types/page.urls";

export const get = async (req: Request, res: Response) => {
  const companyNumber = req.params[urlParams.PARAM_COMPANY_NUMBER];
  const backLinkUrl = TRADING_STATUS_PATH.replace(`:${urlParams.PARAM_COMPANY_NUMBER}`, companyNumber);
  const company: CompanyProfile = await getCompanyProfile(companyNumber);
  const taskList: TaskList = initTaskList();
  return res.render(Templates.TASK_LIST, {
    backLinkUrl,
    company,
    taskList
  });
};
