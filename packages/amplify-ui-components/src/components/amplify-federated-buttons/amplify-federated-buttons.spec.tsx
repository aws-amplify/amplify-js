import { newSpecPage } from '@stencil/core/testing';

import { AmplifyFederatedButtons } from './amplify-federated-buttons';
import * as stories from './amplify-federated-buttons.stories';

const {
	default: { title },
	...templates
} = stories;

const components = [AmplifyFederatedButtons];

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
