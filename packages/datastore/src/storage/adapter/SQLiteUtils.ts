import {
	InternalSchema,
	SchemaModel,
	PersistentModel,
	isEnumFieldType,
	isGraphQLScalarType,
	GraphQLScalarType,
	QueryOne,
	PredicatesGroup,
	isPredicateObj,
	SortPredicatesGroup,
} from '../../types';
import { USER } from '../../util';

export type SQLStatement = [string, any[]];

const keysFromModel = model => Object.keys(model).join(', ');

const valuesFromModel = (model): [string, any[]] => {
	const values = Object.values(model);
	const paramaterized = values.map(() => '?').join(', ');

	return [paramaterized, values];
};

const updateSet = model => {
	const values = [];
	const paramaterized = Object.entries(model)
		.filter(([k]) => k !== 'id')
		.map(([k, v]) => {
			values.push(v);
			return `${k}=?`;
		})
		.join(', ');

	return [paramaterized, values];
};

export function generateSchemaStatements(schema: InternalSchema): string[] {
	return Object.keys(schema.namespaces).flatMap(namespaceName => {
		const namespace = schema.namespaces[namespaceName];
		const isUserModel = namespaceName === USER;

		return Object.values(namespace.models).map(model =>
			modelCreateTableStatement(model, isUserModel)
		);
	});
}

export function modelCreateTableStatement(
	model: SchemaModel,
	userModel: boolean = false
): string {
	let fields = Object.values(model.fields).reduce((acc, field) => {
		if (isGraphQLScalarType(field.type)) {
			if (field.name === 'id') {
				return acc + 'id PRIMARY KEY NOT NULL';
			}

			let columnParam = `${field.name} ${GraphQLScalarType.getSQLiteType(
				field.type
			)}`;

			if (field.isRequired) {
				columnParam += ' NOT NULL';
			}

			return acc + `, ${columnParam}`;
		}

		// default to TEXT
		let columnParam = `${field.name} TEXT`;

		if (field.isRequired) {
			columnParam += ' NOT NULL';
		}

		return acc + `, ${columnParam}`;
	}, '');

	if (userModel) {
		fields += ', _version INT, _lastChangedAt INT, _deleted BOOLEAN';
	}

	const createTableStatement = `CREATE TABLE IF NOT EXISTS ${model.name} (${fields});`;
	return createTableStatement;
}

export function modelInsertStatement(
	model: PersistentModel,
	tableName: string
): SQLStatement {
	const keys = keysFromModel(model);
	const [paramaterized, values] = valuesFromModel(model);

	const insertStatement = `INSERT INTO ${tableName} (${keys}) VALUES (${paramaterized})`;

	return [insertStatement, values];
}

export function modelUpdateStatement(
	model: PersistentModel,
	tableName: string
): SQLStatement {
	const [paramaterized, values] = updateSet(model);

	const updateStatement = `UPDATE ${tableName} SET ${paramaterized} WHERE id=?`;

	return [updateStatement, [...values, model.id]];
}

export function queryByIdStatement(
	id: string,
	tableName: string
): SQLStatement {
	return [`SELECT * FROM ${tableName} WHERE id = ?`, [id]];
}

/*
	Strings: eq | ne | le | lt | ge | gt | contains | notContains | beginsWith | between
	Numbers: eq | ne | le | lt | ge | gt | between
	Lists: contains | notContains
*/

const comparisonOperatorMap = {
	eq: '=',
	ne: '!=',
	le: '<=',
	lt: '<',
	ge: '>=',
	gt: '>',
};

const logicalOperatorMap = {
	beginsWith: 'LIKE',
	// TODO: enable for lists (works with strings now)
	contains: 'LIKE',
	notContains: 'NOT LIKE',
	// TODO:
	between: 'BETWEEN',
};

const whereConditionFromPredicateObject = ({ field, operator, operand }) => {
	const comparisonOperator = comparisonOperatorMap[operator];

	// TODO: make this more resilient
	const rightExpr = typeof operand === 'string' ? `'${operand}'` : operand;

	if (comparisonOperator) {
		return `${field} ${comparisonOperator} ${rightExpr}`;
	}

	const logicalOperator = logicalOperatorMap[operator];

	if (logicalOperator) {
		switch (operator) {
			case 'beginsWith':
				return `${field} ${logicalOperator} '${operand}%'`;

			case 'contains':
				return `${field} ${logicalOperator} '%${operand}%'`;

			case 'notContains':
				return `${field} ${logicalOperator} '%${operand}%'`;

			default:
				// Throw, because we don't want to execute a command with an incorrect WHERE clause
				throw new Error('Cannot map predicate to a valid WHERE clause');
		}
	}
};

// TODO: paramaterize where clause; return SQLStatement
export function whereClauseFromPredicate(predicate: PredicatesGroup<any>) {
	const { type, predicates } = predicate;

	return predicates.reduce((acc, predicateObject, idx) => {
		// TODO: handle nested Predicate Group
		if (!isPredicateObj(predicateObject)) {
			return acc;
		}

		const condition = whereConditionFromPredicateObject(predicateObject);

		if (idx > 0) {
			// append type, e.g., AND for predicates [1..n]
			return acc + ` ${type} ${condition}`;
		}

		return acc + ` ${condition}`;
	}, 'WHERE');
}

/* 
TODO:
	sort -> ORDER BY
	pagination -> LIMIT
*/
export function queryAllStatement(
	tableName: string,
	predicate?: PredicatesGroup<PersistentModel>,
	sort?: SortPredicatesGroup<PersistentModel>,
	limit?: number,
	page: number = 0
) {
	let statement = `SELECT * FROM ${tableName}`;

	if (predicate) {
		const whereClause = whereClauseFromPredicate(predicate);
		statement += ` ${whereClause}`;
	}

	if (sort) {
	}

	if (limit) {
	}

	return [statement, []];
}

export function queryOneStatement(firstOrLast, tableName: string) {
	if (firstOrLast === QueryOne.FIRST) {
		return [`SELECT * FROM ${tableName} LIMIT 1`, []];
	} else {
		// Not very efficient, but I don't think this query gets used often
		return [
			`SELECT * FROM ${tableName} LIMIT 1 OFFSET ((SELECT COUNT(*) FROM ${tableName}) - 1)`,
			[],
		];
	}
}

export function modelDeleteStatement(
	model: PersistentModel,
	tableName: string
): SQLStatement {
	const deleteStatement = `DELETE FROM ${tableName} WHERE id=?`;
	return [deleteStatement, [model.id]];
}

// Probably won't be using this leaving for now just in case

// export function modelUpsertStatement(
// 	model: PersistentModel,
// 	tableName: string
// ): [string, string] {
// 	const keys = keysFromModel(model);
// 	const values = valuesFromModel(model);

// 	const upsertKeyVals = Object.keys(model)
// 		.map(key => {
// 			return `${key} = excluded.${key}`;
// 		})
// 		.join(', ');

// 	const upsertStatement = `INSERT INTO ${tableName} (${keys}) VALUES (${values})
// 	ON CONFLICT("id")
// 	DO
// 	UPDATE SET
// 	${upsertKeyVals}
// 	`;

// 	const queryStatement = queryByIdStatement(model.id, tableName);

// 	return [upsertStatement, queryStatement];
// }
