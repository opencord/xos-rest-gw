
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
  
  const socketIo = require('./websocket.js');
  const config = require('../config/config.js');
  const logger = require('../config/logger.js');
  const request = require('superagent');
  const socket = socketIo.get();
  const _ = require('lodash');

  var redis = require('redis');
  
  var client = redis.createClient({
    host: config.redis.host,
    port: config.redis.port
  });

  client.on('error', function (err) {
    logger.log('error', err);
  });

  client.on('ready', function () {
    logger.log('info', 'Redis connected');
  });

  client.on('subscribe', function (channel) {
    logger.log('debug', `Subscribed to channel: ${channel}`);
  });

  client.on('pmessage', function (pattern, channel, message) {
    logger.log('warn', 'sub channel ' + channel + ': ' + message);

    let msg;
    try {
      msg = JSON.parse(message);
      // TODO find the user that needs to be notified for msg.object update
      socket.emit('event', {model: channel, msg: msg});
    }
    catch(e) {
      // send the event also if it is not JSON
      msg = message;
      socket.emit('event', {model: channel, msg: msg});
    }
  });

  // subscribe to all channels
  client.psubscribe('*');

})();