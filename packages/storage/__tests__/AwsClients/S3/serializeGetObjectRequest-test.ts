import { serializeGetObjectRequest } from '../../../src/AwsClients/S3';
import getObjectCases, { expectedGetObjectUrl } from './cases/getObject';

const [getObjectHappyCase] = getObjectCases;

describe('serializeGetObjectRequest', () => {
	it('should return get object API request', () => {
		const [_, __, ___, config, input, expected] = getObjectHappyCase;
		const actual = serializeGetObjectRequest(config as any, input);
		expect(actual).toMatchObject({
			url: expect.objectContaining({
				href: expectedGetObjectUrl,
			}),
			method: 'GET',
		});
	});
});
