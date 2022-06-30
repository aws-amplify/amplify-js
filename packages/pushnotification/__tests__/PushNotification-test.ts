import { DeviceEventEmitter, Platform, NativeModules } from 'react-native';
import Amplify from 'aws-amplify';
import PushNotificationIOS from '@react-native-community/push-notification-ios';
import RegisteredPushNotification from '../src';
import PushNotification from '../src/PushNotification';

const defaultPlatform = 'ios';

jest.mock('react-native', () => ({
	AppState: {
		currentState: 'active',
		addEventListener: (event, callback) => callback('active'),
	},
	DeviceEventEmitter: {
		addListener: jest.fn(),
	},
	NativeModules: {
		RNPushNotification: {
			initialize: () => {},
			getToken: callback => callback('token'),
		},
	},
	Platform: {
		OS: defaultPlatform,
	},
}));

jest.mock('@react-native-async-storage/async-storage', () => ({
	getItem: () => new Promise(res => res('item')),
	setItem: jest.fn(),
}));

jest.mock('@react-native-community/push-notification-ios', () => ({
	requestPermissions: () => {},
	getInitialNotification: new Promise(res => res('notification')),
	addEventListener: () => {},
}));

function mockPlatform(platform) {
	Platform.OS = platform;
}

function clearPlatformMock() {
	Platform.OS = defaultPlatform;
}

const defaultConfig = {
	aws_project_region: 'aws_project_region',
	aws_cognito_identity_pool_id: 'aws_cognito_identity_pool_id',
	aws_cognito_region: 'aws_cognito_region',
	aws_user_pools_id: 'aws_user_pools_id',
	aws_user_pools_web_client_id: 'aws_user_pools_web_client_id',
	oauth: {},
	aws_mobile_analytics_app_id: 'aws_mobile_analytics_app_id',
	aws_mobile_analytics_app_region: 'aws_mobile_analytics_app_region',
};
const platforms = ['ios', 'android'];

describe('PushNotification:', () => {
	afterEach(() => {
		jest.restoreAllMocks();
		clearPlatformMock();
	});

	describe('Amplify register ->', () => {
		test('should register with Amplify', () => {
			const registerSpy = jest.spyOn(Amplify, 'register');

			expect.assertions(4);

			// Global Amplify should register with `import "@aws-amplify/pushnotification"`
			expect(Amplify.Pushnotification).toEqual(RegisteredPushNotification);

			// Spy should be at 0 (it was already called on import)
			expect(registerSpy).toHaveBeenCalledTimes(0);

			// Global Amplify should keep original instance, not new instances
			const NewPushNotification = new PushNotification(null);
			expect(Amplify.Pushnotification).not.toEqual(NewPushNotification);

			// Amplify.register should not have been called for the new instance
			expect(registerSpy).toHaveBeenCalledTimes(0);
			registerSpy.mockClear();
		});
	});

	describe('getModuleName ->', () => {
		test('should return correct name', () => {
			const pushnotification = new PushNotification(null);
			expect(pushnotification.getModuleName()).toEqual('Pushnotification');
		});
	});

	describe('configure ->', () => {
		test('should return config with base config', () => {
			const pushnotification = new PushNotification(null);
			expect(pushnotification.configure(defaultConfig)).toMatchObject({
				appId: defaultConfig.aws_mobile_analytics_app_id,
				requestIOSPermissions: true,
			});
		});

		test('should return config with PushNotification config with requestIOSPermissions', () => {
			const config = {
				...defaultConfig,
				PushNotification: {
					requestIOSPermissions: false,
				},
			};

			const pushnotification = new PushNotification(null);
			expect(pushnotification.configure(config)).toMatchObject({
				appId: defaultConfig.aws_mobile_analytics_app_id,
				requestIOSPermissions: false,
			});
		});

		test('should return config with PushNotification config with different appId', () => {
			const config = {
				...defaultConfig,
				PushNotification: {
					appId: '123',
					requestIOSPermissions: false,
				},
			};

			const pushnotification = new PushNotification(null);
			expect(pushnotification.configure(config)).toMatchObject({
				appId: '123',
				requestIOSPermissions: false,
			});
		});

		test('should return config with PushNotification config only', () => {
			const config = {
				PushNotification: {
					appId: '123',
					requestIOSPermissions: false,
				},
			};

			const pushnotification = new PushNotification(null);
			expect(pushnotification.configure(config)).toMatchObject({
				appId: '123',
				requestIOSPermissions: false,
			});
		});

		platforms.forEach(platform => {
			test(`${platform} should return with empty config`, () => {
				mockPlatform(platform);

				const androidInitSpy = jest.spyOn(
					PushNotification.prototype,
					'initializeAndroid'
				);
				const iosInitSpy = jest.spyOn(
					PushNotification.prototype,
					'initializeIOS'
				);

				const pushnotification = new PushNotification(null);

				expect.assertions(3);
				expect(pushnotification.configure({})).toEqual({});
				expect(androidInitSpy).toHaveBeenCalledTimes(0);
				expect(iosInitSpy).toHaveBeenCalledTimes(0);

				androidInitSpy.mockClear();
				iosInitSpy.mockClear();
			});
		});

		test('should initialize Android', () => {
			mockPlatform('android');

			const androidEventListenerSpy = jest.spyOn(
				PushNotification.prototype,
				'addEventListenerForAndroid'
			);

			const pushnotification = new PushNotification(null);
			pushnotification.configure(defaultConfig);

			expect.assertions(1);
			expect(androidEventListenerSpy).toHaveBeenCalledTimes(3);
			androidEventListenerSpy.mockClear();
		});

		test('should initialize iOS', () => {
			mockPlatform('ios');

			const iosEventListenerSpy = jest.spyOn(
				PushNotification.prototype,
				'addEventListenerForIOS'
			);

			const requestPermissionsSpy = jest.spyOn(
				PushNotificationIOS,
				'requestPermissions'
			);

			const pushnotification = new PushNotification(null);
			pushnotification.configure(defaultConfig);

			expect.assertions(2);
			expect(iosEventListenerSpy).toHaveBeenCalledTimes(3);
			expect(requestPermissionsSpy).toHaveBeenCalledTimes(1);

			iosEventListenerSpy.mockClear();
			requestPermissionsSpy.mockClear();
		});
	});

	describe('onRegister ->', () => {
		test('iOS handler should be called', () => {
			mockPlatform('ios');

			const listenerMap: any = {};
			const listenerSpy = jest
				.spyOn(PushNotificationIOS, 'addEventListener')
				.mockImplementation((event: any, cb) => {
					listenerMap[event] = cb;
				});
			const handler = jest.fn();

			const pushnotification = new PushNotification(null);
			pushnotification.configure(defaultConfig);
			pushnotification.onRegister(handler);

			expect.assertions(2);
			expect(handler).toHaveBeenCalledTimes(0);

			listenerMap.register('testing');
			expect(handler).toHaveBeenCalledWith('testing');

			listenerSpy.mockClear();
		});

		test('Android handler should be called', () => {
			mockPlatform('android');

			const listenerMap: any = {};
			const listenerSpy = jest
				.spyOn(DeviceEventEmitter, 'addListener')
				.mockImplementation((event: any, cb) => {
					listenerMap[event] = cb;
				});
			const handler = jest.fn();

			const pushnotification = new PushNotification(null);
			pushnotification.parseMessagefromAndroid = jest
				.fn()
				.mockImplementation(data => data);

			pushnotification.configure(defaultConfig);
			pushnotification.onRegister(handler);

			expect.assertions(2);
			expect(handler).toHaveBeenCalledTimes(0);

			const data = {
				dataJSON: '{"refreshToken":"token"}',
			};

			listenerMap.remoteTokenReceived(data);
			expect(handler).toHaveBeenCalledWith('token');

			listenerSpy.mockClear();
		});
	});

	describe('onNotification ->', () => {
		test('iOS handler should be called', () => {
			mockPlatform('ios');

			const listenerMap: any = {};
			const listenerSpy = jest
				.spyOn(PushNotificationIOS, 'addEventListener')
				.mockImplementation((event: any, cb) => {
					listenerMap[event] = cb;
				});
			const handler = jest.fn();

			const pushnotification = new PushNotification(null);
			pushnotification.configure(defaultConfig);
			pushnotification.onNotification(handler);

			expect.assertions(2);
			expect(handler).toHaveBeenCalledTimes(0);

			listenerMap.notification('testing');
			expect(handler).toHaveBeenCalledWith('testing');

			listenerSpy.mockClear();
		});

		test('Android handler should be called', () => {
			mockPlatform('android');

			const listenerMap: any = {};
			const listenerSpy = jest
				.spyOn(DeviceEventEmitter, 'addListener')
				.mockImplementation((event: any, cb) => {
					listenerMap[event] = cb;
				});
			const handler = jest.fn();

			const pushnotification = new PushNotification(null);
			pushnotification.parseMessagefromAndroid = jest
				.fn()
				.mockImplementation(data => data);

			pushnotification.configure(defaultConfig);
			pushnotification.onNotification(handler);

			expect.assertions(2);
			expect(handler).toHaveBeenCalledTimes(0);

			listenerMap.remoteNotificationReceived('testing');
			expect(handler).toHaveBeenCalledWith('testing');

			listenerSpy.mockClear();
		});
	});

	describe('onNotificationOpened ->', () => {
		platforms.forEach(platform => {
			test(`${platform} handler should be called`, () => {
				mockPlatform('ios');

				const handler = jest.fn();

				const pushnotification = new PushNotification(null);
				pushnotification.parseMessageData = jest
					.fn()
					.mockImplementation(data => data);

				pushnotification.configure(defaultConfig);
				pushnotification.onNotificationOpened(handler);

				expect.assertions(2);
				expect(handler).toHaveBeenCalledTimes(0);

				pushnotification.handleNotificationOpened('testing');

				expect(handler).toHaveBeenCalledWith('testing');
			});
		});
	});

	describe('requestIOSPermissions ->', () => {
		test('should request iOS permissions with default config on configure', () => {
			mockPlatform('ios');

			const requestPermissionsSpy = jest.spyOn(
				PushNotificationIOS,
				'requestPermissions'
			);

			const pushnotification = new PushNotification(null);
			pushnotification.configure(defaultConfig);

			expect.assertions(1);
			expect(requestPermissionsSpy).toHaveBeenCalledTimes(1);

			requestPermissionsSpy.mockClear();
		});

		test('should NOT request iOS permissions on configure', () => {
			mockPlatform('ios');

			const requestPermissionsSpy = jest.spyOn(
				PushNotificationIOS,
				'requestPermissions'
			);

			const config = {
				...defaultConfig,
				PushNotification: {
					requestIOSPermissions: false,
				},
			};

			const pushnotification = new PushNotification(null);
			pushnotification.configure(config);

			expect.assertions(1);
			expect(requestPermissionsSpy).toHaveBeenCalledTimes(0);

			requestPermissionsSpy.mockClear();
		});

		test('should request iOS permissions when called', () => {
			mockPlatform('ios');

			const requestPermissionsSpy = jest.spyOn(
				PushNotificationIOS,
				'requestPermissions'
			);

			const config = {
				...defaultConfig,
				PushNotification: {
					requestIOSPermissions: false,
				},
			};

			const pushnotification = new PushNotification(null);
			pushnotification.configure(config);

			expect.assertions(2);
			expect(requestPermissionsSpy).toHaveBeenCalledTimes(0);

			const permissionsConfig = {
				alert: false,
				badge: false,
				sound: false,
			};
			pushnotification.requestIOSPermissions(permissionsConfig);
			expect(requestPermissionsSpy).toHaveBeenCalledWith(permissionsConfig);

			requestPermissionsSpy.mockClear();
		});
	});
});
