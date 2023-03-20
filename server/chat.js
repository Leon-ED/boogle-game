const WebSocket = require('ws');
const auth = require('./auth');

const SERVER_PSEUDO = 'Système';
const CANT_SEND_MESSAGE = 'Vous devez être connecté pour envoyer un message.';
const MAX_MSG_PER_SECOND = 1;
const RATE_LIMIT_MESSAGE = 'Vous ne pouvez pas envoyer plus de ' + MAX_MSG_PER_SECOND + ' messages par seconde.';



function sendError(ws, message) {
    ws.send(JSON.stringify({
        content: message,
        author: SERVER_PSEUDO,
        date: Date.now(),
        system: true
    }));
}



initWS = function (server) {
    const wss = new WebSocket.Server({ server });
    wss.getUniqueID = function () {
        function s4() {
            return Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
        }
        return s4() + s4() + '-' + s4();
    };

    
    const clients = [];
    wss.on('connection', (ws) => {
        ws.id = wss.getUniqueID();
        ws.lastMessage = null;

        ws.on('message', (message) => {
            console.log('received: %s', message);
            var message = JSON.parse(message);
            auth.returnUserFromToken(message.token).then((user) => {
                if (user) {
                    newMessage = {
                        content: message.content,
                        author: user.pseudoUser,
                        date: Date.now()
                    }
                } else {
                    sendError(ws, CANT_SEND_MESSAGE);
                    return;
                }
                if (ws.lastMessage && Date.now() - ws.lastMessage.date < 1000 / MAX_MSG_PER_SECOND) {
                 sendError(ws, RATE_LIMIT_MESSAGE);
                return;
                }
                ws.lastMessage = newMessage;

                wss.clients.forEach(function each(client) {
                    if (client.readyState === WebSocket.OPEN && client.id != ws.id) {
                        client.send(JSON.stringify(newMessage));
                    }
                });
            });

            });

            //send immediatly a feedback to the incoming connection    

            //forEAch client send the message



        });



    }

module.exports = {
            initWS
        }
