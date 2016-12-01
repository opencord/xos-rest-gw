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