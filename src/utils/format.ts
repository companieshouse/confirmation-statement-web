import { RegisteredOfficeAddress } from "@companieshouse/api-sdk-node/dist/services/company-profile/types";
import { ActiveOfficerDetails, Address, PersonOfSignificantControl } from "@companieshouse/api-sdk-node/dist/services/confirmation-statement";

export const formatTitleCase = (str: string|undefined): string =>  {
  if (!str) {
    return "";
  }

  return str.replace(
    /\w\S*/g, (word) => {
      return word.charAt(0).toUpperCase() + word.substr(1).toLowerCase();
    });
};

export const formatOfficerDetails = (officerDetails: ActiveOfficerDetails): ActiveOfficerDetails => {
  const clone: ActiveOfficerDetails = JSON.parse(JSON.stringify(officerDetails));

  clone.foreName1 = formatTitleCase(officerDetails.foreName1);
  clone.foreName2 = formatTitleCase(officerDetails.foreName2);
  clone.surname = officerDetails.surname;
  clone.nationality = formatTitleCase(officerDetails.nationality);
  clone.occupation = formatTitleCase(officerDetails.occupation);
  clone.serviceAddress = formatAddress(officerDetails.serviceAddress);
  clone.residentialAddress = formatAddress(officerDetails.residentialAddress);

  return clone;
};

export const formatAddressForDisplay = (address: Address): string => {
  let addressStr = "";
  for (const line of Object.values(address)) {
    if (line) {
      addressStr = addressStr + line + ", ";
    }
  }
  return addressStr.slice(0, -2);
};

export const formatAddress = (address: Address): Address => {
  const addressClone: Address = JSON.parse(JSON.stringify(address));
  return {
    careOf: formatTitleCase(addressClone.careOf),
    poBox: formatTitleCase(addressClone.poBox),
    premises: formatTitleCase(addressClone.premises),
    addressLine1: formatTitleCase(addressClone.addressLine1),
    addressLine2: formatTitleCase(addressClone.addressLine2),
    locality: formatTitleCase(addressClone.locality),
    region: formatTitleCase(addressClone.region),
    country: formatTitleCase(addressClone.country),
    postalCode: addressClone.postalCode?.toUpperCase()
  };
};

export const formatRegisteredOfficeAddress = (address: RegisteredOfficeAddress): RegisteredOfficeAddress => {
  const addressClone: RegisteredOfficeAddress = JSON.parse(JSON.stringify(address));
  return {
    careOf: formatTitleCase(addressClone.careOf),
    poBox: formatTitleCase(addressClone.poBox),
    premises: formatTitleCase(addressClone.premises),
    addressLineOne: formatTitleCase(addressClone.addressLineOne),
    addressLineTwo: formatTitleCase(addressClone.addressLineTwo),
    locality: formatTitleCase(addressClone.locality),
    region: formatTitleCase(addressClone.region),
    country: formatTitleCase(addressClone.country),
    postalCode: addressClone.postalCode?.toUpperCase()
  };
};

export const formatPSCForDisplay = (psc: PersonOfSignificantControl): PersonOfSignificantControl => {
  const clonedPsc: PersonOfSignificantControl = JSON.parse(JSON.stringify(psc));
  if (psc.nameElements) {
    clonedPsc.nameElements = {
      forename: formatTitleCase(psc.nameElements?.forename),
      otherForenames: psc.nameElements?.otherForenames,
      surname: psc.nameElements?.surname,
      middleName: psc.nameElements?.middleName,
      title: psc.nameElements?.title
    };
  }

  if (psc.address) {
    clonedPsc.address = formatAddress(psc.address);
  }
  if (psc.serviceAddress) {
    clonedPsc.serviceAddress = formatAddress(psc.serviceAddress);
  }

  clonedPsc.lawGoverned = formatTitleCase(psc.lawGoverned);
  clonedPsc.legalForm = formatTitleCase(psc.legalForm);

  return clonedPsc;
};
