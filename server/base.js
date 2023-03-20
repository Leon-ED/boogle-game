const mariadb = require('mariadb');
let base = null;
async function getBase() {
  console.log('getBase');
  if(base) return base;
  base = await mariadb.createPool({
    host: 'localhost',
    password: 'root',
    database: 'boogle',
    user: 'root',
}
);
return base;
}
module.exports = {
  getBase
};


// generate a token with crypto
// const crypto = require('crypto');
// const token = crypto.randomBytes(64).toString('hex');
