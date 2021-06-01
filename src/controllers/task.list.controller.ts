import { Request, Response } from "express";
import { Templates } from "../types/template.paths";
import { Session } from "@companieshouse/node-session-handler";
import { TASK_LIST } from "../types/confirmation.statement.session.extra.data";
import { initTaskList, TaskList } from "../types/task.list";
import { CompanyProfile } from "@companieshouse/api-sdk-node/dist/services/company-profile/types";
import { getCompanyProfile } from "../services/company.profile.service";
import { SessionKey } from "@companieshouse/node-session-handler/lib/session/keys/SessionKey";
import { SignInInfoKeys } from "@companieshouse/node-session-handler/lib/session/keys/SignInInfoKeys";

export const get = async (req: Request, res: Response) => {
  const session: Session = req.session as Session;
  const signInInfo = session.data[SessionKey.SignInInfo] as object;
  const companyNumber = signInInfo[SignInInfoKeys.CompanyNumber] as string;
  const company: CompanyProfile = await getCompanyProfile(companyNumber);
  console.log("Console log " + JSON.stringify(company));
  const taskList: TaskList = initTaskList();
  session[ TASK_LIST ] = taskList;
  return res.render(Templates.TASK_LIST, {
    company,
    taskList
  });
};
