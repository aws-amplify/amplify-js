import { I18n } from '../src/I18n/I18n';

describe('I18n test', () => {
	describe('setLanguage', () => {
		test('happy case', () => {
			const i18n = new I18n(null);

			i18n.setLanguage('en');
		});
	});

	describe('get test', () => {
		test('no language', () => {
			const i18n = new I18n(null);

			i18n._lang = null;
			expect(i18n.get('key')).toBe('key');
			expect(i18n.get('key', 'defVal')).toBe('defVal');
		});

		test('has language', () => {
			const i18n = new I18n(null);

			i18n._lang = 'en';
			const spyon = jest
				.spyOn(I18n.prototype, 'getByLanguage')
				.mockReturnValueOnce('val');

			expect(i18n.get('key')).toBe('val');

			spyon.mockClear();
		});

		test('has language 2', () => {
			const i18n = new I18n(null);

			i18n._lang = 'en-val';
			const spyon = jest
				.spyOn(I18n.prototype, 'getByLanguage')
				.mockImplementationOnce((key, lang) => {
					if (lang === 'en-val') return null;
					else if (lang === 'en') return 'val';
				});

			expect(i18n.get('key')).toBe('key');

			spyon.mockClear();
		});

		test('has language 2', () => {
			const i18n = new I18n(null);

			i18n._lang = 'other';
			const spyon = jest
				.spyOn(I18n.prototype, 'getByLanguage')
				.mockReturnValueOnce(null);

			expect(i18n.get('key')).toBe('key');

			spyon.mockClear();
		});

		test('empty string should be returned', () => {
			const i18n = new I18n(null);
			i18n._dict = {
				en: {
					empty_string: '',
				},
			};
			expect(i18n.get('empty_string')).toBe('');
		});
	});

	describe('getByLangurage test', () => {
		test('happy case', () => {
			const i18n = new I18n(null);

			expect(i18n.getByLanguage('key', undefined)).toBeNull();
		});

		test('has dict', () => {
			const i18n = new I18n(null);
			i18n._dict = {
				en: {
					key: 'val',
				},
			};

			expect(i18n.getByLanguage('key', 'en', 'defval')).toBe('val');
		});

		test('no dict', () => {
			const i18n = new I18n(null);
			i18n._dict = {};

			expect(i18n.getByLanguage('key', 'en', 'val')).toBe('val');
		});
	});

	describe('putVocabulariesForLanguage test', () => {
		test('happy case', () => {
			const i18n = new I18n(null);

			i18n.putVocabulariesForLanguage('cn', {
				hello: '你好',
				exciting: '+1s',
			});

			i18n._dict = {
				cn: {},
			};
		});
	});
});
