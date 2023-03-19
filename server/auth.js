const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const base = require('./base');
require('dotenv').config();


generateToken = function (user) {
    return jwt.sign({
        id: user.idUser,
        login: user.login,
        email: user.email

    }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN
    });
}

insertToken = async function (token, idUser) {
    deleteUserToken(idUser);
    let conn;
    conn = await base.getBase();
    const query = `INSERT INTO tokens (idUser, token,expiration) VALUES (?, ?,?)`;
    var expiration = new Date(jwt.decode(token).exp * 1000);
    expiration = expiration.getFullYear() + '-' + (expiration.getMonth() + 1) + '-' + expiration.getDate() + ' ' + expiration.getHours() + ':' + expiration.getMinutes() + ':' + expiration.getSeconds();
    await conn.execute(query, [idUser, token, expiration]);
    conn.end();
}

deleteUserToken = async function (idUser) {
    let conn;
    conn = await base.getBase();
    const query = `DELETE FROM tokens WHERE idUser = ?`;
    await conn.execute(query, [idUser]);
    conn.end();


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
    } finally {
        if (conn) conn.end();
    }
}





login = async function(req, res, next) {
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
    } finally {
      if (conn) conn.end();
    }
  };
  
  module.exports = {
    login,
    disconnect
  };