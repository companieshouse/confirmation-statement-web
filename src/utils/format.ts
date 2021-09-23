import { RegisteredOfficeAddress } from "@companieshouse/api-sdk-node/dist/services/company-profile/types";
import { ActiveDirectorDetails, Address } from "@companieshouse/api-sdk-node/dist/services/confirmation-statement";

export const formatTitleCase = (str: string|undefined): string =>  {
  if (!str) {
    return "";
  }

  return str.replace(
    /\w\S*/g, (word) => {
      return word.charAt(0).toUpperCase() + word.substr(1).toLowerCase();
    });
};

export const formatDirectorDetails = (directorDetails: ActiveDirectorDetails): ActiveDirectorDetails => {
  const clone: ActiveDirectorDetails = JSON.parse(JSON.stringify(directorDetails));

  clone.foreName1 = formatTitleCase(directorDetails.foreName1);
  clone.foreName2 = formatTitleCase(directorDetails.foreName2);
  clone.surname = directorDetails.surname;
  clone.nationality = formatTitleCase(directorDetails.nationality);
  clone.occupation = formatTitleCase(directorDetails.occupation);
  clone.serviceAddress = formatAddress(directorDetails.serviceAddress);
  clone.residentialAddress = formatAddress(directorDetails.residentialAddress);

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
