import { SchemaNamespace } from '../types';
import { DATASTORE } from '../util';

export function getNamespace(): SchemaNamespace {
	const namespace: SchemaNamespace = {
		name: DATASTORE,
		relationships: {},
		enums: {},
		nonModels: {},
		models: {
			Setting: {
				name: 'Setting',
				pluralName: 'Settings',
				syncable: false,
				fields: {
					id: {
						name: 'id',
						type: 'ID',
						isRequired: true,
						isArray: false,
					},
					key: {
						name: 'key',
						type: 'String',
						isRequired: true,
						isArray: false,
					},
					value: {
						name: 'value',
						type: 'String',
						isRequired: true,
						isArray: false,
					},
				},
			},
		},
	};

	return namespace;
}
