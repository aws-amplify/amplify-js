import { ModelInit, MutableModel, Schema } from '../src/types';

export declare class Model {
	public readonly id: string;
	public readonly field1: string;
	public readonly optionalField1?: string;
	public readonly dateCreated: string;
	public readonly emails?: string[];
	public readonly ips?: (string | null)[];
	public readonly metadata?: Metadata;

	constructor(init: ModelInit<Model>);

	static copyOf(
		src: Model,
		mutator: (draft: MutableModel<Model>) => void | Model
	): Model;
}

export declare class Metadata {
	readonly author: string;
	readonly tags?: string[];
	readonly rewards: string[];
	readonly penNames: string[];
	readonly nominations?: string[];
	readonly misc?: (string | null)[];
	constructor(init: Metadata);
}

export function testSchema(): Schema {
	return {
		enums: {},
		models: {
			Model: {
				name: 'Model',
				pluralName: 'Models',
				syncable: true,
				fields: {
					id: {
						name: 'id',
						isArray: false,
						type: 'ID',
						isRequired: true,
					},
					field1: {
						name: 'field1',
						isArray: false,
						type: 'String',
						isRequired: true,
					},
					optionalField1: {
						name: 'optionalField1',
						isArray: false,
						type: 'String',
						isRequired: false,
					},
					dateCreated: {
						name: 'dateCreated',
						isArray: false,
						type: 'AWSDateTime',
						isRequired: true,
						attributes: [],
					},
					emails: {
						name: 'emails',
						isArray: true,
						type: 'AWSEmail',
						isRequired: true,
						attributes: [],
						isArrayNullable: true,
					},
					ips: {
						name: 'ips',
						isArray: true,
						type: 'AWSIPAddress',
						isRequired: false,
						attributes: [],
						isArrayNullable: true,
					},
					metadata: {
						name: 'metadata',
						isArray: false,
						type: {
							nonModel: 'Metadata',
						},
						isRequired: false,
						attributes: [],
					},
				},
			},
			LocalModel: {
				name: 'LocalModel',
				pluralName: 'LocalModels',
				syncable: false,
				fields: {
					id: {
						name: 'id',
						isArray: false,
						type: 'ID',
						isRequired: true,
					},
					field1: {
						name: 'field1',
						isArray: false,
						type: 'String',
						isRequired: true,
					},
				},
			},
		},
		nonModels: {
			Metadata: {
				name: 'Metadata',
				fields: {
					author: {
						name: 'author',
						isArray: false,
						type: 'String',
						isRequired: true,
						attributes: [],
					},
					tags: {
						name: 'tags',
						isArray: true,
						type: 'String',
						isRequired: false,
						isArrayNullable: true,
						attributes: [],
					},
					rewards: {
						name: 'rewards',
						isArray: true,
						type: 'String',
						isRequired: true,
						attributes: [],
					},
					penNames: {
						name: 'penNames',
						isArray: true,
						type: 'String',
						isRequired: true,
						isArrayNullable: true,
						attributes: [],
					},
					nominations: {
						name: 'nominations',
						isArray: true,
						type: 'String',
						isRequired: false,
						attributes: [],
					},
					misc: {
						name: 'misc',
						isArray: true,
						type: 'String',
						isRequired: false,
						isArrayNullable: true,
						attributes: [],
					},
				},
			},
		},
		version: '1',
	};
}
