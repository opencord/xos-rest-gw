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

  const socketSpy = sinon.spy();

  const mockSocket = {
    get: () => {
      return {
        emit: socketSpy
      }
    }
  };

  const trigger = {}

  const mockStream = {
    on: (event, cb) => {
      trigger[event] = cb
    },
    consumer: {
      on: sinon.spy()
    }
  }

  const fakekafka = {
    KafkaConsumer: {
      createReadStream: () => mockStream
    }
  }

  const channelName = 'Site';
  const msgTopic = 'xos.gui_events';

  describe('The event system', () => {

    before((done) => {

      // Enable mockery to mock objects
      mockery.enable({
          warnOnReplace: false,
          warnOnUnregistered: false
      });

      // Override the node-rdkafka module with our fakekafka instance
      mockery.registerMock('node-rdkafka', fakekafka);

      // mock the socketIo client to have a spy
      mockery.registerMock('./websocket.js', mockSocket);

      require('../src/controllers/kafka.js');
      setTimeout(() => {
        done();
      }, 1000);
    });

    after(() => {
      mockery.disable();
    });

    // run after each test
    beforeEach(() => {
      socketSpy.reset();
    });

    it('should send a websocket event when text Kafka event is received', (done) => {
      trigger.data({topic:msgTopic,
                    key:channelName,
                    timestamp:1234,
                    value:'I am sending a message.',
                    });

      setTimeout(() => {
        expect(socketSpy).to.have.been.called;
        expect(socketSpy).to.have.been.calledWith('update', {
          model: channelName,
          msg: 'I am sending a message.'
        });
        done();
      }, 500)
    });

    it('should send a websocket event when JSON Kafka event is received', (done) => {
      trigger.data({topic:msgTopic,
                    key:channelName,
                    timestamp:2345,
                    value:JSON.stringify({msg: 'JSON Message'}),
                    });

      setTimeout(() => {
        expect(socketSpy).to.have.been.called;
        expect(socketSpy).to.have.been.calledWith('update', {
          model: channelName,
          msg: {msg: 'JSON Message'}
        });
        done();
      }, 1000)
    });

    it('should send a websocket event with msg: Deleted when JSON object has deleted:true', (done) => {
      trigger.data({topic:msgTopic,
                    key:channelName,
                    timestamp:3456,
                    value:JSON.stringify({msg: 'Deleted', deleted: true}),
                    });

      setTimeout(() => {
        expect(socketSpy).to.have.been.called;
        expect(socketSpy).to.have.been.calledWith('remove', {
          model: channelName,
          msg: {
            msg: 'Deleted',
            deleted: true
          },
          deleted: true
        });

        done();
      }, 1000)
    });

    it('should not send a websocket event if the Kafka key is Diag', (done) => {
      trigger.data({topic:msgTopic,
                    key:'Diag',
                    timestamp:4567,
                    value:JSON.stringify({msg: 'Diag Message'}),
                    });

      setTimeout(() => {
        expect(socketSpy).not.to.have.been.called;
        done();
      }, 1000)
    });

  });
})();
