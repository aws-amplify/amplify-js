import { newSpecPage } from '@stencil/core/testing';

import { AmplifyGoogleButton } from './amplify-google-button';
import * as stories from './amplify-google-button.stories';

const {
  default: { title },
  ...templates
} = stories;

const components = [AmplifyGoogleButton];

describe(title, () => {
  describe('stories', () => {
    Object.entries(templates).forEach(([name, template]) => {
      it(name, async () => {
        const page = await newSpecPage({ components, template });

        expect(page.root).toMatchSnapshot();
      });
    });
  });
});
