
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

  const chai = require('chai');
  const expect = chai.expect;
  const sinonChai = require('sinon-chai');
  chai.use(sinonChai);
  const io = require('socket.io-client');
  const server = require('../src/server.js');
  const port = 4000;
  describe('Websocket', function() {

    var client;

    beforeEach(function(done) {
      // Start our server
      server.start(port);

      // connect a client to the server
      client = io.connect(`http://localhost:${port}`, {
        query: 'name=test@xos.org&token=testToken&sessionId=testSession&id=1'
      });

      // when is connected start testing
      client.on('connect', () => {
        done();
      });
    });

    afterEach((done) => {
      // disconnect the client
      if(client.connected) {
        client.disconnect();
      }
      done();
    });

    it('should store user details for a new connection', () => {
      const clients = require('../src/controllers/clients.js');
      const user = clients.clients[0];
      expect(user.name).to.equal('test@xos.org')
    });

    it('should not store the same user twice', (done) => {

      // connect a client to the server
      const client2 = io.connect(`http://localhost:${port}`, {
        query: 'name=test@xos.org&token=testToken&sessionId=testSession&id=1'
      });

      // when is connected start testing
      client2.on('connect', () => {
        setTimeout(() => {
          const clients = require('../src/controllers/clients.js');
          expect(clients.clients.length).to.equal(1)
          done();
        }, 100);
      });

    });

    it('should remove a user on disconnect', (done) => {
      client.disconnect();
      // we need to wait for the event to be dispatched
      setTimeout(() => {
        const clients = require('../src/controllers/clients.js');
        expect(clients.clients.length).to.equal(0)
        done();
      }, 100);
    });

  });
})();