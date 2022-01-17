jest.mock("../../../src/utils/api.enumerations");

import { activeOfficerDetails } from "../../../src/controllers/tasks/active.officers.details.controller";
import { mockCorporateOfficerWithNullIdentificationType } from "../../mocks/active.officers.details.mock";
import { lookupIdentificationType } from "../../../src/utils/api.enumerations";

const mockLookupIdentificationType = lookupIdentificationType as jest.Mock;

describe("Api enumerations lookup tests for active officers", () => {

  beforeEach(() => {
    mockLookupIdentificationType.mockClear();
  });

  it("Should not call identification type lookup when identification type is null", () => {
    const spyGetActiveOfficerDetails = jest.spyOn(activeOfficerDetails, "buildCorporateOfficerList");
    spyGetActiveOfficerDetails.mockImplementationOnce(() => {
      return [mockCorporateOfficerWithNullIdentificationType];
    });
    expect(mockLookupIdentificationType).not.toHaveBeenCalled();
  });
});
