import chai from "chai";
import chaiHttp from "chai-http";
chai.use(chaiHttp);

import app from "../../src/app";

const expect = chai.expect;

describe("start controller tests", function() {
  it("should return start page", async function() {
    const response = await chai.request(app).get("/confirmation-statement/");

    expect(response.text).to.contain("File a confirmation statement");
  });

});
