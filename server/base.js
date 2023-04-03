const mariadb = require('mariadb');
let base = null;

require('dotenv').config();
const CWD = process.env.CWD;

async function getBase() {
  const con = mariadb.createConnection({
    host: process.env.DB_HOST,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
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
