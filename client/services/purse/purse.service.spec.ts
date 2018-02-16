'use strict';

describe('Service: purse', function() {
  // load the service's module
  beforeEach(module('betaApp.purse'));

  // instantiate service
  var purse;
  beforeEach(inject(function(_purse_) {
    purse = _purse_;
  }));

  it('should do something', function() {
    expect(!!purse).to.be.true;
  });
});
