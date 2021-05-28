import { newSpecPage } from '@stencil/core/testing';

import { AmplifyOAuthButton } from './amplify-oauth-button';
import * as stories from './amplify-oauth-button.stories';

const {
	default: { title },
	...specs
} = stories;

const components = [AmplifyOAuthButton];

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
