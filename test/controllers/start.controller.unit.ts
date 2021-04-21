import { NextFunction, Request, Response } from "express";
import chai from "chai";
import chaiHttp from "chai-http";
import sinon from "sinon";
import decache from "decache";
decache('../../src/app');
chai.use(chaiHttp);
const auth = require ("../../src/middleware/authentication.middleware");

// store reference to original function in case you need it:
const originalAuthMid = auth.authenticationMiddleware

// replace isAdmin method with a stubbed, but don't specify implementation yet
const authMidStub = sinon.stub(auth, "authenticationMiddleware");

import app from "../../src/app";

const expect = chai.expect;

describe("start controller tests", function() {
  it("should return start page", async function() {
    auth.authenticationMiddleware.callsFake((req : Request, res: Response, next: NextFunction) => next());
    const response = await chai.request(app).get("/confirmation-statement/");

    expect(response.text).to.contain("File a confirmation statement");
  });

});
