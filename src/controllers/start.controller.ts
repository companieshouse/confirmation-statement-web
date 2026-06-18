import { Request, Response } from "express";
import {
    CHS_URL,
    CS01_COST,
    PIWIK_START_GOAL_ID,
    FEATURE_FLAG_FIVE_OR_LESS_OFFICERS_JOURNEY_21102021,
    EWF_URL,
    FEATURE_FLAG_SERVICE_WITHDRAWN_02102025,
    SKIP_START_PAGE_COMPANY_TYPES,
} from "../utils/properties";
import { Templates } from "../types/template.paths";
import { getLocaleInfo, getLocalesService, selectLang } from "../utils/localise";
import { COMPANY_NUMBER, CONFIRMATION_STATEMENT } from "../types/page.urls";

const parseTypes = (typeParam: unknown): string[] => {
    if (!typeParam) {
        return [];
    }
    if (Array.isArray(typeParam)) {
        return typeParam
            .map(String)
            .flatMap(p => String(p).split(","))
            .map(p => p.trim().toLowerCase())
            .filter(Boolean);
    }
    return String(typeParam)
        .split(",")
        .map(p => p.trim().toLowerCase())
        .filter(Boolean);
};

const shouldSkipStart = (req: Request): boolean => {
    const configured = String(SKIP_START_PAGE_COMPANY_TYPES || "")
        .split(",")
        .map(s => s.trim().toLowerCase())
        .filter(Boolean);
    if (!configured.length) {
        return false;
    }
    const types = parseTypes(req.query.type);
    return types.some(t => configured.includes(t));
};

export const get = (req: Request, res: Response) => {
    const lang = selectLang(req.query.lang);
    const locales = getLocalesService();

    if (shouldSkipStart(req)) {
        return res.redirect(CONFIRMATION_STATEMENT + COMPANY_NUMBER);
    }

    return res.render(Templates.START, {
        ...getLocaleInfo(locales, lang),
        htmlLang: lang,
        CHS_URL,
        PIWIK_START_GOAL_ID,
        FEATURE_FLAG_SERVICE_WITHDRAWN_02102025,
        FEATURE_FLAG_FIVE_OR_LESS_OFFICERS_JOURNEY_21102021,
        EWF_URL,
        CS01_COST,
        templateName: Templates.START,
    });
};
