const express = require('express');
const app = express();
const bcrypt = require('bcryptjs');
const sql = require("./db.js");
const User = require("./user.model.js");

app.use(express.json());

const createUserTableString = `CREATE TABLE IF NOT EXISTS users (
  id int(11) NOT NULL PRIMARY KEY AUTO_INCREMENT,
  name varchar(255) NOT NULL,
  password varchar(255) NOT NULL,
  win int(11) DEFAULT 0,
  lose int(11) DEFAULT 0,
  tie int(11) DEFAULT 0
);`
sql.query(createUserTableString, (err, res) => {});

app.get('/', (req, res) => {
  res.json({
    status: 'ok'
  })
})

app.post('/findAll', (req, res) => {
  User.findAll((err, data) => {
    if (err)
      res.status(500).send({
        message: err.message || "Some error occurred while retrieving users."
      });
    else res.send(data);
  });
})

app.post('/signUpOrSignIn', (req, res) => {
  reqBody = req.body
  User.findByName(reqBody.name, (err, existUser) => {
    if (err) {
      if (err.message === 'not_found') {
        const user = new User({
          name: reqBody.name,
          password: bcrypt.hashSync(reqBody.password, 10),
        });
        User.create(user, (err, newUser) => {
          if (err)
            res.status(500).json({
              message: err.message || "Some error occurred while creating the User."
            });
          else res.json({ valid: true, user: newUser});
        });
      } else {
        res.status(500).json({
          message: err.message || "Some error occurred while retrieving users."
        });
      }
    } else {
      if (bcrypt.compareSync(reqBody.password, existUser.password)) res.json({ valid: true, user: existUser});
      else res.json({ valid: false, user: null});
    }
  });
})

app.post('/findByName', (req, res) => {
  reqBody = req.body
  User.findByName(reqBody.name, (err, user) => {
    if (err) {
      res.status(500).json({
        message: err.message || "Some error occurred while creating the User."
      });
    } else {
      res.json(user);
    }
  });
})

app.post('/updateGameResult', (req, res) => {
  reqBody = req.body
  User.updateGameResult(reqBody, (err, data) => {
    if (err)
      res.status(500).json({
        message: err.message || "Some error occurred while updating the User."
      });
    else res.json(data);
  });
})

module.exports = {
  path: 'api',
  handler: app
}