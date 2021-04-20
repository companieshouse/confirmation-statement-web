import chai from "chai";
import chaiHttp from "chai-http";
chai.use(chaiHttp);

import app from "../../src/app";

const expect = chai.expect;

describe("service availability middleware test", function() {
  it("should return service offline page", async function() {
    process.env.SHOW_SERVICE_OFFLINE_PAGE = "true";
    const response = await chai.request(app).get("/confirmation-statement/");

    expect(response.text).to.contain("Service offline - File a confirmation statement");
  });

  it("should not return service offline page", async function() {
    process.env.SHOW_SERVICE_OFFLINE_PAGE = "false";
    const response = await chai.request(app).get("/confirmation-statement/");

    expect(response.text).to.not.contain("Service offline - File a confirmation statement");
  });

});