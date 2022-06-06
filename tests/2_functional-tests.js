const chaiHttp = require("chai-http");
const chai = require("chai");
const assert = chai.assert;
const server = require("../server");

chai.use(chaiHttp);

suite("Functional Tests", function () {
  this.timeout(5000);
  suite("Integration tests with chai-http", function () {
    // #1
    test("Create an issue with every field: POST request to /api/issues/apitest", function (done) {
      chai
        .request(server)
        .post("/api/issues/apitest")
        .send({
          issue_title: "Fix error in posting data",
          issue_text: "When we post data it has an error.",
          created_by: "Joe",
          assigned_to: "Joe",
          open: true,
          status_text: "In QA",
        })
        .end(function (err, res) {
          assert.equal(res.status, 200);
          done();
        });
    });
  });
});
