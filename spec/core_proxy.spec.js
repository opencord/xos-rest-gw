
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
  const supertest = require('supertest');
  const mockery = require('mockery');
  chai.use(sinonChai);

  const request = require('superagent');
  const stub = require('./spec_helper.js');

  const configMock = {
    xos: {
      host: 'http://test-xos-url',
      port: '80'
    }
  };

  let app;

  xdescribe('The core proxy routes [REST API moved to chameleon]', () => {

    // stub for GET method
    stub.makeStub('getSuccess', request, 'get', cb => {
        cb(null, {
        status: 200, 
        body: {msg: 'successfully proxied'}
      });
    });

    // stub for POST method
    stub.makeStub('postSuccess', request, 'post', cb => {
        cb(null, {
        status: 201, 
        body: {msg: 'successfully proxied'}
      });
    });

    // stub for PUT method
    stub.makeStub('putSuccess', request, 'put', cb => {
        cb(null, {
        status: 200, 
        body: {msg: 'successfully proxied'}
      });
    });

    // stub for DELETE method
    stub.makeStub('deleteSuccess', request, 'delete', cb => {
        cb(null, {
        status: 204
      });
    });

    // mocking the config.rest module
    before(() => {
      mockery.enable({
        warnOnReplace: true,
        warnOnUnregistered: false
      });
      mockery.registerMock('../config/config.js', configMock);

      app = require('../src/server.js').app;
    });

    after(() => {
      mockery.deregisterMock('../config/config.js');
      mockery.disable();
    });

    it('should read XOS address from config.rest module', (done) => {
      const myStub = stub.getStub('getSuccess');

      supertest(app)
      .get('/api/core/')
      .end((err) => {
        if (err) return done(err);
        expect(myStub.get.called).to.be.true;
        expect(myStub.get).to.have.been.calledWith('http://test-xos-url:80/api/core/');
        done();
      });
    });

    it('should pass token and cookies along with the request', (done) => {
      const myStub = stub.getStub('getSuccess');

      supertest(app)
      .get('/api/core/')
      .set('Accept', 'application/json')
      .set('x-csrftoken', 'testToken')
      .set('x-sessionid', 'testSession')
      .end(function(err) {
        if (err) return done(err);
        expect(myStub.set.getCall(0)).to.have.been.calledWith('x-csrftoken', 'testToken');
        expect(myStub.set.getCall(1)).to.have.been.calledWith('cookie', 'xoscsrftoken=testToken; xossessionid=testSession');
        done();
      });
    });

    it('should pass query paramenters along with the request', (done) => {
      const myStub = stub.getStub('getSuccess');

      supertest(app)
      .get('/api/core/instances/?no_hyperlink=1&node=1')
      .end((err) => {
        if (err) return done(err);
        expect(myStub.get.called).to.be.true;
        expect(myStub.get).to.have.been.calledWith('http://test-xos-url:80/api/core/instances/?no_hyperlink=1&node=1');
        done();
      });
    });

    it('should proxy GET request to XOS', (done) => {
      supertest(app)
      .get('/api/core/')
      .set('Accept', 'application/json')
      .set('x-csrftoken', 'testToken')
      .set('cookie', 'testCookie')
      .end(function(err, res) {
        if (err) return done(err);
        expect(res.status).to.equal(200);
        expect(res.body).to.deep.equal({msg: 'successfully proxied'});
        done();
      });
    });

    it('should proxy POST request to XOS', (done) => {

      const myStub = stub.getStub('postSuccess');

      supertest(app)
      .post('/api/core/')
      .send({foo: 'bar'})
      .set('Accept', 'application/json')
      .set('x-csrftoken', 'testToken')
      .set('cookie', 'testCookie')
      .end(function(err, res) {
        if (err) return done(err);
        expect(myStub.send.getCall(0)).to.have.been.calledWith({foo: 'bar'});
        expect(res.status).to.equal(201);
        expect(res.body).to.deep.equal({msg: 'successfully proxied'});
        done();
      });
    });

    it('should proxy PUT request to XOS', (done) => {

      const myStub = stub.getStub('putSuccess');

      supertest(app)
      .put('/api/core/')
      .send({foo: 'bar'})
      .set('Accept', 'application/json')
      .set('x-csrftoken', 'testToken')
      .set('cookie', 'testCookie')
      .end(function(err, res) {
        if (err) return done(err);
        expect(myStub.send.getCall(0)).to.have.been.calledWith({foo: 'bar'});
        expect(res.status).to.equal(200);
        expect(res.body).to.deep.equal({msg: 'successfully proxied'});
        done();
      });
    });

    it('should proxy DELETE request to XOS', (done) => {

      const myStub = stub.getStub('deleteSuccess');

      supertest(app)
      .delete('/api/core/')
      .set('Accept', 'application/json')
      .set('x-csrftoken', 'testToken')
      .set('cookie', 'testCookie')
      .end(function(err, res) {
        if (err) return done(err);
        expect(myStub.send).not.to.have.been.called;
        expect(res.status).to.equal(204);
        done();
      });
    });
  });
})();