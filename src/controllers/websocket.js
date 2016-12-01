(function () {
  'use strict';

  const clients = require('./clients.js');
  const logger = require('../config/logger.js');

  let io;

  exports.create = function(server) {
    // INSTANTIATE SOCKET.IO
    // =============================================================================

    io = require('socket.io').listen(server);

    // LISTEN TO "CONNECTION" EVENT (FROM SOCKET.IO)
    // =============================================================================

    io.on('connection', function (socket) {
      logger.log('debug', 'connect %j', socket.handshake.query);
      clients.add(socket.handshake.query);

      socket.emit('connected', {message : 'Welcome to XOS'});

      socket.on('disconnect', function(reason) {
        clients.remove(socket.handshake.query);
        logger.log('debug', 'disconnect %s %j', reason, socket.handshake.query);
      });
    });

  };

  exports.get = () => io;

  // USAGE
  // const socketIo = require('./controllers/websocket.js');
  // const socket = socketIo.get();
  // socket.emit('eventName', data);

})(); 