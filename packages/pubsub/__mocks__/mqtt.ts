const mqttClientMockCache: Record<string, any> = {};

const mockMqttClient = (clientId: string) => {
	if (mqttClientMockCache[clientId]) {
		return mqttClientMockCache[clientId];
	}

	const eventHandlers: Record<string, (...args: any[]) => void> = {};

	const client = {
		on: jest.fn((event, handler) => {
			eventHandlers[event] = handler;
		}),
		publish: jest.fn((topic, message) => {
			eventHandlers.message(topic, message);
		}),
		subscribe: jest.fn(),
		unsubscribe: jest.fn(),
		connected: true,
		end: jest.fn(),
	};

	mqttClientMockCache[clientId] = client;

	return client;
};

const mqtt = {
	connectAsync: jest.fn((_, { clientId }) =>
		Promise.resolve(mockMqttClient(clientId)),
	),
};

export default mqtt;
