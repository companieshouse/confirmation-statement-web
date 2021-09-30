import { RegisteredOfficeAddress } from "@companieshouse/api-sdk-node/dist/services/company-profile/types";
import { ActiveDirectorDetails, Address, PersonOfSignificantControl } from "@companieshouse/api-sdk-node/dist/services/confirmation-statement";

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
    clonedPsc.address = {
      addressLine1: formatTitleCase(psc.address.addressLine1),
      addressLine2: formatTitleCase(psc.address.addressLine2),
      careOf: formatTitleCase(psc.address.careOf),
      country: formatTitleCase(psc.address.country),
      locality: formatTitleCase(psc.address.locality),
      poBox: formatTitleCase(psc.address.poBox),
      postalCode: psc.address.postalCode,
      premises: formatTitleCase(psc.address.premises),
      region: formatTitleCase(psc.address.region)
    };
  }

  clonedPsc.serviceAddressLine1 = formatTitleCase(psc.serviceAddressLine1);
  clonedPsc.serviceAddressPostTown = formatTitleCase(psc.serviceAddressPostTown);
  clonedPsc.serviceAddressCareOf = formatTitleCase(psc.serviceAddressCareOf);
  clonedPsc.serviceAddressCountryName = formatTitleCase(psc.serviceAddressCountryName);
  clonedPsc.serviceAddressPoBox = formatTitleCase(psc.serviceAddressPoBox);
  clonedPsc.serviceAddressArea = formatTitleCase(psc.serviceAddressArea);
  clonedPsc.serviceAddressRegion = formatTitleCase(psc.serviceAddressRegion);

  clonedPsc.lawGoverned = formatTitleCase(psc.lawGoverned);
  clonedPsc.legalForm = formatTitleCase(psc.legalForm);

  return clonedPsc;
};

export const formatServiceAddress = (formattedPsc: PersonOfSignificantControl): string => {
  const addressClone: Address = {
    careOf: formattedPsc.serviceAddressCareOf,
    poBox: formattedPsc.serviceAddressPoBox,
    addressLine1: formattedPsc.serviceAddressLine1,
    locality: formattedPsc.serviceAddressArea,
    region: formattedPsc.serviceAddressRegion,
    country: formattedPsc.serviceAddressCountryName,
    postalCode: formattedPsc.serviceAddressPostCode
  };
  return formatAddressForDisplay(formatAddress(addressClone));
};

export const formatUraAddress = (formattedPsc: PersonOfSignificantControl): string => {
  let ura = "";
  if (formattedPsc.address) {
    ura = formatAddressForDisplay(formatAddress(formattedPsc.address));
  }
  return ura;
};
