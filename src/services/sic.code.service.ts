import { createInternalApiKeyClient } from "./api.service";
import { CondensedSicCodeData } from "@companieshouse/api-sdk-node/dist/services/sic-code";

export const getSicCodeCondensedList = async (): Promise<CondensedSicCodeData[]> => {
  const client = createInternalApiKeyClient();
  const sicCodeService = client.sicCodeService;
  const data = await sicCodeService.getCondensedSicCodes();
  const sicCodeList = data.resource;

  return sicCodeList || [];
};
