 // ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
//
//
// -- This is a parent command --
// Cypress.Commands.add('login', (email, password) => { ... })
//
//
// -- This is a child command --
// Cypress.Commands.add('drag', { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add('dismiss', { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This will overwrite an existing command --
// Cypress.Commands.overwrite('visit', (originalFn, url, options) => { ... })

Cypress.Commands.add('mockCharts', () => {
  cy.window().then((win) => {
    const fakeContext: Partial<CanvasRenderingContext2D> = {
      fillRect: () => {},
      clearRect: () => {},
      getImageData: () => new ImageData(1, 1),
      putImageData: () => {},
      createImageData: () => new ImageData(1, 1),
      setTransform: () => {},
      drawImage: () => {},
      save: () => {},
      fillText: () => {},
      restore: () => {},
      beginPath: () => {},
      moveTo: () => {},
      lineTo: () => {},
      closePath: () => {},
      stroke: () => {},
      translate: () => {},
      scale: () => {},
      rotate: () => {},
      arc: () => {},
      fill: () => {},
      rect: () => {},
      clip: () => {},
      measureText: () =>
        ({
          width: 0,
          actualBoundingBoxAscent: 0,
          actualBoundingBoxDescent: 0,
          actualBoundingBoxLeft: 0,
          actualBoundingBoxRight: 0,
          fontBoundingBoxAscent: 0,
          fontBoundingBoxDescent: 0,
          emHeightAscent: 0,
          emHeightDescent: 0,
          hangingBaseline: 0,
          alphabeticBaseline: 0,
          ideographicBaseline: 0,
        } as TextMetrics),
    };

    const stubGetContext = function (
      contextId: "2d" | "bitmaprenderer" | "webgl" | "webgl2"
    ): CanvasRenderingContext2D | ImageBitmapRenderingContext | WebGLRenderingContext | WebGL2RenderingContext | null {
      if (contextId === "2d") {
        return fakeContext as CanvasRenderingContext2D;
      }
      return null;
    };

    // Cast with the full expected getContext type signature
    (win.HTMLCanvasElement.prototype.getContext as typeof stubGetContext) = stubGetContext;
  });
});


// === TYPE DECLARATIONS ===

declare global {
  namespace Cypress {
    interface Chainable {
      mockCharts(): Chainable<void>;
    }
  }
}

export {};