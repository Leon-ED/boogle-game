const http = require('http');
const app = require('./app');
const chat = require('./chat');
const server = http.createServer(app);
app.set('port', process.env.PORT || 3000);
chat.initWS(server);
server.listen(process.env.PORT || 3000);
