import { urlUtils } from "../../../src/utils/url";

jest.mock("../../../src/middleware/company.authentication.middleware");
jest.mock("../../../src/services/confirmation.statement.service");
jest.mock("../../../src/services/psc.service");
jest.mock("../../../src/utils/date");

import mocks from "../../mocks/all.middleware.mock";
import { PEOPLE_WITH_SIGNIFICANT_CONTROL_PATH } from "../../../src/types/page.urls";
import request from "supertest";
import app from "../../../src/app";
import { companyAuthenticationMiddleware } from "../../../src/middleware/company.authentication.middleware";
import { PEOPLE_WITH_SIGNIFICANT_CONTROL_ERROR } from "../../../src/utils/constants";
import {
  getConfirmationStatement,
  updateConfirmationStatement
} from "../../../src/services/confirmation.statement.service";
import { mockConfirmationStatementSubmission } from "../../mocks/confirmation.statement.submission.mock";
import { getPscs } from "../../../src/services/psc.service";
import { toReadableFormatMonthYear } from "../../../src/utils/date";

const PAGE_TITLE = "Review the people with significant control";
const PAGE_HEADING = "Check the people with significant control (PSC)";
const STOP_PAGE_HEADING = "Update the people with significant control (PSC) details";
const COMPANY_NUMBER = "12345678";
const PEOPLE_WITH_SIGNIFICANT_CONTROL_URL = PEOPLE_WITH_SIGNIFICANT_CONTROL_PATH.replace(":companyNumber", COMPANY_NUMBER);
const APPOINTMENT_TYPE_5007 = "5007";
const DOB_MONTH = 3;
const DOB_YEAR = 1955;
const FORMATTED_DATE = "March 1955";

const mockGetConfirmationStatement = getConfirmationStatement as jest.Mock;
const mockUpdateConfirmationStatement = updateConfirmationStatement as jest.Mock;

const mockCompanyAuthenticationMiddleware = companyAuthenticationMiddleware as jest.Mock;
mockCompanyAuthenticationMiddleware.mockImplementation((req, res, next) => next());

const mockGetPscs = getPscs as jest.Mock;
mockGetPscs.mockResolvedValue([{
  appointmentType: APPOINTMENT_TYPE_5007,
  dateOfBirth: {
    month: DOB_MONTH,
    year: DOB_YEAR
  }
}]);

const mockToReadableFormatMonthYear = toReadableFormatMonthYear as jest.Mock;
mockToReadableFormatMonthYear.mockReturnValue(FORMATTED_DATE);

describe("People with significant control controller tests", () => {

  beforeEach(() => {
    mocks.mockAuthenticationMiddleware.mockClear();
    mockUpdateConfirmationStatement.mockReset();
    mockGetPscs.mockClear();
    mockToReadableFormatMonthYear.mockClear();
  });

  describe("get tests", function () {
    it("should navigate to the active pscs page", async () => {
      const response = await request(app).get(PEOPLE_WITH_SIGNIFICANT_CONTROL_URL);
      expect(response.text).toContain(PAGE_HEADING);
      expect(mockGetPscs).toBeCalledTimes(1);
      expect(mockGetPscs.mock.calls[0][1]).toBe(COMPANY_NUMBER);
      expect(toReadableFormatMonthYear).toBeCalledTimes(1);
      expect(mockToReadableFormatMonthYear.mock.calls[0][0]).toBe(DOB_MONTH);
      expect(mockToReadableFormatMonthYear.mock.calls[0][1]).toBe(DOB_YEAR);
    });

    it("Should navigate to an error page if the function throws an error", async () => {
      const spyGetUrlToPath = jest.spyOn(urlUtils, "getUrlToPath");
      spyGetUrlToPath.mockImplementationOnce(() => { throw new Error(); });

      const response = await request(app).get(PEOPLE_WITH_SIGNIFICANT_CONTROL_URL);

      expect(response.text).toContain("Sorry, the service is unavailable");

      spyGetUrlToPath.mockRestore();
    });

    it("should navigate to error page if more than one psc is found", async () => {
      mockGetPscs.mockResolvedValueOnce([ {}, {} ]);
      const response = await request(app).get(PEOPLE_WITH_SIGNIFICANT_CONTROL_URL);
      expect(response.text).toContain("Sorry, the service is unavailable");
    });

    it("should navigate to error page if no psc is found", async () => {
      mockGetPscs.mockResolvedValueOnce([ ]);
      const response = await request(app).get(PEOPLE_WITH_SIGNIFICANT_CONTROL_URL);
      expect(response.text).toContain("Sorry, the service is unavailable");
    });

    it("should navigate to individual psc page if psc is individual", async () => {
      const response = await request(app).get(PEOPLE_WITH_SIGNIFICANT_CONTROL_URL);
      expect(response.statusCode).toBe(200);
      expect(response.text).toContain("1 individual person");
      expect(response.text).toContain(FORMATTED_DATE);
    });

    it("should navigate to rle page if psc is rle type", async () => {
      mockGetPscs.mockResolvedValueOnce([ { dateOfBirth: {
        month: 3,
        year: 1955
      },
      appointmentType: "5008" } ]);
      const response = await request(app).get(PEOPLE_WITH_SIGNIFICANT_CONTROL_URL);
      expect(response.statusCode).toBe(200);
      expect(response.text).toContain("1 relevant legal entity");
      expect(response.text).toContain(FORMATTED_DATE);
    });

    it("should navigate to error page if psc is unknown type", async () => {
      mockGetPscs.mockResolvedValueOnce([ { appointmentType: "5009" } ]);
      const response = await request(app).get(PEOPLE_WITH_SIGNIFICANT_CONTROL_URL);
      expect(response.text).toContain("Sorry, the service is unavailable");
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
      expect(response.text).toContain(FORMATTED_DATE);
    });

    it("Should display wrong psc data page when no radio button is selected", async () => {
      mockGetConfirmationStatement.mockResolvedValueOnce(mockConfirmationStatementSubmission);
      const response = await request(app)
        .post(PEOPLE_WITH_SIGNIFICANT_CONTROL_URL)
        .send({ pscRadioValue: "no" });

      expect(mockUpdateConfirmationStatement).toHaveBeenCalledTimes(1);
      expect(response.status).toEqual(200);
      expect(response.text).toContain(STOP_PAGE_HEADING);
    });

    it("Should return 200 when yes radio button is selected", async () => {
      mockGetConfirmationStatement.mockResolvedValueOnce(mockConfirmationStatementSubmission);
      const response = await request(app)
        .post(PEOPLE_WITH_SIGNIFICANT_CONTROL_URL)
        .send({ pscRadioValue: "yes" });

      expect(mockUpdateConfirmationStatement).toHaveBeenCalledTimes(1);
      expect(response.status).toEqual(200);
    });

    it("Should return an error page if error is thrown in post function", async () => {
      mockGetConfirmationStatement.mockImplementationOnce(() => {throw new Error();});
      const response = await request(app)
        .post(PEOPLE_WITH_SIGNIFICANT_CONTROL_URL)
        .send({ pscRadioValue: "yes" });

      expect(response.text).toContain("Sorry, the service is unavailable");
    });
  });
});
