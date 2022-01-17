jest.mock("../../../src/utils/api.enumerations");
jest.mock("../../../src/services/active.officers.details.service");

import { getActiveOfficersDetailsData } from "../../../src/services/active.officers.details.service";
import { mockCorporateOfficerWithNullIdentificationType } from "../../mocks/active.officers.details.mock";
import { lookupIdentificationType } from "../../../src/utils/api.enumerations";

const mockGetActiveOfficerDetails = getActiveOfficersDetailsData as jest.Mock;
const mockLookupIdentificationType = lookupIdentificationType as jest.Mock;

describe("Active officers details controller tests", () => {

  beforeEach(() => {
    mockLookupIdentificationType.mockClear();
  });

  it("Should not call identification type lookup when identification type is null", () => {
    mockGetActiveOfficerDetails.mockResolvedValueOnce([
      mockCorporateOfficerWithNullIdentificationType]);
    expect(mockLookupIdentificationType).not.toHaveBeenCalled();
  });
});
