'use strict';

describe('Component: YourstockComponent', function() {
  // load the controller's module
  beforeEach(module('betaApp.yourstock'));

  var YourstockComponent;

  // Initialize the controller and a mock scope
  beforeEach(inject(function($componentController) {
    YourstockComponent = $componentController('yourstock', {});
  }));

  it('should ...', function() {
    expect(1).to.equal(1);
  });
});
