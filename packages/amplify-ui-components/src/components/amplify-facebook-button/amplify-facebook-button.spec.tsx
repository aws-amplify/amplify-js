import { newSpecPage } from '@stencil/core/testing';

import { AmplifyFacebookButton } from './amplify-facebook-button';
import * as stories from './amplify-facebook-button.stories';

const {
	default: { title },
	...specs
} = stories;

const components = [AmplifyFacebookButton];

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
