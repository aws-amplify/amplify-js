import {
	PersistentModel,
	PersistentModelConstructor,
} from '@aws-amplify/datastore';

/**
 * Converts a plain "JSON" object (or an array thereof) into a DataStore Model
 * instance (or array thereof).
 *
 * Useful for taking serialized model instance from over the wire and turning
 * it back into a model instance.
 *
 * @param Model The Model constructor to instantiate.
 * @param init The plain "JSON" object.
 * @returns The instantiated instance(s).
 */
export function deserializeModel<T extends PersistentModel>(
	Model: PersistentModelConstructor<T>,
	init: T | T[]
) {
	if (Array.isArray(init)) {
		return init.map(init => deserializeModel(Model, init));
	}

	// `fromJSON` is intentionally hidden from types as a "private" method (though it exists on the instance)
	// @ts-ignore Property 'fromJSON' does not exist on type 'PersistentModelConstructor<T>'.ts(2339)
	return Model.fromJSON(init);
}

/**
 * Takes a regular Model instance and returns a plain old "JSON" object.
 *
 * Useful for serializing a model instance to send over the wire.
 *
 * @param model An instance of a Model
 * @returns A plain "JSON" object.
 */
export function serializeModel<T extends PersistentModel>(
	model: T | T[]
): JSON {
	return JSON.parse(JSON.stringify(model));
}
