import { AWSAppSyncRealTimeProvider } from '../src/Providers/AWSAppSyncRealTimeProvider';

describe('AWSAppSyncRealTimeProvider', () => {
	describe('isCustomDomain()', () => {
		test('Custom domain returns `true`', () => {
			const provider = new AWSAppSyncRealTimeProvider();
			const result = (provider as any).isCustomDomain(
				'https://unit-test.testurl.com/graphql'
			);
			expect(result).toBe(true);
		});
		test('Non-custom domain returns `false`', () => {
			const provider = new AWSAppSyncRealTimeProvider();
			const result = (provider as any).isCustomDomain(
				'https://12345678901234567890123456.appsync-api.us-west-2.amazonaws.com/graphql'
			);
			expect(result).toBe(false);
		});
	});
});
