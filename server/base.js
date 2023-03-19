const mariadb = require('mariadb');

async function getBase() {
  const pool = mariadb.createPool({
    host: 'localhost',
    user: 'root',
    password: 'root',
    database: 'boogle'
  });

  const conn = await pool.getConnection();
  return conn;
}

module.exports = {
  getBase
};
