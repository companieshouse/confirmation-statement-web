import { CondensedSicCodeData } from "@companieshouse/api-sdk-node/dist/services/sic-code";
import { createAndLogError } from "../utils/logger";
import { Session } from "@companieshouse/node-session-handler";
import Resource from "@companieshouse/api-sdk-node/dist/services/resource";
import { createPublicOAuthApiClient } from "./api.service";

export interface SicCodeValidationResult {
    maxError?: string;
    duplicateError?: string;
    invalidError?: string;
    minError?: boolean;
}

export const getSicCodeCondensedList = async (session: Session): Promise<CondensedSicCodeData[]> => {
    const client = createPublicOAuthApiClient(session);
    const csService = client.confirmationStatementService;
    const response = (await csService.getCondensedSicCodeList()) as Resource<CondensedSicCodeData[]>;

    const condensedSicCodeListResource: Resource<CondensedSicCodeData[]> = response as Resource<CondensedSicCodeData[]>;
    const sicCodeList =
        condensedSicCodeListResource?.httpStatusCode === 200 && condensedSicCodeListResource?.resource
            ? sortSicCodesList(condensedSicCodeListResource.resource)
            : [];
    return sicCodeList;
};

export function validateSicCodes(
    sicCodes: string[],
    initSicCodes: number,
    sicCodeList: CondensedSicCodeData[]
): SicCodeValidationResult {
    const result: SicCodeValidationResult = {};

    const duplicateSicCodes = new Map<string, number>();
    const duplicates: string[] = [];

    for (const code of sicCodes) {
        const count = duplicateSicCodes.get(code) ?? 0;
        duplicateSicCodes.set(code, count + 1);
        if (count === 1) {
            duplicates.push(code);
        }
    }

    if (duplicates.length > 0) {
        result.duplicateError = "Remove duplicate SIC codes. A limited partnership can not have duplicate SIC codes.";
    }

    if (initSicCodes > 0 && sicCodes.length === 0) {
        result.minError = true;
        result.maxError = "Add a SIC code. A limited partnership must have at least one SIC code.";
    }

    if (sicCodes.length > 4) {
        result.maxError = "Remove SIC code(s). A limited partnership can only have a maximum of 4 SIC codes.";
    }

    if (hasInvalidSicCodes(sicCodes, sicCodeList)) {
        result.invalidError = "Invalid SIC code(s) entered. Please enter a Valid SIC code.";
    }

    return result;
}

export function hasInvalidSicCodes(sicCodes: string[], sicCodeList: CondensedSicCodeData[]) {
    const validCodes = new Set(sicCodeList.map(sic => sic.sic_code));

    return sicCodes.some(code => {
        const sc = code.split(",")[0].trim();
        return !validCodes.has(sc);
    });
}

function sortSicCodesList(sicCodeList: CondensedSicCodeData[]) {
    if (!sicCodeList || sicCodeList.length === 0) {
        return sicCodeList;
    }
    return sicCodeList.sort((a: CondensedSicCodeData, b: CondensedSicCodeData) => a.sic_code.localeCompare(b.sic_code));
}
