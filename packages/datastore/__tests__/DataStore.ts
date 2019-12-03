import 'fake-indexeddb/auto';
import * as uuidValidate from 'uuid-validate';
import { initSchema as initSchemaType } from '../src/datastore/datastore';
import {
	ModelInit,
	MutableModel,
	PersistentModelConstructor,
	Schema,
} from '../src/types';

let initSchema: typeof initSchemaType;

beforeEach(() => {
	jest.resetModules();

	({ initSchema } = require('../src/datastore/datastore'));
});

describe('DataStore tests', () => {
	describe('initSchema tests', () => {
		test('Class is created', () => {
			const classes = initSchema(testSchema());

			expect(classes).toHaveProperty('Model');

			const { Model } = classes;

			let property: keyof PersistentModelConstructor<any> = 'copyOf';
			expect(Model).toHaveProperty(property);

			expect(typeof Model.copyOf).toBe('function');
		});

		test('Class can be instantiated', () => {
			const { Model } = initSchema(testSchema()) as {
				Model: PersistentModelConstructor<Model>;
			};

			const model = new Model({
				field1: 'something',
			});

			expect(model).toBeInstanceOf(Model);

			expect(model.id).toBeDefined();

			// syncable models use uuid v4
			expect(uuidValidate(model.id, 4)).toBe(true);
		});

		test('Non-syncable models get a uuid v1', () => {
			const { LocalModel } = initSchema(testSchema()) as {
				LocalModel: PersistentModelConstructor<Model>;
			};

			const model = new LocalModel({
				field1: 'something',
			});

			expect(model).toBeInstanceOf(LocalModel);

			expect(model.id).toBeDefined();

			// local models use something like a uuid v1, see https://github.com/kelektiv/node-uuid/issues/75#issuecomment-483756623
			expect(
				uuidValidate(model.id.replace(/^(.{4})-(.{4})-(.{8})/, '$3-$2-$1'), 1)
			).toBe(true);
		});
	});

	describe('Immutability', () => {
		test('Field cannot be changed', () => {
			const { Model } = initSchema(testSchema()) as {
				Model: PersistentModelConstructor<Model>;
			};

			const model = new Model({
				field1: 'something',
			});

			expect(() => {
				(<any>model).field1 = 'edit';
			}).toThrowError("Cannot assign to read only property 'field1' of object");
		});

		test('Model can be copied+edited by creating an edited copy', () => {
			const { Model } = initSchema(testSchema()) as {
				Model: PersistentModelConstructor<Model>;
			};

			const model1 = new Model({
				field1: 'something',
			});

			const model2 = Model.copyOf(model1, draft => {
				draft.field1 = 'edited';
			});

			expect(model1).not.toBe(model2);

			// ID should be kept the same
			expect(model1.id).toBe(model2.id);

			expect(model1.field1).toBe('something');
			expect(model2.field1).toBe('edited');
		});

		test('Id cannot be changed inside copyOf', () => {
			const { Model } = initSchema(testSchema()) as {
				Model: PersistentModelConstructor<Model>;
			};

			const model1 = new Model({
				field1: 'something',
			});

			const model2 = Model.copyOf(model1, draft => {
				(<any>draft).id = 'a-new-id';
			});

			// ID should be kept the same
			expect(model1.id).toBe(model2.id);
		});
	});
});

//#region Test helpers

declare class Model {
	public readonly id: string;
	public readonly field1: string;

	constructor(init: ModelInit<Model>);

	static copyOf(
		src: Model,
		mutator: (draft: MutableModel<Model>) => void | Model
	): Model;
}

function testSchema(): Schema {
	return {
		enums: {},
		models: {
			Model: {
				name: 'Model',
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
				},
			},
			LocalModel: {
				name: 'LocalModel',
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
		version: 1,
	};
}

//#endregion
