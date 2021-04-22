import chai from "chai";
import chaiHttp from "chai-http";
import decache from "decache";

chai.use(chaiHttp);
decache('../../src/app');
import app from "../../src/app";

const expect = chai.expect;
const EXPECTED_TEXT = "File a confirmation statement";

describe("start controller tests", function() {
  it("should return start page", async function() {
    const response = await chai.request(app).get("/confirmation-statement");

    expect(response.text).to.contain(EXPECTED_TEXT);
  });

});
