const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const cors = require('cors');
const { getGameFromUUID, createGameAPI } = require('./jeu');
require('bcryptjs');
require('dotenv').config();
require('./auth');
require('./base');
require('./jeu');
const compte = require('./account');
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
app.get("/api/jeu/grille/:lignes/:colonnes", APIgetGrille);
app.post("/api/jeu/verify", verifMot);
app.post("/api/auth/check", check);
app.post("/api/auth/register", register);
app.post("/api/jeu/create", createGameAPI);
app.post("/api/jeu/verifID", apiGetGameFromUUID);
app.post("/api/account/upload", compte.upload);
app.get("/api/account/get/image/:idUser", compte.getPicture);
app.get("/api/account/get/profile/:idUser", compte.getProfile);





app.get("/api/definitions/:mot", async (req, res, next) => {
    console.log('Recherche de définitions pour le mot ' + req.params.mot);
    const exec = require('child_process').execSync;
    const mot = req.params.mot.toUpperCase();
    let stdout = '';
    try {
        stdout = await exec('cd ' + CWD + '/bin && java -cp jdict.jar fr.uge.jdict.DictionarySearcher definitions ' + mot + ' ../utils/dictionary.index ../utils/definitions_fr.json').toString();
    } catch (err) {
        console.log(err);
        res.status(404).json({
            status: 'error',
            message: 'Erreur lors de la recherche de définitions.'
        });
        next();
    }

    res.status(200).json({
        status: 'success',
        message: 'Recherche réussie.',
        definitions: stdout
    });



});


module.exports = app;


