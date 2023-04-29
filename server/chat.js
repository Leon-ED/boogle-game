const WebSocket = require('ws');
const auth = require('./auth');

const SERVER_PSEUDO = 'Système';
const CANT_SEND_MESSAGE = 'Vous devez être connecté pour envoyer un message.';
const MAX_MSG_PER_SECOND = 1;
const RATE_LIMIT_MESSAGE = 'Vous ne pouvez pas envoyer plus de ' + MAX_MSG_PER_SECOND + ' messages par seconde.';
const GLOBAL_ROOM = 'global';

var rooms = {
    [GLOBAL_ROOM]: {
        name: 'Global',
        id: GLOBAL_ROOM,
        users: []
    },
    ['room1']: {
        name: 'Room 1',
        id: 'room1',
        users: []
    },
    ['room2']: {
        name: 'Room 2',
        id: 'room2',
        users: []
    }

};



function sendError(ws, message) {
    ws.send(JSON.stringify({
        type: 'message',
        content: message,
        author: SERVER_PSEUDO,
        date: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
        system: true
    }));
}

function handleNewMessage(wss, ws, message) {
    const formattedDate = new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
    auth.returnUserFromToken(message.token).then((user) => {
        newMessage = {
            type: 'message',
            content: message.content,
            author: user.pseudoUser,
            date: formattedDate
        }
        if (user === false) {
            newMessage.cancelled = true;
            ws.send(JSON.stringify(newMessage));
            sendError(ws, CANT_SEND_MESSAGE);
            return;
        }


        if (ws.lastMessage && Date.now() - ws.lastMessage.date < 1000 / MAX_MSG_PER_SECOND) {
            console.log("RATE LIMIT");
            sendError(ws, RATE_LIMIT_MESSAGE);
            return;
        }
        ws.lastMessage = newMessage;

        wss.clients.forEach(function each(client) {
            if (client.readyState === WebSocket.OPEN && client.room == ws.room) {
                client.send(JSON.stringify(newMessage));
            }
        });
    });




}

function handleJoinRoom(wss, ws, message) {
    var formattedDate = new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
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



    ws.send(JSON.stringify({ type: 'join', status: "success", roomId: message.roomId, system: true, date: formattedDate, author: SERVER_PSEUDO, content: 'Vous avez rejoint la room ' + message.roomId }));
    return;
}

function handleAvailableRooms(ws, message) {
    var formattedDate = new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
    ws.send(JSON.stringify({
        type: "got"
        , status: "success"
        , system: true
        , date: formattedDate
        , rooms: [{ id: GLOBAL_ROOM, name: "Global", number: rooms[GLOBAL_ROOM].users.length },
        { id: "room1", name: "Room 1", number: rooms["room1"].users.length },
        { id: "room2", name: "Room 2", number: rooms["room2"].users.length }]





    }))





}








initWS = function (server) {
    const wss = new WebSocket.Server({ server });
    wss.getUniqueID = function () {
        function s4() {
            return Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
        }
        return s4() + s4() + '-' + s4();
    };


    wss.on('connection', (ws) => {
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



    });

    wss.on('close', (ws) => {
        // On enlève l'utilisateur de la room
        rooms[ws.room].users = rooms[ws.room].users.filter((user) => user.id != ws.id);
        // On envoie un update à tous les utilisateurs du serveur avec les infos sur les rooms
        wss.clients.forEach(function each(client) {
            if (client.readyState === WebSocket.OPEN) {
                handleAvailableRooms(client);
            }
        });
    });

}



module.exports = {
    initWS
}
