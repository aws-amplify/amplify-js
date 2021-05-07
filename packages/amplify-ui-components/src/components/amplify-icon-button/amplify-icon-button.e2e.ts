import { newE2EPage } from '@stencil/core/testing';
import { pixelThreshold } from '../../common/testing';
import { icons } from '../amplify-icon/icons';

/** Helper functions */
async function matchIcon(iconName: string) {
	const page = await newE2EPage();

	await page.setContent(`<amplify-icon-button name='${iconName}' />`);
	const screenshot = await page.compareScreenshot('Amplify Icon Button', {
		fullPage: true,
	});
	expect(screenshot).toMatchScreenshot({
		allowableMismatchedPixels: pixelThreshold,
	});

	const iconButtonElement = await page.find('amplify-icon-button');
	expect(iconButtonElement).not.toBeNull();
}

/** Tests */
describe('amplify-icon-button e2e:', () => {
	Object.keys(icons).map(name => {
		it(`renders with the ${name} icon`, async () => matchIcon(name));
	});
});
