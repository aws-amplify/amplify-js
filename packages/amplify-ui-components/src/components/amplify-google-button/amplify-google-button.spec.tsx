import { newSpecPage } from '@stencil/core/testing';

import { AmplifyGoogleButton } from './amplify-google-button';
import * as stories from './amplify-google-button.stories';

const {
	default: { title },
	...specs
} = stories;

const components = [AmplifyGoogleButton];

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
