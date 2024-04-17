import { ResourcesConfig } from '../../src';
import { parseAmplifyConfig } from '../../src/libraryUtils';
import { parseAWSExports } from '../../src/parseAWSExports';
import { isAmplifyOutputs, parseAmplifyOutputs } from '../../src/parseAmplifyOutputs';

jest.mock('../../src/parseAWSExports');
jest.mock('../../src/parseAmplifyOutputs');

const testAmplifyOutputs = {
	'version': '1',
	'auth': {
		'user_pool_id': 'us-east-1:',
		'user_pool_client_id': 'xxxx',
		'aws_region': 'us-east-1',
	},
}

const testLegacyConfig = {
	aws_project_region: 'us-west-2',
	aws_user_pools_id: 'user-pool-id',
	aws_user_pools_web_client_id: 'user-pool-client-id'
}

const testResourcesConfig: ResourcesConfig = {
	Auth: {
		Cognito: {
			userPoolId: 'us-east-1:xxx',
			userPoolClientId: 'xxxx',
			identityPoolId: 'test'
		}
	}
};

describe('parseAmplifyConfig', () => {
	const mockParseAWSExports = parseAWSExports as jest.Mock;
	const mockParseAmplifyOutputs = parseAmplifyOutputs as jest.Mock;
	const mockIsAmplifyOutputs = isAmplifyOutputs as unknown as jest.Mock;

	beforeEach(() => {
		jest.clearAllMocks();
		mockParseAWSExports.mockReturnValue(testResourcesConfig);
		mockParseAmplifyOutputs.mockReturnValue(testResourcesConfig);
		mockIsAmplifyOutputs.mockReturnValue(false);
	});

	it('returns a ResourceConfig when one is provided', () => {
		const parsedConfig = parseAmplifyConfig(testResourcesConfig);

		// Verify that a provided ResourceConfig is returned back unmodified
		expect(parsedConfig).toEqual(testResourcesConfig)
	});

	it('parses legacy config objects into ResourcesConfig', () => {
		const parsedConfig = parseAmplifyConfig(testLegacyConfig);

		// Verify that a provided legacy config is parsed into a ResourcesConfig
		expect(parsedConfig).toEqual(testResourcesConfig);
		expect(mockParseAWSExports).toHaveBeenCalledTimes(1);
		expect(mockParseAWSExports).toHaveBeenCalledWith(testLegacyConfig)
	});

	it('parses Gen2 config objects into ResourcesConfig', () => {
		mockIsAmplifyOutputs.mockReturnValueOnce(true);
		const parsedConfig = parseAmplifyConfig(testAmplifyOutputs);

		// Verify that a provided Gen2 config is parsed into a ResourcesConfig
		expect(parsedConfig).toEqual(testResourcesConfig);
		expect(mockParseAmplifyOutputs).toHaveBeenCalledTimes(1);
		expect(mockIsAmplifyOutputs).toHaveBeenCalledTimes(1);
		expect(mockParseAmplifyOutputs).toHaveBeenCalledWith(testAmplifyOutputs);
	});
})