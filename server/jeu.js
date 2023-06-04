require('dotenv').config();
const CWD = process.env.CWD;
const base = require('./base');

createGame = async function (token = null, user = null) {
    console.log('createGame: création d\'une partie en BDD (params: token=' + token + ', user=' + user + ')');
    if (token == null && user == null)
        return false;

    if (user == null)
        user = await returnUserFromToken(token);
    if (!user)
        return false;


    const uuid = require('uuid');
    const uuidv4 = uuid.v4();

    const idUser = user.idUser;
    const conn = await base.getBase();
    const query = 'INSERT INTO partie (idPartie,gameAdmin) VALUES (?,?)';
    const params = [uuidv4, idUser];
    const result = await conn.execute(query, params);
    await conn.end();
    if (result.length == 0)
        return false;

    return uuidv4;

}

createGameAPI = async function (req, res, next) {
    const token = req.body.token;
    const result = await createGame(token);
    if (result == false)
        return res.status(400).json({
            status: 'error',
            message: 'Une erreur est survenue lors de la création de la partie.'
        });

    return res.status(200).json({
        status: 'success',
        message: 'Partie créée.',
        uuid: result
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
    if (user != false && user.idUser == game.gameAdmin)
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

getGrille = function (lignes, colonnes) {
    const exec = require("child_process").execSync;
    lignes = Math.max(2, lignes);
    colonnes = Math.max(2, colonnes);

    const result = exec('cd ' + CWD + '/bin && ./grid_build ../utils/frequences.txt ' + lignes + ' ' + colonnes).toString();
    const grille = result
    return grille;

}

preVerifMot = function (mot, lignes, colonnes) {

    if (mot.length > lignes * colonnes)
        return false;
    if (mot.length < 2)
        return false;
    if (!/^[a-zA-Z]+$/.test(mot))
        return false;
    return true;
}




solveGrille = async function (grille, lignes, colonnes) {
    const MIN_WORD_LENGTH = 2;
    const command = 'cd ' + CWD + '/bin && ./solve ../utils/dico_fr.lex '+MIN_WORD_LENGTH+ " " + lignes + ' ' + colonnes + ' ' + grille;
    const exec = require("child_process").execSync;
    const result = await exec(command).toString();
    return result.split(' ');



}


verifMot = async function (req, res, next) {

    const exec = require("child_process").execSync;
    const { mot, grille, lignes, colonnes, langue } = req.body;
    if (!preVerifMot(mot, lignes, colonnes))
        return res.status(400).json({ status: 'error', message: 'Le mot ne peut pas être recherché' });
    if (!grille || !lignes || !colonnes || !langue)
        return res.status(400).json({ status: 'error', message: 'Erreur dans les paramètres fournis' });


    const cmd = 'cd ' + CWD + '/bin && ./grid_path ' + mot.toUpperCase() + ' ' + lignes + ' ' + colonnes + ' ' + grille;
    const result = await exec(cmd).toString();
    if (result == 1) {
        return res.status(200).json({ status: 'error', message: 'Le mot n\'est pas dans la grille' });

    }
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
                message: 'Le mot n\'existe pas dans le dictionnaire.',
            });
        });
    } catch (e) {
        console.log(e);
    }

}


getAllGamesFromUser = async function (req, res) {
    const token = req.params.uuid;
    const sql = "SELECT idPartie FROM jouer WHERE idUser = ?";
    const conn = await base.getBase();
    const result = await conn.execute(sql, [token]);
    if (result.length == 0)
        return res.status(400).json({ status: 'error', message: 'Aucune partie trouvée.' });
    const games = result;
    const fullGames = [];

    const sql2 = `
    SELECT P.*, 
    (SELECT GROUP_CONCAT(DISTINCT U.idUser SEPARATOR ',') 
     FROM jouer U
     WHERE P.idPartie = ?) AS users
    FROM partie P
    WHERE P.idPartie = ?;`;

    for (let i = 0; i < games.length; i++) {
        const game = games[i];
        const result2 = await conn.execute(sql2, [game.idPartie, game.idPartie]);
        if (result2.length == 0)
            continue;
        const fullGame = result2[0];
        fullGames.push(fullGame);
    }
    await conn.end();
    return res.status(200).json({ status: 'success', message: 'Parties trouvées.', games: fullGames });

}
        


 getFullGame = async function (req, res) {
    const uuid = req.params.uuid;

    const sql = `
    SELECT P.*, 
    (SELECT GROUP_CONCAT(DISTINCT U.idUser SEPARATOR ',') 
     FROM jouer U
     WHERE P.idPartie = ?) AS users
    FROM partie P
    WHERE P.idPartie = ?;`;
    const conn = await base.getBase();
    const result = await conn.execute(sql, [uuid, uuid]);
    const jsonGrille = JSON.parse(result[0].Grille);
    const stringGrille = jsonGrille.join(' ').replaceAll(',', ' ');

    const [lignes, colonnes] = result[0].dimensionsGrille.split('x');
    const solveur = await solveGrille(stringGrille, lignes,colonnes);
    result[0].solveur = solveur;
    if (result.length == 0)
        return res.status(400).json({ status: 'error', message: 'La partie n\'existe pas.' });
    const game = result[0];
    return res.status(200).json({ status: 'success', message: 'Partie trouvée.', game: game });        




}




module.exports = {
    getGrille: getGrille,
    APIgetGrille: APIgetGrille,
    verifMot: verifMot,
    createGameAPI: createGameAPI,
    createGame: createGame,
    getGameFromUUID: getGameFromUUID,
    apiGetGameFromUUID: apiGetGameFromUUID,
    solve: solveGrille,
    preVerifMot,
    getFullGame,
    getAllGamesFromUser
}

