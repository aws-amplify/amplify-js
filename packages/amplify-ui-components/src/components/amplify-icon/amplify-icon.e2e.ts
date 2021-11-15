import { newE2EPage } from '@stencil/core/testing';
import { pixelThreshold } from '../../common/testing';
import { icons } from './icons';

/** Helper functions */
async function matchIcon(iconName: string) {
	const page = await newE2EPage();

	await page.setContent(`<amplify-icon name='${iconName}'></amplify-icon>`);
	const screenshot = await page.compareScreenshot('Amplify icon', {
		fullPage: true,
	});
	expect(screenshot).toMatchScreenshot({
		allowableMismatchedPixels: pixelThreshold,
	});

	const iconElement = await page.find('amplify-icon');
	expect(iconElement).not.toBeNull();
}

/** Tests */
describe('amplify-icon e2e:', () => {
	Object.keys(icons).map((name) => {
		it(`renders with the ${name} icon`, async () => matchIcon(name));
	});
});
