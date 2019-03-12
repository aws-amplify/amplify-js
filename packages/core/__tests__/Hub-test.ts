import { Hub, Logger } from '../src';

describe('Hub', () => {
  test('happy case', () => {
    const listener = jest.fn(() => { });

    Hub.listen('auth', listener);

    Hub.dispatch(
      'auth',
      { event: 'signOut', data: 'the user has been signed out' },
      'Auth',
      Symbol.for('amplify_default')
    );

    expect(listener).toHaveBeenCalled();
  });

  test('Legacy config', () => {

    const listener = {
      onHubCapsule: jest.fn((capsule) => {
        const { channel, payload, source } = capsule;
        console.log(source);
        console.log(capsule);
      })
    };
    const loggerSpy = jest.spyOn(Logger.prototype, '_log');

    Hub.listen('auth', listener);

    Hub.dispatch(
      'auth',
      { event: 'signOut', data: 'the user has been signed out' },
      'Auth',
      Symbol.for('amplify_default')
    );

    expect(listener.onHubCapsule).toHaveBeenCalled();
    expect(loggerSpy).toHaveBeenCalledWith(
      'WARN',
      'WARNING onHubCapsule is Deprecated and will be removed in the future. Please pass in a callback.'
    );
  });

  test('Protected channel', () => {

    const listener = jest.fn(() => { });
    const loggerSpy = jest.spyOn(Logger.prototype, '_log');

    Hub.listen('auth', listener);

    Hub.dispatch(
      'auth',
      { event: 'signOut', data: 'the user has been signed out' },
      'Auth'
    );

    expect(listener).toHaveBeenCalled();
    expect(loggerSpy).toHaveBeenCalledWith(
      'WARN',
      'WARNING: auth is protected and dispatching on it can have unintended consequences'
    );
  });

  test('Regex Listener', () => {
    const listener = jest.fn(() => { });

    Hub.listen(/user(.*)/, listener);

    Hub.dispatch(
      'auth',
      { event: 'signOut', data: 'the user has been signed out' },
      'Auth',
      Symbol.for('amplify_default')
    );

    expect(listener).toHaveBeenCalledWith({
      "channel": "auth", "payload":
        { "data": "the user has been signed out", "event": "signOut" },
      "source": "Auth"
    });
  });

  test('Regex Listener No Data', () => {
    const listener = jest.fn(() => { });

    Hub.listen(/user(.*)/, listener);
    const loggerSpy = jest.spyOn(Logger.prototype, '_log');

    Hub.dispatch(
      'auth',
      { event: 'signOut' },
      'Auth',
      Symbol.for('amplify_default')
    );

    expect(listener).not.toHaveBeenCalled();
    expect(loggerSpy).toHaveBeenCalledWith(
      'WARN',
      'Cannot perform pattern matching without a data key in your payload'
    );
  });

  test('Remove listener', () => {
    const listener = jest.fn(() => { });

    Hub.listen('auth', listener);

    Hub.dispatch(
      'auth',
      { event: 'signOut', data: 'the user has been signed out' },
      'Auth',
      Symbol.for('amplify_default')
    );

    expect(listener).toHaveBeenCalled();

    listener.mockReset();

    Hub.remove('auth', listener);

    Hub.dispatch(
      'auth',
      { event: 'signOut2', data: 'the user has been signed out' },
      'Auth',
      Symbol.for('amplify_default')
    );

    expect(listener).not.toHaveBeenCalled();

  });

});

