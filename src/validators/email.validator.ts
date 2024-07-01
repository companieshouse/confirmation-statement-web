import {HOSTNAME_REGEX, VALID_EMAIL_REGEX_PATTERN} from "../utils/constants";

export const isEmailAddressValid = (emailAddress: string): boolean => {

  if (!emailAddress) {
    return false;
  }

  const regexResult: RegExpMatchArray | null = emailAddress.match(VALID_EMAIL_REGEX_PATTERN);
  if (!regexResult) {
    return false;
  }

  if (emailAddress.includes("..")) {
    return false;
  }

  const hostName = regexResult[1];
  const parts = hostName.split(".");
  if (parts.length < 2) {
    return false;
  }
  if (!parts[parts.length - 1].toLowerCase().match(HOSTNAME_REGEX)) {
    return false;
  }
  for(const part of parts) {
    if (!part.toLowerCase().match(HOSTNAME_REGEX)) {
      return false;
    }
  }

  return true;
};
