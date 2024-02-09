import { I18n } from '../src/I18n/I18n';

describe('I18n test', () => {
	describe('setLanguage', () => {
		test('happy case', () => {
			const i18n = new I18n();

			i18n.setLanguage('en');
		});
	});

	describe('get test', () => {
		let languageGetterSpy;

		beforeEach(() => {
			languageGetterSpy = jest.spyOn(window.navigator, 'language', 'get')
		});

		test('no language', () => {
			const i18n = new I18n();

			i18n._lang = null;
			expect(i18n.get('key')).toBe('key');
			expect(i18n.get('key', 'defVal')).toBe('defVal');
		});

		test('has language', () => {
			const i18n = new I18n();

			i18n._lang = 'en';
			const spyon = jest
				.spyOn(I18n.prototype, 'getByLanguage')
				.mockReturnValueOnce('val');

			expect(i18n.get('key')).toBe('val');

			spyon.mockClear();
		});

		test('has language 2', () => {
			const i18n = new I18n();

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
			const i18n = new I18n();

			i18n._lang = 'other';
			const spyon = jest
				.spyOn(I18n.prototype, 'getByLanguage')
				.mockReturnValueOnce(null);

			expect(i18n.get('key')).toBe('key');

			spyon.mockClear();
		});

		test('sets default language', () => {
			languageGetterSpy.mockReturnValue('fr')

			const i18n = new I18n();

			i18n.putVocabularies({
				'fr': {
					'Sign In': 'Se connecter',
				}
			});

			expect(i18n.get('Sign In')).toBe('Se connecter');
		});
	});

	describe('getByLanguage test', () => {
		test('happy case', () => {
			const i18n = new I18n();

			expect(i18n.getByLanguage('key', '')).toBeNull();
		});

		test('has dict', () => {
			const i18n = new I18n();
			i18n._dict = {
				en: {
					key: 'val',
				},
			};

			expect(i18n.getByLanguage('key', 'en', 'defval')).toBe('val');
		});

		test('no dict', () => {
			const i18n = new I18n();
			i18n._dict = {};

			expect(i18n.getByLanguage('key', 'en', 'val')).toBe('val');
		});
	});

	describe('putVocabulariesForLanguage test', () => {
		test('happy case', () => {
			const i18n = new I18n();

			i18n.putVocabulariesForLanguage('cn', {
				hello: '你好',
				exciting: '+1s',
			});

			i18n._dict = {
				cn: {},
			};
		});

		test('multi-call putVocabulariesForLanguage results in correct get result', () => {
			const i18n = new I18n();

			i18n.putVocabulariesForLanguage('cn', {
				hello: '你好',
				exciting: '+1s',
				stable: 'x',
			});

			i18n.putVocabulariesForLanguage('cn', {
				exciting: '+2s',
			});

			expect(i18n.getByLanguage('exciting', 'cn')).toEqual('+2s');
			expect(i18n.getByLanguage('stable', 'cn')).toEqual('x');

			i18n._dict = {
				cn: {},
			};
		});
	});
});
