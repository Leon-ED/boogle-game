const mariadb = require('mariadb');
let base = null;
async function getBase() {
  const con = mariadb.createConnection({
    host: 'localhost',
    password: 'root',
    database: 'boogle',
    user: 'root'
  });
  const conn = con;

  return conn;
return base;
}
module.exports = {
  getBase
};


// generate a token with crypto
// const crypto = require('crypto');
// const token = crypto.randomBytes(64).toString('hex');
