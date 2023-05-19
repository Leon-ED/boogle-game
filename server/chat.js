const WebSocket = require('ws');
const auth = require('./auth');

const SERVER_PSEUDO = 'Système';
const CANT_SEND_MESSAGE = 'Vous devez être connecté pour envoyer un message.';
const MAX_MSG_PER_SECOND = 1;
const RATE_LIMIT_MESSAGE = 'Vous ne pouvez pas envoyer plus de ' + MAX_MSG_PER_SECOND + ' messages par seconde.';
const GLOBAL_ROOM = 'global';
const { getGameFromUUID } = require('./jeu');


// Les salons de discussion par défaut 
var rooms = {
    [GLOBAL_ROOM]: {
        name: 'Global', // Le nom du salon, visible par les utilisateurs
        id: GLOBAL_ROOM, // L'id du salon, utilisé par le serveur
        users: [], // Les utilisateurs connectés au salon
        visible: true, // Si le salon est visible par défaut dans la liste des salons 
        whitelist: [] // Les utilisateurs qui peuvent rejoindre le salon quand il n'est pas visible
    }
};



// Envoie un message d'erreur à l'utilisateur sous le nom du serveur
function sendError(ws, message) {
    ws.send(JSON.stringify({
        type: 'message',
        content: message,
        author: SERVER_PSEUDO,
        date: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
        system: true
    }));
}


// Gère l'envoi d'un message
function handleNewMessage(wss, ws, message) {
    // La date du message, gérée par le serveur
    const formattedDate = new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });

    // On vérifie que l'utilisateur soit connecté
    auth.returnUserFromToken(message.token).then((user) => {
        // On formatte le message
        newMessage = {
            type: 'message',
            content: message.content,
            author: user.pseudoUser,
            date: formattedDate
        }
        // Il n'est pas connecté alors on envoie un message d'erreur et on annule l'envoi du message
        if (user === false) {
            newMessage.cancelled = true;
            ws.send(JSON.stringify(newMessage));
            sendError(ws, CANT_SEND_MESSAGE);
            return;
        }

        // On vérifie que l'utilisateur ne soit pas rate limited 
        if (ws.lastMessage && Date.now() - ws.lastMessage.date < 1000 / MAX_MSG_PER_SECOND) {
            sendError(ws, RATE_LIMIT_MESSAGE);
            return;
        }

        ws.lastMessage = newMessage;
        // On envoie le message à tous les utilisateurs de la room
        wss.clients.forEach(function each(client) {
            if (client.readyState === WebSocket.OPEN && client.room == ws.room) {
                client.send(JSON.stringify(newMessage));
            }
        });
    });




}




// Gère la connexion d'un utilisateur à un salon de discussion
async function handleJoinRoom(wss, ws, message) {
    const formattedDate = new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });

    // Définit si le salon est un salon de jeu ou non
    let isGame = false;

    // On vérife déjà que l'utilisateur ne soit pas déjà dans la room
    if (ws.room == message.roomId) {
        return;
    }
    // Si c'est un salon de jeu, on vérifie que la partie existe
    if (message.roomId.startsWith("game_")) {
        isGame = true;
        message.roomId = message.roomId.replace("game_", ""); // On enlève le préfixe game_
        const result = await getGameFromUUID(message.roomId) // On vérifie que la partie existe
        if (result == false) {
            // Elle n'existe pas on envoie un message d'erreur et on annule la connexion
            ws.send(JSON.stringify({ type: 'join', status: "error", roomId: message.roomId, system: true, date: formattedDate, author: SERVER_PSEUDO, content: 'La room ' + message.roomId + ' n\'existe pas.' }));
            return
        }
        // On crée la room de chat de la partie si elle n'existe pas
        if (!rooms[message.roomId])
            createGameChatRoom(message.roomId);
        // On ajoute l'utilisateur à la whitelist de la room
        rooms[message.roomId].whitelist.push(ws.id);
    }

    // On vérifie que la room existe, sinon erreur
    if (!rooms[message.roomId]) {
        ws.send(JSON.stringify({ type: 'join', status: "error", roomId: message.roomId, system: true, date: formattedDate, author: SERVER_PSEUDO, content: 'La room ' + message.roomId + ' n\'existe pas.' }));
        return;
    }
    // On enlève l'utilisateur de la room précédente
    rooms[ws.room].users = rooms[ws.room].users.filter((user) => user.id != ws.id);
    // On ajoute l'utilisateur à la nouvelle room
    rooms[message.roomId].users.push({ id: ws.id, pseudo: ws.pseudo });
    // On change la room de l'utilisateur
    ws.room = message.roomId;
    // On envoie un update à tous les utilisateurs du serveur avec les infos sur les rooms
    wss.clients.forEach(function each(client) {
        if (client.readyState === WebSocket.OPEN) {
            handleAvailableRooms(client);
        }
    });



    // Enfin, on confirme la réussite de la connexion à l'utilisateur
    ws.send(JSON.stringify({ type: 'join', status: "success", roomId: message.roomId, system: true, date: formattedDate, author: SERVER_PSEUDO, content: 'Vous avez rejoint la room ' + rooms[message.roomId].name + '.' }));
    return;
}

// Gère l'envoi des infos sur les rooms à un utilisateur
function handleAvailableRooms(ws, message) {
    const formattedDate = new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });

    const roomsArray = [];
    for (const room in rooms) {
        // On vérifie que l'utilisateur ait le droit de voir la room, càd qu'il soit dans la whitelist ou que la room soit visible
        if (!rooms[room].visible && rooms[room].whitelist.indexOf(ws.id) == -1)
            continue;
        roomsArray.push({ id: rooms[room].id, name: rooms[room].name, number: rooms[room].users.length });
    }
    // On envoie les infos sur les rooms à l'utilisateur
    ws.send(JSON.stringify({
        type: "got"
        , status: "success"
        , system: true
        , date: formattedDate
        , rooms: roomsArray
    }))
}










initWS = function (server) {
    const wss = new WebSocket.Server({ noServer: true });
    // Attribue un id unique à un utilisateur
    wss.getUniqueID = function () {
        function s4() {
            return Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
        }
        return s4() + s4() + '-' + s4();
    };

    const interval = setInterval(function ping() {
        // console.log("nombre de clients "+ wss.clients.size);
        wss.clients.forEach(function each(ws) {

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
        // On utilise un id unique pour chaque client
        ws.id = wss.getUniqueID();
        ws.lastMessage = null;
        ws.room = GLOBAL_ROOM;
        // On ajoute l'utilisateur à la room global
        rooms[GLOBAL_ROOM].users.push(ws);
        // On envoie un update à tous les utilisateurs du serveur avec les infos sur les rooms
        wss.clients.forEach(function each(client) {
            if (client.readyState === WebSocket.OPEN) {
                handleAvailableRooms(client);
            }
        });


        // A chaque message reçu
        ws.on('message', (packet) => {
            var packet = JSON.parse(packet);
            if (packet.type === 'join' && packet.roomId)
                return handleJoinRoom(wss, ws, packet);
            if (packet.type == "message" && packet.content) {

                return handleNewMessage(wss, ws, packet);

            }
            if (packet.type == "get")
                return handleAvailableRooms(ws, packet);

        });

        ws.on('close', (ws) => {
            clearInterval(interval);
        });

    });

    // A chaque déconnexion

    return wss;
}
// Crée une room de chat de partie
function createGameChatRoom(gameID) {
    console.log("createGameChatRoom");
    rooms[gameID] = {
        name: 'Chat de partie',
        id: gameID,
        users: [],
        visible: false,
        whitelist: []
    };
}

function deleteGameChatRoom(gameID) {
    delete rooms[gameID];
}
function heartbeat() {
    // console.log("heartbeat + " + new Date());
    this.isAlive = true;
}


module.exports = {
    initChat: initWS,
}

