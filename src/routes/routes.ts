import { Router } from "express";
import * as confirmCompanyRoute from "../controllers/confirm.company.controller";
import * as companyNumberRoute from "../controllers/company.number.controller";
import * as startRoute from "../controllers/start.controller";
import * as urls from "../types/page.urls";


export const router: Router = Router();


router.get("/", startRoute.get);

router.get(urls.COMPANY_NUMBER, companyNumberRoute.get);

router.get(urls.CONFIRM_COMPANY, confirmCompanyRoute.get);
