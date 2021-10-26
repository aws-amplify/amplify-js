import { newSpecPage } from '@stencil/core/testing';

import { AmplifyAmazonButton } from './amplify-amazon-button';
import * as stories from './amplify-amazon-button.stories';

const {
	default: { title },
	...specs
} = stories;

const components = [AmplifyAmazonButton];

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
