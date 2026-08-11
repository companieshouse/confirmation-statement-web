import { HOSTNAME_REGEX, VALID_EMAIL_REGEX_PATTERN } from "../utils/constants";

export const isEmailAddressValid = (emailAddress: string): boolean => {
    if (!emailAddress) {
        return false;
    }

    const regexResult: RegExpExecArray | null = new RegExp(VALID_EMAIL_REGEX_PATTERN).exec(emailAddress);
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
    if (!new RegExp(HOSTNAME_REGEX).exec(parts[parts.length - 1].toLowerCase())) {
        return false;
    }
    for (const part of parts) {
        if (!new RegExp(HOSTNAME_REGEX).exec(part.toLowerCase())) {
            return false;
        }
    }

    return true;
};
