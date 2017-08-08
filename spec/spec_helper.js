
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
  
  const sinon = require('sinon');

  let stubCache = {};

  exports.makeStub = (name, target, method, cb) => {
    
    let methodStub, prototypeStub;

    function SuperAgentStub(end) {
      this.end = end;
      this.set = sinon.stub().returns(this);
      this.send = sinon.stub().returns(this);
      return this;
    }

    beforeEach(() => {
      methodStub = sinon.stub(target, method);

      prototypeStub = new SuperAgentStub(cb);

      methodStub.returns(prototypeStub);

      // cache stub (for use in tests)
      stubCache[name] = {
        set: prototypeStub.set,
        send: prototypeStub.send
      };
      stubCache[name][method] = methodStub
    });

    afterEach(() => {
      target[method].restore();
    });
    
  };

  exports.getStub = name => stubCache[name];

})();