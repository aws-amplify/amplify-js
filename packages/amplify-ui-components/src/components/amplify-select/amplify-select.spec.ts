import { newSpecPage } from '@stencil/core/testing';
import { AmplifySelect } from './amplify-select';

describe('amplify-select spec:', () => {
	describe('Component logic ->', () => {
		let select;

		beforeEach(() => {
			select = new AmplifySelect();
		});

		it('should have options be defined by default', () => {
			expect(select.options).toBeDefined();
		});

		it('should throw an error when there is a mixture of `string` and `number` values', () => {
			const options = [
				{ label: 'us-east-1', value: '1' },
				{ label: 'us-west-2', value: '2' },
				{ label: 'us-west-1', value: 3 },
			];

			select.options = options;

			expect(select.options).toBeDefined();
			expect(select.contructSelectOptions).toThrowError();
		});

		it('should use custom options when passed from parent', () => {
			const options = [
				{ label: 'Gogi', value: '1' },
				{ label: 'Gucci', value: '2' },
				{ label: 'Foooci', value: '3' },
			];

			select.options = options;

			expect(select.options).toBeDefined();
			expect(select.options).toEqual(options);
		});

		it('should throw an error if label from options is not a string', () => {
			const options = [{ label: 1, value: 1 }];

			select.options = options;

			expect(select.options).toBeDefined();
			expect(select.contructSelectOptions).toThrowError();
		});
	});

	describe('Render logic ->', () => {
		it('should render an empty `placeholder` label and value of `1` by default', async () => {
			const page = await newSpecPage({
				components: [AmplifySelect],
				html: `<amplify-select></amplify-select>`,
			});

			expect(page.root).toMatchSnapshot();
		});
	});
});
