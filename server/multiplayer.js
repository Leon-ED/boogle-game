const WebSocket = require('ws');
const auth = require('./auth');
const jeu = require('./jeu');
const base = require('./base');

const games = {};
const seekers = {};

initMultiplayer = function (server) {
    const wss = new WebSocket.Server({ noServer: true });




    // Attribue un id unique à un utilisateur
    wss.getUniqueID = function () {
        function s4() {
            return Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
        }
        return s4() + s4() + '-' + s4();
    };

    const interval = setInterval(function ping() {
        wss.clients.forEach(function each(ws) {
            //console.log("On teste si le client est alive");
            if (ws.isAlive === false) { return ws.terminate(); }
            ws.isAlive = false;
            ws.ping();
        });
    }, 1000);



    // A chaque connexion,
    wss.on('connection', (ws) => {
        ws.isAlive = true;
        ws.on('error', console.error);
        ws.on('pong', heartbeat);
        console.log("Nouvelle connexion");
        ws.id = wss.getUniqueID();



        ws.on('message', async (packet) => {
            const message = JSON.parse(packet);


            if (!ws.user) {
                const user = await auth.returnUserFromToken(message.token);
                if (!user) {
                    console.log("L'utilisateur n'est pas connecté");
                    return;
                }
                ws.user = user;
            }


            switch (message.type) {
                case 'seek': // Gère les joueurs en recherche de parties 
                    return handleSeek(ws, message);

                case 'new_game': // Gère la création d'une partie
                    return handleNewGame(ws, message);
                case 'join': // Gère la connexion à une partie
                    return handleJoin(ws, message);
                case 'rejoin': // Gère la reconnexion à une partie
                    return handleRejoin(ws, message);
                case 'leave': // Gère la déconnexion d'une partie (non implémenté)
                    return handleLeave(ws, message);
                case 'guess': // Gère la proposition d'un mot
                    return handleGuess(ws, message);
                case 'start': // Gère le démarrage d'une partie
                    return handleStart(ws, message);
                case 'settings': // Gère les le changeement des paramètres d'une partie
                    return handleSettings(ws, message);
            }


        });

        ws.on('close', (ws) => {
            console.log("On ferme la connexion");
            clearInterval(interval);
        });

    });
    return wss;
}

/**
 *  Gère la fin d'une partie (déconnexion d'un joueur, fin du temps, ...)
 * @param {*} game  - Partie en cours
 */
function handleEnd(game) {
    console.log("handleEnd : Fin de la partie");
    // On met le statut à jour et on notifie tous les joueurs
    game.statut = "ended";
    sendToAllPlayers(game.players, { type: 'end', scores: game.settings.foundWords });
    // On redirige tous les joueurs vers la page de récapitulatif de la partie
    sendRedirect(game.players[0], "/recap/" + game.id);
    game.winnerID = game.adminID;
    game.startTime = new Date().toISOString().slice(0, 19).replace('T', ' ');
    // On supprime la partie de la liste des parties du WS
    delete games[game.id];
    saveGameToDB(game);
}

/**
 * Gère la proposition d'un mot par un joueur
 * @param {*} ws - Client qui a envoyé la proposition
 * @param {*} message - Message contenant le mot proposé
 */

function handleGuess(ws, message) {
    // On récupère la partie et le mot 
    const guess = message.word.toUpperCase();
    const game = games[message.gameID];
    // Impossible de faire une proposition si la partie n'existe pas
    if (!game) {
        console.log("handleGuess : La partie n'existe pas");
        return;
    }
    console.log("handleGuess : Le mot proposé est : " + guess + " par : " + ws.user.pseudoUser + "(" + ws.user.idUser + ")");


    // On vérifie premièrement si le mot est valide pour la recherche
    if (!jeu.preVerifMot(guess, game.settings.grille)) {
        console.log("handleGuess : Le mot n'est pas valide pour la recherche");
        return ws.send(JSON.stringify({
            type: 'guess',
            status: 'invalid',
            message: 'Le mot n\'est pas valide pour la recherche.'
        }));

    }
    // Ensuite, si le mot est dans la grille
    if (!game.word_list.includes(guess)) {
        console.log("handleGuess : Le mot n'est pas dans la liste du solveur");
        return ws.send(JSON.stringify({
            type: 'guess',
            status: 'invalid',
            message: 'Le mot n\'est pas dans la liste.'
        }));
    }


    // Si le mot de blocage des mots est activé alors on vérifie si le mot a déjà été trouvé dans par un des joueurs
    if (game.settings.bloquer) {
        console.log("handleGuess : Le mode bloquer (mots uniques) est activé");
        game.players.forEach((player) => {
            if (game.settings.foundWords[player.user.idUser].includes(guess)) {
                console.log("handleGuess : Le mot a déjà été trouvé par un joueur");
                return ws.send(JSON.stringify({
                    type: 'guess',
                    status: 'invalid',
                    message: 'Le mot a déjà été trouvé par un joueur.'
                }));
            }
        });
        // Si le mot n'a pas été trouvé, on l'ajoute à la liste des mots trouvés du joueur
        console.log("handleGuess : Le joueur a bien trouvé un mot");

    }


    // Ne devrait jamais arriver
    if (!game.settings.foundWords)
        throw new RuntimeException("handleGuess : La liste des mots trouvés n'existe pas");
    if (game.settings.foundWords[ws.user.idUser].includes(guess)) {
        return;
    }


    // On envoie que le mot a été trouvé à tous les joueurs
    game.settings.foundWords[ws.user.idUser].push(guess);
    sendScoreUpdate(game, game.settings.bloquer);

}

/**
 * Gère l'envoie en direct des informations de score à tous les joueurs
 * @param {*} game  - Partie en cours 
 * @param {*} bloquer  - Mode bloquer activé ou non
 */
function sendScoreUpdate(game, bloquer) {

    const scores = [];
    // Pour chaque joueur on récupère son score et on l'ajoute à la liste des scores
    for (const player of game.players) {
        const score = {
            idUser: player.user.idUser,
            login: player.user.login,
            score: game.settings.foundWords[player.user.idUser].length,
            // Particularité du mode non bloqué, on envoie pas les mots trouvés
            // Car on ne veut pas que les joueurs puissent tricher
            words: bloquer ? game.settings.foundWords[player.user.idUser] : "Dans ce mode, les mots ne sont pas affichés",
        }
        scores.push(score);
    }
    // On envoie les scores à tous les joueurs
    for (const player of game.players) {
        if (player.readyState !== WebSocket.OPEN) {
            continue;
        }
        player.send(JSON.stringify({
            type: 'move_event',
            scores
        }));
    }
}


/**
 * Renvois la liste des parties disponibles
 */
function handleSeek(ws, message) {
    const gamesList = [];
    if (!seekers[ws.id])
        seekers[ws.id] = ws;
    for (const gameID in games) {
        const game = games[gameID];
        if (game.statut == "lobby") {
            const gameObj = {
                id: game.id,
                adminID: game.players.find(player => player.user.idUser === game.adminID).user.pseudoUser,
                players: game.players.length,
                settings: game.settings,
            }
            gamesList.push(gameObj);
        }
    }
    ws.send(JSON.stringify({
        type: 'seek',
        games: gamesList,
    }));




}
/**
 *  Gère le démarage d'une partie
 */
async function handleStart(ws, message) {
    console.log("On démarre la partie");
    const game = games[message.gameID];
    if (!game) {
        console.log("La partie n'existe pas");
        return;
    }
    // if(game.statut != 'lobby'){
    //     console.log("La partie n'est pas en lobby, on ne peut pas la démarrer");
    //     return;
    // }

    if (game.adminID != ws.user.idUser) {
        console.log("L'utilisateur n'est pas admin");
        return;
    }
    game.statut = "game";


    // Programmation de la fin de la partie
    console.log("On programme la fin de la partie qui finira dans : " + game.settings.temps / 1_000 + " secondes");
    game.timeout = setTimeout(() => {
        handleEnd(game);
        console.log("Fin de la partie, timeout terminé");
    }, game.settings.temps * 1_0000 * 60);

    // On récupère la grille et la liste des mots à trouver
    const colonnes = game.settings.colonnes;
    const lignes = game.settings.lignes;


    // Si une erreur a eu lieu lors de ce processus, on annule la partie
    try {
        game.settings.grille = await jeu.getGrille(colonnes, lignes, game.settings.langue); // On récupère la grille
        game.word_list = await jeu.solve(game.settings.grille, lignes, colonnes); // On récupère la liste des mots à trouver
    } catch (err) {
        sendToAllPlayers(game.players, { type: 'error', error_type: 'error', message: 'Une erreur est survenue lors de la création de la partie' });
        saveGameToDB(game, statut = "CANCELLED");
        delete games[game.id];
        return;
    }


    if (!game.settings.foundWords)
        game.settings.foundWords = [];

    // On créee la liste des mots trouvés pour chaque joueur et on leur envoie par la même occasion la grille et l'ordre de début de partie
    game.players.forEach((player) => {
        game.settings.foundWords[player.user.idUser] = [];
        console.log("On envoie la grille à : " + player.user.login);
        player.send(JSON.stringify({
            type: 'start',
            settings: game.settings,
            grille: game.settings.grille,
        }));
    });

    // Mise à jour des parties disponibles (donc celle-ci n'est plus disponible)
    updateAllSeekers();

}
/**
 *  Envois un message à tous les client d'une liste
 * @param {*} users_list - Liste des clients
 * @param {*} message  - Message à envoyer
 */
function sendToAllPlayers(users_list, message) {
    for (const user of users_list) {
        console.log(JSON.stringify(message));
        user.send(JSON.stringify(message));
    }

}
/**
 *  Sauvegarde une partie en BDD
 * @param {*} game  - Partie à sauvegarder
 * @param {*} statut - Statut de la partie (ended, cancelled, ...)
 */
async function saveGameToDB(game, statut = "FINISHED") {
    const sql = `
    UPDATE partie SET idVainqueur = ?, dimensionsGrille = ?, DateDebutPartie = ?,DateFinPartie = ?, temps = ?, politiqueScore = ?, bloquerMots = ?, statut = ?, motsTrouves = ?, Grille = ? WHERE partie.idPartie = ?;
    `

    const arrayGrille = game.settings.grille.split(" ");
    const grille2D = [];
    for (let i = 0; i < game.settings.lignes; i++) {
        grille2D[i] = [];
        for (let j = 0; j < game.settings.colonnes; j++) {
            grille2D[i][j] = arrayGrille[i * game.settings.colonnes + j];
        }
    }
    game.settings.grille = grille2D;


    const params = [
        game.winnerID,
        game.settings.colonnes + "x" + game.settings.lignes,
        game.startTime,
        new Date().toISOString().slice(0, 19).replace('T', ' '),
        game.settings.temps,
        game.settings.politique,
        game.settings.bloquer,
        statut,
        JSON.stringify(game.settings.foundWords),
        game.settings.grille,
        game.id,
    ]
    const conn = await base.getBase();
    await conn.execute(sql, params);
    await conn.end();

    game.players.forEach((player) => {
        linkGameToUser(game, player.user);
    }
    );


}

async function linkGameToUser(game, user) {
    const sql = `INSERT INTO jouer (idPartie, idUser) VALUES (?, ?);`;
    const conn = await base.getBase();
    console.log("On lie la partie " + game.id + " à l'utilisateur " + user.idUser);
    try {
        await conn.execute(sql, [game.id, user.idUser]);
        console.log("Lien créé");
    } catch (e) {
    }

    await conn.end();
}




function heartbeat() {
    this.isAlive = true;
}

/**
 * Gère les demandes de création de partie
 * @param {*} ws - Client qui a envoyé la demande de nouvelle partie
 * @param {*} message  - Message contenant le token de l'utilisateur
 * @returns 
 */
async function handleNewGame(ws, message) {
    console.log("handleNewGame: Tentative de création de partie par ->  " + ws.user.pseudoUser + "(" + ws.user.idUser + ")");
    if (isPlayerAlreadyInAGame(ws.user)) {
        sendError2(ws, 'new_game', "already_in_game", "Vous êtes déjà dans une partie");
        sendRedirect(ws, "/lobby/" + getPlayerCurrentGame(ws).id);
        console.log("handleNewGame: Création annulée -> l'utilisateur est déjà dans une partie");
        return;
    }
    const game = await jeu.createGame(token = null, user = ws.user);
    if (game == false) {
        ws.user.inCreateGame = false;
        sendError(ws, "error", "Une erreur est survenue lors de la création de la partie");
        console.log("handleNewGame: Création annulée -> erreur lors de la création de la partie");
        return;
    }

    const fakeMessage = {
        gameID: game,
        token: null,
    }

    await createGameInternal(ws, fakeMessage);

    ws.send(JSON.stringify({
        type: 'game_created',
        gameID: game,
    }));
    console.log("handleNewGame: Création réussie");

    // sendRedirect(ws, "/join/"+ game.idPartie);
}

/**
 * Gère la mise à jour des paramètres de la partie par l'administateur
 * @param {*} ws - Client qui a envoyé la mise à jour
 * @param {*} message - Message contenant les paramètres de la partie
 * @returns 
 */
async function handleSettings(ws, message) {
    const game = games[message.gameID];
    if (!game) {
        return;
    }
    if (game.adminID != ws.user.idUser) {
        return;
    }
    console.log("handleSettings: Mise à jour des paramètres de la partie par : " + ws.user.pseudoUser + "(" + ws.user.idUser + ")");
    console.log(message.settings);
    game.settings = message.settings;
    sendGameUpdate(ws, game);
}
/**
 *  Fait rejoindre une partie à un client
 * @param {*} ws - Client qui veut rejoindre la partie
 * @param {*} message  - Message contenant l'id de la partie
 * @returns 
 */
async function handleJoin(ws, message) {
    console.log("handleJoin: Tentative de connexion à une partie par : " + ws.user.pseudoUser + "(" + ws.user.idUser + ")");
    if (!message.gameID)
        return;

    // Si la partie n'existe pas, on la crée
    if (!games[message.gameID]) {
        console.log("handleJoin: La partie n'existe pas, on la crée");
        if (message.status == "game")
            await createGame(ws, message, "game");
        else
            await createGame(ws, message);
        return;
    }
    const game = games[message.gameID];

    // Si un joueur s'est déconnecté et qu'il revient, on le remet dans la partie
    if (message.status == "game" && game.statut == "game" && !game.players.includes(ws.user)) {
        console.log("handleJoin: Un joueur s'est déconnecté et revient, on le remet dans la partie");
        sendGameStart(ws, game);
    }


    // Si l'utilisateur est déjà dans la partie, on c
    if (isPlayerAlreadyInGame(game, ws.user)) {
        replaceOldWSClient(ws, game);
        sendGameUpdate(ws, game);
        sendNewPlayerUpdate(game);
        console.log("handleJoin: L'utilisateur est déjà dans la partie");
        return;
    }
    // Max 4 joueurs
    if (game.players.length >= 4) {
        // TODO: Rajouter un return quand on aura fix le problème des clients inactifs
    }
    // On ajoute le joueur à la partie
    game.players.push(ws);
    // On envoie un update à tous les joueurs
    sendGameUpdate(ws, game);
    if (message.status == "game")
        sendScoreUpdate(game, game.settings.bloquer);
    sendNewPlayerUpdate(game);
}


/**
 *  Remplace un ancien client WebSocket par un nouveau
 * @description Il arrive de perdre la connexion avec l'ancien client, (F5, problème de connexion), il faut alors identifier et remplacer l'autre client par le nouveau
 * @param {*} ws - Nouveau client
 * @param {*} game - Partie à mettre à jour
 * @returns 
 */
function replaceOldWSClient(ws, game) {
    console.log("replaceOldWSClient: On remplace l'ancien client par le nouveau (id : " + ws.user.idUser + " pseudo: " + ws.user.pseudoUser + ")");
    if (!ws.user)
        return;
    const index = game.players.findIndex(player => player.user.idUser === ws.user.idUser);
    console.log(index);
    game.players[index] = ws;


}


/**
 * Envois à tous les joueurs de la partie la liste des joueurs
 * @param {*} game - Partie dont on souhaite envoyer la liste des joueurs
 */
function sendNewPlayerUpdate(game) {
    const players = [];

    game.players.forEach((player) => {
        console.log("sendNewPlayerUpdate: On envoie la liste des joueurs à : " + player.user.pseudoUser + "(" + player.user.idUser + ")");
        const playerObj = {
            idUser: player.user.idUser,
            login: player.user.pseudoUser,
        }
        players.push(playerObj);
    });

    sendToAllPlayers(game.players, { type: 'players_update', players });
}


/**
 * Envois à une client que la partie à débuté
 * @param {*} client - Client à qui envoyer la redirection
 * @param {*} game - Partie à rejoindre
 */
function sendGameStart(client, game) {
    console.log("Game start ordonné  pour : " + client.user.idUser);
    client.send(JSON.stringify({
        type: 'start',
        settings: game.settings,
        grille: game.settings.grille,
    }));
}

/**
 * Envois à tous les joueurs de la partie les infos de la partie
 * @param {*} ws - Client (non utilisé, y passer null)
 * @param {*} gameToUpdate 
 */
function sendGameUpdate(ws, gameToUpdate) {
    console.log("On envoie l'update à tous les joueurs, gameToUpdate : " + gameToUpdate.players.length);

    // Create a deep copy of the gameToUpdate object without circular references
    const game = deepCopyWithoutCircular(gameToUpdate);
    delete game.players; // La liste contient des informations sensibles (token, etc), on ne l'envoie pas aux clients
    delete game.timeout; // On ne veut pas envoyer le timeout aux clients
    sendToAllPlayers(gameToUpdate.players, { type: 'update', game });
}

/**
 * Créé un objet sans références circulaires
 * @param {*} obj - Objet à copier
 * @returns  - Copie de l'objet sans références circulaires
 */
function deepCopyWithoutCircular(obj) {
    const cache = new WeakMap();

    function clone(value) {
        if (typeof value === 'object' && value !== null) {
            if (cache.has(value)) {
                return cache.get(value);
            }

            const isArray = Array.isArray(value);
            const cloneObj = isArray ? [] : {};

            cache.set(value, cloneObj);

            const keys = isArray ? value : Object.keys(value);
            for (const key of keys) {
                cloneObj[key] = clone(value[key]);
            }

            return cloneObj;
        }

        return value;
    }

    return clone(obj);
}

/**
 * Vérifie toutes les parties à la recherche du joueur spécifié
 * @param {*} user - Utilisateur à vérifier
 * @returns - true si l'utilisateur est déjà dans une partie, false sinon
 */
function isPlayerAlreadyInAGame(user) {
    for (const gameID in games) {
        const game = games[gameID];
        if (isPlayerAlreadyInGame(game, user)) {
            return true;
        }
    }
    return false;
}
/**
 * - Check si un joueur est dans la partie spécifiée
 * @param {*} game - Partie à vérifier
 * @param {*} user  - Utilisateur à vérifier
 * @returns true si l'utilisateur est dans la partie, false sinon
 */
function isPlayerAlreadyInGame(game, user) {
    for (const player of game.players) {
        if (player.user.idUser === user.idUser) {
            return true;
        }
    }
    return false;
}

/**
 * Fonction créant une partie
 * Remplacée par createGameInternal
 * Utilisée à des fins de rétrocompatibilité
 * @deprecated
 * @see createGameInternal  
 * @param {*} ws 
 * @param {*} message 
 * @param {*} status 
 * @returns 
 */
async function createGame(ws, message, status = "lobby") {
    console.log("createGame: Tentative de création de partie par -> " + ws.user.pseudoUser + "(" + ws.user.idUser + ")");


    if (isPlayerAlreadyInAGame(ws.user)) {
        sendError2(ws, 'new_game', "already_in_game", "Vous êtes déjà dans une partie");
        sendRedirect(ws, "/lobby/" + getPlayerCurrentGame(ws).id);
        console.log("createGame: Création annulée -> l'utilisateur est déjà dans une partie");
        return;
    }



    if (!message.token || !message.gameID) {
        console.log("createGame: Création annulée -> token ou gameID non fourni");
        return;
    }

    const game = await jeu.getGameFromUUID(message.gameID);
    if (!game) {
        console.log("createGame: Création annulée -> partie non trouvée en BDD");
        return;
    }

    if (ws.user.idUser != game.gameAdmin) {
        console.log("createGame: Création annulée -> pas admin de la game visée");
        return;
    }


    const gameObj = {
        id: message.gameID,
        adminID: ws.user.idUser,
        players: [ws],
        statut: "lobby",
        settings: {
            colonnes: 4,
            lignes: 4,
            langue: 'fr',
            temps: 3,
            politique: '1',
            bloquer: false,
            mode: 'normal',
            foundWords: []
        }
    }
    gameObj.settings.foundWords[ws.user.idUser] = [];



    ws.send(JSON.stringify({
        type: 'update',
        game: deepCopyWithoutCircular(gameObj)
    }));
    sendNewPlayerUpdate(gameObj);
    games[message.gameID] = gameObj;
    console.log("createGame: Partie créée");
    if (status == "game") {
        handleStart(ws, message);
    }

}

/**
 * Crée une partie, en appelant directement la fonction de création de partie du module jeu.js
 * Utilisée depuis que les parties sont créées via le websocket
 * 
 * @param {*} ws  - Client qui veut créer la partie
 * @param {*} message - Message contenant l'id de la partie
 * @returns 
 */
async function createGameInternal(ws, message) {
    const game = await jeu.getGameFromUUID(message.gameID);
    if (!game) {
        console.log("createGameInternal: Création annulée -> partie non trouvée en BDD");
        return;
    }

    if (ws.user.idUser != game.gameAdmin) {
        console.log("createGameInternal: Création annulée -> pas admin");
        return;
    }
    const gameObj = {
        id: message.gameID,
        adminID: ws.user.idUser,
        players: [ws],
        statut: "lobby",
        settings: {
            colonnes: 4,
            lignes: 4,
            langue: 'fr',
            temps: 3,
            politique: '1',
            bloquer: false,
            mode: 'normal',
            foundWords: []
        }
    }
    gameObj.settings.foundWords[ws.user.idUser] = [];



    ws.send(JSON.stringify({
        type: 'update',
        game: gameObj,
    }));
    sendNewPlayerUpdate(gameObj);
    games[message.gameID] = gameObj;
    updateAllSeekers();
    console.log("createGameInternal: Partie créée");


}
/**
 * Envois un la liste des parties disponibles à tous les joueurs en recherche de parties
 */
updateAllSeekers = function () {
    for (const seekerID in seekers) {
        const seeker = seekers[seekerID];
        handleSeek(seeker, null);
    }
}


/**
 * Gère la reconnexion d'un joueur à une partie
 * @param {*} ws  - Client qui veut se reconnecter
 * @param {*} message  - Message contenant l'id de la partie
 * @returns 
 */
function handleRejoin(ws, message) {
    if (!message.gameID)
        return;
    const game = games[message.gameID];
    if (!game)
        return

    sendNewPlayerUpdate(game);
    ws.send(JSON.stringify({
        type: 'rejoin',
        game: game,
    }));


}

/**
 * Permet de récupérer la partie en cours d'un client
 * @param {*} ws  - Client dont on veut récupérer la partie en cours
 * @returns  - La partie en cours du client sinon null
 */
function getPlayerCurrentGame(ws) {
    for (const gameID in games) {
        const game = games[gameID];
        if (isPlayerAlreadyInGame(game, ws.user)) {
            return game;
        }
    }
    return null;
}

/**
 * Wrapper pour envoyer une erreur à un client avec un type de message
 * @param {*} ws  - Client à qui envoyer l'erreur
 * @param {*} type  - Type de message
 * @param {*} error_type  - Type d'erreur
 * @param {*} message  - Message d'erreur
 */
function sendError2(ws, type, error_type, message) {
    ws.send(JSON.stringify({
        type,
        status: 'error',
        error_type,
        message,
    }));
}

/**
 * Wrapper pour envoyer une erreur à un client
 * @param {*} ws  - Client à qui envoyer l'erreur
 * @param {*} error_type  - Type d'erreur
 * @param {*} message  - Message d'erreur
 */
function sendError(ws, error_type, message) {
    ws.send(JSON.stringify({
        type: 'error',
        error_type,
        message,
    }));
}

/**
 * Envoyer un client vers une autre page
 * @param {*} ws  - Client à rediriger
 * @param {*} url  - URL de redirection
 */
function sendRedirect(ws, url) {
    ws.send(JSON.stringify({
        type: 'redirect',
        url,
    }));
}


const gameExemple = {
    id: 1,
    admin: 1,
    players: [],
    settings: {
        colonnes: 4,
        lignes: 4,
        langue: 'fr',
        temps: 60,
        politique: '1',
        bloquer: false,
        mode: 'normal',
    }
}





module.exports = {
    initMultiplayer,
};
