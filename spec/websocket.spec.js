(function () {
  'use strict';

  const chai = require('chai');
  const expect = chai.expect;
  const sinonChai = require('sinon-chai');
  chai.use(sinonChai);
  const io = require('socket.io-client');
  const server = require('../src/server.js');

  describe('basic socket.io example', function() {

    var client;

    beforeEach(function(done) {
      // Start our server
      server.start();

      // connect a client to the server
      client = io.connect('http://localhost:3000', {
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
      const client2 = io.connect('http://localhost:3000', {
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