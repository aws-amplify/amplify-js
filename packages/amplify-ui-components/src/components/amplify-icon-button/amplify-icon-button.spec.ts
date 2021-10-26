import { newSpecPage } from '@stencil/core/testing';
import { AmplifyIconButton } from './amplify-icon-button';
import { icons } from '../amplify-icon/icons';

/** Helper functions */
async function snapshotTestIconButton(iconName: string) {
	const page = await newSpecPage({
		components: [AmplifyIconButton],
		html: `<amplify-icon-button name='${iconName}'></amplify-icon>`,
	});

	expect(page.root).toMatchSnapshot();
}

describe('amplify-icon-button spec:', () => {
	describe('Render logic ->', () => {
		Object.keys(icons).map(name => {
			it(`renders ${name} icon button correctly`, async () =>
				snapshotTestIconButton(name));
		});
	});
});
