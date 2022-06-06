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
      const postData = {
        issue_title: "Fix error in posting data",
        issue_text: "When we post data it has an error.",
        created_by: "Joe",
        assigned_to: "Joe",
        open: true,
        status_text: "In QA",
      };
      chai
        .request(server)
        .post("/api/issues/apitest")
        .send(postData)
        .end(function (err, res) {
          assert.equal(res.status, 200);
          done();
        });
    });
    // #2
    test("Create an issue with only required fields: POST request to /api/issues/{project}", function (done) {
      chai
        .request(server)
        .post("/api/issues/apitest")
        .send({
          issue_title: "Fix error in posting data",
          issue_text: "When we post data it has an error.",
          created_by: "Joe",
        })
        .end(function (err, res) {
          assert.equal(res.status, 200);
          done();
        });
    });
    // #3
    test("Create an issue with missing required fields: POST request to /api/issues/{project}", function (done) {
      chai
        .request(server)
        .post("/api/issues/apitest")
        .send({
          assigned_to: "Joe",
          open: true,
          status_text: "In QA",
        })
        .end(function (err, res) {
          assert.equal(res.status, 200);
          assert.equal(res.body.error, "required field(s) missing");

          done();
        });
    });
    //#4
    test("View issues on a project: GET request to /api/issues/{project}", function (done) {
      chai
        .request(server)
        .get("/api/issues/apitest")
        .end(function (err, res) {
          assert.equal(res.status, 200);
          assert.isArray(res.body);
          assert.property(res.body[0], "issue_title");
          assert.property(res.body[0], "issue_text");
          assert.property(res.body[0], "created_on");
          assert.property(res.body[0], "updated_on");
          assert.property(res.body[0], "created_by");
          assert.property(res.body[0], "assigned_to");
          assert.property(res.body[0], "open");
          assert.property(res.body[0], "status_text");
          assert.property(res.body[0], "_id");

          done();
        });
    });
    //#5
    test("View issues on a project with one filter: GET request to /api/issues/{project}", function (done) {
      chai
        .request(server)
        .get("/api/issues/apitest")
        .query({ status_text: "test one filter" })
        .end(function (err, res) {
          res.body.forEach((issueResult) => {
            assert.equal(issueResult.status_text, "test one filter");
          });

          done();
        });
    });
    //#6
    test("View issues on a project with multiple filters: GET request to /api/issues/{project}", function (done) {
      chai
        .request(server)
        .get("/api/issues/apitest")
        .query({ status_text: "test multiple filters", open: true })
        .end(function (err, res) {
          res.body.forEach((issueResult) => {
            assert.equal(issueResult.status_text, "test multiple filters");
          });

          done();
        });
    });
    //#7
    test("Update one field on an issue: PUT request to /api/issues/{project}", function (done) {
      const id = 1;
      chai
        .request(server)
        .put("/api/issues/apitest")
        .send({ _id: id, status_text: "put test" })
        .end(function (err, res) {
          assert.equal(res.body.result, "successfully updated");
          assert.equal(res.body._id, id);
          done();
        });
    });
    //#8
    test("Update multiple fields on an issue: PUT request to /api/issues/{project}", function (done) {
      const id = 3;
      chai
        .request(server)
        .put("/api/issues/apitest")
        .send({ _id: id, status_text: "put test", open: false })
        .end(function (err, res) {
          assert.equal(res.body.result, "successfully updated");
          assert.equal(res.body._id, id);

          done();
        });
    });
    //#9
    test("Update an issue with missing _id: PUT request to /api/issues/{project}", function (done) {
      chai
        .request(server)
        .put("/api/issues/apitest")
        .send({ status_text: "put test", open: false })
        .end(function (err, res) {
          assert.equal(res.body.error, "missing_id");
          done();
        });
    });
    //#10
    test("Update an issue with no fields to update: PUT request to /api/issues/{project}", function (done) {
      const id = 1;
      chai
        .request(server)
        .put("/api/issues/apitest")
        .send({ _id: id })
        .end(function (err, res) {
          assert.equal(res.body.error, "no update field(s) sent");
          assert.equal(res.body._id, id);
          done();
        });
    });
    //#11
    test("Update an issue with an invalid _id: PUT request to /api/issues/{project}", function (done) {
      const id = "invalid id";
      chai
        .request(server)
        .put("/api/issues/apitest")
        .send({ _id: id, status_text: "put test", open: false })
        .end(function (err, res) {
          assert.equal(res.body.error, "could not update");
          assert.equal(res.body._id, id);
          done();
        });
    });
    //#12
    test("Delete an issue: DELETE request to /api/issues/{project}", function (done) {
      let id;
      chai
        .request(server)
        .get("/api/issues/apitest")
        .end((err, res) => {
          id = Math.max(...res.body.map((i) => Number(i._id)));
          chai
            .request(server)
            .delete("/api/issues/apitest")
            .send({ _id: id })
            .end(function (err, res) {
              assert.equal(res.body.result, "successfully deleted");
              assert.equal(res.body._id, id);
              done();
            });
        });
    });
    //#13
    test("Delete an issue with an invalid _id: DELETE request to /api/issues/{project}", function (done) {
      const id = "invalid id";
      chai
        .request(server)
        .delete("/api/issues/apitest")
        .send({ _id: id })
        .end(function (err, res) {
          assert.equal(res.body.error, "could not delete");
          assert.equal(res.body._id, id);

          done();
        });
    });
    //#14
    test("Delete an issue with missing _id: DELETE request to /api/issues/{project}", function (done) {
      chai
        .request(server)
        .delete("/api/issues/apitest")
        .send({})
        .end(function (err, res) {
          assert.equal(res.body.error, "missing _id");
          done();
        });
    });
  });
});
