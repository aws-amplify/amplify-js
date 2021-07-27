require('aws-sdk/lib/node_loader');

const AWS = require('aws-sdk/lib/core');
const Service = AWS.Service;
const apiLoader = AWS.apiLoader;

const PINPOINT = 'pinpoint';

apiLoader.services[PINPOINT] = {};
AWS.Pinpoint = Service.defineService('pinpoint', ['2016-12-01']);
Object.defineProperty(apiLoader.services[PINPOINT], '2016-12-01', {
	get: function get() {
		const model = require('./pinpoint-2016-12-01.min.json');
		return model;
	},
	enumerable: true,
	configurable: true,
});

const PinpointClient = AWS.Pinpoint;

export default PinpointClient;
