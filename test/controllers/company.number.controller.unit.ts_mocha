import chai from "chai";
import chaiHttp from "chai-http";
import { NextFunction, Request, Response } from "express";
import sinon from "sinon";
import decache from "decache";

decache('../../src/app');
chai.use(chaiHttp);

// eslint-disable-next-line @typescript-eslint/no-var-requires
const auth = require ("../../src/middleware/authentication.middleware");

sinon.stub(auth, "authenticationMiddleware");
import app from "../../src/app";

const expect = chai.expect;

describe("company number controller tests", function() {
  it("should return company number page", async function() {
    auth.authenticationMiddleware.callsFake((req: Request, res: Response, next: NextFunction) => next());
    const response = await chai.request(app).get("/confirmation-statement/company-number");

    expect(response.text).to.contain("This is the company number page");
  });
});
