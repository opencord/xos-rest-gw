
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

  const mockRequest = {
    get: () => {
      return {
        end: (fn) => {
          fn(null, {body: [
            {name: 'Slice'},
            {name: 'Site'}
          ]});
        }
      }
    }
  }
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

      // Override the superagent module with our mockRequest instance
      mockery.registerMock('superagent', mockRequest);

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