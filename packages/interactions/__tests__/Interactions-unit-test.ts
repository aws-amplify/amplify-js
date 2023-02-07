// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
import { InteractionsClass as Interactions } from '../src/Interactions';
import { AbstractInteractionsProvider } from '../src/Providers';
import { InteractionsOptions } from '../src/types';
import { AWSLexProvider } from '../src/Providers';

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
		name: 'BookTrip',
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

// a sample response from send method
const sampleSendResponse = {
	$metadata: {
		httpStatusCode: 200,
		requestId: '6eed4ad1-141c-4662-a528-3c857de1e1da',
		attempts: 1,
		totalRetryDelay: 0,
	},
	alternativeIntents: '[]',
	audioStream: new Blob(),
	botVersion: '$LATEST',
	contentType: 'audio/mpeg',
	dialogState: 'ElicitSlot',
	intentName: 'BookCar_dev',
	message: 'In what city do you need to rent a car?',
	sessionId: '2022-08-11T18:23:01.013Z-sTqDnpGk',
	slotToElicit: 'PickUpCity',
	slots:
		'{"ReturnDate":null,"PickUpDate":null,"DriverAge":null,"CarType":null,"PickUpCity":null,"Location":null}',
};

class DummyProvider extends AbstractInteractionsProvider {
	getProviderName() {
		return 'DummyProvider';
	}

	configure(config: InteractionsOptions = {}): InteractionsOptions {
		return super.configure(config);
	}

	async sendMessage(message: string | Object): Promise<Object> {
		return new Promise(async (res, rej) => res(sampleSendResponse));
	}

	async onComplete(botname: string, callback: (err, confirmation) => void) {
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
		let providerConfigureSpy;

		beforeEach(() => {
			interactions = new Interactions({});
			interactions.configure({});
			interactions.addPluggable(new DummyProvider());
			providerConfigureSpy = jest.spyOn(DummyProvider.prototype, 'configure');
		});

		test('Check if bot is successfully configured by validating config response', () => {
			const options = {
				keyA: 'valueA',
				keyB: 'valueB',
			};

			const config = interactions.configure(options);
			expect(config).toEqual({ ...options, bots: {} });
			expect.assertions(1);
		});

		test('Configure bot using aws-exports configuration', () => {
			const config = interactions.configure(awsmobile);
			expect(config).toEqual({
				...awsmobile,
				bots: {
					BookTripMOBILEHUB: awsmobileBot,
				},
			});
			// check if provider's configure was called
			expect(providerConfigureSpy).toBeCalledTimes(
				awsmobile.aws_bots_config.length
			);
			expect(providerConfigureSpy).toHaveBeenCalledWith({
				BookTripMOBILEHUB: awsmobileBot,
			});
			expect.assertions(3);
		});

		test('Configure bot using manual configuration', () => {
			const config = interactions.configure(manualConfig);
			expect(config).toEqual({
				bots: manualConfigBots,
			});

			// check if provider's configure was called
			expect(providerConfigureSpy).toBeCalledTimes(
				Object.keys(manualConfigBots).length
			);

			// provider's config get's called for each bot
			expect(providerConfigureSpy).toHaveBeenCalledWith({
				BookTrip: manualConfigBots.BookTrip,
			});
			expect(providerConfigureSpy).toHaveBeenCalledWith({
				OrderFlowers: manualConfigBots.OrderFlowers,
			});
			expect.assertions(4);
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

			// check if provider's configure was called
			expect(providerConfigureSpy).toBeCalledTimes(
				Object.keys(manualConfigBots).length
			);

			// provider's config get's called for each bot
			expect(providerConfigureSpy).toHaveBeenCalledWith({
				BookTrip: manualConfigBots.BookTrip,
			});
			expect(providerConfigureSpy).toHaveBeenCalledWith({
				OrderFlowers: manualConfigBots.OrderFlowers,
			});
			expect.assertions(4);
		});

		test('Configure bot with default provider (AWSLexProvider) using manual config', async () => {
			const lexV1ConfigureSpy = jest.spyOn(
				AWSLexProvider.prototype,
				'configure'
			);

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

			interactions.configure(myConfig);

			// check if provider's configure was called
			expect(lexV1ConfigureSpy).toBeCalledTimes(Object.keys(myBot).length);
			expect(lexV1ConfigureSpy).toHaveBeenCalledWith({
				MyBot: myBot.MyBot,
			});
			expect.assertions(2);
		});

		test('Configure bot with default provider (AWSLexProvider) using aws-exports config', async () => {
			const lexV1ConfigureSpy = jest.spyOn(
				AWSLexProvider.prototype,
				'configure'
			);

			const awsmobileBot = {
				name: 'BookTripMOBILEHUB',
				alias: '$LATEST',
				region: 'us-east-1',
				description: 'Bot to make reservations for a visit to a city.',
				'bot-template': 'bot-trips',
			};
			const awsmobile = {
				aws_bots: 'enable',
				aws_bots_config: [awsmobileBot],
				aws_project_name: 'bots',
				aws_project_region: 'us-east-1',
			};

			interactions.configure(awsmobile);

			// check if provider's configure was called
			expect(lexV1ConfigureSpy).toBeCalledTimes(
				awsmobile.aws_bots_config.length
			);
			expect(lexV1ConfigureSpy).toHaveBeenCalledWith({
				BookTripMOBILEHUB: awsmobileBot,
			});
			expect.assertions(2);
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

			// configuring a bot to a plugin that isn't added yet is allowed
			// when the plugin is added the bots belonging to plugin are automatically configured
			expect(() => interactions.configure(myConfig)).not.toThrow();
			expect.assertions(1);
		});
	});

	// Test 'getModuleName' API
	test(`Is provider name 'Interactions'`, () => {
		const interactions = new Interactions({});
		const moduleName = interactions.getModuleName();
		expect(moduleName).toEqual('Interactions');
		expect.assertions(1);
	});

	// Test 'addPluggable' API
	describe('addPluggable API', () => {
		let interactions;
		let providerConfigureSpy;

		beforeEach(() => {
			interactions = new Interactions({});
			providerConfigureSpy = jest.spyOn(DummyProvider.prototype, 'configure');
			interactions.configure({});
		});

		test('Add custom pluggable and configure a bot for that plugin successfully', async () => {
			// first add custom plugin
			// then configure bots for that plugin
			expect(() =>
				interactions.addPluggable(new DummyProvider())
			).not.toThrow();

			const config = interactions.configure(manualConfig);
			expect(config).toEqual({
				bots: manualConfigBots,
			});

			// provider's config get's called for each bot
			expect(providerConfigureSpy).toHaveBeenCalledWith({
				BookTrip: manualConfigBots.BookTrip,
			});
			expect(providerConfigureSpy).toHaveBeenCalledWith({
				OrderFlowers: manualConfigBots.OrderFlowers,
			});
			expect.assertions(4);
		});

		test('Configure bot belonging to custom plugin first, then add pluggable for that bot', async () => {
			// first configure bots for a custom plugin
			// then add the custom plugin
			// when the plugin is added the bots belonging to plugin are automatically configured
			const config = interactions.configure(manualConfig);
			expect(config).toEqual({
				bots: manualConfigBots,
			});

			expect(() =>
				interactions.addPluggable(new DummyProvider())
			).not.toThrow();

			// after adding pluggin provider's config get's called for each bot
			expect(providerConfigureSpy).toHaveBeenCalledWith({
				BookTrip: manualConfigBots.BookTrip,
			});
			expect(providerConfigureSpy).toHaveBeenCalledWith({
				OrderFlowers: manualConfigBots.OrderFlowers,
			});
			expect.assertions(4);
		});

		test('Add existing pluggable again', () => {
			interactions.addPluggable(new DummyProvider());
			expect(() => {
				interactions.addPluggable(new DummyProvider());
			}).toThrow('Pluggable DummyProvider already plugged');
			expect.assertions(1);
		});
	});

	// Test 'send' API
	describe('send API', () => {
		let interactions;
		let providerSend;

		beforeEach(() => {
			interactions = new Interactions({});
			interactions.configure({});
			interactions.addPluggable(new DummyProvider());
			interactions.configure(manualConfig);
			providerSend = jest.spyOn(DummyProvider.prototype, 'sendMessage');
		});

		test('send text message to a bot successfully', async () => {
			const response = await interactions.send('BookTrip', 'hi');
			expect(response).toEqual(sampleSendResponse);

			// check if provider's send was called
			expect(providerSend).toBeCalledTimes(1);
			expect(providerSend).toHaveBeenCalledWith('BookTrip', 'hi');
			expect.assertions(3);
		});

		test('Send text message to non-existing bot', async () => {
			await expect(interactions.send('unknownBot', 'hi')).rejects.toEqual(
				'Bot unknownBot does not exist'
			);
			expect.assertions(1);
		});
	});

	// Test 'onComplete' API
	describe('onComplete API', () => {
		let interactions;
		let providerOnComplete;
		const callback = (err, confirmation) => {};

		beforeEach(() => {
			interactions = new Interactions({});
			interactions.configure({});
			interactions.addPluggable(new DummyProvider());
			interactions.configure(manualConfig);
			providerOnComplete = jest.spyOn(DummyProvider.prototype, 'onComplete');
		});

		test('Configure onComplete callback for a configured bot successfully', async () => {
			expect(() => interactions.onComplete('BookTrip', callback)).not.toThrow();
			// check if provider's onComplete was called
			expect(providerOnComplete).toBeCalledTimes(1);
			expect(providerOnComplete).toHaveBeenCalledWith('BookTrip', callback);
			expect.assertions(3);
		});

		test('Configure onComplete callback for non-existing bot', async () => {
			expect(() => interactions.onComplete('unknownBot', callback)).toThrow(
				'Bot unknownBot does not exist'
			);
			expect.assertions(1);
		});
	});
});
