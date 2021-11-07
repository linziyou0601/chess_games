const sql = require("./db.js");

const createUserTableString = `CREATE TABLE IF NOT EXISTS reversi_users (
  id int(11) NOT NULL PRIMARY KEY AUTO_INCREMENT,
  name varchar(255) NOT NULL,
  password varchar(255) NOT NULL,
  win int(11) DEFAULT 0,
  lose int(11) DEFAULT 0,
  tie int(11) DEFAULT 0
);`
sql.query(createUserTableString, (err, res) => { console.log(res) });

// constructor
const User = function(user) {
  this.name = user.name;
  this.password = user.password;
  this.win = user.win || 0;
  this.lose = user.lose || 0;
  this.tie = user.tie || 0;
};

User.findAll = result => {
  sql.query("SELECT * FROM reversi_users ORDER BY win desc, lose asc", (err, res) => {
    if (err) {
      console.log("error: ", err);
      result(null, err);
      return;
    }

    result(null, res);
  });
};

User.findByName = (userName, result) => {
  sql.query(`SELECT * FROM reversi_users WHERE name = ?`, [userName], (err, res) => {
    if (err) {
      console.log("error: ", err);
      result(err, null);
      return;
    }

    if (res.length) {
      result(null, res[0]);
      return;
    }

    result({ message: "not_found" }, null);
  });
};

User.create = (newUser, result) => {
  sql.query("INSERT INTO reversi_users SET ?", newUser, (err, res) => {
    if (err) {
      console.log("error: ", err);
      result(err, null);
      return;
    }

    result(null, { id: res.insertId, ...newUser });
  });
};

User.updateGameResult = (gameResult, result) => {
  sql.query(
    "UPDATE reversi_users SET win = win + ?, lose = lose + ?, tie = tie + ? WHERE name = ?", 
    [gameResult.win, gameResult.lose, gameResult.tie, gameResult.name],
    (err, res) => {
      if (err) {
        console.log("error: ", err);
        result(null, err);
        return;
      }

      if (res.affectedRows == 0) {
        // not found User with the id
        result({ kind: "not_found" }, null);
        return;
      }

      result(null, { status: 'ok' });
    }
  );
};

module.exports = User;