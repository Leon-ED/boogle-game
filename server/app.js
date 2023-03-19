const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const cors = require('cors');
const bcrypt = require('bcryptjs');
require('dotenv').config();
const auth = require('./auth');
const base = require('./base');

app.use(cors());



app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());


app.get("/", (req, res, next) => {
    res.send("Hello World!");
    next();
});



app.use('/api/auth/check', (req, res, next) => {

    console.log('Auth check successfful!');
    res.status(200).json({
        status : 'success',
        message: 'Auth check successful!EE'
    });
    next();

});

app.use('/api/auth/login', (req, res, next) => {
    if (!req.body.hasOwnProperty('login') || !req.body.hasOwnProperty('password')) {
        res.status(400).json({
            status: 'error',
            message: 'Bad request!'
        });
        next();
        return;
    }
    const login = req.body.login;
    const password = req.body.password;
    const connection = base.getBase();
    connection.query('SELECT * FROM utilisateur WHERE login = ?', [login], (err, rows, fields) => {
        if (err) {
            console.log(err);
            console.log("Error in query!");
            res.status(500).json({
                status: 'error',
                message: 'Error in query!'
            });
            return;
        }
        if (rows.length < 1) {
            console.log("Mot de passe ou identifiant incorrect");
            res.status(401).json({
                status: 'error',
                message: 'Mot de passe ou identifiant incorrect'
            });
            return;
        }
        if (!bcrypt.compareSync(password, rows[0].password)) {
            console.log("Mot de passe ou identifiant incorrect");
            res.status(401).json({
                status: 'error',
                message: 'Mot de passe ou identifiant incorrect'
            });
            return;
        }
        const user = rows[0];
        const token = auth.generateToken(user);
        console.log(user.idUser);
        if (auth.insertToken(token, user.idUser) === false) {
            res.status(500).json({
                status: 'error',
                message: 'Une erreur est survenue lors de la connexion.'
            });
            return;
        }
        res.status(200).json({
            status: 'success',
            message: 'Connexion réussie.',
            token: token
        });
        next();

    });
});



app.use("/api/auth/logout", (req, res, next) => {
    console.log('Logout successful!');
    res.status(200).json({
        status : 'success',
        message: 'Logout successful!'
    });
    next();
});

app.get("/api/definitions/:mot", (req, res, next) => {
    console.log('Recherche de définitions pour le mot ' + req.params.mot);
    const exec = require('child_process').exec;
    const mot = req.params.mot;
    exec('cd /usr/src/app/bin && java -cp jdict.jar fr.uge.jdict.DictionarySearcher definitions ' + mot + ' ../utils/dictionary.index ../utils/definitions_fr.json', (err, stdout, stderr) => {
        if (err) {
            console.error(err);
            res.status(400).json({
                status: 'error',
                message: 'Une erreur est survenue lors de la recherche.'
            });
            return;
        }
        if (stderr) {
            console.error(stderr);
            res.status(400).json({
                status: 'error',
                message: 'Une erreur est survenue lors de la recherche.'
            });
            return;
        }
        res.status(200).json({
            status: 'success',
            message: 'Recherche réussie.',
            definitions: stdout
        });



        next();
    });});


    module.exports = app;


