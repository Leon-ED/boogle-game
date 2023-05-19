require('dotenv').config();
const CWD = process.env.CWD;
const base = require('./base');



createGame = async function (req, res, next) {
    const uuid = require('uuid');
    const uuidv4 = uuid.v4();
    const user = await returnUserFromToken(req.body.token);
    console.log(user);
    if (user == false)
        return res.status(500);
    const idUser = user.idUser;
    const conn = await base.getBase();
    const query = 'INSERT INTO partie (idPartie,gameAdmin) VALUES (?,?)';
    const params = [uuidv4, idUser];
    conn.query(query, params, function (err, rows) {
        if (err) {
            console.log(err);
            return res.status(400).json({
                status: 'error',
                message: 'Une erreur est survenue lors de la création de la partie.'
            });
        }
    });
    conn.end();
    return res.status(200).json({
        status: 'success',
        message: 'Partie créée.',
        uuid: uuidv4
    });
}
getGameFromUUID = async function (uuid, token = undefined) {
    const conn = await base.getBase();
    const query = 'SELECT * FROM partie WHERE idPartie = ?';
    const params = [uuid];

    const result = await conn.execute(query, params);
    const user = await returnUserFromToken(token);


    if (result.length == 0) {
        conn.end();
        return false;
    }
    const game = result[0];
    if(user != false && user.idUser == game.gameAdmin)
        game.admin = true;
    else
        game.admin = false;

    await conn.end();
    return game;

}

apiGetGameFromUUID = async function (req, res, next) {
    const game = await getGameFromUUID(req.body.uuid, req.body.token);
    if (game == false)
        return res.status(400).json({
            status: 'error',
            message: 'La partie n\'existe pas.'
        });
    return res.status(200).json({
        status: 'success',
        message: 'Partie trouvée.',
        game: game
    });
}




APIgetGrille = async function (req, res, next) {
    const lignes = Math.max(2, req.params.lignes);
    const colonnes = Math.max(2, req.params.colonnes);
    const grille = await getGrille(lignes, colonnes);

    if (!grille)
        return res.status(400).json({
            status: 'error',
            message: 'Une erreur est survenue lors de la création de la grille.'
        });

    return res.status(200).json({
            status: 'success',
            message: 'Recherche réussie.',
            grille: grille.replace(/\n/g, ''),
            lignes: lignes,
            colonnes: colonnes
    });


   



}

getGrille =  function (lignes,colonnes) {
    const exec = require("child_process").execSync;
    lignes = Math.max(2, lignes);
    colonnes = Math.max(2, colonnes);

    const result = exec('cd ' + CWD + '/bin && ./grid_build ../utils/frequences.txt ' + lignes + ' ' + colonnes).toString();
    const grille = result
    return grille;
    
}


function preVerifMot(mot,lignes,colonnes){

    if (mot.length > lignes * colonnes)
        return false;
    if (mot.length < 2)
        return false;
    if (!/^[a-zA-Z]+$/.test(mot))
        return false;
    return true;
}


verifMot = function (req, res, next) {

    const exec = require('child_process').exec;
    const { mot, grille, lignes, colonnes, langue } = req.body;
    if(!preVerifMot(mot,lignes,colonnes))
        return res.status(400).json({ status: 'error', message: 'Le mot ne peut pas être recherché.' });

    const cmd = 'cd ' + CWD + '/bin && ./grid_path ' + mot.toUpperCase() + ' ' + lignes + ' ' + colonnes + ' ' + grille;
    exec(cmd, (err, stdout, stderr) => {
        if (err) {
            console.error(err);
            return res.status(400).json({
                status: 'error',
                message: 'Une erreur est survenue lors de la recherche.'
            });

        }
        if (stderr) {
            console.error(stderr);
            return res.status(400).json({
                status: 'error',
                message: 'Une erreur est survenue lors de la recherche.'
            });

        }

    });

    const exec2 = require('child_process').exec;
    const cmd2 = 'cd ' + CWD + '/bin && ./dictionnary_lookup ../utils/dico_fr.lex ' + mot.toUpperCase();
    try {
        exec2(cmd2, (err, stdout, stderr) => {

            if (stdout == "0")
                return res.status(200).json({
                    status: 'success',
                    message: 'Recherche réussie.',
                });
            return res.status(400).json({
                status: 'error',
                message: 'Recherche réussie.',
            });
        });
    } catch (e) {
        console.log(e);
    }

}







module.exports = {
    getGrille: getGrille,
    APIgetGrille: APIgetGrille,
    verifMot: verifMot,
    createGame: createGame,
    getGameFromUUID: getGameFromUUID,
    apiGetGameFromUUID:apiGetGameFromUUID
}

