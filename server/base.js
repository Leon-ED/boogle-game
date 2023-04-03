const mariadb = require('mariadb');
require('dotenv').config();


async function getBase() {
  const conn = mariadb.createConnection({
    host: process.env.DB_HOST,
    password: process.env.DB_PWD,
    database: process.env.DB_NAME,
    user: process.env.DB_USR
  },
  {
    multipleStatements: true
});
  return conn;
}
module.exports = {
  getBase
};
