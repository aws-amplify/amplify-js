import * as raw from '../../src';
import { Amplify, AmplifyClassV6 } from '@aws-amplify/core';
import { generateClient } from '../../src/internals';
import configFixture from '../fixtures/modeled/amplifyconfiguration';
import { Schema } from '../fixtures/modeled/schema';
import { Observable, from } from 'rxjs';
import * as internals from '../../src/internals';
import {
	normalizePostGraphqlCalls,
	expectSub,
	expectSubWithHeaders,
	expectSubWithHeadersFn,
	expectSubWithlibraryConfigHeaders,
	expectSelectionSetContains,
	expectSelectionSetNotContains,
	expectVariables,
} from '../utils/index';

const serverManagedFields = {
	id: 'some-id',
	owner: 'wirejobviously',
	createdAt: new Date().toISOString(),
	updatedAt: new Date().toISOString(),
};

/**
 *
 * @param value Value to be returned. Will be `awaited`, and can
 * therefore be a simple JSON value or a `Promise`.
 * @returns
 */
function mockApiResponse(value: any) {
	return jest
		.spyOn((raw.GraphQLAPI as any)._api, 'post')
		.mockImplementation(async () => {
			const result = await value;
			return {
				body: {
					json: () => result,
				},
			};
		});
}

describe('implicit auth field handling', () => {
	beforeEach(() => {
		jest.clearAllMocks();
	});

	for (const [modelName, authField] of [
		['ImplicitOwner', 'owner'],
		['CustomImplicitOwner', 'customOwner'],
		['ModelGroupDefinedIn', 'groupField'],
		['ModelGroupsDefinedIn', 'groupsField'],
	] as const) {
		test(`get ${modelName} includes auth field ${authField} in selection set`, async () => {
			// This config hackery can be removed once the schema builder is updated to omit
			// implicit auth fields from the graphql schema and the amplifyconfiguration.ts fixture
			// is updated accordingly. Until then, we're creating a copy of the generated fixture
			// minus the auth field that will eventually be omitted from the model.
			const config = JSON.parse(JSON.stringify(configFixture));
			delete (config.modelIntrospection.models[modelName].fields as any)[
				authField
			];

			Amplify.configure(config as any);

			const spy = mockApiResponse({
				data: null,
			});

			const client = generateClient<Schema>({ amplify: Amplify });
			const { data } = await client.models[modelName].get({ id: 'some-id' });

			expectSelectionSetContains(spy, [authField]);
		});

		test(`can list ${modelName} with filter on auth field ${authField}`, async () => {
			// This config hackery can be removed once the schema builder is updated to omit
			// implicit auth fields from the graphql schema and the amplifyconfiguration.ts fixture
			// is updated accordingly. Until then, we're creating a copy of the generated fixture
			// minus the auth field that will eventually be omitted from the model.
			const config = JSON.parse(JSON.stringify(configFixture));
			delete (config.modelIntrospection.models[modelName].fields as any)[
				authField
			];

			const spy = mockApiResponse({
				data: {
					[`list${config.modelIntrospection.models[modelName].pluralName}`]: {
						items: [],
					},
				},
			});

			const client = generateClient<Schema>({ amplify: Amplify });
			const { data } = await client.models[modelName].list({
				filter: { [authField]: { contains: 'something' } },
			});

			expectVariables(spy, {
				filter: { [authField]: { contains: 'something' } },
			});
		});
	}
});
