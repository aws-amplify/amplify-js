import { parseAmplifyConfig } from '../../src/libraryUtils';
import mockAmplifyOutputs from '../../__mocks__/configMocks/amplify_outputs.json';
import mockAmplifyConfiguration from '../../__mocks__/configMocks/amplifyconfiguration.json';

describe('parseAmplifyConfig backwards compatibility', () => {
	it('returns identical ResourcesConfig for equivalent CLI & Gen2 configuration files', () => {
		const cliConfig = parseAmplifyConfig(mockAmplifyConfiguration);
		const gen2Config = parseAmplifyConfig(mockAmplifyOutputs);

		expect(gen2Config).toEqual(cliConfig);
	});
});
