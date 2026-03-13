const { createServer } = require('../server');
const server = createServer();
module.exports = (req, res) => server.emit('request', req, res);
