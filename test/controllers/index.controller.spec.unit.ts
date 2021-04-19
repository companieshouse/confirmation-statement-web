import chai from "chai";
import chaiHttp from "chai-http";
chai.use(chaiHttp);

import app from "../../src/app";

const expect = chai.expect;

describe("index controller tests", function() {
  it("should return index page", async function() {
    const response = await chai.request(app).get("/confirmation-statement/");

    expect(response.text).to.equal("Hello Confirmation statement");
  });

});