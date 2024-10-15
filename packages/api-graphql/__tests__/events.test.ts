import { Subscription } from 'rxjs';
import { Amplify } from '@aws-amplify/core';
import { MESSAGE_TYPES } from '../src/Providers/constants';
import * as constants from '../src/Providers/constants';

import {
	delay,
	FakeWebSocketInterface,
	replaceConstant,
} from '../__tests__/helpers';
import { ConnectionState as CS } from '../src/types/PubSub';

import { AWSAppSyncEventProvider } from '../src/Providers/AWSAppSyncEventsProvider';

import { events } from '../src/';
import { GraphQLAuthMode } from '@aws-amplify/core/internals/utils';

/**
 * TODO:
 * 1. gen2 config
 * 2. manual config
 * 3. all auth modes
 * 4. ensure auth works as expected for all modes/locations
 */

test('no configure()', async () => {
	await expect(events.connect('/')).rejects.toThrow(
		'Amplify configuration is missing. Have you called Amplify.configure()?',
	);
});

describe('Events Client', () => {
	beforeEach(() => {
		Amplify.configure({
			custom: {
				events: {
					url: 'https://not-a-real.ddpg-api.us-west-2.amazonaws.com/event',
					aws_region: 'us-west-2',
					default_authorization_type: 'API_KEY',
					api_key: 'da2-abcxyz321',
				},
			},
			version: '1.2',
		});
	});

	const authModes: GraphQLAuthMode[] = [
		'apiKey',
		'userPool',
		'oidc',
		'iam',
		'lambda',
		'none',
	];

	describe('channel', () => {
		test('happy connect', async () => {
			const channel = await events.connect('/');

			expect(channel.subscribe).toBeInstanceOf(Function);
			expect(channel.close).toBeInstanceOf(Function);
		});

		describe('auth modes', () => {
			let provider: typeof AWSAppSyncEventProvider;
			let providerSpy: any;

			beforeEach(() => {
				provider = new AWSAppSyncEventProvider();
				providerSpy = jest.spyOn(provider, 'connect');
			});

			for (const authMode of authModes) {
				test(`auth override: ${authMode}`, async () => {
					await events.connect('/', { authMode });
				});
			}
		});
	});
});
