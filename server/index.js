const express = require('express');
const app = express();
const bcrypt = require('bcryptjs');
const ReversiUser = require("./reversi_users.model.js");
const ChineseDarkChessUser = require("./ch_dark_chess_users.model.js");

app.use(express.json());

app.get('/', (req, res) => {
  res.json({
    status: 'ok'
  })
})

// ============================== Reversi ==============================
app.post('/Reversi/findAll', (req, res) => {
  ReversiUser.findAll((err, data) => {
    if (err)
      res.status(500).send({
        message: err.message || "Some error occurred while retrieving users."
      });
    else res.send(data);
  });
})

app.post('/Reversi/signUpOrSignIn', (req, res) => {
  reqBody = req.body
  ReversiUser.findByName(reqBody.name, (err, existUser) => {
    if (err) {
      if (err.message === 'not_found') {
        const user = new ReversiUser({
          name: reqBody.name,
          password: bcrypt.hashSync(reqBody.password, 10),
        });
        ReversiUser.create(user, (err, newUser) => {
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

app.post('/Reversi/findByName', (req, res) => {
  reqBody = req.body
  ReversiUser.findByName(reqBody.name, (err, user) => {
    if (err) {
      res.status(500).json({
        message: err.message || "Some error occurred while creating the User."
      });
    } else {
      res.json(user);
    }
  });
})

app.post('/Reversi/updateGameResult', (req, res) => {
  reqBody = req.body
  ReversiUser.updateGameResult(reqBody, (err, data) => {
    if (err)
      res.status(500).json({
        message: err.message || "Some error occurred while updating the User."
      });
    else res.json(data);
  });
})

// ============================== Chinese Dark Chess ==============================
app.post('/ChineseDarkChess/findAll', (req, res) => {
  ChineseDarkChessUser.findAll((err, data) => {
    if (err)
      res.status(500).send({
        message: err.message || "Some error occurred while retrieving users."
      });
    else res.send(data);
  });
})

app.post('/ChineseDarkChess/signUpOrSignIn', (req, res) => {
  reqBody = req.body
  ChineseDarkChessUser.findByName(reqBody.name, (err, existUser) => {
    if (err) {
      if (err.message === 'not_found') {
        const user = new ChineseDarkChessUser({
          name: reqBody.name,
          password: bcrypt.hashSync(reqBody.password, 10),
        });
        ChineseDarkChessUser.create(user, (err, newUser) => {
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

app.post('/ChineseDarkChess/findByName', (req, res) => {
  reqBody = req.body
  ChineseDarkChessUser.findByName(reqBody.name, (err, user) => {
    if (err) {
      res.status(500).json({
        message: err.message || "Some error occurred while creating the User."
      });
    } else {
      res.json(user);
    }
  });
})

app.post('/ChineseDarkChess/updateGameResult', (req, res) => {
  reqBody = req.body
  ChineseDarkChessUser.updateGameResult(reqBody, (err, data) => {
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