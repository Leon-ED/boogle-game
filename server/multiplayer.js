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
            console.log("On teste si le client est alive");
            if (ws.isAlive === false) { console.log("Client inactif, connexion terminée"); return ws.terminate(); }
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
                case 'join':
                    return handleJoin(ws, message);
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

function heartbeat() {
    this.isAlive = true;
}
async function handleSettings(ws, message) {
    const game = games[message.gameID];
    if (!game) {
        console.log("La partie n'existe pas");
        return;
    }
    if (game.adminID != ws.user.idUser) {
        console.log("L'utilisateur n'est pas admin");
        return;
    }
    game.settings = message.settings;
    console.log("On envoie l'update");
    sendGameUpdate(ws,game);



}
async function handleJoin(ws, message) {
    // On vérifie que l'utilisateur soit connecté

    // Si la partie n'existe pas, on la crée
    if (!games[message.gameID]) {
        await createGame(ws, message);
        return;
    }
    const game = games[message.gameID];
    // Si l'utilisateur est déjà dans la partie, on ne fait rien
    if (game.players.includes(ws.user))
        return;
    // Max 4 joueurs
    if (game.players.length >= 4){
        // TODO: Rajouter un return quand on aura fix le problème des clients inactifs
    }
    // On ajoute le joueur à la partie
    game.players.push(ws);
    // On envoie un update à tous les joueurs
    sendGameUpdate(ws,game);
}
function sendGameUpdate(ws,gameToUpdate) {
    console.log("On envoie l'update à tous les joueurs, gameToUpdate : " + gameToUpdate.players.length);
    const game = JSON.parse(JSON.stringify(gameToUpdate));
    for (const player of gameToUpdate.players) {
        console.log("On teste : " + player.user.login
        );
        if (player.readyState !== WebSocket.OPEN) {
            console.log("Le joueur n'est pas prêt");
            continue;
        }
        if (player.user.idUser == gameToUpdate.adminID) {
            console.log("L'utilisateur est admin");
            continue;

        }
        console.log("On envoie l'update à : " + ws.user.login);
        player.send(JSON.stringify({
            type: 'update',
            game: game,
        }));

    }
}


async function createGame(ws, message) {
    if (!message.token || !message.gameID)
        return;
    const game = await jeu.getGameFromUUID(message.gameID);
    if (!game)
        return;

    if (ws.user.idUser != game.gameAdmin)
        return;
    const gameObj = {
        id: message.gameID,
        adminID: ws.user.idUser,
        players: [ws],
        settings: {
            colonnes: 10,
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
