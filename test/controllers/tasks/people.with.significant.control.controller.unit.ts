jest.mock("../../../src/middleware/company.authentication.middleware");
jest.mock("../../../src/services/psc.service");
jest.mock("../../../src/utils/date");
jest.mock("../../../src/utils/logger");

import mocks from "../../mocks/all.middleware.mock";
import { PEOPLE_WITH_SIGNIFICANT_CONTROL_PATH, PSC_STATEMENT_PATH, URL_QUERY_PARAM } from "../../../src/types/page.urls";
import request from "supertest";
import app from "../../../src/app";
import { companyAuthenticationMiddleware } from "../../../src/middleware/company.authentication.middleware";
import { PEOPLE_WITH_SIGNIFICANT_CONTROL_ERROR, RADIO_BUTTON_VALUE } from "../../../src/utils/constants";
import { getPscs } from "../../../src/services/psc.service";
import { toReadableFormat } from "../../../src/utils/date";
import { urlUtils } from "../../../src/utils/url";
import { createAndLogError } from "../../../src/utils/logger";
import { PersonOfSignificantControl } from "@companieshouse/api-sdk-node/dist/services/confirmation-statement";

const PAGE_TITLE = "Review the people with significant control";
const PAGE_HEADING = "Check the people with significant control (PSC)";
const STOP_PAGE_HEADING = "Update the people with significant control (PSC) details";
const COMPANY_NUMBER = "12345678";
const TRANSACTION_ID = "66544";
const SUBMISSION_ID = "6464647";
const COMPANY_NAME = "name";
const REG_NO = "36363";
const SERV_ADD_LINE_1 = "line1";
const REGISTER_LOCATION = "UK";
const COUNTRY_RESIDENCE = "UK";
const ERROR_PAGE_TEXT = "Sorry, the service is unavailable";
const TEST_RLE_NAME = "Test Rle Name";
const PEOPLE_WITH_SIGNIFICANT_CONTROL_URL =
  urlUtils.getUrlWithCompanyNumberTransactionIdAndSubmissionId(PEOPLE_WITH_SIGNIFICANT_CONTROL_PATH,
                                                               COMPANY_NUMBER,
                                                               TRANSACTION_ID,
                                                               SUBMISSION_ID);
const PSC_STATEMENT_URL =
  urlUtils.getUrlWithCompanyNumberTransactionIdAndSubmissionId(PSC_STATEMENT_PATH,
                                                               COMPANY_NUMBER,
                                                               TRANSACTION_ID,
                                                               SUBMISSION_ID);
const APPOINTMENT_TYPE_5007 = "5007";
const APPOINTMENT_TYPE_5008 = "5008";
const APPOINTMENT_TYPE_5009 = "5009";
const DOB_MONTH = 3;
const DOB_YEAR = 1955;
const FORMATTED_DOB = "21 March 1955";
const DOB_ISO = "1955-03-21";
const FORENAME = "BOB";
const FORENAME_TITLE_CASE = "Bob";
const SURNAME = "WILSON";
const ADDRESS_LINE_1 = "ADD LINE 1";
const ADDRESS_LINE_1_TITLE_CASE = "Add Line 1";
const COUNTRY = "UNITED KINGDOM";
const COUNTRY_TITLE_CASE = "United Kingdom";

const mockCompanyAuthenticationMiddleware = companyAuthenticationMiddleware as jest.Mock;
mockCompanyAuthenticationMiddleware.mockImplementation((req, res, next) => next());

const mockGetPscs = getPscs as jest.Mock;
mockGetPscs.mockResolvedValue([{
  address: {
    addressLine1: ADDRESS_LINE_1
  },
  appointmentType: APPOINTMENT_TYPE_5007,
  dateOfBirth: {
    month: DOB_MONTH,
    year: DOB_YEAR
  },
  dateOfBirthIso: DOB_ISO,
  nameElements: {
    forename: FORENAME,
    surname: SURNAME
  },
  serviceAddress: {
    country: COUNTRY
  }
} as PersonOfSignificantControl ]);

const mockToReadableFormat = toReadableFormat as jest.Mock;
mockToReadableFormat.mockReturnValue(FORMATTED_DOB);

const mockCreateAndLogError = createAndLogError as jest.Mock;
mockCreateAndLogError.mockReturnValue(new Error());

describe("People with significant control controller tests", () => {

  beforeEach(() => {
    mocks.mockAuthenticationMiddleware.mockClear();
    mockGetPscs.mockClear();
    mockToReadableFormat.mockClear();
    mockCreateAndLogError.mockClear();
  });

  describe("get tests", () => {
    it("should navigate to the active pscs page", async () => {
      const response = await request(app).get(PEOPLE_WITH_SIGNIFICANT_CONTROL_URL);
      expect(response.text).toContain(PAGE_HEADING);
      expect(mockGetPscs).toBeCalledTimes(1);
      expect(mockGetPscs.mock.calls[0][1]).toBe(COMPANY_NUMBER);
      expect(mockToReadableFormat).toBeCalledTimes(1);
      expect(mockToReadableFormat.mock.calls[0][0]).toBe(DOB_ISO);
      expect(response.text).toContain(ADDRESS_LINE_1_TITLE_CASE);
      expect(response.text).toContain(FORENAME_TITLE_CASE);
      expect(response.text).toContain(SURNAME);
      expect(response.text).toContain(FORMATTED_DOB);
      expect(response.text).toContain(COUNTRY_TITLE_CASE);
    });

    it("Should navigate to an error page if the function throws an error", async () => {
      const spyGetUrlToPath = jest.spyOn(urlUtils, "getUrlToPath");
      spyGetUrlToPath.mockImplementationOnce(() => { throw new Error(); });

      const response = await request(app).get(PEOPLE_WITH_SIGNIFICANT_CONTROL_URL);

      expect(response.text).toContain(ERROR_PAGE_TEXT);

      spyGetUrlToPath.mockRestore();
    });

    it("should navigate to error page if more than one psc is found", async () => {
      mockGetPscs.mockResolvedValueOnce([ {}, {} ]);
      const response = await request(app).get(PEOPLE_WITH_SIGNIFICANT_CONTROL_URL);
      expect(response.text).toContain(ERROR_PAGE_TEXT);
    });

    it("should navigate to psc statement page if no psc is found", async () => {
      mockGetPscs.mockResolvedValueOnce([ ]);
      const response = await request(app).get(PEOPLE_WITH_SIGNIFICANT_CONTROL_URL);
      expect(response.status).toEqual(302);
      expect(response.header.location).toEqual(pscStatementPathWithIsPscParam("false"));
    });

    it("should navigate to individual psc page if psc is individual", async () => {
      const response = await request(app).get(PEOPLE_WITH_SIGNIFICANT_CONTROL_URL);
      expect(response.statusCode).toBe(200);
      expect(response.text).toContain("1 individual person");
      expect(response.text).toContain(FORMATTED_DOB);
    });

    it("should navigate to rle page if psc is rle type", async () => {
      mockGetPscs.mockResolvedValueOnce([ { dateOfBirth: {
        month: 3,
        year: 1955
      },
      appointmentType: APPOINTMENT_TYPE_5008 } ]);
      const response = await request(app).get(PEOPLE_WITH_SIGNIFICANT_CONTROL_URL);
      expect(response.statusCode).toBe(200);
      expect(response.text).toContain("1 relevant legal entity");
    });

    it("should navigate to orp page if psc is orp type and populate with psc data", async () => {
      mockGetPscs.mockResolvedValueOnce([ {
        dateOfBirth: {
          month: DOB_MONTH,
          year: DOB_YEAR
        },
        appointmentType: APPOINTMENT_TYPE_5009,
        companyName: COMPANY_NAME,
        registerLocation: REGISTER_LOCATION,
        registrationNumber: REG_NO,
        serviceAddress: {
          addressLine2: SERV_ADD_LINE_1
        },
        countryOfResidence: COUNTRY_RESIDENCE
      } ]);
      const response = await request(app).get(PEOPLE_WITH_SIGNIFICANT_CONTROL_URL);
      expect(response.statusCode).toBe(200);
      expect(response.text).toContain("1 other registrable person");
      expect(response.text).toContain(COMPANY_NAME);
      expect(response.text).toContain(REGISTER_LOCATION);
      expect(response.text).toContain(REG_NO);
      expect(response.text).toContain("Line1");
      expect(response.text).toContain(COUNTRY_RESIDENCE);
    });

    it("should navigate to error page if psc is unknown type", async () => {
      mockGetPscs.mockResolvedValueOnce([ { appointmentType: "5010" } ]);
      const response = await request(app).get(PEOPLE_WITH_SIGNIFICANT_CONTROL_URL);
      expect(response.text).toContain(ERROR_PAGE_TEXT);
    });

    it("should populate rle page with psc data", async () => {
      mockGetPscs.mockResolvedValueOnce([ {
        dateOfBirth: {
          month: DOB_MONTH,
          year: DOB_YEAR
        },
        appointmentType: APPOINTMENT_TYPE_5008,
        companyName: COMPANY_NAME,
        registerLocation: REGISTER_LOCATION,
        registrationNumber: REG_NO,
        serviceAddress: {
          addressLine2: SERV_ADD_LINE_1
        },
        countryOfResidence: COUNTRY_RESIDENCE
      } ]);
      const response = await request(app).get(PEOPLE_WITH_SIGNIFICANT_CONTROL_URL);
      expect(response.statusCode).toBe(200);
      expect(response.text).toContain("1 relevant legal entity");
      expect(response.text).toContain(COMPANY_NAME);
      expect(response.text).toContain(REGISTER_LOCATION);
      expect(response.text).toContain(REG_NO);
      expect(response.text).toContain("Line1");
      expect(response.text).toContain(COUNTRY_RESIDENCE);
    });

    it("should not populate rle page with non mandatory data", async () => {
      mockGetPscs.mockResolvedValueOnce([ {
        dateOfBirth: {
          month: DOB_MONTH,
          year: DOB_YEAR
        },
        appointmentType: APPOINTMENT_TYPE_5008,
        companyName: COMPANY_NAME,
        serviceAddress: {
          addressLine2: SERV_ADD_LINE_1
        }
      } ]);
      const response = await request(app).get(PEOPLE_WITH_SIGNIFICANT_CONTROL_URL);
      expect(response.statusCode).toBe(200);
      expect(response.text).toContain("1 relevant legal entity");
      expect(response.text).toContain(COMPANY_NAME);
      expect(response.text).not.toContain("Registration number");
      expect(response.text).toContain("Line1");
      expect(response.text).not.toContain("Country of residence");
    });

    it("should navigate to error page if no date of birth is found for individual psc", async () => {
      const FORENAME = "Fred";
      const SURNAME = "Smith";

      mockGetPscs.mockResolvedValueOnce([ {
        appointmentType: APPOINTMENT_TYPE_5007,
        companyName: COMPANY_NAME,
        nameElements: {
          forename: FORENAME,
          surname: SURNAME
        },
        serviceAddress: {
          addressLine2: SERV_ADD_LINE_1
        }
      } ]);
      const response = await request(app).get(PEOPLE_WITH_SIGNIFICANT_CONTROL_URL);
      expect(response.text).toContain(ERROR_PAGE_TEXT);
    });

    it("should navigate to error page if no date of birth month is found for individual psc", async () => {
      mockGetPscs.mockResolvedValueOnce([ {
        appointmentType: APPOINTMENT_TYPE_5007,
        dateOfBirth: {
          year: DOB_YEAR
        },
        companyName: COMPANY_NAME,
        serviceAddress: {
          addressLine2: SERV_ADD_LINE_1
        }
      } ]);
      const response = await request(app).get(PEOPLE_WITH_SIGNIFICANT_CONTROL_URL);
      expect(response.text).toContain(ERROR_PAGE_TEXT);
    });

    it("should navigate to error page if no date of birth year is found for individual psc", async () => {
      mockGetPscs.mockResolvedValueOnce([ {
        appointmentType: APPOINTMENT_TYPE_5007,
        dateOfBirth: {
          month: DOB_MONTH
        },
        companyName: COMPANY_NAME,
        serviceAddress: {
          addressLine2: SERV_ADD_LINE_1
        }
      } ]);
      const response = await request(app).get(PEOPLE_WITH_SIGNIFICANT_CONTROL_URL);
      expect(response.text).toContain(ERROR_PAGE_TEXT);
    });

    it("should navigate to error page if no date of birth and no name is found for individual psc", async () => {
      mockGetPscs.mockResolvedValueOnce([ {
        appointmentType: APPOINTMENT_TYPE_5007,
        companyName: COMPANY_NAME,
        serviceAddress: {
          addressLine2: SERV_ADD_LINE_1
        }
      } ]);
      const response = await request(app).get(PEOPLE_WITH_SIGNIFICANT_CONTROL_URL);
      expect(response.text).toContain(ERROR_PAGE_TEXT);
      expect(mockCreateAndLogError).toHaveBeenCalledTimes(1);
      expect(mockCreateAndLogError).toHaveBeenCalledWith(expect.stringContaining("psc name undefined undefined"));
    });

    it("should not navigate to error page if no date of birth is found for rle", async () => {
      mockGetPscs.mockResolvedValueOnce([ {
        nameElements: {
          surname: TEST_RLE_NAME
        },
        appointmentType: APPOINTMENT_TYPE_5008,
        companyName: COMPANY_NAME,
        serviceAddress: {
          addressLine2: SERV_ADD_LINE_1
        }
      } ]);
      const response = await request(app).get(PEOPLE_WITH_SIGNIFICANT_CONTROL_URL);
      expect(response.statusCode).toBe(200);
      expect(response.text).toContain(TEST_RLE_NAME);
      expect(response.text).toContain("1 relevant legal entity");
      expect(response.text).toContain(COMPANY_NAME);
      expect(response.text).not.toContain("Registration number");
      expect(response.text).toContain("Line1");
      expect(response.text).not.toContain("Country of residence");
    });
  });

  describe("post tests", function () {
    it("Should redisplay psc page with error when radio button is not selected", async () => {
      const response = await request(app).post(PEOPLE_WITH_SIGNIFICANT_CONTROL_URL);

      expect(response.status).toEqual(200);
      expect(response.text).toContain(PAGE_TITLE);
      expect(response.text).toContain(PEOPLE_WITH_SIGNIFICANT_CONTROL_ERROR);
      expect(response.text).toContain(PAGE_HEADING);
      expect(response.text).toContain("1 individual person");
      expect(response.text).toContain(FORMATTED_DOB);
    });

    it("Should display wrong psc data page when no radio button is selected", async () => {
      const response = await request(app)
        .post(PEOPLE_WITH_SIGNIFICANT_CONTROL_URL)
        .send({ pscRadioValue: RADIO_BUTTON_VALUE.NO });

      expect(response.status).toEqual(200);
      expect(response.text).toContain(STOP_PAGE_HEADING);
    });

    it("Should redirect to psc statement page when yes radio button is selected", async () => {
      const response = await request(app)
        .post(PEOPLE_WITH_SIGNIFICANT_CONTROL_URL)
        .send({ pscRadioValue: RADIO_BUTTON_VALUE.YES });

      expect(response.status).toEqual(302);
      expect(response.header.location).toEqual(pscStatementPathWithIsPscParam("true"));
    });

    it("Should redirect to psc statement page when Recently Filed radio button is selected", async () => {
      const response = await request(app)
        .post(PEOPLE_WITH_SIGNIFICANT_CONTROL_URL)
        .send({ pscRadioValue: RADIO_BUTTON_VALUE.RECENTLY_FILED });

      expect(response.status).toEqual(302);
      expect(response.header.location).toEqual(pscStatementPathWithIsPscParam("true"));
    });

    it("Should return an error page if error is thrown in post function", async () => {
      const spyGetUrlToPath = jest.spyOn(urlUtils, "getUrlToPath");
      spyGetUrlToPath.mockImplementationOnce(() => { throw new Error(); });
      const response = await request(app).post(PEOPLE_WITH_SIGNIFICANT_CONTROL_URL);

      expect(response.status).toEqual(500);
      expect(response.text).toContain("Sorry, the service is unavailable");

      // restore original function so it is no longer mocked
      spyGetUrlToPath.mockRestore();
    });
  });
});

const pscStatementPathWithIsPscParam = (isPscParam: string) => {
  return urlUtils.setQueryParam(PSC_STATEMENT_URL, URL_QUERY_PARAM.IS_PSC, isPscParam);
};
