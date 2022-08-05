/*
 * Copyright 2017-2017 Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License"). You may not use this file except in compliance with
 * the License. A copy of the License is located at
 *
 *     http://aws.amazon.com/apache2.0/
 *
 * or in the "license" file accompanying this file. This file is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR
 * CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions
 * and limitations under the License.
 */
import { InteractionsClass as Interactions } from '../src/Interactions';
import { AbstractInteractionsProvider } from '../src/Providers';

(global as any).Response = () => {};
(global as any).Response.prototype.arrayBuffer = (blob: Blob) => {
	return Promise.resolve(new ArrayBuffer(0));
};

// aws-export config
const awsmobileBot = {
	name: 'BookTripMOBILEHUB',
	alias: '$LATEST',
	region: 'us-east-1',
	providerName: 'DummyProvider',
	description: 'Bot to make reservations for a visit to a city.',
	'bot-template': 'bot-trips',
	'commands-help': [
		'Book a car',
		'Reserve a car',
		'Make a car reservation',
		'Book a hotel',
		'Reserve a room',
		'I want to make a hotel reservation',
	],
};
const awsmobile = {
	aws_bots: 'enable',
	aws_bots_config: [awsmobileBot],
	aws_project_name: 'bots',
	aws_project_region: 'us-east-1',
};

// manual config
const manualConfigBots = {
	BookTrip: {
		name: 'BookTrip', // default provider 'AWSLexProvider'
		alias: '$LATEST',
		region: 'us-west-2',
		providerName: 'DummyProvider',
	},
	OrderFlowers: {
		name: 'OrderFlowers',
		alias: '$LATEST',
		region: 'us-west-2',
		providerName: 'DummyProvider',
	},
};
const manualConfig = {
	Interactions: {
		bots: manualConfigBots,
	},
};

class DummyProvider extends AbstractInteractionsProvider {
	getProviderName() {
		return 'DummyProvider';
	}

	async sendMessage(message: string | Object): Promise<Object> {
		return new Promise(async (res, rej) => res({}));
	}

	async onComplete() {
		return new Promise((res, rej) => res({}));
	}
}

class WrongProvider extends AbstractInteractionsProvider {
	getProviderName() {
		return 'WrongProvider';
	}

	getCategory() {
		return 'WrongCategory';
	}

	async sendMessage(message: string | Object): Promise<Object> {
		return new Promise(async (res, rej) => res({}));
	}

	async onComplete() {
		return new Promise((res, rej) => res({}));
	}
}

afterEach(() => {
	jest.restoreAllMocks();
});

describe('Interactions', () => {
	// Test 'configure' API
	describe('configure API', () => {
		let interactions;

		beforeEach(() => {
			interactions = new Interactions({});
			interactions.configure({});
			interactions.addPluggable(new DummyProvider());
		});

		test('Check if bot is successfully configured by validating config response', () => {
			const options = {
				keyA: 'valueA',
				keyB: 'valueB',
			};

			const config = interactions.configure(options);
			expect(config).toEqual({ ...options, bots: {} });
		});

		// these in turn covers default provider 'AWSLexProvider' test
		test('Configure bot using aws-exports configuration', () => {
			const config = interactions.configure(awsmobile);

			expect(config).toEqual({
				...awsmobile,
				bots: {
					BookTripMOBILEHUB: awsmobileBot,
				},
			});
		});

		test('Configure bot using manual configuration', () => {
			const config = interactions.configure(manualConfig);

			expect(config).toEqual({
				bots: manualConfigBots,
			});
		});

		test('Configure bot using aws-exports and manual configuration', () => {
			const combinedConfig = {
				...awsmobile,
				...manualConfig,
			};

			const config = interactions.configure(combinedConfig);

			// if manualConfig bots are given, aws-export bots are ignored
			expect(config).toEqual({
				bots: manualConfigBots,
			});
		});

		test('Check if default provider is AWSLexProvider', async () => {
			const myBot = {
				MyBot: {
					name: 'MyBot', // default provider 'AWSLexProvider'
					alias: '$LATEST',
					region: 'us-west-2',
				},
			};
			const myConfig = {
				Interactions: {
					bots: myBot,
				},
			};

			expect(interactions.configure(myConfig)).toEqual({
				bots: myBot,
			});
		});

		test('Configure bot belonging to non-existing plugin', async () => {
			const myConfig = {
				Interactions: {
					bots: {
						MyBot: {
							name: 'MyBot',
							alias: '$LATEST',
							region: 'us-west-2',
							providerName: 'randomProvider',
						},
					},
				},
			};

			expect(() => interactions.configure(myConfig)).toThrow(
				'providerName randomProvider does not exist, did you try addPluggable first?'
			);
		});
	});

	// Test 'getModuleName' API
	test(`Is provider name 'Interactions'`, () => {
		const interactions = new Interactions({});
		const moduleName = interactions.getModuleName();
		expect(moduleName).toEqual('Interactions');
	});

	// Test 'addPluggable' API
	describe('addPluggable API', () => {
		let interactions;

		beforeEach(() => {
			interactions = new Interactions({});
			interactions.configure({});
		});

		test('Add custom pluggable and configure a bot for that plugin successfully', () => {
			interactions.addPluggable(new DummyProvider());
			interactions.configure(manualConfig);
		});

		test('Add a invalid pluggable', () => {
			expect(() => interactions.addPluggable(new WrongProvider())).toThrow(
				'Invalid pluggable'
			);
		});

		test('Add existing pluggable again', () => {
			interactions.addPluggable(new DummyProvider());
			expect(() => {
				interactions.addPluggable(new DummyProvider());
			}).toThrow('Pluggable DummyProvider already plugged');
		});
	});

	// Test 'send' API
	describe('send API', () => {
		let interactions;

		beforeEach(() => {
			interactions = new Interactions({});
			interactions.configure({});
			interactions.addPluggable(new DummyProvider());
			interactions.configure(manualConfig);
		});

		test('send text message to a bot successfully', async () => {
			const response = await interactions.send('BookTrip', 'hi');
			expect(response).toEqual({});
		});

		test('Send text message to non-existing bot', async () => {
			await expect(interactions.send('unknownBot', 'hi')).rejects.toEqual(
				'Bot unknownBot does not exist'
			);
		});
	});

	// Test 'onComplete' API
	describe('onComplete API', () => {
		let interactions;
		const callback = (err, confirmation) => {};

		beforeEach(() => {
			interactions = new Interactions({});
			interactions.configure({});
			interactions.addPluggable(new DummyProvider());
			interactions.configure(manualConfig);
		});

		test('Configure onComplete callback for a configured bot successfully', async () => {
			expect(() => interactions.onComplete('BookTrip', callback)).not.toThrow();
		});

		test('Configure onComplete callback for non-existing bot', async () => {
			expect(() => interactions.onComplete('unknownBot', callback)).toThrow(
				'Bot unknownBot does not exist'
			);
		});
	});
});
