import chai from "chai";
import chaiHttp from "chai-http";
chai.use(chaiHttp);

import app from "../../src/app";

const expect = chai.expect;

describe("company number controller tests", function() {
  it("should return company number page", async function() {
    const response = await chai.request(app).get("/confirmation-statement/company-number");

    expect(response.text).to.contain("This is the company number page");
  });

});
