
/*
 * Copyright 2017-present Open Networking Foundation

 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at

 * http://www.apache.org/licenses/LICENSE-2.0

 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */


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