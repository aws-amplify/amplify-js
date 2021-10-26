import { newSpecPage } from '@stencil/core/testing';

import { AmplifyAuth0Button } from './amplify-auth0-button';
import * as stories from './amplify-auth0-button.stories';

const {
	default: { title },
	...templates
} = stories;

const components = [AmplifyAuth0Button];

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
