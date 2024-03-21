import {
	ModelIntrospectionSchema,
	SchemaModel,
} from '@aws-amplify/core/dist/esm/singleton/API/types';
import { resolveOwnerFields } from '../src/utils/resolveOwnerFields';
import { buildAmplifyConfig } from './utils/build-amplify-config';
import { schema } from './fixtures/modeled/schema';

describe('owner field resolution', () => {
	const expectedResolutions = {
		Todo: ['owner'],
		Note: ['owner'],
		TodoMetadata: ['owner'],
		ThingWithCustomerOwnerField: ['customField'],
		ThingWithOwnerFieldSpecifiedInModel: ['owner'],
		ThingWithAPIKeyAuth: [],
		ThingWithoutExplicitAuth: [],
	};

	for (const [modelName, expected] of Object.entries(expectedResolutions)) {
		it(`identifes ${JSON.stringify(expected)} for ${modelName}`, async () => {
			const config = await buildAmplifyConfig(schema);
			const modelIntroSchema =
				config.modelIntrospection as ModelIntrospectionSchema;
			const model: SchemaModel = modelIntroSchema.models[modelName];

			const resolvedField = resolveOwnerFields(model);
			expect(resolvedField).toEqual(expected);
		});
	}
});
