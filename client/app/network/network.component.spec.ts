'use strict';

describe('Component: NetworkComponent', function() {
  // load the controller's module
  beforeEach(module('betaApp.network'));

  var NetworkComponent;

  // Initialize the controller and a mock scope
  beforeEach(inject(function($componentController) {
    NetworkComponent = $componentController('network', {});
  }));

  it('should ...', function() {
    expect(1).to.equal(1);
  });
});
