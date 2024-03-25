import { GraphQLProviderConfig } from '@aws-amplify/core/internals/utils';
import { generateEnumsProperty } from '../../../src/internals/utils/clientProperties/generateEnumsProperty';

describe('generateEnumsProperty()', () => {
	it('returns an empty object when there is no valid `modelIntrospection`', () => {
		const mockAPIGraphQLConfig: GraphQLProviderConfig['GraphQL'] = {
			endpoint: 'endpoint',
			defaultAuthMode: 'iam',
		};
		const result = generateEnumsProperty(mockAPIGraphQLConfig);

		expect(Object.keys(result)).toHaveLength(0);
	});

	it('returns expected `enums` object', () => {
		const mockAPIGraphQLConfig: GraphQLProviderConfig['GraphQL'] = {
			endpoint: 'endpoint',
			defaultAuthMode: 'iam',
			modelIntrospection: {
				version: 1,
				models: {},
				nonModels: {},
				enums: {
					TodoStatus: {
						name: 'TodoStatus',
						values: ['Planned', 'InProgress', 'Completed'],
					},
					SomeEnum: {
						name: 'SomeEnum',
						values: ['value1', 'value2'],
					},
				},
			},
		};

		const result = generateEnumsProperty(mockAPIGraphQLConfig);

		expect(Object.keys(result)).toEqual(['TodoStatus', 'SomeEnum']);
		expect((result as any).TodoStatus.values()).toEqual([
			'Planned',
			'InProgress',
			'Completed',
		]);
		expect((result as any).SomeEnum.values()).toEqual(['value1', 'value2']);
	});
});
