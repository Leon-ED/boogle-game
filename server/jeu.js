require('dotenv').config();
const CWD = process.env.CWD;
const base = require('./base');



createGame = async function (req, res, next) {
    const uuid = require('uuid');
    const uuidv4 = uuid.v4();
    const conn = await base.getBase();
    const query = 'INSERT INTO partie (idPartie) VALUES (?)';
    const params = [uuidv4];
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
getGameFromUUID = async function (uuid) {
    const conn = await base.getBase();
    const query = 'SELECT * FROM partie WHERE idPartie = ?';
    const params = [uuid];

    conn.execute(query, params, function (err, rows) {
        if (err) {
            console.log(err);
            return false;
        }
        if (rows.length == 0)
            return false;
        return rows[0];
    }
    );

    await conn.end();
}
    


getGrille = function (req, res, next) {
    const exec = require('child_process').exec;
    const lignes = Math.max(2, req.params.lignes);
    const colonnes = Math.max(2, req.params.colonnes);

    exec('cd ' + CWD + '/bin && ./grid_build ../utils/frequences.txt ' + lignes + ' ' + colonnes, (err, stdout, stderr) => {
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
        return res.status(200).json({
            status: 'success',
            message: 'Recherche réussie.',
            grille: stdout,
            lignes: lignes,
            colonnes: colonnes
        });

    });



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
    verifMot: verifMot,
    createGame: createGame,
    getGameFromUUID: getGameFromUUID
}

