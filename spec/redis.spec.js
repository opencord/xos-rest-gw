(function () {
  'use strict';
  
  const chai = require('chai');
  const expect = chai.expect;
  const sinon = require('sinon');
  const sinonChai = require('sinon-chai');
  const mockery = require('mockery');
  chai.use(sinonChai);
  const fakeredis = require('fakeredis');

  const client = fakeredis.createClient('test-client');
  const publisher = fakeredis.createClient('test-client');

  const socketSpy = sinon.spy();
  const mockSocket = {
    get: () => {
      return {
        emit: socketSpy
      }
    }
  };
  const channelName = 'Site';

  describe('The event system', () => {

    before((done) => {

      // Enable mockery to mock objects
      mockery.enable({
          warnOnReplace: false,
          warnOnUnregistered: false
      });

      // Stub the createClient method to *always* return the client created above
      sinon.stub(fakeredis, 'createClient', () => client);

      // Override the redis module with our fakeredis instance
      mockery.registerMock('redis', fakeredis);

      // mock the socketIo client to have a spy
      mockery.registerMock('./websocket.js', mockSocket);

      require('../src/controllers/redis.js');
      setTimeout(() => {
        done();
      }, 1000);
    });

    after(() => {
      mockery.disable();
      fakeredis.createClient.restore();
    });

    // run after each test
    beforeEach(() => {
      client.unsubscribe(channelName);
      client.subscribe(channelName);
      publisher.flushdb();
    });

    it('should send a websocket event when it receive a redis event that is not JSON', (done) => {
      publisher.publish(channelName, 'I am sending a message.');
      setTimeout(() => {
        expect(socketSpy).to.have.been.called;
        expect(socketSpy).to.have.been.calledWith('event', {
          model: channelName,
          msg: 'I am sending a message.'
        });
        done();
      }, 500)
    });

    it('should send a websocket event when it receive a redis event that is JSON', (done) => {
      publisher.publish(channelName, JSON.stringify({msg: 'Json Message'}));
      setTimeout(() => {
        expect(socketSpy).to.have.been.called;
        expect(socketSpy).to.have.been.calledWith('event', {
          model: channelName,
          msg: {msg: 'Json Message'}
        });
        done();
      }, 1000)
    });
  });
})();