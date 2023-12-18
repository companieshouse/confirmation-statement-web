import {
  ConfirmationStatementSubmission, SectionStatus,
  StatementOfCapital
} from "@companieshouse/api-sdk-node/dist/services/confirmation-statement";

export const mockStatementOfCapital: StatementOfCapital = {
  classOfShares: "Ordinary",
  currency: "GBP",
  numberAllotted: "100",
  aggregateNominalValue: "0.01",
  prescribedParticulars: "THE QUICK BROWN FOX",
  totalNumberOfShares: "100",
  totalAggregateNominalValue: "1",
  totalAmountUnpaidForCurrency: "2"
};


export const mockConfirmationStatementSubmission: ConfirmationStatementSubmission = {
  id: "dgshjgdsj",
  data: {
    statementOfCapitalData: {
      sectionStatus: SectionStatus.CONFIRMED,
      statementOfCapital: mockStatementOfCapital
    },
    confirmationStatementMadeUpToDate: "2020-03-11"
  },
  links: {
    self: "/somewhere/"
  }
};

export const mockConfirmationStatementSubmissionAllConfirmed: ConfirmationStatementSubmission = {
  id: "dgshjgdsj",
  data: {
    confirmationStatementMadeUpToDate: "2020-03-11",
    activeOfficerDetailsData: {
      sectionStatus: SectionStatus.CONFIRMED,
    },
    personsSignificantControlData: {
      sectionStatus: SectionStatus.CONFIRMED,
    },
    registeredOfficeAddressData: {
      sectionStatus: SectionStatus.CONFIRMED,
    },
    registeredEmailAddressData: {
      sectionStatus: SectionStatus.CONFIRMED,
    },
    registerLocationsData: {
      sectionStatus: SectionStatus.CONFIRMED,
    },
    shareholderData: {
      sectionStatus: SectionStatus.CONFIRMED,
    },
    sicCodeData: {
      sectionStatus: SectionStatus.CONFIRMED,
    },
    statementOfCapitalData: {
      sectionStatus: SectionStatus.CONFIRMED,
      statementOfCapital: mockStatementOfCapital
    },
    tradingStatusData: {
      tradingStatusAnswer: true,
    },
  },
  links: {
    self: "/somewhere/"
  }
};

export const mockConfirmationStatementSubmissionMixedStatuses: ConfirmationStatementSubmission = {
  id: "dgshjgdsj",
  data: {
    confirmationStatementMadeUpToDate: "2020-03-11",
    activeOfficerDetailsData: {
      sectionStatus: SectionStatus.NOT_CONFIRMED,
    },
    personsSignificantControlData: {
      sectionStatus: SectionStatus.NOT_CONFIRMED,
    },
    registeredOfficeAddressData: {
      sectionStatus: SectionStatus.RECENT_FILING,
    },
    registeredEmailAddressData: {
      sectionStatus: SectionStatus.INITIAL_FILING,
      registeredEmailAddress: "mock@mock.email"
    },
    registerLocationsData: {
      sectionStatus: SectionStatus.CONFIRMED,
    },
    shareholderData: {
      sectionStatus: SectionStatus.CONFIRMED,
    },
    sicCodeData: {
      sectionStatus: SectionStatus.CONFIRMED,
    },
    statementOfCapitalData: {
      sectionStatus: SectionStatus.CONFIRMED,
      statementOfCapital: mockStatementOfCapital
    },
    tradingStatusData: {
      tradingStatusAnswer: true,
    },
  },
  links: {
    self: "/somewhere/"
  }
};
