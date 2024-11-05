import {
	generateSchemaStatements,
	queryByIdStatement,
	queryAllStatement,
	queryOneStatement,
	modelInsertStatement,
	modelUpdateStatement,
	whereClauseFromPredicate,
	whereConditionFromPredicateObject,
	limitClauseFromPagination,
	orderByClauseFromSort,
	deleteByIdStatement,
	deleteByPredicateStatement,
	modelCreateTableStatement,
	implicitAuthFieldsForModel,
} from '../src/common/SQLiteUtils';
import {
	InternalSchema,
	PersistentModelConstructor,
	QueryOne,
	SchemaModel,
	initSchema as initSchemaType,
} from '@aws-amplify/datastore';
import { Model, testSchema, internalTestSchema } from './helpers';

let initSchema: typeof initSchemaType;

const INTERNAL_TEST_SCHEMA_STATEMENTS = [
	'CREATE TABLE IF NOT EXISTS "Setting" ("id" PRIMARY KEY NOT NULL, "key" TEXT NOT NULL, "value" TEXT NOT NULL);',
	'CREATE TABLE IF NOT EXISTS "Model" ("id" PRIMARY KEY NOT NULL, "field1" TEXT NOT NULL, "optionalField1" TEXT, "dateCreated" TEXT NOT NULL, "emails" TEXT NOT NULL, "ips" TEXT, "metadata" TEXT, "_version" INTEGER, "_lastChangedAt" INTEGER, "_deleted" INTEGER);',
	'CREATE TABLE IF NOT EXISTS "LocalModel" ("id" PRIMARY KEY NOT NULL, "field1" TEXT NOT NULL, "_version" INTEGER, "_lastChangedAt" INTEGER, "_deleted" INTEGER);',
	'CREATE TABLE IF NOT EXISTS "MutationEvent" ("id" PRIMARY KEY NOT NULL, "model" TEXT NOT NULL, "data" TEXT NOT NULL, "modelId" TEXT NOT NULL, "operation" TEXT NOT NULL, "condition" TEXT NOT NULL);',
	'CREATE TABLE IF NOT EXISTS "ModelMetadata" ("id" PRIMARY KEY NOT NULL, "namespace" TEXT NOT NULL, "model" TEXT NOT NULL, "lastSync" INTEGER, "lastFullSync" INTEGER, "fullSyncInterval" INTEGER NOT NULL);',
];

const INTERNAL_TEST_SCHEMA_MANY_TO_MANY_STATEMENT =
	'CREATE TABLE IF NOT EXISTS "PostEditor" ("id" PRIMARY KEY NOT NULL, "post" TEXT, "postID" TEXT NOT NULL, "editor" TEXT, "editorID" TEXT NOT NULL, "createdAt" TEXT, "updatedAt" TEXT, "_version" INTEGER, "_lastChangedAt" INTEGER, "_deleted" INTEGER);';

const INTERNAL_TEST_SCHEMA_ONE_TO_MANY_STATEMENT =
	'CREATE TABLE IF NOT EXISTS "Post" ("id" PRIMARY KEY NOT NULL, "title" TEXT NOT NULL, "comments" TEXT, "_version" INTEGER, "_lastChangedAt" INTEGER, "_deleted" INTEGER);';

describe('SQLiteUtils tests', () => {
	let Model: PersistentModelConstructor<Model>;

	beforeAll(async () => {
		({ initSchema } = require('@aws-amplify/datastore'));

		const classes = initSchema(testSchema());

		({ Model } = classes as {
			Model: PersistentModelConstructor<Model>;
		});
	});

	describe('createSchemaStatements', () => {
		it('should generate valid CREATE TABLE statements from internal schema', () => {
			const schema: InternalSchema = internalTestSchema();

			expect(generateSchemaStatements(schema)).toEqual(
				INTERNAL_TEST_SCHEMA_STATEMENTS,
			);
		});
	});

	describe('modelCreateTableStatement', () => {
		it('should generate a valid CREATE TABLE statement from a M:N join table model with implicit FKs', () => {
			expect(modelCreateTableStatement(postEditorImplicit, true)).toEqual(
				INTERNAL_TEST_SCHEMA_MANY_TO_MANY_STATEMENT,
			);
		});

		it('should generate a valid CREATE TABLE statement from a M:N join table model with explicit FKs', () => {
			expect(modelCreateTableStatement(postEditorExplicit, true)).toEqual(
				INTERNAL_TEST_SCHEMA_MANY_TO_MANY_STATEMENT,
			);
		});

		it('should generate a valid CREATE TABLE statement from a 1:M join table model', () => {
			expect(modelCreateTableStatement(postWithRequiredComments, true)).toEqual(
				INTERNAL_TEST_SCHEMA_ONE_TO_MANY_STATEMENT,
			);
		});
	});

	describe('implicitAuthFieldsForModel', () => {
		it('should extract implicitly defined owner field from model attributes', () => {
			expect(implicitAuthFieldsForModel(ownerAuthImplicit)).toEqual(['owner']);
		});

		it('should skip explicitly defined owner field', () => {
			expect(implicitAuthFieldsForModel(ownerAuthExplicit)).toEqual([]);
		});

		it('should extract implicitly defined groups field from model attributes', () => {
			expect(implicitAuthFieldsForModel(groupsAuthImplicit)).toEqual([
				'allowedGroups',
			]);
		});

		it('should skip explicitly defined groups field', () => {
			expect(implicitAuthFieldsForModel(groupsAuthExplicit)).toEqual([]);
		});
	});

	describe('queryByIdStatement', () => {
		it('should generate valid SELECT by id statement', () => {
			const model = new Model({
				field1: 'test',
				dateCreated: new Date().toISOString(),
			});

			const expected = [`SELECT * FROM "Model" WHERE "id" = ?`, [model.id]];

			expect(queryByIdStatement(model.id, 'Model')).toEqual(expected);
		});
	});

	describe('queryAllStatement', () => {
		it('should generate valid SELECT all statement', () => {
			const expected = [`SELECT * FROM "Model" ORDER BY _rowid_ ASC`, []];

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
				`SELECT * FROM "Model" WHERE ("firstName" = ? AND instr("lastName", ?) = 1 AND "sortOrder" > ?) ORDER BY "sortOrder" ASC, "lastName" DESC, _rowid_ ASC LIMIT ? OFFSET ?`,
				['Bob', 'Sm', 5, 10, 30],
			];

			expect(
				queryAllStatement(
					tableName,
					predicateGroup as any,
					sortPredicateGroup as any,
					limit,
					page,
				),
			).toEqual(expected);
		});
	});

	describe('queryOneStatement', () => {
		it('should generate valid SELECT statement for query first', () => {
			const expected = [`SELECT * FROM Model ORDER BY _rowid_ LIMIT 1`, []];

			expect(queryOneStatement(QueryOne.FIRST, 'Model')).toEqual(expected);
		});

		it('should generate valid SELECT statement for query last', () => {
			const expected = [
				`SELECT * FROM Model ORDER BY _rowid_ DESC LIMIT 1`,
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
				'INSERT INTO "Model" ("field1", "dateCreated", "id", "_version", "_lastChangedAt", "_deleted", "optionalField1", "emails", "ips", "metadata", "createdAt", "updatedAt") VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
				[
					model.field1,
					model.dateCreated,
					model.id,
					undefined,
					undefined,
					undefined,
					null,
					null,
					null,
					null,
					null,
					null,
				],
			];

			expect(modelInsertStatement(model, 'Model')).toEqual(expected);
		});
	});

	describe('modelUpdateStatement', () => {
		it('should generate valid UPDATE by id statement', () => {
			const model = new Model({
				field1: 'test',
				dateCreated: new Date().toISOString(),
			});

			const expected = [
				`UPDATE "Model" SET "field1"=?, "dateCreated"=?, "_version"=?, "_lastChangedAt"=?, "_deleted"=?, "optionalField1"=?, "emails"=?, "ips"=?, "metadata"=?, "createdAt"=?, "updatedAt"=? WHERE id=?`,
				[
					model.field1,
					model.dateCreated,
					undefined,
					undefined,
					undefined,
					null,
					null,
					null,
					null,
					null,
					null,
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
				`WHERE ("firstName" = ? AND instr("lastName", ?) = 1 AND "sortOrder" > ?)`,
				['Bob', 'Sm', 5],
			];

			expect(whereClauseFromPredicate(predicateGroup as any)).toEqual(expected);
		});
	});

	describe('whereConditionFromPredicateObject', () => {
		it('should generate valid `beginsWith` condition from predicate object', () => {
			const predicate = {
				field: 'name',
				operator: 'beginsWith',
				operand: '%',
			};

			const expected = [`instr("name", ?) = 1`, ['%']];

			expect(whereConditionFromPredicateObject(predicate as any)).toEqual(
				expected,
			);
		});
		it('should generate valid `contains` condition from predicate object', () => {
			const predicate = {
				field: 'name',
				operator: 'contains',
				operand: '%',
			};

			const expected = [`instr("name", ?) > 0`, ['%']];

			expect(whereConditionFromPredicateObject(predicate as any)).toEqual(
				expected,
			);
		});
		it('should generate valid `notContains` condition from predicate object', () => {
			const predicate = {
				field: 'name',
				operator: 'notContains',
				operand: '%',
			};

			const expected = [`instr("name", ?) = 0`, ['%']];

			expect(whereConditionFromPredicateObject(predicate as any)).toEqual(
				expected,
			);
		});
		it('should generate valid `between` condition from predicate object', () => {
			const predicate = {
				field: 'name',
				operator: 'between',
				operand: ['a', 'b'],
			};

			const expected = [`"name" BETWEEN ? AND ?`, ['a', 'b']];

			expect(whereConditionFromPredicateObject(predicate as any)).toEqual(
				expected,
			);
		});
	});

	describe('limitClauseFromPagination', () => {
		it('should generate valid LIMIT clause from pagination limit', () => {
			const limit = 10;

			const expected = ['LIMIT ?', [10]];

			expect(limitClauseFromPagination(limit)).toEqual(expected);
		});

		it('should generate valid LIMIT clause from pagination limit and page', () => {
			const limit = 10;
			const page = 3;

			const expected = ['LIMIT ? OFFSET ?', [10, 30]];

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

			const expected = 'ORDER BY "sortOrder" ASC, _rowid_ ASC';

			expect(orderByClauseFromSort(sortPredicateGroup as any)).toEqual(
				expected,
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

			const expected = 'ORDER BY "sortOrder" ASC, "lastName" DESC, _rowid_ ASC';

			expect(orderByClauseFromSort(sortPredicateGroup as any)).toEqual(
				expected,
			);
		});
	});

	describe('deleteByIdStatement', () => {
		it('should generate valid DELETE statement', () => {
			const model = new Model({
				field1: 'test',
				dateCreated: new Date().toISOString(),
			});

			const expected = ['DELETE FROM "Model" WHERE "id"=?', [model.id]];

			expect(deleteByIdStatement(model.id, 'Model')).toEqual(expected);
		});
	});

	describe('deleteByPredicateStatement', () => {
		it('should generate valid DELETE statement', () => {
			const model = new Model({
				field1: 'test',
				dateCreated: new Date().toISOString(),
			});

			const predicateGroup = {
				type: 'and',
				predicates: [
					{
						field: 'createdAt',
						operator: 'gt',
						operand: '2021-06-20',
					},
				],
			};

			const expected = [
				'DELETE FROM "Model" WHERE ("createdAt" > ?)',
				['2021-06-20'],
			];

			expect(
				deleteByPredicateStatement('Model', predicateGroup as any),
			).toEqual(expected);
		});
	});
});

const postEditorImplicit: SchemaModel = {
	name: 'PostEditor',
	fields: {
		id: {
			name: 'id',
			isArray: false,
			type: 'ID',
			isRequired: true,
			attributes: [],
		},
		post: {
			name: 'post',
			isArray: false,
			type: { model: 'Post' },
			isRequired: true,
			attributes: [],
			association: {
				connectionType: 'BELONGS_TO',
				targetName: 'postID',
			},
		},
		editor: {
			name: 'editor',
			isArray: false,
			type: { model: 'User' },
			isRequired: true,
			attributes: [],
			association: {
				connectionType: 'BELONGS_TO',
				targetName: 'editorID',
			},
		},
		createdAt: {
			name: 'createdAt',
			isArray: false,
			type: 'AWSDateTime',
			isRequired: false,
			attributes: [],
		},
		updatedAt: {
			name: 'updatedAt',
			isArray: false,
			type: 'AWSDateTime',
			isRequired: false,
			attributes: [],
		},
	},
	syncable: true,
	pluralName: 'PostEditors',
	attributes: [
		{ type: 'model', properties: { queries: null } },
		{
			type: 'key',
			properties: {
				name: 'byPost',
				fields: ['postID', 'editorID'],
			},
		},
		{
			type: 'key',
			properties: {
				name: 'byEditor',
				fields: ['editorID', 'postID'],
			},
		},
	],
};

const postEditorExplicit: SchemaModel = {
	name: 'PostEditor',
	fields: {
		id: {
			name: 'id',
			isArray: false,
			type: 'ID',
			isRequired: true,
			attributes: [],
		},
		post: {
			name: 'post',
			isArray: false,
			type: { model: 'Post' },
			isRequired: true,
			attributes: [],
			association: {
				connectionType: 'BELONGS_TO',
				targetName: 'postID',
			},
		},
		postID: {
			name: 'postID',
			isArray: false,
			type: 'ID',
			isRequired: true,
			attributes: [],
		},
		editor: {
			name: 'editor',
			isArray: false,
			type: { model: 'User' },
			isRequired: true,
			attributes: [],
			association: {
				connectionType: 'BELONGS_TO',
				targetName: 'editorID',
			},
		},
		editorID: {
			name: 'editorID',
			isArray: false,
			type: 'ID',
			isRequired: true,
			attributes: [],
		},
		createdAt: {
			name: 'createdAt',
			isArray: false,
			type: 'AWSDateTime',
			isRequired: false,
			attributes: [],
		},
		updatedAt: {
			name: 'updatedAt',
			isArray: false,
			type: 'AWSDateTime',
			isRequired: false,
			attributes: [],
		},
	},
	syncable: true,
	pluralName: 'PostEditors',
	attributes: [
		{ type: 'model', properties: { queries: null } },
		{
			type: 'key',
			properties: { name: 'byPost', fields: ['postID', 'editorID'] },
		},
		{
			type: 'key',
			properties: {
				name: 'byEditor',
				fields: ['editorID', 'postID'],
			},
		},
	],
};

const ownerAuthImplicit: SchemaModel = {
	name: 'OwnerAuthImplicit',
	pluralName: 'OwnerAuthImplicit',
	fields: {
		id: {
			name: 'id',
			isArray: false,
			type: 'ID',
			isRequired: true,
			attributes: [],
		},
	},
	attributes: [
		{
			type: 'auth',
			properties: {
				rules: [
					{
						provider: 'userPools',
						ownerField: 'owner',
						allow: 'owner',
						identityClaim: 'cognito:username',
						operations: ['create', 'update', 'delete', 'read'],
					},
					{
						allow: 'public',
						operations: ['read'],
					},
				],
			},
		},
	],
};

const ownerAuthExplicit: SchemaModel = {
	name: 'OwnerAuthImplicit',
	pluralName: 'OwnerAuthImplicit',
	fields: {
		id: {
			name: 'id',
			isArray: false,
			type: 'ID',
			isRequired: true,
			attributes: [],
		},
		owner: {
			name: 'owner',
			isArray: false,
			type: 'String',
			isRequired: false,
			attributes: [],
		},
	},
	attributes: [
		{
			type: 'auth',
			properties: {
				rules: [
					{
						provider: 'userPools',
						ownerField: 'owner',
						allow: 'owner',
						identityClaim: 'cognito:username',
						operations: ['create', 'update', 'delete', 'read'],
					},
					{
						allow: 'public',
						operations: ['read'],
					},
				],
			},
		},
	],
};

const groupsAuthImplicit: SchemaModel = {
	name: 'OwnerAuthImplicit',
	pluralName: 'OwnerAuthImplicit',
	fields: {
		id: {
			name: 'id',
			isArray: false,
			type: 'ID',
			isRequired: true,
			attributes: [],
		},
	},
	attributes: [
		{
			type: 'auth',
			properties: {
				rules: [
					{
						groupClaim: 'cognito:groups',
						provider: 'userPools',
						allow: 'groups',
						groupsField: 'allowedGroups',
						operations: ['create', 'update', 'delete', 'read'],
					},
					{
						allow: 'public',
						operations: ['read'],
					},
				],
			},
		},
	],
};

const groupsAuthExplicit: SchemaModel = {
	name: 'OwnerAuthImplicit',
	pluralName: 'OwnerAuthImplicit',
	fields: {
		id: {
			name: 'id',
			isArray: false,
			type: 'ID',
			isRequired: true,
			attributes: [],
		},
		allowedGroups: {
			name: 'allowedGroups',
			isArray: false,
			type: 'String',
			isRequired: false,
			attributes: [],
		},
	},
	attributes: [
		{
			type: 'auth',
			properties: {
				rules: [
					{
						groupClaim: 'cognito:groups',
						provider: 'userPools',
						allow: 'groups',
						groupsField: 'allowedGroups',
						operations: ['create', 'update', 'delete', 'read'],
					},
					{
						allow: 'public',
						operations: ['read'],
					},
				],
			},
		},
	],
};

const postWithRequiredComments: SchemaModel = {
	name: 'Post',
	pluralName: 'Posts',
	fields: {
		id: {
			name: 'id',
			isArray: false,
			type: 'ID',
			isRequired: true,
			attributes: [],
		},
		title: {
			name: 'title',
			isArray: false,
			type: 'String',
			isRequired: true,
			attributes: [],
		},
		comments: {
			name: 'comments',
			isArray: true,
			type: {
				model: 'Comment',
			},
			isRequired: true,
			attributes: [],
			isArrayNullable: true,
			association: {
				connectionType: 'HAS_MANY',
				associatedWith: 'post',
			},
		},
	},
	attributes: [
		{
			type: 'model',
			properties: {},
		},
	],
};
