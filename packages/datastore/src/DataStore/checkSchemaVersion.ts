import { ModelPredicateCreator } from '../predicates';
import { ExclusiveStorage as Storage } from '../storage/storage';
import { PersistentModelConstructor } from '../types';
import { DATASTORE, SETTING_SCHEMA_VERSION } from '../util';
import { modelInstanceCreator } from './modelInstanceCreator';
import { dataStoreClasses, schema } from './schema';
import { Setting } from './Setting';

export async function checkSchemaVersion(
	storage: Storage,
	version: string
): Promise<void> {
	const Setting = dataStoreClasses.Setting as PersistentModelConstructor<
		Setting
	>;

	const modelDefinition = schema.namespaces[DATASTORE].models.Setting;

	await storage.runExclusive(async s => {
		const [schemaVersionSetting] = await s.query(
			Setting,
			ModelPredicateCreator.createFromExisting(modelDefinition, c =>
				// @ts-ignore Argument of type '"eq"' is not assignable to parameter of type 'never'.
				c.key('eq', SETTING_SCHEMA_VERSION)
			),
			{ page: 0, limit: 1 }
		);

		if (schemaVersionSetting !== undefined) {
			const storedValue = JSON.parse(schemaVersionSetting.value);

			if (storedValue !== version) {
				await s.clear(false);
			}
		} else {
			await s.save(
				modelInstanceCreator(Setting, {
					key: SETTING_SCHEMA_VERSION,
					value: JSON.stringify(version),
				})
			);
		}
	});
}
