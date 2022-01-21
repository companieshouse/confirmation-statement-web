import { NextFunction, Request, Response } from "express";
import { TASK_LIST_PATH } from "../../types/page.urls";
import { Templates } from "../../types/template.paths";
import { urlUtils } from "../../utils/url";
import { PersonOfSignificantControl } from "@companieshouse/api-sdk-node/dist/services/confirmation-statement";
import { getPscs } from "../../services/psc.service";
import { Session } from "@companieshouse/node-session-handler";
import { appointmentTypes, LOCALE_EN } from "../../utils/constants";
import { formatAddressForDisplay, formatPSCForDisplay } from "../../utils/format";
import { toReadableFormat } from "../../utils/date";



export const get = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const transactionId = urlUtils.getTransactionIdFromRequestParams(req);
    const submissionId = urlUtils.getSubmissionIdFromRequestParams(req);
    const pscs: PersonOfSignificantControl[] = await getPscs(req.session as Session, transactionId, submissionId);

    const pscLists = buildPscLists(pscs);
    return res.render(Templates.ACTIVE_PSC_DETAILS, {
      templateName: Templates.ACTIVE_PSC_DETAILS,
      backLinkUrl: urlUtils.getUrlToPath(TASK_LIST_PATH, req),
      pscList: pscLists.individualPscList
    });
  } catch (e) {
    return next(e);
  }
};

const buildPscLists = (pscs: PersonOfSignificantControl[]): any => {
  return {
    individualPscList: buildIndividualPscList(pscs)
  };
};

const buildIndividualPscList = (pscs: PersonOfSignificantControl[]): any[] => {
  return pscs
    .filter(psc => equalsIgnoreCase(psc.appointmentType, appointmentTypes.INDIVIDUAL_PSC))
    .map(psc  => {
      const formattedPsc: PersonOfSignificantControl = formatPSCForDisplay(psc);
      const ura = formattedPsc.address ? formatAddressForDisplay(formattedPsc.address) : "";
      const serviceAddress = formattedPsc.serviceAddress ? formatAddressForDisplay(formattedPsc.serviceAddress) : "";
      const dob = psc.dateOfBirthIso ? toReadableFormat(psc.dateOfBirthIso) : "";
      const dateOfAppointment = toReadableFormat(psc.appointmentDate);
      return {
        formattedPsc: formattedPsc,
        ura: ura,
        serviceAddress: serviceAddress,
        dob: dob,
        dateOfAppointment: dateOfAppointment
      };
    });
};

const equalsIgnoreCase = (pscType: string, wantedPscType: string): boolean => {
  return wantedPscType.localeCompare(pscType, LOCALE_EN, { sensitivity: 'accent' }) === 0;
};
