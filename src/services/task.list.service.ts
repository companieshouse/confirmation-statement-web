import { ConfirmationStatementSubmission } from "private-api-sdk-node/dist/services/confirmation-statement";
import {
  TaskList,
  TaskState
} from "../types/task.list";
import { DateTime } from "luxon";
import { toReadableFormat } from "../utils/date";
import {
  SIC_PATH,
  STATEMENT_OF_CAPITAL_PATH,
  ACTIVE_DIRECTORS_PATH,
  REGISTERED_OFFICE_ADDRESS_PATH,
  SHAREHOLDERS_PATH,
  PEOPLE_WITH_SIGNIFICANT_CONTROL_PATH
} from "../types/page.urls";
import { urlUtils } from "../utils/url";
import { toTaskState } from "../utils/task/task.state.mapper";
import { getTaskCompletedCount } from "../utils/task/task.counter";

export const initTaskList = (companyNumber: string,
                             transactionId: string,
                             submissionId: string,
                             csSubmission: ConfirmationStatementSubmission): TaskList => {
  return {
    tasks: {
      officers: {
        isVisible: false,
        state: toTaskState(csSubmission.data?.activeDirectorDetailsData?.sectionStatus),
        url: urlUtils.getUrlWithCompanyNumberTransactionIdAndSubmissionId(ACTIVE_DIRECTORS_PATH, companyNumber, transactionId, submissionId)
      },
      peopleSignificantControl: {
        isVisible: false,
        state: toTaskState(csSubmission.data?.personsSignificantControlData?.sectionStatus),
        url: urlUtils.getUrlWithCompanyNumberTransactionIdAndSubmissionId(PEOPLE_WITH_SIGNIFICANT_CONTROL_PATH, companyNumber, transactionId, submissionId)
      },
      registerLocations: {
        isVisible: false,
        state: TaskState.NOT_CHECKED
      },
      registeredOfficeAddress: {
        isVisible: false,
        state: toTaskState(csSubmission.data?.registeredOfficeAddressData?.sectionStatus),
        url: urlUtils.getUrlWithCompanyNumberTransactionIdAndSubmissionId(REGISTERED_OFFICE_ADDRESS_PATH, companyNumber, transactionId, submissionId)
      },
      shareholders: {
        isVisible: false,
        state: toTaskState(csSubmission.data?.shareholderData?.sectionStatus),
        url: urlUtils.getUrlWithCompanyNumberTransactionIdAndSubmissionId(SHAREHOLDERS_PATH, companyNumber, transactionId, submissionId)
      },
      sicCodes: {
        isVisible: false,
        state: toTaskState(csSubmission.data?.sicCodeData?.sectionStatus),
        url: urlUtils.getUrlWithCompanyNumberTransactionIdAndSubmissionId(SIC_PATH, companyNumber, transactionId, submissionId)
      },
      statementOfCapital: {
        isVisible: false,
        state: toTaskState(csSubmission.data?.statementOfCapitalData?.sectionStatus),
        url: urlUtils.getUrlWithCompanyNumberTransactionIdAndSubmissionId(STATEMENT_OF_CAPITAL_PATH, companyNumber, transactionId, submissionId)
      }
    },
    recordDate: toReadableFormat(DateTime.now().toString()),
    tasksCompletedCount: getTaskCompletedCount(csSubmission),
    allTasksCompleted: false,
    csDue: false
  };
};
