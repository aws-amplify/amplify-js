import { newSpecPage } from '@stencil/core/testing';
import { AmplifyTooltip } from './amplify-tooltip';

describe('amplify-tooltip spec:', () => {
	describe('Component logic ->', () => {
		let tooltip;

		beforeEach(() => {
			tooltip = new AmplifyTooltip();
		});

		it('should have automatically shown prop set to false by default', () => {
			expect(tooltip.shouldAutoShow).toBe(false);
		});
	});
	describe('Render logic ->', () => {
		it('should render an automatically-shown tooltip', async () => {
			const page = await newSpecPage({
				components: [AmplifyTooltip],
				html: `<amplify-tooltip should-auto-show='true'></amplify-tooltip>`,
			});

			expect(page.root).toMatchSnapshot();
		});

		it('should render a normal tooltip by default', async () => {
			const page = await newSpecPage({
				components: [AmplifyTooltip],
				html: `<amplify-tooltip></amplify-tooltip>`,
			});

			expect(page.root).toMatchSnapshot();
		});

		it('should render without Emotion CSS classes', async () => {
			const page = await newSpecPage({
				components: [AmplifyTooltip],
				html: `<amplify-tooltip></amplify-tooltip>`,
			});

			expect(page.root).toMatchSnapshot();
		});
	});
});
