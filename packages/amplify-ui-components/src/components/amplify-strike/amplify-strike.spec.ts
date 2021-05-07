import { newSpecPage } from '@stencil/core/testing';

import { AmplifyStrike } from './amplify-strike';
import * as stories from './amplify-strike.stories';

const {
	default: { title },
	...templates
} = stories;

const components = [AmplifyStrike];

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
