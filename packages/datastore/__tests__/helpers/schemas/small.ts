import { Schema } from '../../../src/types';
import { testSchema } from './default';

export function smallTestSchema(): Schema {
	const schema = testSchema();
	return {
		...schema,
		models: {
			Model: schema.models.Model,
		},
	};
}
