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
        //console.log("Nouvelle connexion");
        ws.id = wss.getUniqueID();



        ws.on('message', async (packet) => {
            const message = JSON.parse(packet);


            if (!ws.user) {
                const user = await auth.returnUserFromToken(message.token);
                if (!user) {
                    console.log("L'utilisateur n'est pas connecté");
                    return;
                }
                console.log("L'utilisateur est connecté");
                ws.user = user;
            }







            switch (message.type) {
                case 'join':
                    return handleJoin(ws, message);
                case 'rejoin':
                    return handleRejoin(ws, message);
                case 'leave':
                    return handleLeave(ws, message);
                case 'move':
                    return handleMove(ws, message);
                case 'start':
                    return handleStart(ws, message);
                case 'end':
                    return handleEnd(ws, message);
                case 'settings':
                    return handleSettings(ws, message);
            }


        });

        ws.on('close', (ws) => {
            clearInterval(interval);
        });

    });
    return wss;
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
    const colonnes = game.settings.colonnes;
    const lignes = game.settings.lignes;
    const grille = await jeu.getGrille(colonnes, lignes, game.settings.langue);
    game.settings.grille = grille;
    //console.log("On envoie la grille à tous les joueurs");
    game.players.forEach((player) => {
        console.log("On envoie la grille à : " + player.user.login);
        player.send(JSON.stringify({
            type: 'start',
            settings: game.settings,
            grille: grille,
        }));
    });

    }



function heartbeat() {
    this.isAlive = true;
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


    // Si l'utilisateur est déjà dans la partie, on ne fait rien
    if (isPlayerAlreadyInGame(game, ws.user)){
        sendNewPlayerUpdate(game)
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
  

async function createGame(ws, message,status = "lobby") {
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
            temps: 60,
            politique: '1',
            bloquer: false,
            mode: 'normal',
            foundWords: {
                user1: [],
            }
        }
    }

    ws.send(JSON.stringify({
        type: 'update',
        game: gameObj,
    }));
    games[message.gameID] = gameObj;
    console.log("Partie crée");
    if(status == "game"){
        handleStart(ws,message);
    }

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
