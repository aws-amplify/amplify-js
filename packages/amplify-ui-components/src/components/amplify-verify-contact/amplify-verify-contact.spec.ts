import { newSpecPage } from '@stencil/core/testing';

import { AmplifyVerifyContact } from './amplify-verify-contact';
import * as stories from './amplify-verify-contact.stories';

const {
	default: { title },
	...templates
} = stories;

const components = [AmplifyVerifyContact];

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
