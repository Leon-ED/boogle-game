const jwt = require('jsonwebtoken');
const base = require('./base');
require('dotenv').config();


generateToken = function(user) {
    return jwt.sign({ 
        id: user.idUser,
        login: user.login,
        email: user.email

    }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN
    });
}

insertToken = function(token, idUser) {
    deleteUserToken(idUser);
    const connection = base.getBase();
    var expiration = new Date(jwt.decode(token).exp * 1000);
    expiration = expiration.getFullYear() + '-' + (expiration.getMonth() + 1) + '-' + expiration.getDate() + ' ' + expiration.getHours() + ':' + expiration.getMinutes() + ':' + expiration.getSeconds();
    connection.query(`INSERT INTO tokens (token, idUser,expiration) VALUES ('${token}', '${idUser}', '${expiration}')`, (err, result) => {
        if (err) {
            console.log(err);

            return false;
        }
        return true;
    });
    connection.end();
}

 deleteUserToken = function(idUser) {
    const connection = base.getBase();
    connection.query(`DELETE FROM tokens WHERE idUser = '${idUser}'`, (err, result) => {
        if (err) {
            return false;
        }
        return true;
    });
    connection.end();

}




module.exports = {
    generateToken,
    insertToken,
    deleteUserToken
}
