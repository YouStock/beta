'use strict';

describe('Component: MarketComponent', function() {
  // load the controller's module
  beforeEach(module('betaApp.market'));

  var MarketComponent;

  // Initialize the controller and a mock scope
  beforeEach(inject(function($componentController) {
    MarketComponent = $componentController('market', {});
  }));

  it('should ...', function() {
    expect(1).to.equal(1);
  });
});
