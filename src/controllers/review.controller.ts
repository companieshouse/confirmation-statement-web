import { NextFunction, Request, Response } from "express";
import { closeTransaction, getTransaction } from "../services/transaction.service";
import { Session } from "@companieshouse/node-session-handler";
import { CONFIRMATION_PATH, CONFIRMATION_STATEMENT, TASK_LIST_PATH } from '../types/page.urls';
import { Templates } from "../types/template.paths";
import { urlUtils } from "../utils/url";
import { CompanyProfile } from "@companieshouse/api-sdk-node/dist/services/company-profile/types";
import { getCompanyProfile } from "../services/company.profile.service";
import { Transaction } from "@companieshouse/api-sdk-node/dist/services/transaction/types";
import { startPaymentsSession } from "../services/payment.service";
import { ApiResponse } from "@companieshouse/api-sdk-node/dist/services/resource";
import { Payment } from "@companieshouse/api-sdk-node/dist/services/payment";
import { createAndLogError } from "../utils/logger";
import { links } from "../utils/constants";
import { toReadableFormat } from "../utils/date";
import { ConfirmationStatementSubmission, NextMadeUpToDate } from '@companieshouse/api-sdk-node/dist/services/confirmation-statement';
import { getConfirmationStatement } from "../services/confirmation.statement.service";
import { sendLawfulPurposeStatementUpdate } from "../utils/update.confirmation.statement.submission";
import { ecctDayOneEnabled } from "../utils/feature.flag";
import { getLocaleInfo, getLocalesService, selectLang } from "../utils/localise";
import { isLimitedPartnershipCompanyType, getACSPBackPath, handleLimitedPartnershipConfirmationJourney } from '../utils/limited.partnership';
import { handleNoChangeConfirmationJourney } from "../utils/no.change";
import { isPaymentDue, executePaymentJourney } from "../utils/payments";

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

    if (isLimitedPartnershipCompanyType(company)) {
      const backLinkPath = getACSPBackPath(session, company);
      const previousPage = urlUtils.getUrlWithCompanyNumberTransactionIdAndSubmissionId(
        backLinkPath,
        companyNumber,
        transactionId,
        submissionId
      );

      return res.render(Templates.REVIEW, {
        ...localeInfo,
        previousPage,
        company,
        nextMadeUpToDate: confirmationDate,
        isPaymentDue: true,
        ecctEnabled: true,
        isLimitedPartnership: true
      });

    }

    const transaction: Transaction = await getTransaction(session, transactionId);
    const csSubmission: ConfirmationStatementSubmission = await getConfirmationStatement(session, transactionId, submissionId);
    const statementDate: Date = new Date(company.confirmationStatement?.nextMadeUpTo as string);
    const ecctEnabled: boolean = ecctDayOneEnabled(statementDate);
    const backLinkUrl = urlUtils.getUrlWithCompanyNumberTransactionIdAndSubmissionId(
      TASK_LIST_PATH, companyNumber, transactionId, submissionId);


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

    if (isLimitedPartnershipCompanyType(companyProfile)) {

      const lpJourneyResponse = handleLimitedPartnershipConfirmationJourney(req, res, companyNumber, companyProfile, transactionId, submissionId, session);

      if ("renderData" in lpJourneyResponse && lpJourneyResponse.renderData) {
        return res.render(Templates.REVIEW, {
          ...getLocaleInfo(lpJourneyResponse.renderData.locales, lpJourneyResponse.renderData.lang),
          htmlLang: lpJourneyResponse.renderData.lang,
          previousPage: lpJourneyResponse.renderData.previousPage,
          companyProfile,
          ecctEnabled: lpJourneyResponse.renderData.ecctEnabled,
          confirmationStatementError: lpJourneyResponse.renderData.confirmationStatementError,
          lawfulActivityStatementError: lpJourneyResponse.renderData.lawfulActivityStatementError,
          confirmationChecked: lpJourneyResponse.renderData.confirmationChecked,
          lawfulActivityChecked: lpJourneyResponse.renderData.lawfulActivityChecked,
          isLimitedPartnership: true
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

    const noChangeJourneyResponse = handleNoChangeConfirmationJourney(req, res, company, companyNumber, transactionId, submissionId, csSubmission, session);

    if (noChangeJourneyResponse?.renderData && "renderData" in noChangeJourneyResponse) {
      return res.render(Templates.REVIEW, {
        backLinkUrl: noChangeJourneyResponse.renderData.backLinkUrl,
        company: noChangeJourneyResponse.renderData.company,
        NextMadeUpToDate: noChangeJourneyResponse.renderData.nextMadeUpToDate,
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
