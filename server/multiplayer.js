const WebSocket = require('ws');
const auth = require('./auth');
const jeu = require('./jeu');

const games = {};

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
            if (ws.isAlive === false) {  return ws.terminate(); }
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
                // console.log("L'utilisateur est connecté");
                ws.user = user;
            }


            switch (message.type) {
                case 'seek':
                    return handleSeek(ws, message);
                
                case 'new_game':
                    return handleNewGame(ws, message);
                case 'join':
                    return handleJoin(ws, message);
                case 'rejoin':
                    return handleRejoin(ws, message);
                case 'leave':
                    return handleLeave(ws, message);
                case 'guess':
                    return handleGuess(ws, message);
                case 'start':
                    return handleStart(ws, message);
                case 'settings':
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
function handleEnd(game){
    game.statut = "ended";
    game.players.forEach((player) => {
        player.send(JSON.stringify({
            type: 'end',
            scores: game.settings.foundWords,
        }));
    }
    );
    sendRedirect(game.players[0], "/recap/"+ game.id);
    delete games[game.id];
    // TODO : enregistrer la partie en BDD
    



}


function handleGuess(ws, message) {
    const guess = message.word.toUpperCase();
    const game = games[message.gameID];
    if (!game) {
        console.log("La partie n'existe pas");
        return;
    }
    console.log("On vérifie le mot : " + guess + " proposé par  " + ws.user.idUser);
    // On vérifie premièrement si le mot est valide pour la recherche
    if(!jeu.preVerifMot(guess,game.settings.grille)){
        console.log("Le mot n'est pas valide pour la recherche");
        return ws.send(JSON.stringify({
            type: 'guess',
            status: 'invalid',
            message: 'Le mot n\'est pas valide pour la recherche.'
        }));

    }
    // Ensuite, si le mot est dans la grille
    if(!game.word_list.includes(guess)){
        console.log("Le mot n'est pas dans la liste");
        return ws.send(JSON.stringify({
            type: 'guess',
            status: 'invalid',
            message: 'Le mot n\'est pas dans la liste.'
        }));
    }

    
    // Si le mot de blocage des mots est activé alors on vérifie si le mot a déjà été trouvé dans par un des joueurs
    if(game.settings.bloquerMots){
        console.log("Le mode bloquer est activé");
        game.players.forEach((player) => {
            if(game.settings.foundWords[player.user.idUser].includes(guess)){
                console.log("Le mot a déjà été trouvé par un joueur");
                return ws.send(JSON.stringify({
                    type: 'guess',
                    status: 'invalid',
                    message: 'Le mot a déjà été trouvé par un joueur.'
                }));
            }
        });
        // Si le mot n'a pas été trouvé, on l'ajoute à la liste des mots trouvés du joueur
        console.log("Le mot n'a pas été trouvé, on l'ajoute à la liste des mots trouvés du joueur");

    }
    // Si le mode bloquer n'est pas activé, on regarde juste dans la liste
    // du joueur qui a envoyé le mot

    if(!game.settings.foundWords)
        throw new Error("foundWords is undefined");
    if (game.settings.foundWords[ws.user.idUser].includes(guess)) {
        return;
    }
    // On envoie que le mot a été trouvé à tous les joueurs
    game.settings.foundWords[ws.user.idUser].push(guess);
    sendScoreUpdate(game, game.settings.bloquerMots);





}


function sendScoreUpdate(game,bloquer) {

    const scores = [];
    for (const player of game.players) {
        const score = {
            idUser: player.user.idUser,
            login: player.user.login,
            score: game.settings.foundWords[player.user.idUser].length,
            words: bloquer ? game.settings.foundWords[player.user.idUser] : "Dans ce mode, les mots ne sont pas affichés",
        }
        scores.push(score);
    }
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
function handleSeek(ws,message){
    const gamesList = [];
    for (const gameID in games) {
        const game = games[gameID];
        if(game.statut == "lobby"){
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
    setTimeout(() => {
        handleEnd(game);
        console.log("Fin de la partie");
    }, game.settings.temps * 1000);
    const colonnes = game.settings.colonnes;
    const lignes = game.settings.lignes;
    game.settings.grille = await jeu.getGrille(colonnes, lignes, game.settings.langue);
    game.word_list = await jeu.solve(game.settings.grille, lignes, colonnes);
    if(!game.settings.foundWords)
        game.settings.foundWords = [];
    //console.log("On envoie la grille à tous les joueurs");
    game.players.forEach((player) => {
        game.settings.foundWords[player.user.idUser] = [];
        console.log("On envoie la grille à : " + player.user.login);
        player.send(JSON.stringify({
            type: 'start',
            settings: game.settings,
            grille: game.settings.grille,
        }));
    });

    }



function heartbeat() {
    this.isAlive = true;
}

async function handleNewGame(ws,message){
    if(isPlayerAlreadyInAGame(ws.user)){
        sendError2(ws,'new_game', "already_in_game", "Vous êtes déjà dans une partie");
        sendRedirect(ws, "/lobby/"+ getPlayerCurrentGame(ws).id);
        console.log("Création annulée: l'utilisateur est déjà dans une partie");
        return;
    }
    console.log(ws.user.login + " veut créer une partie")
    const game = await jeu.createGame(token = null,user = ws.user);
    if(game == false){
        ws.user.inCreateGame = false;
        sendError(ws, "error", "Une erreur est survenue lors de la création de la partie");
        console.log("Création annulée: erreur lors de la création de la partie");
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
    console.log("Création réussie");




    // sendRedirect(ws, "/join/"+ game.idPartie);

    




}

async function handleSettings(ws, message) {
    const game = games[message.gameID];
    if (!game) {
        //console.log("La partie n'existe pas");
        return;
    }
    if (game.adminID != ws.user.idUser) {
        //console.log("L'utilisateur n'est pas admin");
        return;
    }
    game.settings = message.settings;
    //console.log("On envoie l'update");
    sendGameUpdate(ws,game);



}
async function handleJoin(ws, message) {
    if(!message.gameID)
        return;

    // Si la partie n'existe pas, on la crée
    if (!games[message.gameID]) {
        console.log("La partie n'existe pas, on la crée");
        if(message.status == "game")
            await createGame(ws, message,"game");
        else
            await createGame(ws, message);
        return;
    }
    const game = games[message.gameID];

    // Si un joueur s'est déconnecté et qu'il revient, on le remet dans la partie
    if(message.status == "game" && game.statut == "game" && !game.players.includes(ws.user)){
        console.log("Un joueur s'est déconnecté et revient, on le remet dans la partie");
        sendGameStart(ws,game);
    }


    // Si l'utilisateur est déjà dans la partie, on c
    if (isPlayerAlreadyInGame(game, ws.user)){
        replaceOldWSClient(ws, game);
        sendGameUpdate(ws,game);
        sendNewPlayerUpdate(game);
        console.log("L'utilisateur est déjà dans la partie");
        return;
    }
    // Max 4 joueurs
    if (game.players.length >= 4){
        // TODO: Rajouter un return quand on aura fix le problème des clients inactifs
    }
    // On ajoute le joueur à la partie
    game.players.push(ws);


    // On envoie un update à tous les joueurs
    sendGameUpdate(ws,game);
    if(message.status == "game")
        sendScoreUpdate(game, game.settings.bloquerMots);
    sendNewPlayerUpdate(game);
}

function isPlayerAlreadyInGame(game, user) {
    for (const player of game.players) {
        if (player.user.idUser === user.idUser) {
            return true;
        }
    }
    return false;
}
function replaceOldWSClient(ws,game){
   console.log("On remplace l'ancien client par le nouveau");
   if(!ws.user)
        return;
    const index = game.players.findIndex(player => player.user.idUser === ws.user.idUser);
    console.log(index);
    game.players[index] = ws;


}



function sendNewPlayerUpdate(game){
    const players = [];
    game.players.forEach((player) => {
        console.log("On envoie la liste des joueurs à : " + player.user.idUser);
        const playerObj = {
            idUser: player.user.idUser,
            login: player.user.login,
        }
        players.push(playerObj);
    });
    for (const player of game.players) {

        if (player.readyState !== WebSocket.OPEN) {
            continue;
        }
        player.send(JSON.stringify({
            type: 'players_update',
            players
        }));

    }
}



function sendGameStart(client,game){
    console.log("Game start ordonné  pour : " + client.user.idUser);
    client.send(JSON.stringify({
        type: 'start',
        settings: game.settings,
        grille: game.settings.grille,
    }));
}


function sendGameUpdate(ws, gameToUpdate) {
    console.log("On envoie l'update à tous les joueurs, gameToUpdate : " + gameToUpdate.players.length);
    
    // Create a deep copy of the gameToUpdate object without circular references
    const game = deepCopyWithoutCircular(gameToUpdate);
    
    for (const player of gameToUpdate.players) {
      if (player.readyState !== WebSocket.OPEN) {
        continue;
      }
      
      if (player.user.idUser === gameToUpdate.adminID) {
        continue;
      }
      
      player.send(JSON.stringify({
        type: 'update',
        game: game,
      }));
    }
  }
  
  // Function to create a deep copy of an object without circular references
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
  
function isPlayerAlreadyInAGame(user) {
    for (const gameID in games) {
        const game = games[gameID];
        if (isPlayerAlreadyInGame(game, user)) {
            return true;
        }
    }
    return false;
}

async function createGame(ws, message,status = "lobby") {
    if(isPlayerAlreadyInAGame(ws.user)){
        sendError2(ws,'new_game', "already_in_game", "Vous êtes déjà dans une partie");
        sendRedirect(ws, "/lobby/"+ getPlayerCurrentGame(ws).id);
        console.log("Création annulée: l'utilisateur est déjà dans une partie");
        return;
    }


    if (!message.token || !message.gameID){
        console.log("Création annulée: token ou gameID non fourni");
        return;
    }
    const game = await jeu.getGameFromUUID(message.gameID);
    if (!game){
        console.log("Création annulée: partie non trouvée en BDD");
        return;
    }

    if (ws.user.idUser != game.gameAdmin){
        console.log("Création annulée: pas admin");
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
    console.log("Partie crée");
    if(status == "game"){
        handleStart(ws,message);
    }

}
async function  createGameInternal(ws, message) {
    const game = await jeu.getGameFromUUID(message.gameID);
    if (!game){
        console.log("Création annulée: partie non trouvée en BDD");
        return;
    }

    if (ws.user.idUser != game.gameAdmin){
        console.log("Création annulée: pas admin");
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
    console.log("Partie crée");


}



function handleRejoin(ws, message) {
    if(!message.gameID)
        return;
    const game = games[message.gameID];
    if(!game)
        return
    
    sendNewPlayerUpdate(game);

    ws.send(JSON.stringify({
        type: 'rejoin',
        game: game,
    }));


}

function getPlayerCurrentGame(ws) {
    for (const gameID in games) {
        const game = games[gameID];
        if (isPlayerAlreadyInGame(game, ws.user)) {
            return game;
        }
    }
    return null;
}

function sendError2(ws,type, error_type, message) {
    ws.send(JSON.stringify({
        type,
        status: 'error',
        error_type,
        message,
    }));
}


function sendError(ws, error_type, message) {
    ws.send(JSON.stringify({
        type: 'error',
        error_type,
        message,
    }));
}

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
