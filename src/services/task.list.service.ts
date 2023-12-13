import { ConfirmationStatementSubmission } from "@companieshouse/api-sdk-node/dist/services/confirmation-statement";
import {
  TaskList
} from "../types/task.list";
import { toReadableFormat } from "../utils/date";
import {
  SIC_PATH,
  STATEMENT_OF_CAPITAL_PATH,
  REGISTERED_OFFICE_ADDRESS_PATH,
  SHAREHOLDERS_PATH,
  PEOPLE_WITH_SIGNIFICANT_CONTROL_PATH,
  REGISTER_LOCATIONS_PATH,
  ACTIVE_OFFICERS_DETAILS_PATH,
  ACTIVE_OFFICERS_PATH,
  ACTIVE_PSC_DETAILS_PATH,
  PROVIDE_EMAIL_ADDRESS_PATH,
  CHECK_EMAIL_ADDRESS_PATH
} from "../types/page.urls";
import { urlUtils } from "../utils/url";
import { toTaskState } from "../utils/task/task.state.mapper";
import { getTaskCompletedCount } from "../utils/task/task.counter";
import { FEATURE_FLAG_FIVE_OR_LESS_OFFICERS_JOURNEY_21102021 } from "../utils/properties";
import { isActiveFeature } from "../utils/feature.flag";

export const initTaskList = (companyNumber: string,
                             transactionId: string,
                             submissionId: string,
                             csSubmission: ConfirmationStatementSubmission,
                             registeredEmailAddressOptionEnabled: boolean,
                             companyHasExistingRea: boolean): TaskList => {

  const allTasks = {
    officers: {
      state: toTaskState(csSubmission.data?.activeOfficerDetailsData?.sectionStatus),
      url: urlUtils.getUrlWithCompanyNumberTransactionIdAndSubmissionId(officerSection(), companyNumber, transactionId, submissionId)
    },
    peopleSignificantControl: {
      state: toTaskState(csSubmission.data?.personsSignificantControlData?.sectionStatus),
      url: urlUtils.getUrlWithCompanyNumberTransactionIdAndSubmissionId(getPscSectionUrl(), companyNumber, transactionId, submissionId)
    },
    registerLocations: {
      state: toTaskState(csSubmission.data?.registerLocationsData?.sectionStatus),
      url: urlUtils.getUrlWithCompanyNumberTransactionIdAndSubmissionId(REGISTER_LOCATIONS_PATH, companyNumber, transactionId, submissionId)
    },
    registeredEmailAddress: registeredEmailAddressOptionEnabled ? {
      state: toTaskState(csSubmission.data?.registeredEmailAddressData?.sectionStatus),
      url: urlUtils.getUrlWithCompanyNumberTransactionIdAndSubmissionId(getRegisteredEmailAddressSectionUrl(companyHasExistingRea), companyNumber, transactionId, submissionId)
    } : undefined,
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
  const completedTasks = getTaskCompletedCount(csSubmission);
  const expectedTasks =  Object.keys(allTasks).filter(key => allTasks[key] != null).length;
  const isTasksCompleted = expectedTasks === completedTasks;

  return {
    tasks: allTasks,
    recordDate: toReadableFormat(csSubmission.data?.confirmationStatementMadeUpToDate),
    tasksExpectedCount: expectedTasks,
    tasksCompletedCount: completedTasks,
    allTasksCompleted: isTasksCompleted,
    csDue: false
  };
};

const officerSection = (): string => {
  if (FEATURE_FLAG_FIVE_OR_LESS_OFFICERS_JOURNEY_21102021 === 'true') {
    return ACTIVE_OFFICERS_DETAILS_PATH;
  } else {
    return ACTIVE_OFFICERS_PATH;
  }
};

const getPscSectionUrl = (): string => {
  if (isActiveFeature(FEATURE_FLAG_FIVE_OR_LESS_OFFICERS_JOURNEY_21102021)) {
    return ACTIVE_PSC_DETAILS_PATH;
  } else {
    return PEOPLE_WITH_SIGNIFICANT_CONTROL_PATH;
  }
};

const getRegisteredEmailAddressSectionUrl = (reaExists: boolean): string => {
  if (reaExists) {
    return CHECK_EMAIL_ADDRESS_PATH;
  } else {
    return PROVIDE_EMAIL_ADDRESS_PATH;
  }
};
