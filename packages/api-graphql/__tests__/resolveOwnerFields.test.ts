import { resolveOwnerFields } from '../src/utils/resolveOwnerFields';
import configFixture from './fixtures/modeled/amplifyconfiguration';

describe('owner field resolution', () => {
	const exepectetResolutions = {
		Todo: ['owner'],
		Note: ['owner'],
		TodoMetadata: ['owner'],
		ThingWithCustomerOwnerField: ['customField'],
		ThingWithOwnerFieldSpecifiedInModel: ['owner'],
		ThingWithAPIKeyAuth: [],
		ThingWithoutExplicitAuth: [],
	};

	for (const [modelName, expected] of Object.entries(exepectetResolutions)) {
		it(`identifes ${JSON.stringify(expected)} for ${modelName}`, () => {
			const model = configFixture.modelIntrospection.models[modelName];
			const resolvedField = resolveOwnerFields(model);
			expect(resolvedField).toEqual(expected);
		});
	}
});
