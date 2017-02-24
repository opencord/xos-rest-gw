(function () {
  'use strict';
  
  const express = require('express');
  const app = express();
  const config = require('./config/config.js').gateway;
  const bodyParser = require('body-parser');
  const cors = require('cors');
  const socketIo = require('./controllers/websocket.js');
  const logger = require('./config/logger.js');

  // Apply middlewares
  app.use(cors());
  app.use(bodyParser.json());

  // Load routes
  // require('./routes/core_proxy.js')(app);

  app.get('/', function(req, res) {
    res.send('Welcome to the websocket server for XOS');
  });

  const startServer = (port) => {

    // if is running just return it
    if(app.server) {
      return app.server;
    }

    const server =  app.listen(port || config.port, function() {
      logger.info(`Express is listening to http://localhost:${port || config.port}`);

      // once server is ready setup WebSocket
      socketIo.create(server);

      // start redis
      require('./controllers/redis.js');
    });
    app.server = server;
    return server;
  };

  const stopServer = () => {
    if(app.server) {
      app.server.close();
    }
  }

  if(!module.parent) {
    startServer();
  }

  module.exports = {
    app: app,
    start: startServer,
    stop: stopServer
  };
})();