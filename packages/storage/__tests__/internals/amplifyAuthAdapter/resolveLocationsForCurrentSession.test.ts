import { resolveLocationsForCurrentSession } from '../../../src/internals/amplifyAuthConfigAdapter/resolveLocationsForCurrentSession';
import { BucketInfo } from '../../../src/providers/s3/types/options';

describe('resolveLocationsForCurrentSession', () => {
	const mockBuckets: Record<string, BucketInfo> = {
		bucket1: {
			bucketName: 'bucket1',
			region: 'region1',
			paths: {
				'path1/*': {
					guest: ['get', 'list'],
					authenticated: ['get', 'list', 'write'],
				},
				'path2/*': {
					groupsauditor: ['get', 'list'],
					groupsadmin: ['get', 'list', 'write', 'delete'],
				},
				// eslint-disable-next-line no-template-curly-in-string
				'profile-pictures/${cognito-identity.amazonaws.com:sub}/*': {
					entityidentity: ['get', 'list', 'write', 'delete'],
				},
			},
		},
		bucket2: {
			bucketName: 'bucket2',
			region: 'region1',
			paths: {
				'path3/*': {
					guest: ['read'],
				},
			},
		},
	};

	it('should generate locations correctly when tokens are true', () => {
		const result = resolveLocationsForCurrentSession({
			buckets: mockBuckets,
			isAuthenticated: true,
			identityId: '12345',
			userGroup: 'admin',
		});

		expect(result).toEqual([
			{
				type: 'PREFIX',
				permission: ['get', 'list', 'write'],
				scope: {
					bucketName: 'bucket1',
					path: 'path1/*',
				},
			},
			{
				type: 'PREFIX',
				permission: ['get', 'list', 'write', 'delete'],
				scope: {
					bucketName: 'bucket1',
					path: 'path2/*',
				},
			},
			{
				type: 'PREFIX',
				permission: ['get', 'list', 'write', 'delete'],
				scope: {
					bucketName: 'bucket1',
					path: 'profile-pictures/12345/*',
				},
			},
		]);
	});

	it('should generate locations correctly when tokens are true & bad userGroup', () => {
		const result = resolveLocationsForCurrentSession({
			buckets: mockBuckets,
			isAuthenticated: true,
			identityId: '12345',
			userGroup: 'editor',
		});

		expect(result).toEqual([
			{
				type: 'PREFIX',
				permission: ['get', 'list', 'write'],
				scope: {
					bucketName: 'bucket1',
					path: 'path1/*',
				},
			},
			{
				type: 'PREFIX',
				permission: ['get', 'list', 'write', 'delete'],
				scope: {
					bucketName: 'bucket1',
					path: 'profile-pictures/12345/*',
				},
			},
		]);
	});

	it('should continue to next bucket when paths are not defined', () => {
		const result = resolveLocationsForCurrentSession({
			buckets: {
				bucket1: {
					bucketName: 'bucket1',
					region: 'region1',
					paths: undefined,
				},
				bucket2: {
					bucketName: 'bucket1',
					region: 'region1',
					paths: {
						'path1/*': {
							guest: ['get', 'list'],
							authenticated: ['get', 'list', 'write'],
						},
					},
				},
			},
			isAuthenticated: true,
			identityId: '12345',
			userGroup: 'admin',
		});

		expect(result).toEqual([
			{
				type: 'PREFIX',
				permission: ['get', 'list', 'write'],
				scope: { bucketName: 'bucket1', path: 'path1/*' },
			},
		]);
	});

	it('should generate locations correctly when tokens are false', () => {
		const result = resolveLocationsForCurrentSession({
			buckets: mockBuckets,
			isAuthenticated: false,
		});

		expect(result).toEqual([
			{
				type: 'PREFIX',
				permission: ['get', 'list'],
				scope: {
					bucketName: 'bucket1',
					path: 'path1/*',
				},
			},
			{
				type: 'PREFIX',
				permission: ['read'],
				scope: {
					bucketName: 'bucket2',
					path: 'path3/*',
				},
			},
		]);
	});
});
