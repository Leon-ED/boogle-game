const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const cors = require('cors');
require('bcryptjs');
require('dotenv').config();
require('./auth');
require('./base');
require('./jeu');
const CWD = process.env.CWD;


app.use(cors());



app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());


app.get("/", (req, res, next) => {
    res.send("Hello World!");
    next();
});




app.post('/api/auth/login', login);
app.post("/api/auth/logout", disconnect);
app.get("/api/jeu/grille/:lignes/:colonnes", getGrille);
app.post("/api/jeu/verify", verifMot);
app.post("/api/auth/check", check);
app.post("/api/auth/register", register);
app.get("/api/jeu/create", createGame);






app.get("/api/definitions/:mot", (req, res, next) => {
    console.log('Recherche de définitions pour le mot ' + req.params.mot);
    const exec = require('child_process').exec;
    const mot = req.params.mot;
    exec('cd '+CWD+'/bin && java -cp jdict.jar fr.uge.jdict.DictionarySearcher definitions ' + mot + ' ../utils/dictionary.index ../utils/definitions_fr.json', (err, stdout, stderr) => {
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


