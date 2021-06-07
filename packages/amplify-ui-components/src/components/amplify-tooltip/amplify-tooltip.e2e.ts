import { E2EPage, newE2EPage } from '@stencil/core/testing';
import { pixelThreshold } from '../../common/testing';

describe('amplify-tooltip e2e:', () => {
	let page: E2EPage;

	beforeEach(async () => {
		page = await newE2EPage();
	});

	it('renders a tooltip correctly', async () => {
		await page.setContent(
			'<div style="margin-bottom:60px"></div> <amplify-tooltip text="Tooltip" should-auto-show="true">FOO</amplify-tooltip>'
		);
		const tooltip = await page.find('amplify-tooltip');
		expect(tooltip).not.toBeNull();

		const screenshot = await page.compareScreenshot('amplify-tooltip', {
			fullPage: true,
		});
		expect(screenshot).toMatchScreenshot({
			allowableMismatchedPixels: pixelThreshold,
		});
	});

	it(`renders an always-visible tooltip if 'shouldAutoShow' is true`, async () => {
		await page.setContent(`
      <amplify-tooltip text="Tooltip" should-auto-show="true">
        <div id="toHover">FOO</div>
      </amplify-tooltip>
    `);

		const tooltip = await page.find('amplify-tooltip');

		// Move mouse away from div with tooltip -- should still be visible
		await page.mouse.move(500, 500);
		await page.waitFor(1500);
		const tooltipInnerDiv = await tooltip.find('div');
		const opacityNoHover = (await tooltipInnerDiv.getComputedStyle(':after'))
			.opacity;
		expect(opacityNoHover).toEqual('1');

		// Hover div with tooltip -- should still be visible
		await page.hover('#toHover');
		await page.waitFor(1500);
		const opacityHover = (await tooltipInnerDiv.getComputedStyle(':after'))
			.opacity;
		expect(opacityHover).toEqual('1');
	});

	it(`renders a tooltip that is only visible on hover if 'shouldAutoShow' is false`, async () => {
		await page.setContent(`
      <amplify-tooltip text="Tooltip" should-auto-show="false">
        <div id="toHover">FOO</div>
      </amplify-tooltip>
    `);

		const tooltip = await page.find('amplify-tooltip');

		// Move mouse away from div with tooltip -- should not be visible
		await page.mouse.move(500, 500);
		await page.waitFor(1500);
		const tooltipInnerDiv = await tooltip.find('div');
		const opacityNoHover = (await tooltipInnerDiv.getComputedStyle(':after'))
			.opacity;
		expect(opacityNoHover).toEqual('0');

		// Hover div with tooltip -- should become visible
		await page.hover('#toHover');
		await page.waitFor(1500);
		const opacityHover = (await tooltipInnerDiv.getComputedStyle(':after'))
			.opacity;
		expect(opacityHover).toEqual('1');
	});
});
