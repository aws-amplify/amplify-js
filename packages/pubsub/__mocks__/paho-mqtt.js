import * as Paho from '../src/vendor/paho-mqtt';

Paho.Client = jest.fn().mockImplementation((host, port, path, clientId) => {
	var client = {};

	client.connect = jest.fn(options => {
		options.onSuccess();
	});
	client.send = jest.fn((topic, message) => {
		client.onMessageArrived({ destinationName: topic, payloadString: message });
	});
	client.subscribe = jest.fn((topics, options) => {});
	client.unsubscribe = jest.fn(() => {});
	client.onMessageArrived = jest.fn(() => {});

	return client;
});

module.exports = Paho;
