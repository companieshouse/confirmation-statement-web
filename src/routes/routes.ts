import { Request, Response, Router } from "express";
import * as activeOfficers from "../controllers/tasks/active.officers.controller";
import * as confirmCompanyRoute from "../controllers/confirm.company.controller";
import * as companyNumberRoute from "../controllers/company.number.controller";
import * as sicRoute from "../controllers/tasks/confirm.sic.code.controller";
import * as startRoute from "../controllers/start.controller";
import * as statementOfCapitalRoute from "../controllers/tasks/statement.of.capital.controller";
import * as tradingStatusRoute from "../controllers/trading.status.controller";
import * as taskListRoute from "../controllers/task.list.controller";
import * as activePscsRoute from "../controllers/tasks/active.pscs.controller";
import * as registeredOfficeAddressRoute from "../controllers/tasks/registered.office.address.controller";
import * as urls from "../types/page.urls";
import { Templates } from "../types/template.paths";


export const router: Router = Router();

/**
 * Simply renders a view template.
 *
 * @param template the template name
 */
const renderTemplate = (template: string) => (req: Request, res: Response) => {
  return res.render(template);
};

router.get("/", startRoute.get);

router.get(urls.COMPANY_NUMBER, companyNumberRoute.get);

router.get(urls.ACCESSIBILITY_STATEMENT, renderTemplate(Templates.ACCESSIBILITY_STATEMENT));

router.get(urls.ACTIVE_OFFICERS, activeOfficers.get);

router.get(urls.CONFIRM_COMPANY, confirmCompanyRoute.get);
router.post(urls.CONFIRM_COMPANY, confirmCompanyRoute.post);

router.get(urls.SIC, sicRoute.get);
router.post(urls.SIC, sicRoute.post);

router.get(urls.TRADING_STATUS, tradingStatusRoute.get);
router.post(urls.TRADING_STATUS, tradingStatusRoute.post);

router.get(urls.TASK_LIST, taskListRoute.get);

router.get(urls.STATEMENT_OF_CAPITAL, statementOfCapitalRoute.get);
router.post(urls.STATEMENT_OF_CAPITAL, statementOfCapitalRoute.post);

router.get(urls.ACTIVE_PSCS, activePscsRoute.get);

router.get(urls.REGISTERED_OFFICE_ADDRESS, registeredOfficeAddressRoute.get);
router.post(urls.REGISTERED_OFFICE_ADDRESS, registeredOfficeAddressRoute.post);
