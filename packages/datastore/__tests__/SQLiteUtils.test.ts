import {
	generateSchemaStatements,
	queryByIdStatement,
	queryAllStatement,
	queryOneStatement,
	modelInsertStatement,
	modelUpdateStatement,
	whereClauseFromPredicate,
	limitClauseFromPagination,
	orderByClauseFromSort,
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

		it('should generate valid SELECT all statement - with predicates, sort, & pagination', () => {
			const tableName = 'Model';

			const predicateGroup = {
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
						operand: 'Sm',
					},
					{
						field: 'sortOrder',
						operator: 'gt',
						operand: 5,
					},
				],
			};

			const sortPredicateGroup = [
				{
					field: 'sortOrder',
					sortDirection: 'ASCENDING',
				},
				{
					field: 'lastName',
					sortDirection: 'DESCENDING',
				},
			];

			const limit = 10;
			const page = 3;

			const expected = [
				`SELECT * FROM Model WHERE firstName = ? and lastName LIKE ? and sortOrder > ? ORDER BY sortOrder ASC, lastName DESC LIMIT 10 OFFSET 3`,
				['Bob', 'Sm%', 5],
			];

			expect(
				queryAllStatement(
					tableName,
					predicateGroup as any,
					sortPredicateGroup as any,
					limit,
					page
				)
			).toEqual(expected);
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
		it('should generate valid WHERE clause from predicate', () => {
			const predicateGroup = {
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
						operand: 'Sm',
					},
					{
						field: 'sortOrder',
						operator: 'gt',
						operand: 5,
					},
				],
			};

			const expected = [
				`WHERE firstName = ? and lastName LIKE ? and sortOrder > ?`,
				['Bob', 'Sm%', 5],
			];

			expect(whereClauseFromPredicate(predicateGroup as any)).toEqual(expected);
		});
	});

	describe('limitClauseFromPagination', () => {
		it('should generate valid LIMIT clause from pagination limit', () => {
			const limit = 10;

			const expected = 'LIMIT 10';

			expect(limitClauseFromPagination(limit)).toEqual(expected);
		});

		it('should generate valid LIMIT clause from pagination limit and page', () => {
			const limit = 10;
			const page = 3;

			const expected = 'LIMIT 10 OFFSET 3';

			expect(limitClauseFromPagination(limit, page)).toEqual(expected);
		});
	});

	describe('orderByClauseFromSort', () => {
		it('should generate valid ORDER BY clause from pagination sort', () => {
			const sortPredicateGroup = [
				{
					field: 'sortOrder',
					sortDirection: 'ASCENDING',
				},
			];

			const expected = 'ORDER BY sortOrder ASC';

			expect(orderByClauseFromSort(sortPredicateGroup as any)).toEqual(
				expected
			);
		});

		it('should generate valid ORDER BY clause from pagination sort - multi field', () => {
			const sortPredicateGroup = [
				{
					field: 'sortOrder',
					sortDirection: 'ASCENDING',
				},
				{
					field: 'lastName',
					sortDirection: 'DESCENDING',
				},
			];

			const expected = 'ORDER BY sortOrder ASC, lastName DESC';

			expect(orderByClauseFromSort(sortPredicateGroup as any)).toEqual(
				expected
			);
		});
	});
});
