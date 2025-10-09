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

	describe('crossTab', () => {
		const crossTabListener = jest.fn();
		const uiCrossTabListener = jest.fn();
		const sameTabListener = jest.fn();
		beforeAll(() => {
			Hub.listen('auth', crossTabListener, {
				enableCrossTabEvents: true,
			});
			Hub.listen('ui' as 'auth', uiCrossTabListener, {
				enableCrossTabEvents: true,
			});
			Hub.listen('auth', sameTabListener);
		});

		beforeEach(() => {
			crossTabListener.mockClear();
			sameTabListener.mockClear();
		});

		it('should not call crossTab listeners on sameTab events', () => {
			Hub.dispatch(
				'auth',
				{
					event: 'signedIn',
					data: {},
				},
				'Auth',
				Symbol.for('amplify_default'),
			);

			expect(crossTabListener).not.toHaveBeenCalled();
			expect(sameTabListener).toHaveBeenCalled();
		});

		it('should call crossTab listeners on crossTab events', () => {
			Hub.dispatch(
				'auth',
				{
					event: 'signedIn',
					data: {
						username: 'foo',
						userId: '123',
					},
				},
				'Auth',
				Symbol.for('amplify_default'),
				true,
			);

			expect(crossTabListener).toHaveBeenCalled();
			expect(sameTabListener).not.toHaveBeenCalled();
		});

		it('should not allow crossTab dispatch in other channels', () => {
			Hub.dispatch(
				// this looks weird but is only used to mute TS.
				// becase the API can be called this way.
				// and we want to check the logic, not the types
				'ui' as 'auth',
				{
					event: 'tokenRefresh',
					message: 'whooza',
				},
				'Auth',
				Symbol.for('amplify_default'),
				true,
			);

			expect(uiCrossTabListener).not.toHaveBeenCalled();
		});
	});
});
