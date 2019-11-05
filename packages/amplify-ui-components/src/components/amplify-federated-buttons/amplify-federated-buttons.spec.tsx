import { newSpecPage } from '@stencil/core/testing';

import { AmplifyFederatedButtons } from './amplify-federated-buttons';
import * as stories from './amplify-federated-buttons.stories';

const {
  default: { title },
  ...specs
} = stories;

const components = [AmplifyFederatedButtons];

describe(title, () => {
  describe('stories', () => {
    Object.entries(specs).forEach(([name, spec]) => {
      it(name, async () => {
        const page = await newSpecPage({ components, html: spec() });

        expect(page.root).toMatchSnapshot();
      });
    });
  });
});
