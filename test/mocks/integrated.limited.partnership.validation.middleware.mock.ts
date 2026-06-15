import { NextFunction, Request, Response } from "express";
import { validateIntegratedJourney } from "../../src/middleware/integrated.limited.partnership.validation.middleware";

jest.mock("../../src/middleware/integrated.limited.partnership.validation.middleware");

// get handle on mocked function
const mockValidateIntegratedJourney = validateIntegratedJourney as jest.Mock;

// tell the mock what to return
mockValidateIntegratedJourney.mockImplementation((req: Request, res: Response, next: NextFunction) => next());

export default mockValidateIntegratedJourney;
