require('bcryptjs');
require('dotenv').config();
require('./auth');
require('./base');
const RateLimit = require('express-rate-limit');
require('./jeu');
const express = require('express');
const helmet = require('helmet');
const exec = require('child_process').execSync;
const bodyParser = require('body-parser');
const cors = require('cors');
const { createGameAPI } = require('./jeu');
const compte = require('./account');

const app = express();

const CWD = process.env.CWD;
const compression = require('compression');

app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(compression());


app.get('/', (req, res, next) => {
  res.send('Hello World!');
  next();
});

// dump request data
app.use((req, res, next) => {
  // console log IP
  console.log('========DEBUT REQ============');
  console.log('IP: ' + req.ip);
  console.log("Method: " + req.method);
  console.log("URL: " + req.url);
  console.log("Body: "+ JSON.stringify(req.body));
  // UA
  console.log("UA: " + req.headers['user-agent']);
  console.log('========FIN REQ============');
  next();
});



app.use(
  helmet.contentSecurityPolicy({
    directives: {
      'script-src': ['self', 'code.jquery.com', 'cdn.jsdelivr.net'],
    },
  })
);
// Apply rate limiter to all requests

app.get('/api/jeu/fetchAll/:uuid', getAllGamesFromUser);
app.get('/api/jeu/fetch/:uuid', getFullGame);
app.post('/api/auth/login', login);
app.post('/api/auth/logout', disconnect);
app.get('/api/jeu/grille/:lignes/:colonnes', APIgetGrille);
app.post('/api/jeu/verify', verifMot);
app.post('/api/auth/check', check);
app.post('/api/auth/register', register);
app.post('/api/jeu/create', createGameAPI);
app.post('/api/jeu/verifID', apiGetGameFromUUID);
app.post('/api/account/upload', compte.upload);
app.get('/api/account/get/image/:idUser', compte.getPicture);
app.get('/api/account/get/profile/:idUser', compte.getProfile);

app.get('/api/definitions/:mot', async (req, res) => {
  console.log('Recherche de définitions pour le mot ' + req.params.mot);
  const mot = req.params.mot.toUpperCase();
  let stdout = '';
  try {
    stdout = await exec('cd ' + CWD + '/bin && java -cp jdict.jar fr.uge.jdict.DictionarySearcher definitions ' + mot + ' ../utils/dictionary.index ../utils/definitions_fr.json').toString();
  } catch (err) {
    return res.status(400).json({ status: 'error', message: 'Mot introuvable.' });
  }

  return res.status(200).json({
    status: 'success',
    message: 'Recherche réussie.',
    definitions: stdout,
  });
});
module.exports = app;
