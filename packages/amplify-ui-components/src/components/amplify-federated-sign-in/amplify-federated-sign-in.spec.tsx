import { newSpecPage } from '@stencil/core/testing';

import { AmplifyFederatedSignIn } from './amplify-federated-sign-in';
import * as stories from './amplify-federated-sign-in.stories';

const {
	default: { title },
	...specs
} = stories;

const components = [AmplifyFederatedSignIn];

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
