"use strict";

module.exports = function (app) {
  const fs = require("fs");
  const { writeFile } = fs;
  app
    .route("/api/issues/:project")

    .get(function (req, res) {
      let project = req.params.project;
      //console.log("get", project);
      let fname = `./data/${project}.json`;
      const query = req.query;
      let filter = "";
      if (query) {
        const keys = Object.keys(query);
        const values = Object.values(query);

        keys.forEach((i, index) => {
          if (values[index] === "true" || values[index] === "false") {
            values[index] = filter += "i." + i + "===" + values[index];
          } else {
            values[index] = filter +=
              "i." + i + "===" + JSON.stringify(values[index]);
          }

          if (index !== keys.length - 1) filter += "&&";
        });
      }

      fs.readFile(fname, "utf8", (error, data) => {
        if (error) {
          //console.log("get error", project);
          return res.send(`${project} project doesn't exist`);
        }
        // console.log(JSON.parse(data));
        let result = JSON.parse(data);

        result =
          Object.keys(query).length === 0
            ? result
            : result.filter((i) => eval(filter));
        res.send(result);
      });
    })

    .post(function (req, res) {
      let project = req.params.project;
      let fname = `./data/${project}.json`;

      const {
        issue_title,
        issue_text,
        created_by,
        assigned_to = "",
        status_text = "",
      } = req.body;
      if (!issue_title || !issue_text || !created_by)
        return (res.send = "{ error: 'required field(s) missing' }");

      const created_on = new Date();
      const updated_on = created_on;
      const open = true;

      let readData = [];
      fs.readFile(fname, "utf8", (error, data) => {
        if (error) {
          return;
        }
        readData = JSON.parse(data);
        const id =
          readData.length > 0
            ? Math.max(...readData.map((i) => Number(i._id))) + 1
            : 1;
        const response = {
          _id: id,
          issue_title,
          issue_text,
          created_on,
          updated_on,
          created_by,
          assigned_to,
          open: true,
          status_text,
        };
        readData = [...readData, response];
        writeFile(fname, JSON.stringify(readData, null, 2), (error) => {
          if (error) {
            // console.log("An error has occurred ", error);
            return;
          }
          //console.log("Data written successfully to disk");
        });
        res.json(response);
      });
    })

    .put(function (req, res) {
      let project = req.params.project;
      let fname = `./data/${project}.json`;

      const response = req.body;
      const id = response._id;
      if (!id) return (res.send = "{ error: 'missing _id' }");
      if (Object.values(response).filter((i) => i !== "").length <= 1) {
        return (res.send = `{ error: 'no update field(s) sent', '_id': ${id} }`);
      }
      fs.readFile(fname, "utf8", (error, data) => {
        if (error) {
          return (res.send = `{ error: 'could not update', '_id': ${id} }`);
        }
        let result = JSON.parse(data);
        result = result.map((i) =>
          i._id == id ? { ...i, ...response, updated_on: new Date() } : i
        );
        writeFile(fname, JSON.stringify(result, null, 2), (error) => {
          if (error) {
            return (res.send = `{ error: 'could not update', '_id': ${id} }`);
          }
          res.send(`{  result: 'successfully updated', '_id': ${id} }`);
        });
      });
    })
    .delete(function (req, res) {
      let project = req.params.project;
      let fname = `./data/${project}.json`;

      const response = req.body;
      const id = response._id;
      if (!id) return (res.send = "{ error: 'missing _id' }");

      fs.readFile(fname, "utf8", (error, data) => {
        if (error) {
          return (res.send = `{ error: 'could not delete', '_id': ${id} }`);
        }
        let result = JSON.parse(data);
        result = result.filter((i) => i._id != id);

        writeFile(fname, JSON.stringify(result, null, 2), (error) => {
          if (error) {
            return (res.send = `{ error: 'could not delete', '_id': ${id} }`);
          }
          res.send(`{ result: 'successfully deleted', '_id': ${id}}`);
        });
      });
    });
};
