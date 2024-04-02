import {
	ModelIntrospectionSchema,
	SchemaModel,
} from '@aws-amplify/core/dist/esm/singleton/API/types';
import { resolveOwnerFields } from '../src/utils/resolveOwnerFields';
import configFixture from './fixtures/modeled/amplifyconfiguration';

describe('owner field resolution', () => {
	const expectedResolutions = {
		Todo: ['owner'],
		Note: ['owner'],
		TodoMetadata: ['owner'],
		ThingWithCustomerOwnerField: ['customField'],
		ThingWithOwnerFieldSpecifiedInModel: ['owner'],
		ThingWithAPIKeyAuth: [],
		ThingWithoutExplicitAuth: [],
		ModelGroupDefinedIn: ['groupField'],
		ModelGroupsDefinedIn: ['groupsField'],
		ModelStaticGroup: [],
	};

	for (const [modelName, expected] of Object.entries(expectedResolutions)) {
		it(`identifes ${JSON.stringify(expected)} for ${modelName}`, () => {
			const modelIntroSchema =
				configFixture.modelIntrospection as ModelIntrospectionSchema;
			const model: SchemaModel = modelIntroSchema.models[modelName];

			const resolvedField = resolveOwnerFields(model);
			expect(resolvedField).toStrictEqual(expected);
		});
	}
});
