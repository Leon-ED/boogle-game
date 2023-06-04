const http = require('http');
const app = require('./app');
const {initChat} = require('./chat');
const { parse } = require('url');
const {initMultiplayer} = require('./multiplayer');
const fs = require('fs');
// const options = {
//   key: fs.readFileSync('{PATH/TO/CERTIFICATE-KEY-FILENAME}.pem'),
//   cert: fs.readFileSync('{PATH/TO/CERTIFICATE-FILENAME}.pem'),
// }

const server = http.createServer(app);


const mp_WS = initMultiplayer(server);
const chat_WS = initChat(server);

server.on('upgrade', function upgrade(request, socket, head) {
    const { pathname } = parse(request.url);
    if (pathname === '/chat') {
      chat_WS.handleUpgrade(request, socket, head, function done(ws) {
        chat_WS.emit('connection', ws, request);
      });
    } else if (pathname === '/mp') {
      mp_WS.handleUpgrade(request, socket, head, function done(ws) {
        mp_WS.emit('connection', ws, request);
      });
    } else {
      socket.destroy();
    }
  });
app.set('port', process.env.PORT || 4000);
server.listen(process.env.PORT || 4000);
