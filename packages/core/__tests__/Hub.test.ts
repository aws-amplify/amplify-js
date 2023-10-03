import { Hub } from '../src';
import { Logger } from '../src/libraryUtils';

describe('Hub', () => {
	test('happy case', () => {
		const listener = jest.fn(() => {});

		Hub.listen('auth', listener);

		Hub.dispatch(
			'auth',
			{
				event: 'signOut',
				data: 'the user has been signed out',
				message: 'User singout has taken place',
			},
			'Auth',
			Symbol.for('amplify_default')
		);

		expect(listener).toHaveBeenCalled();
	});

	test('Protected channel', () => {
		const listener = jest.fn(() => {});
		const loggerSpy = jest.spyOn(Logger.prototype, '_log');

		Hub.listen('auth', listener);

		Hub.dispatch(
			'auth',
			{
				event: 'signOut',
				data: 'the user has been signed out',
				message: 'User singout has taken place',
			},
			'Auth'
		);

		expect(listener).toHaveBeenCalled();
		expect(loggerSpy).toHaveBeenCalledWith(
			'WARN',
			'WARNING: auth is protected and dispatching on it can have unintended consequences'
		);
	});

	test('Protected channel - ui', () => {
		const listener = jest.fn(() => {});
		const loggerSpy = jest.spyOn(Logger.prototype, '_log');

		Hub.listen('ui', listener);

		Hub.dispatch('ui', {
			event: 'auth:signOut:finished',
			data: 'the user has been signed out',
			message: 'User has been signed out',
		});

		expect(listener).toHaveBeenCalled();
		expect(loggerSpy).toHaveBeenCalledWith(
			'WARN',
			'WARNING: ui is protected and dispatching on it can have unintended consequences'
		);
	});
	test('Remove listener', () => {
		const listener = jest.fn(() => {});

		const unsubscribe = Hub.listen('auth', listener);

		Hub.dispatch(
			'auth',
			{
				event: 'signOut',
				data: 'the user has been signed out',
				message: 'User signout has taken place',
			},
			'Auth',
			Symbol.for('amplify_default')
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
			Symbol.for('amplify_default')
		);

		expect(listener).not.toHaveBeenCalled();
	});
});
