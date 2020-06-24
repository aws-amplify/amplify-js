import { Draft } from 'immer';
import {
	GraphQLScalarType,
	isGraphQLScalarType,
	ModelInit,
	ModelInstanceMetadata,
	SchemaModel,
	SchemaNonModel,
} from '../types';

export const initializeInstance = <T>(
	init: ModelInit<T>,
	modelDefinition: SchemaModel | SchemaNonModel,
	draft: Draft<T & ModelInstanceMetadata>
) => {
	Object.entries(init).forEach(([k, v]) => {
		const fieldDefinition = modelDefinition.fields[k];

		if (fieldDefinition !== undefined) {
			const { type, isRequired, name, isArray } = fieldDefinition;

			if (isRequired && (v === null || v === undefined)) {
				throw new Error(`Field ${name} is required`);
			}

			if (isGraphQLScalarType(type)) {
				const jsType = GraphQLScalarType.getJSType(type);

				if (isArray) {
					if (!Array.isArray(v)) {
						throw new Error(
							`Field ${name} should be of type ${jsType}[], ${typeof v} received. ${v}`
						);
					}

					if ((<[]>v).some(e => typeof e !== jsType)) {
						const elemTypes = (<[]>v).map(e => typeof e).join(',');

						throw new Error(
							`All elements in the ${name} array should be of type ${jsType}, [${elemTypes}] received. ${v}`
						);
					}
				} else if (typeof v !== jsType && v !== null) {
					throw new Error(
						`Field ${name} should be of type ${jsType}, ${typeof v} received. ${v}`
					);
				}
			}
		}

		(<any>draft)[k] = v;
	});
};
