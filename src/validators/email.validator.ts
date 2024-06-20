const VALID_EMAIL_REGEX_PATTERN = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~\\-]+@([^.@][^@\\s]+)$/u;
const HOSTNAME_REGEX = /^(xn|[a-z0-9]+)(-?-[a-z0-9]+)*$/u;
const TLD_PART_REGEX = /^(?:[a-z]{2,63}|xn--[a-z0-9]+(?:-[a-z0-9]+){1,4})(?:$|[^-])/u;

export const isEmailAddressValid = (emailAddress: string): boolean => {

  if (!VALID_EMAIL_REGEX_PATTERN.test(emailAddress)) {
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
  for(const part of parts) {
    if (!part.toLowerCase().match(HOSTNAME_REGEX)) {
      return false;
    }
  }
  if (!parts[parts.length - 1].toLowerCase().match(HOSTNAME_REGEX)) {
    return false;
  }

  return true;
};
