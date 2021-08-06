import { ActiveOfficerDetails } from "private-api-sdk-node/dist/services/confirmation-statement";


export const mockActiveOfficerDetails: ActiveOfficerDetails = {
  foreName1: "JOHN",
  foreName2: "MiddleName",
  surname: "DOE",
  occupation: "singer",
  nationality: "British",
  dateOfBirth: "1 January 1960",
  serviceAddressLine1: "Diddly squat farm shop",
  serviceAddressPostTown: "Chadlington",
  serviceAddressPostcode: "OX7 3PE",
  uraLine1: "Llanishen Library Hub",
  uraPostTown: "Llanishen",
  uraPostcode: "CF14 5LS",
  secureIndicator: "N"
};

export const mockActiveOfficerDetailsFormatted: ActiveOfficerDetails = {
  foreName1: "John",
  foreName2: "Middlename",
  surname: "DOE",
  occupation: "Singer",
  nationality: "British",
  dateOfBirth: "1 January 1960",
  serviceAddressLine1: "Diddly Squat Farm Shop",
  serviceAddressPostTown: "Chadlington",
  serviceAddressPostcode: "OX7 3PE",
  uraLine1: "Llanishen Library Hub",
  uraPostTown: "Llanishen",
  uraPostcode: "CF14 5LS",
  secureIndicator: "N"
};
