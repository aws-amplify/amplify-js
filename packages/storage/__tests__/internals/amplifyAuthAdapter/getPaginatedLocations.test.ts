import { getPaginatedLocations } from '../../../src/internals/amplifyAuthConfigAdapter/getPaginatedLocations';
import { PathAccess } from '../../../src/internals/types/credentials';

describe('getPaginatedLocations', () => {
	const mockLocations: PathAccess[] = [
		{
			type: 'PREFIX',
			permission: ['read'],
			bucket: 'bucket1',
			prefix: 'path1/',
		},
		{
			type: 'PREFIX',
			permission: ['write'],
			bucket: 'bucket2',
			prefix: 'path2/',
		},
		{
			type: 'PREFIX',
			permission: ['read', 'write'],
			bucket: 'bucket3',
			prefix: 'path3/',
		},
	];

	it('should return all locations when no pagination is specified', () => {
		const result = getPaginatedLocations({ locations: mockLocations });
		expect(result).toEqual({ locations: mockLocations });
	});

	it('should return paginated locations when pageSize is specified', () => {
		const result = getPaginatedLocations({
			locations: mockLocations,
			pageSize: 2,
		});
		expect(result).toEqual({
			locations: mockLocations.slice(0, 2),
			nextToken: '1',
		});
	});

	it('should return paginated locations when pageSize and nextToken are specified', () => {
		const result = getPaginatedLocations({
			locations: mockLocations,
			pageSize: 1,
			nextToken: '2',
		});
		expect(result).toEqual({
			locations: mockLocations.slice(1, 2),
			nextToken: '1',
		});
	});

	it('should return empty locations when locations array is empty', () => {
		const result = getPaginatedLocations({ locations: [], pageSize: 2 });
		expect(result).toEqual({ locations: [] });
	});

	it('should return empty location when nextToken is beyond array length', () => {
		const result = getPaginatedLocations({
			locations: mockLocations,
			pageSize: 2,
			nextToken: '5',
		});
		expect(result).toEqual({ locations: [], nextToken: undefined });
	});

	it('should return all remaining location when page size is greater than remaining locations length', () => {
		const result = getPaginatedLocations({
			locations: mockLocations,
			pageSize: 5,
			nextToken: '2',
		});
		expect(result).toEqual({
			locations: mockLocations.slice(-2),
			nextToken: undefined,
		});
	});

	it('should return undefined nextToken when end of array is reached', () => {
		const result = getPaginatedLocations({
			locations: mockLocations,
			pageSize: 5,
		});
		expect(result).toEqual({
			locations: mockLocations.slice(0, 3),
			nextToken: undefined,
		});
	});
});
