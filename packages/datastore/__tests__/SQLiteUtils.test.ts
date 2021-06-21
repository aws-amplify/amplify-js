import {
	generateSchemaStatements,
	queryByIdStatement,
	queryAllStatement,
	queryOneStatement,
	modelInsertStatement,
	modelUpdateStatement,
	whereClauseFromPredicate,
} from '../src/storage/adapter/SQLiteUtils';
import {
	InternalSchema,
	PersistentModelConstructor,
	QueryOne,
} from '../src/types';
import { Model, testSchema, internalTestSchema } from './helpers';
import { initSchema as initSchemaType } from '../src/datastore/datastore';

let initSchema: typeof initSchemaType;

const INTERNAL_TEST_SCHEMA_STATEMENTS = [
	'CREATE TABLE IF NOT EXISTS Setting (id PRIMARY KEY NOT NULL, key TEXT NOT NULL, value TEXT NOT NULL);',
	'CREATE TABLE IF NOT EXISTS Model (id PRIMARY KEY NOT NULL, field1 TEXT NOT NULL, optionalField1 TEXT, dateCreated TEXT NOT NULL, emails TEXT NOT NULL, ips TEXT, metadata TEXT, _version INT, _lastChangedAt INT, _deleted BOOLEAN);',
	'CREATE TABLE IF NOT EXISTS LocalModel (id PRIMARY KEY NOT NULL, field1 TEXT NOT NULL, _version INT, _lastChangedAt INT, _deleted BOOLEAN);',
	'CREATE TABLE IF NOT EXISTS MutationEvent (id PRIMARY KEY NOT NULL, model TEXT NOT NULL, data TEXT NOT NULL, modelId TEXT NOT NULL, operation TEXT NOT NULL, condition TEXT NOT NULL);',
	'CREATE TABLE IF NOT EXISTS ModelMetadata (id PRIMARY KEY NOT NULL, namespace TEXT NOT NULL, model TEXT NOT NULL, lastSync INT, lastFullSync INT, fullSyncInterval INT NOT NULL);',
];

describe('SQLiteUtils tests', () => {
	let Model: PersistentModelConstructor<Model>;

	beforeAll(async () => {
		({ initSchema } = require('../src/datastore/datastore'));

		const classes = initSchema(testSchema());

		({ Model } = classes as {
			Model: PersistentModelConstructor<Model>;
		});
	});

	describe('createSchemaStatements', () => {
		it('should generate valid CREATE TABLE statements from internal schema', () => {
			const schema: InternalSchema = internalTestSchema();

			expect(generateSchemaStatements(schema)).toEqual(
				INTERNAL_TEST_SCHEMA_STATEMENTS
			);
		});
	});

	describe('queryByIdStatement', () => {
		it('should generate valid SELECT by id statement', () => {
			const model = new Model({
				field1: 'test',
				dateCreated: new Date().toISOString(),
			});

			const expected = [`SELECT * FROM Model WHERE id = ?`, [model.id]];

			expect(queryByIdStatement(model.id, 'Model')).toEqual(expected);
		});
	});

	describe('queryAllStatement', () => {
		it('should generate valid SELECT all statement', () => {
			const expected = [`SELECT * FROM Model`, []];

			expect(queryAllStatement('Model')).toEqual(expected);
		});
	});

	describe('queryOneStatement', () => {
		it('should generate valid SELECT statement for query first', () => {
			const expected = [`SELECT * FROM Model LIMIT 1`, []];

			expect(queryOneStatement(QueryOne.FIRST, 'Model')).toEqual(expected);
		});

		it('should generate valid SELECT statement for query last', () => {
			const expected = [
				`SELECT * FROM Model LIMIT 1 OFFSET ((SELECT COUNT(*) FROM Model) - 1)`,
				[],
			];

			expect(queryOneStatement(QueryOne.LAST, 'Model')).toEqual(expected);
		});
	});

	describe('modelInsertStatement', () => {
		it('should generate valid SELECT by id statement', () => {
			const model = new Model({
				field1: 'test',
				dateCreated: new Date().toISOString(),
			});

			const expected = [
				'INSERT INTO Model (field1, dateCreated, id, _version, _lastChangedAt, _deleted) VALUES (?, ?, ?, ?, ?, ?)',
				[
					model.field1,
					model.dateCreated,
					model.id,
					undefined,
					undefined,
					undefined,
				],
			];

			expect(modelInsertStatement(model, 'Model')).toEqual(expected);
		});
	});

	describe('modelUpdateStatement', () => {
		it('should generate valid SELECT by id statement', () => {
			const model = new Model({
				field1: 'test',
				dateCreated: new Date().toISOString(),
			});

			const expected = [
				`UPDATE Model SET field1=?, dateCreated=?, _version=?, _lastChangedAt=?, _deleted=? WHERE id=?`,
				[
					model.field1,
					model.dateCreated,
					undefined,
					undefined,
					undefined,
					model.id,
				],
			];

			expect(modelUpdateStatement(model, 'Model')).toEqual(expected);
		});
	});

	describe('whereClauseFromPredicate', () => {
		const predicate = {
			type: 'and',
			predicates: [
				{
					field: 'firstName',
					operator: 'eq',
					operand: 'Bob',
				},
				{
					field: 'lastName',
					operator: 'beginsWith',
					operand: 'sm',
				},
				{
					field: 'sortOrder',
					operator: 'gt',
					operand: 5,
				},
			],
		};

		const expected = `WHERE firstName = 'Bob' and lastName LIKE 'sm%' and sortOrder > 5`;

		expect(whereClauseFromPredicate(predicate as any)).toEqual(expected);
	});
});
