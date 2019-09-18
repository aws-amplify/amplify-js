import { calcKey } from '../../src/Storage/Common';

window.encodeURI = name => {
	return name;
};

describe('Storage Common test', () => {
	describe('calcKey test', () => {
		const file = {
			name: 'name',
			size: 'size',
			type: 'type',
		};

		test('happy case when fileToKey is a string', () => {
			expect(calcKey(file, 'fileToKey')).toBe('fileToKey');
		});

		test('happy case when fileToKey is a function', () => {
			const mockFn = jest.fn().mockImplementation(obj => {
				let str = '';
				for (const k in obj) {
					str += obj[k] + ' ';
				}
				return str;
			});

			expect(calcKey(file, mockFn)).toBe('name_size_type_');
		});

		test('happy case when fileToKey is a object', () => {
			const fileToKey = { attr: 'attr' };

			expect(calcKey(file, fileToKey)).toBe('{"attr":"attr"}');
		});

		test('key is empty', () => {
			const mockFn = jest.fn().mockImplementation(obj => {
				return null;
			});

			expect(calcKey(file, mockFn)).toBe('empty_key');
		});

		test('fileToKey is empty', () => {
			expect(calcKey(file, null)).toBe('name');
		});
	});
});
