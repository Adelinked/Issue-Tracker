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
          //res.json({ error: `${project} project doesn't exist` });
          //return;
          let emptyArr = [];
          writeFile(fname, JSON.stringify(emptyArr, null, 2), (errorWr) => {
            if (errorWr) {
              // console.log("An error has occurred ", error);
              return;
            }
            //console.log("Data written successfully to disk");
          });
          res.json([]);
          return;
        }
        let result = JSON.parse(data);

        result =
          Object.keys(query).length === 0
            ? result
            : result.filter((i) => eval(filter));
        res.json(result);
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
      if (!issue_title || !issue_text || !created_by) {
        res.json({ error: "required field(s) missing" });
        return;
      }

      const created_on = new Date();
      const updated_on = created_on;
      const open = true;

      let readData = [];
      const newResponse = {
        assigned_to,
        status_text,
        open: true,
        _id: "1",
        issue_title,
        issue_text,
        created_by,
        created_on,
        updated_on,
      };
      const newArr = [].push(newResponse);
      fs.readFile(fname, "utf8", (error, data) => {
        if (error) {
          writeFile(fname, JSON.stringify(newArr, null, 2), (errorWr) => {
            if (errorWr) {
              // console.log("An error has occurred ", error);
              return;
            }
            //console.log("Data written successfully to disk");
          });
          res.json(newArr);

          return;
        }
        readData = JSON.parse(data);
        const id =
          readData.length > 0
            ? String(Math.max(...readData.map((i) => Number(i._id))) + 1)
            : "1";
        const response = {
          assigned_to,
          status_text,
          open: true,
          _id: String(id),
          issue_title,
          issue_text,
          created_by,
          created_on,
          updated_on,
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
      if (!id) {
        res.json({ error: "missing _id" });
        return;
      }

      if (Object.values(response).filter((i) => i !== "").length <= 1) {
        res.json({ error: "no update field(s) sent", _id: id });
        return;
      }

      fs.readFile(fname, "utf8", (error, data) => {
        if (error) {
          res.json({ error: "could not update", _id: id });
          return;
        }
        let result = JSON.parse(data);

        if (result.filter((i) => i._id == id).length < 1) {
          res.json({ error: "could not update", _id: id });
          return;
        }
        result = result.map((i) =>
          i._id == id ? { ...i, ...response, updated_on: new Date() } : i
        );
        writeFile(fname, JSON.stringify(result, null, 2), (error) => {
          if (error) {
            res.json({ error: "could not update", _id: id });
            return;
          }
          res.json({ result: "successfully updated", _id: id });
        });
      });
    })
    .delete(function (req, res) {
      let project = req.params.project;
      let fname = `./data/${project}.json`;

      const response = req.body;
      const id = response._id;
      if (!id) {
        res.json({ error: "missing _id" });
        return;
      }

      fs.readFile(fname, "utf8", (error, data) => {
        if (error) {
          res.json({ error: "could not delete", _id: id });
          return;
        }
        let result = JSON.parse(data);
        if (result.filter((i) => i._id == id).length < 1) {
          res.json({ error: "could not delete", _id: id });
          return;
        }
        result = result.filter((i) => i._id != id);

        writeFile(fname, JSON.stringify(result, null, 2), (error) => {
          if (error) {
            res.json({ error: "could not delete", _id: id });
            return;
          }
          res.json({ result: "successfully deleted", _id: id });
        });
      });
    });
};
