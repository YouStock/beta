'use strict';

describe('Component: CryptodexComponent', function() {
  // load the controller's module
  beforeEach(module('betaApp.cryptodex'));

  var CryptodexComponent;

  // Initialize the controller and a mock scope
  beforeEach(inject(function($componentController) {
    CryptodexComponent = $componentController('cryptodex', {});
  }));

  it('should ...', function() {
    expect(1).to.equal(1);
  });
});
