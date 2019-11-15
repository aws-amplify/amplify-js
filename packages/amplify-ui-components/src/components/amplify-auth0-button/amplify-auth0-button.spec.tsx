import { newSpecPage } from '@stencil/core/testing';

import { AmplifyAuth0Button } from './amplify-auth0-button';
import * as stories from './amplify-auth0-button.stories';

const {
  default: { title },
  ...specs
} = stories;

const components = [AmplifyAuth0Button];

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
