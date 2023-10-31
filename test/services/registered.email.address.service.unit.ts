jest.mock("../../src/services/api.service");
jest.mock("../../src/utils/logger");
jest.mock("../../src/utils/date");
jest.mock("../../src/utils/api.enumerations");

import { getRegisteredEmailAddress, doesCompanyHaveEmailAddress } from "../../src/services/registered.email.address.service";
import { createAndLogError } from "../../src/utils/logger";

import { Resource } from "@companieshouse/api-sdk-node";
import { RegisteredEmailAddressResponse } from "private-api-sdk-node/dist/services/confirmation-statement/types";
import { createPrivateApiKeyClient } from "../../src/services/api.service";
import { ApiErrorResponse } from "@companieshouse/api-sdk-node/dist/services/resource";

const mockCreatePrivateApiClient = createPrivateApiKeyClient as jest.Mock;
const mockGetRegisteredEmailAddress = jest.fn();
const mockCreateAndLogError = createAndLogError as jest.Mock;

const validEmailResponse: Resource<RegisteredEmailAddressResponse> = { httpStatusCode: 200, resource: { registered_email_address: "test@email.org" } };
const emailNotFoundResponse: ApiErrorResponse = { httpStatusCode: 404, errors: [{ error: "Registered Email Address not found" }] };

mockCreatePrivateApiClient.mockReturnValue({
  confirmationStatementService: {
    getRegisteredEmailAddress: mockGetRegisteredEmailAddress
  }
});

mockCreateAndLogError.mockReturnValue(new Error());

describe("Registered email service test", () => {
  const COMPANY_NUMBER = "1234567";

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("getRegisteredEmailAddress tests", () => {
    it("Should return an email address if response has one", async () => {
      mockGetRegisteredEmailAddress.mockResolvedValueOnce(validEmailResponse);
      const response: string = await getRegisteredEmailAddress(COMPANY_NUMBER);
      expect(response).toEqual("test@email.org");
    });

    it("Should return a blank string if status code = 404 because company has no email address", async () => {
      mockGetRegisteredEmailAddress.mockResolvedValueOnce(emailNotFoundResponse);
      const response: string = await getRegisteredEmailAddress(COMPANY_NUMBER);
      expect(response).toEqual("");
    });

    it("Should throw an error if status code = 404 for an unexpected reason", async () => {
      const HTTP_STATUS_CODE = 404;
      mockGetRegisteredEmailAddress.mockResolvedValueOnce({
        httpStatusCode: HTTP_STATUS_CODE
      } as Resource<RegisteredEmailAddressResponse>);

      await getRegisteredEmailAddress(COMPANY_NUMBER)
        .then(() => {
          fail("Was expecting an error to be thrown.");
        })
        .catch(() => {
          expect(createAndLogError).toHaveBeenCalledWith(expect.stringContaining(`${HTTP_STATUS_CODE}`));
          expect(createAndLogError).toHaveBeenCalledWith(expect.stringContaining(`${COMPANY_NUMBER}`));
        });
    });

    it("Should throw an error for unexpected status code", async () => {
      const HTTP_STATUS_CODE = 500;
      mockGetRegisteredEmailAddress.mockResolvedValueOnce({
        httpStatusCode: HTTP_STATUS_CODE
      } as Resource<RegisteredEmailAddressResponse>);

      await getRegisteredEmailAddress(COMPANY_NUMBER)
        .then(() => {
          fail("Was expecting an error to be thrown.");
        })
        .catch(() => {
          expect(createAndLogError).toHaveBeenCalledWith(expect.stringContaining(`${HTTP_STATUS_CODE}`));
          expect(createAndLogError).toHaveBeenCalledWith(expect.stringContaining(`${COMPANY_NUMBER}`));
        });
    });

    it("Should throw an error if no response returned from SDK", async () => {
      mockGetRegisteredEmailAddress.mockResolvedValueOnce(undefined);

      await getRegisteredEmailAddress(COMPANY_NUMBER)
        .then(() => {
          fail("Was expecting an error to be thrown.");
        })
        .catch(() => {
          expect(createAndLogError).toHaveBeenCalledWith(expect.stringContaining("no response"));
          expect(createAndLogError).toHaveBeenCalledWith(expect.stringContaining(`${COMPANY_NUMBER}`));
        });
    });

    it("Should throw an error if no response resource returned from SDK", async () => {
      mockGetRegisteredEmailAddress.mockResolvedValueOnce({ httpStatusCode: 200 } as Resource<RegisteredEmailAddressResponse>);

      await getRegisteredEmailAddress(COMPANY_NUMBER)
        .then(() => {
          fail("Was expecting an error to be thrown.");
        })
        .catch(() => {
          expect(createAndLogError).toHaveBeenCalledWith(expect.stringContaining("No resource"));
          expect(createAndLogError).toHaveBeenCalledWith(expect.stringContaining(`${COMPANY_NUMBER}`));
        });
    });
  });

  describe("doesCompanyHaveEmailAddress tests", () => {
    it("Should return true if company has an email address", async () => {
      mockGetRegisteredEmailAddress.mockResolvedValueOnce(validEmailResponse);
      const response: boolean = await doesCompanyHaveEmailAddress(COMPANY_NUMBER);
      expect(response).toEqual(true);
    });
    it("Should return false if no email address was found", async () => {
      mockGetRegisteredEmailAddress.mockResolvedValueOnce(emailNotFoundResponse);
      const response: boolean = await doesCompanyHaveEmailAddress(COMPANY_NUMBER);
      expect(response).toEqual(false);
    });
  });
});
