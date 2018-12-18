/*
 * Copyright 2018-present Open Networking Foundation

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
  const socket = socketIo.get();

  // docs: https://github.com/Blizzard/node-rdkafka
  var kafka = require('node-rdkafka');

  const connect = () => {

    try {
      logger.log('debug',`Using librdkafka version: ${kafka.librdkafkaVersion}, kafka features: '${kafka.features}'`);
      logger.log('debug',`Connecting to broker: ${config.kafka_bootstrap_servers}`);

      var stream = kafka.KafkaConsumer.createReadStream({
        'metadata.broker.list': config.kafka_bootstrap_servers,
        'group.id': 'xos-ws',
        'socket.keepalive.enable': true,
        'enable.auto.commit': false
      }, {}, {
        topics: ['xos.gui_events'],
      });
    
      stream.on('ready', function () {
        logger.log('info', 'Kafka connected');
      });
    
      stream.on('error', function (err) {
        logger.log('info', 'Failed to connect to kafka, reconnecting in 5 sec')
        logger.log('debug', err);
        setTimeout(connect, 5 * 1000);
      });
    
      stream.consumer.on('event.error', function (err) {
        logger.log('info', 'Failed to connect to kafka, reconnecting in 5 sec')
        logger.log('debug', err);
        setTimeout(connect, 5 * 1000);
      });
    
      stream.on('data', function (msg) {
        logger.log('debug', `Topic: ${msg.topic}, Key: ${msg.key}, Timestamp: ${msg.timestamp}`);
    
        // strip diag messages
        // NOTE: have to coerce to string (due to FFI?)
        if (msg.key.toString() === 'Diag') {
          return;
        }
        let msgobj;
    
        try {
          // TODO find the user that needs to be notified for msg.object update
          msgobj = JSON.parse(msg.value)
        }
        catch(e) {
          // stringify the event if it is not JSON
          msgobj = msg.value.toString()
        }
    
        if (msgobj.deleted) {
          logger.log('info', 'Remove on: ' + msg.key + ': ' + msg.value);
          socket.emit('remove', {model: msg.key.toString(), msg: msgobj, deleted: true});
        }
        else {
          logger.log('info', 'Update on: ' + msg.key + ': ' + msg.value);
          socket.emit('update', {model: msg.key.toString(), msg: msgobj});
        }
    
      });
    }
    catch(err) {
      logger.log('warning', 'Failed to connect to kafka, reconnecting in 5 sec')
      logger.log('debug', err);
      setTimeout(connect, 5 * 1000);
    }
  }

  connect()

})();
