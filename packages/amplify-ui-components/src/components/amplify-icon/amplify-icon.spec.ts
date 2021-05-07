import { newSpecPage } from '@stencil/core/testing';
import { AmplifyIcon } from './amplify-icon';
import { icons } from './icons';

/** Helper functions */
async function snapshotTestIcon(iconName: string) {
	const page = await newSpecPage({
		components: [AmplifyIcon],
		html: `<amplify-icon name='${iconName}'></amplify-icon>`,
	});

	expect(page.root).toMatchSnapshot();
}

/** Tests */
describe('amplify-icon spec:', () => {
	describe('Render logic ->', () => {
		Object.keys(icons).map(name => {
			it(`renders ${name} correctly`, async () => snapshotTestIcon(name));
		});
	});
});
