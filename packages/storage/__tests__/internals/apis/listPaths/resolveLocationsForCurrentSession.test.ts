import { resolveLocationsForCurrentSession } from '../../../../src/internals/apis/listPaths/resolveLocationsForCurrentSession';
import { BucketInfo } from '../../../../src/providers/s3/types/options';

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
		});

		expect(result).toEqual([
			{
				type: 'PREFIX',
				permission: ['get', 'list', 'write'],
				bucket: 'bucket1',
				prefix: 'path1/*',
			},
			{
				type: 'PREFIX',
				permission: ['get', 'list', 'write', 'delete'],
				bucket: 'bucket1',
				prefix: 'profile-pictures/12345/*',
			},
		]);
	});

	it('should generate locations correctly when tokens are true & userGroup', () => {
		const result = resolveLocationsForCurrentSession({
			buckets: mockBuckets,
			isAuthenticated: true,
			identityId: '12345',
			userGroup: 'admin',
		});

		expect(result).toEqual([
			{
				type: 'PREFIX',
				permission: ['get', 'list', 'write', 'delete'],
				bucket: 'bucket1',
				prefix: 'path2/*',
			},
		]);
	});

	it('should return empty locations when tokens are true & bad userGroup', () => {
		const result = resolveLocationsForCurrentSession({
			buckets: mockBuckets,
			isAuthenticated: true,
			identityId: '12345',
			userGroup: 'editor',
		});

		expect(result).toEqual([]);
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
		});

		expect(result).toEqual([
			{
				type: 'PREFIX',
				permission: ['get', 'list', 'write'],
				bucket: 'bucket1',
				prefix: 'path1/*',
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
				bucket: 'bucket1',
				prefix: 'path1/*',
			},
			{
				type: 'PREFIX',
				permission: ['read'],
				bucket: 'bucket2',
				prefix: 'path3/*',
			},
		]);
	});
});
