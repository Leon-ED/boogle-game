const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const base = require('./base');
require('dotenv').config();
const mariadb = require('mariadb');
const { send } = require('process');




generateToken = function (user) {
  return crypto.randomBytes(64).toString('hex');
}



insertToken = async function (token, idUser) {
  await deleteUserToken(idUser);
  const conn = await base.getBase();
  const query = `INSERT INTO tokens (idUser, token, expiration) VALUES (?, ?, ?)`;
  const expiration = new Date(Date.now() + 2 * 24 * 60 * 60 * 1000);
  console.log(idUser);
  const ret = await conn.execute(query, [idUser, token, expiration]);
  console.log(ret);

}

deleteUserToken = async function (idUser) {
  let conn;
  conn = await base.getBase();
  const query = `DELETE FROM tokens WHERE idUser = ?`;
  await conn.execute(query, [idUser]);
  await conn.end();


}

check = async function (req, res, next) {
  const user = await returnUserFromToken(req.body.token);
  return (user == false ? res.status(401).json({ status: 'error', message: 'Token invalide' }) : res.status(200).json({ status: 'success', message: 'Token valide' }));
}


disconnect = async function (req, res, next) {
  let conn;
  try {
    conn = await base.getBase();
    const query = 'DELETE FROM tokens WHERE token = ?';
    const params = [req.headers.authorization];
    await conn.execute(query, params);
    conn.end();
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

function sendRes(res, status, code, message) {
  return res.status(code).json({
    status: status,
    message: message
  });
}


register = async function (req, res, next) {
  const conn = await getConnection();
  const login = req.body.login;
  const password = req.body.password;
  const password_confirm = req.body.password_confirm;
  const email = req.body.email;

  if (password != password_confirm) {
    conn.end();
    return sendRes(res, 'error', 400, 'Les mots de passe ne correspondent pas');
  }

  let query = 'SELECT * FROM utilisateur WHERE login = ? OR email = ?';
  let params = [login, email];
  let result = await conn.query(query, params);
  console.log(result);
  if (result.length > 0) {
    conn.end();
    return sendRes(res, 'error', 400, 'Ce login ou email est déjà utilisé');
  }

  const hashed_password = bcrypt.hashSync(password);
  query = 'INSERT INTO utilisateur (login, password, email,pseudoUser) VALUES (?,?,?,?)';
  params = [login, hashed_password, email, login];

  (await conn).execute(query, params);
  conn.end();
  return sendRes(res, 'success', 200, 'Inscription réussie');









}



login = async function (req, res, next) {
  let conn;
  try {
    conn = await base.getBase();
    const query = 'SELECT * FROM utilisateur WHERE login = ?';
    const params = [req.body.login];

    const result = await conn.execute(query, params);
    conn.end();
    if (result.length == 0) {
      res.status(400).json({
        status: 'error',
        message: 'Mot de passe ou identifiant incorrect 1'
      });
      return;
    }

    const password = req.body.password;
    const bddPassword = result[0].password;
    if (!bcrypt.compareSync(password, bddPassword)) {
      res.status(400).json({
        status: 'error',
        message: 'Mot de passe ou identifiant incorrect 2'
      });
      return;
    }

    const user = result[0];
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
  if(token == undefined || token == null)
    return false;
  try {
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
    conn.end();
    if (results.length == 0)
      return false;

    return results[0];
  } catch (err) {
    console.log(err);
    return false;
  }
}
module.exports = {
  login,
  returnUserFromToken,
  disconnect,
  check,
  register
};


