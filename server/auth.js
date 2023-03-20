const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const base = require('./base');
require('dotenv').config();
const mariadb = require('mariadb');
generateToken = function (user) {
  return crypto.randomBytes(64).toString('hex');
}

insertToken = async function (token, idUser) {
  deleteUserToken(idUser);
  const con = mariadb.createConnection({
    host: 'localhost',
    password: 'root',
    database: 'boogle',
    user: 'root'
  });
  const conn = con;

  




  const query = `INSERT INTO tokens (idUser, token,expiration) VALUES (?, ?,?)`;
  // expire in 2days
  const expiration = new Date(Date.now() + 2 * 24 * 60 * 60 * 1000);
  expiration.toISOString().slice(0, 19).replace('T', ' ');
  console.log(idUser);





  await (await conn).query(query, [idUser, token, expiration]);


}

deleteUserToken = async function (idUser) {
  let conn;
  conn = await base.getBase();
  const query = `DELETE FROM tokens WHERE idUser = ?`;
  await conn.execute(query, [idUser]);


}

check = async function(req, res, next) {
  const user = await returnUserFromToken(req.body.token);
  return user == false ? res.status(401).json({status: 'error', message: 'Token invalide'}) : res.status(200).json({status: 'success', message: 'Token valide'});
}  


disconnect = async function (req, res, next) {
  let conn;
  try {
    conn = await base.getBase();
    const query = 'DELETE FROM tokens WHERE token = ?';
    const params = [req.headers.authorization];
    await conn.execute(query, params);
    res.status(200).json({
      status: 'success',
      message: 'Déconnexion réussie.'
    });
  } catch (err) {
    console.log(err);
    res.status(400).json({
      status: 'error',
      message: 'Une erreur est survenue lors de la déconnexion'
    });
  } 
}





login = async function (req, res, next) {
  let conn;
  try {
    conn = await base.getBase();
    const query = 'SELECT * FROM utilisateur WHERE login = ?';
    const params = [req.body.login];

    const result = await conn.execute(query, params);
    if (result.length == 0) {
      res.status(400).json({
        status: 'error',
        message: 'Mot de passe ou identifiant incorrect 1'
      });
      return;
    }

    const password = req.body.password;
    const bddPassword = result[0].password;
    console.log(bddPassword);
    console.log(password);
    if (!bcrypt.compareSync(password, bddPassword)) {
      res.status(400).json({
        status: 'error',
        message: 'Mot de passe ou identifiant incorrect 2'
      });
      return;
    }

    const user = result[0];
    console.log(user);
    const token = generateToken(user);
    insertToken(token, user.idUser);
    res.status(200).json({
      status: 'success',
      message: 'Authentification réussie.',
      token: token
    });
  } catch (err) {
    console.log(err);
    res.status(400).json({
      status: 'error',
      message: 'Une erreur est survenue lors de la connexion'
    });
  } 
};



returnUserFromToken = async function (token) {
  let conn;
  try{
  conn = await base.getBase();
  let query = `SELECT * FROM tokens WHERE token = ? AND expiration > NOW()`;
  let params = [token];

  let results = await conn.query(query, params);
  if (results.length == 0 || results.length > 1) {
    return false;
  }
  const idUser = results[0].idUser;
  query = `SELECT * FROM utilisateur WHERE idUser = ?`;
  params = [idUser];
  results = await conn.query(query, params);
  if (results.length == 0)
    return false;
  
  return results[0];
  }catch(err){
    console.log(err);
    return false;
  }
}
module.exports = {
  login,
  returnUserFromToken,
  disconnect,
  check
};


