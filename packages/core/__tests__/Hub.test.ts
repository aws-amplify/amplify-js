import { Hub } from '../src/Hub';
import { ConsoleLogger } from '../src';

describe('Hub', () => {
	const loggerSpy = jest.spyOn(ConsoleLogger.prototype, '_log');

	afterEach(() => {
		loggerSpy.mockClear();
	});

	test('happy case', () => {
		const listener = jest.fn();

		Hub.listen('auth', listener);

		Hub.dispatch(
			'auth',
			{
				event: 'signOut',
				data: 'the user has been signed out',
				message: 'User singout has taken place',
			},
			'Auth',
			Symbol.for('amplify_default'),
		);

		expect(listener).toHaveBeenCalled();
	});

	test('Protected channel', () => {
		const listener = jest.fn();

		Hub.listen('auth', listener);

		Hub.dispatch(
			'auth',
			{
				event: 'signOut',
				data: 'the user has been signed out',
				message: 'User singout has taken place',
			},
			'Auth',
		);

		expect(listener).toHaveBeenCalled();
		expect(loggerSpy).toHaveBeenCalledWith(
			'WARN',
			'WARNING: auth is protected and dispatching on it can have unintended consequences',
		);
	});

	test('Protected channel - ui', () => {
		const listener = jest.fn();

		Hub.listen('ui', listener);

		Hub.dispatch('ui', {
			event: 'auth:signOut:finished',
			data: 'the user has been signed out',
			message: 'User has been signed out',
		});

		expect(listener).toHaveBeenCalled();
		expect(loggerSpy).toHaveBeenCalledWith(
			'WARN',
			'WARNING: ui is protected and dispatching on it can have unintended consequences',
		);
	});
	test('Remove listener', () => {
		const listener = jest.fn();

		const unsubscribe = Hub.listen('auth', listener);

		Hub.dispatch(
			'auth',
			{
				event: 'signOut',
				data: 'the user has been signed out',
				message: 'User signout has taken place',
			},
			'Auth',
			Symbol.for('amplify_default'),
		);

		expect(listener).toHaveBeenCalled();

		listener.mockReset();

		unsubscribe();

		Hub.dispatch(
			'auth',
			{
				event: 'signOut2',
				data: 'the user has been signed out',
				message: 'User signout has taken place',
			},
			'Auth',
			Symbol.for('amplify_default'),
		);

		expect(listener).not.toHaveBeenCalled();
	});

	describe('Symbol fallback when not supported', () => {
		const originalSymbol = global.Symbol;

		beforeAll(() => {
			global.Symbol = undefined as any;
			jest.resetModules();
		});

		afterAll(() => {
			global.Symbol = originalSymbol;
		});

		it('works with Symbol fallback', () => {
			const mockListener = jest.fn();

			const {
				Hub: HubInstance,
				AMPLIFY_SYMBOL: amplifySymbolValue,
			} = require('../src/Hub');

			expect(amplifySymbolValue).toStrictEqual('@@amplify_default');

			HubInstance.listen('auth', mockListener);

			HubInstance.dispatch(
				'auth',
				{
					event: 'signOut',
					data: 'the user has been signed out',
					message: 'User signout has taken place',
				},
				'Auth',
				amplifySymbolValue,
			);

			expect(loggerSpy).not.toHaveBeenCalled();
		});
	});
});
