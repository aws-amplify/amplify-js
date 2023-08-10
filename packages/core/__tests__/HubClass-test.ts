Symbol = undefined; // this should be undefined before loading Hub
import { Hub, Logger } from '../src';

describe('Symbol undefined before load Hub', () => {
	test('Symbol not supported', () => {
		const listener = jest.fn(() => {});
		const amplifySymbol = '@@amplify_default' as unknown as Symbol;
		const loggerSpy = jest.spyOn(Logger.prototype, '_log');

		Hub.listen('auth', listener);

		Hub.dispatch(
			'auth',
			{
				event: 'signOut',
				data: 'the user has been signed out',
				message: 'User signout has taken place',
			},
			'Auth',
			amplifySymbol
		);

		expect(listener).toHaveBeenCalled();
		expect(loggerSpy).not.toHaveBeenCalledWith(
			'WARN',
			'WARNING: auth is protected and dispatching on it can have unintended consequences'
		);
	});
});
