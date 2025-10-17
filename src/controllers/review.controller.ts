import { NextFunction, Request, Response } from "express";
import { getTransaction } from "../services/transaction.service";
import { Session } from "@companieshouse/node-session-handler";
import { CONFIRMATION_PATH, TASK_LIST_PATH } from '../types/page.urls';
import { Templates } from "../types/template.paths";
import { urlUtils } from "../utils/url";
import { CompanyProfile } from "@companieshouse/api-sdk-node/dist/services/company-profile/types";
import { getCompanyProfile } from "../services/company.profile.service";
import { Transaction } from "@companieshouse/api-sdk-node/dist/services/transaction/types";
import { toReadableFormat } from "../utils/date";
import { ConfirmationStatementSubmission } from '@companieshouse/api-sdk-node/dist/services/confirmation-statement';
import { getConfirmationStatement } from "../services/confirmation.statement.service";
import { sendLawfulPurposeStatementUpdate } from "../utils/update.confirmation.statement.submission";
import { ecctDayOneEnabled } from "../utils/feature.flag";
import { getLocaleInfo, getLocalesService, selectLang } from "../utils/localise";
import { isLimitedPartnershipCompanyType, getACSPBackPath } from '../utils/limited.partnership';
import { isPaymentDue, executePaymentJourney } from "../utils/payments";
import { handleLimitedPartnershipConfirmationJourney } from "../utils/confirmation/limited.partnership.confirmation";
import { handleNoChangeConfirmationJourney } from "../utils/confirmation/no.change.confirmation";
import { getAcspSessionData } from "../utils/session.acsp";
import moment from "moment";

const CONFIRMATION_STATEMENT_SESSION_KEY: string = 'CONFIRMATION_STATEMENT_CHECK_KEY';
const LAWFUL_ACTIVITY_STATEMENT_SESSION_KEY: string = 'LAWFUL_ACTIVITY_STATEMENT_CHECK_KEY';

export const get = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const session = req.session as Session;
    const companyNumber = urlUtils.getCompanyNumberFromRequestParams(req);
    const transactionId = urlUtils.getTransactionIdFromRequestParams(req);
    const submissionId = urlUtils.getSubmissionIdFromRequestParams(req);
    const locales = getLocalesService();
    const lang = selectLang(req.query.lang);
    const localeInfo = getLocaleInfo(locales, lang);
    res.cookie('lang', lang, { httpOnly: true });

    const company: CompanyProfile = await getCompanyProfile(companyNumber);
    const confirmationDate = company.confirmationStatement?.nextMadeUpTo;

    const confirmationStatementCheck = session.getExtraData(CONFIRMATION_STATEMENT_SESSION_KEY) as string;
    const lawfulActivityStatementCheck = session.getExtraData(LAWFUL_ACTIVITY_STATEMENT_SESSION_KEY) as string;

    const transaction: Transaction = await getTransaction(session, transactionId);
    const csSubmission: ConfirmationStatementSubmission = await getConfirmationStatement(session, transactionId, submissionId);
    const statementDate: Date = new Date(company.confirmationStatement?.nextMadeUpTo as string);
    const ecctEnabled: boolean = ecctDayOneEnabled(statementDate);
    const backLinkUrl = urlUtils.getUrlWithCompanyNumberTransactionIdAndSubmissionId(
      TASK_LIST_PATH, companyNumber, transactionId, submissionId);

    if (isLimitedPartnershipCompanyType(company)) {
      const backLinkPath = getACSPBackPath(session, company);
      const previousPage = urlUtils.getUrlWithCompanyNumberTransactionIdAndSubmissionId(
        backLinkPath,
        companyNumber,
        transactionId,
        submissionId
      );
      const acspSessionData = getAcspSessionData(session);
      const formattedCsDate = formatConfirmationDate(acspSessionData?.newConfirmationDate ?? confirmationDate);

      return res.render(Templates.REVIEW, {
        ...localeInfo,
        previousPage,
        company,
        nextMadeUpToDate: confirmationDate,
        isPaymentDue: isPaymentDue(transaction, submissionId),
        ecctEnabled: true,
        confirmationChecked: confirmationStatementCheck,
        lawfulActivityChecked: lawfulActivityStatementCheck,
        isLimitedPartnership: true,
        csDateValue: formattedCsDate
      });

    }

    return res.render(Templates.REVIEW, {
      ...localeInfo,
      backLinkUrl,
      company,
      nextMadeUpToDate: toReadableFormat(csSubmission.data?.confirmationStatementMadeUpToDate),
      isPaymentDue: isPaymentDue(transaction, submissionId),
      ecctEnabled
    });

  } catch (e) {
    return next(e);
  }
};

export const post = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const companyNumber = urlUtils.getCompanyNumberFromRequestParams(req);
    const companyProfile: CompanyProfile = await getCompanyProfile(companyNumber);
    const transactionId = urlUtils.getTransactionIdFromRequestParams(req);
    const submissionId = urlUtils.getSubmissionIdFromRequestParams(req);
    const session = req.session as Session;
    const transaction: Transaction = await getTransaction(
      session,
      transactionId
    );
    const acspSessionData = getAcspSessionData(session);
    const confirmationDate = companyProfile.confirmationStatement?.nextMadeUpTo;

    const formattedCsDate = formatConfirmationDate(acspSessionData?.newConfirmationDate ?? confirmationDate);

    if (isLimitedPartnershipCompanyType(companyProfile)) {
      const lpJourneyResponse = handleLimitedPartnershipConfirmationJourney(req, companyNumber, companyProfile, transactionId, submissionId, session);

      if ("renderData" in lpJourneyResponse && lpJourneyResponse.renderData) {
        return res.render(Templates.REVIEW, {
          ...getLocaleInfo(lpJourneyResponse.renderData.locales, lpJourneyResponse.renderData.lang),
          htmlLang: lpJourneyResponse.renderData.lang,
          previousPage: lpJourneyResponse.renderData.previousPage,
          company: companyProfile,
          ecctEnabled: lpJourneyResponse.renderData.ecctEnabled,
          confirmationStatementError: lpJourneyResponse.renderData.confirmationStatementError,
          lawfulActivityStatementError: lpJourneyResponse.renderData.lawfulActivityStatementError,
          confirmationChecked: lpJourneyResponse.renderData.confirmationChecked,
          lawfulActivityChecked: lpJourneyResponse.renderData.lawfulActivityChecked,
          isLimitedPartnership: true,
          csDateValue: formattedCsDate
        });
      }

      return res.redirect(
        urlUtils.getUrlWithCompanyNumberTransactionIdAndSubmissionId(
          lpJourneyResponse.nextPage,
          companyNumber,
          transactionId,
          submissionId
        )
      );
      // Payment journey need transaction id cannot be added
      // await executePaymentJourney(
      //   session,
      //   res,
      //   next,
      //   companyNumber,
      //   transactionId,
      //   submissionId,
      //   nextPage
      // );

    }
    const company: CompanyProfile = await getCompanyProfile(companyNumber);
    const csSubmission: ConfirmationStatementSubmission =
      await getConfirmationStatement(session, transactionId, submissionId);

    const noChangeJourneyResponse = handleNoChangeConfirmationJourney(req, company, csSubmission);

    if (noChangeJourneyResponse?.renderData && "renderData" in noChangeJourneyResponse) {
      return res.render(Templates.REVIEW, {
        backLinkUrl: noChangeJourneyResponse.renderData.backLinkUrl,
        company: noChangeJourneyResponse.renderData.company,
        nextMadeUpToDate: noChangeJourneyResponse.renderData.nextMadeUpToDate,
        ecctEnabled: noChangeJourneyResponse.renderData.ecctEnabled,
        confirmationStatementError: noChangeJourneyResponse.renderData.confirmationStatementError,
        lawfulActivityStatementError: noChangeJourneyResponse.renderData.lawfulActivityStatementError,
        isPaymentDue: isPaymentDue(transaction, submissionId)
      });
    }

    await sendLawfulPurposeStatementUpdate(req, true);

    await executePaymentJourney(
      session,
      res,
      next,
      companyNumber,
      transactionId,
      submissionId,
      CONFIRMATION_PATH
    );

  } catch (e) {
    return next(e);
  }
};

export function formatConfirmationDate(dateString?: string | Date | null): string | undefined {
  if (!dateString) {
    return undefined;
  }
  return moment(dateString).format("D MMMM YYYY");
}
