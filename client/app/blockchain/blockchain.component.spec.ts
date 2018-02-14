'use strict';

describe('Component: BlockchainComponent', function() {
  // load the controller's module
  beforeEach(module('betaApp.blockchain'));

  var BlockchainComponent;

  // Initialize the controller and a mock scope
  beforeEach(inject(function($componentController) {
    BlockchainComponent = $componentController('blockchain', {});
  }));

  it('should ...', function() {
    expect(1).to.equal(1);
  });
});
