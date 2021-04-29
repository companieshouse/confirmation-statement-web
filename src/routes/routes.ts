import { Request, Response, Router } from "express";
import * as startRoute from "../controllers/start.controller";
import * as companyNumberRoute from "../controllers/company.number.controller";
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
