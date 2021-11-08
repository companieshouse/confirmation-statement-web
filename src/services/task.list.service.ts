import { ConfirmationStatementSubmission } from "@companieshouse/api-sdk-node/dist/services/confirmation-statement";
import {
  TaskList
} from "../types/task.list";
import { toReadableFormat } from "../utils/date";
import {
  SIC_PATH,
  STATEMENT_OF_CAPITAL_PATH,
  ACTIVE_OFFICERS_PATH,
  REGISTERED_OFFICE_ADDRESS_PATH,
  SHAREHOLDERS_PATH,
  PEOPLE_WITH_SIGNIFICANT_CONTROL_PATH,
  REGISTER_LOCATIONS_PATH,
  NATURAL_PERSON_SECRETARIES_PATH
} from "../types/page.urls";
import { FEATURE_FLAG_FIVE_OR_LESS_OFFICERS_JOURNEY_21102021 } from "../utils/properties";
import { urlUtils } from "../utils/url";
import { toTaskState } from "../utils/task/task.state.mapper";
import { getTaskCompletedCount } from "../utils/task/task.counter";

export const initTaskList = (companyNumber: string,
                             transactionId: string,
                             submissionId: string,
                             csSubmission: ConfirmationStatementSubmission): TaskList => {

  const allTasks = {
    officers: {
      state: toTaskState(csSubmission.data?.activeOfficerDetailsData?.sectionStatus),
      url: urlUtils.getUrlWithCompanyNumberTransactionIdAndSubmissionId(officerSection(), companyNumber, transactionId, submissionId)
    },
    peopleSignificantControl: {
      state: toTaskState(csSubmission.data?.personsSignificantControlData?.sectionStatus),
      url: urlUtils.getUrlWithCompanyNumberTransactionIdAndSubmissionId(PEOPLE_WITH_SIGNIFICANT_CONTROL_PATH, companyNumber, transactionId, submissionId)
    },
    registerLocations: {
      state: toTaskState(csSubmission.data?.registerLocationsData?.sectionStatus),
      url: urlUtils.getUrlWithCompanyNumberTransactionIdAndSubmissionId(REGISTER_LOCATIONS_PATH, companyNumber, transactionId, submissionId)
    },
    registeredOfficeAddress: {
      state: toTaskState(csSubmission.data?.registeredOfficeAddressData?.sectionStatus),
      url: urlUtils.getUrlWithCompanyNumberTransactionIdAndSubmissionId(REGISTERED_OFFICE_ADDRESS_PATH, companyNumber, transactionId, submissionId)
    },
    shareholders: {
      state: toTaskState(csSubmission.data?.shareholderData?.sectionStatus),
      url: urlUtils.getUrlWithCompanyNumberTransactionIdAndSubmissionId(SHAREHOLDERS_PATH, companyNumber, transactionId, submissionId)
    },
    sicCodes: {
      state: toTaskState(csSubmission.data?.sicCodeData?.sectionStatus),
      url: urlUtils.getUrlWithCompanyNumberTransactionIdAndSubmissionId(SIC_PATH, companyNumber, transactionId, submissionId)
    },
    statementOfCapital: {
      state: toTaskState(csSubmission.data?.statementOfCapitalData?.sectionStatus),
      url: urlUtils.getUrlWithCompanyNumberTransactionIdAndSubmissionId(STATEMENT_OF_CAPITAL_PATH, companyNumber, transactionId, submissionId)
    }
  };
  const completedtasks = getTaskCompletedCount(csSubmission);
  const isTasksCompleted = Object.keys(allTasks).length === completedtasks;

  return {
    tasks: allTasks,
    recordDate: toReadableFormat(csSubmission.data?.confirmationStatementMadeUpToDate),
    tasksCompletedCount: completedtasks,
    allTasksCompleted: isTasksCompleted,
    csDue: false
  };
};

const officerSection = () : string => {
  if (FEATURE_FLAG_FIVE_OR_LESS_OFFICERS_JOURNEY_21102021 === 'true') {
    return NATURAL_PERSON_SECRETARIES_PATH;
  } else {
    return ACTIVE_OFFICERS_PATH;
  }
}
