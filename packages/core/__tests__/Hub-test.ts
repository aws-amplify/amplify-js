import { filter } from 'rxjs';
import { Hub, Logger } from '../src';

describe('Hub', () => {
	test('happy case', () => {
		const listener = jest.fn(() => {});

		Hub.listen('auth').subscribe(listener);

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

		Hub.listen('auth').subscribe(listener);

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

		Hub.listen('ui').subscribe(listener);

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

	test('Regex Listener', () => {
		const listener = jest.fn(() => {});

		Hub.listen('auth')
			.pipe(
				filter(capsule => {
					const data: string = capsule.payload.data as string;
					const message: string = capsule.payload.message || '';
					return data.match(/user/) || message.match(/user/);
				})
			)
			.subscribe(listener);

		Hub.dispatch(
			'auth',
			{
				event: 'signOut',
				data: 'the user has been signed out',
				message: 'A user sign out event has taken place.',
			},
			'Auth',
			Symbol.for('amplify_default')
		);

		expect(listener).toHaveBeenCalledWith({
			channel: 'auth',
			payload: {
				data: 'the user has been signed out',
				event: 'signOut',
				message: 'A user sign out event has taken place.',
			},
			patternInfo: [],
			source: 'Auth',
		});
	});

	test('Remove listener', () => {
		const listener = jest.fn(() => {});

		const subscriber = Hub.listen('auth').subscribe(listener);

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

		subscriber.unsubscribe();

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
