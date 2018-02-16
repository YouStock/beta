'use strict';

describe('Component: OpenComponent', function() {
  // load the controller's module
  beforeEach(module('betaApp.openWallet'));

  var OpenComponent;

  // Initialize the controller and a mock scope
  beforeEach(inject(function($componentController) {
    OpenComponent = $componentController('open', {});
  }));

  it('should ...', function() {
    expect(1).to.equal(1);
  });
});
