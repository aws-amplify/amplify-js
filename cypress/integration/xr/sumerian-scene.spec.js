describe('sumerian-scene', function() {
  const selectors = {
    sumerianSceneDomId: "#scene-container-dom-id",
    sumerianSceneContainer: "[data-test=sumerian-scene-container]",
    sumerianSceneLoading: "[data-test=sumerian-scene-loading]",
    sumerianSceneCanvas: "#sumerian-canvas-inner-container > canvas",
    sumerianSceneBar: "[data-test=sumerian-scene-actions]"
  }

  beforeEach(function() {
    cy.visit('/');
  });

  it('successfully loads a Sumerian scene', function() {
      cy.get(selectors.sumerianSceneContainer);
      cy.get(selectors.sumerianSceneLoading);
      cy.get(selectors.sumerianSceneDomId);
      cy.get(selectors.sumerianSceneCanvas);
      cy.get(selectors.sumerianSceneBar, { timeout: 20000 });
  });
});
  