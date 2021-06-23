import {
	InternalSchema,
	SchemaModel,
	PersistentModel,
	isGraphQLScalarType,
	GraphQLScalarType,
	QueryOne,
	PredicatesGroup,
	isPredicateObj,
	SortPredicatesGroup,
	PredicateObject,
	isPredicateGroup,
} from '../../types';
import { USER, exhaustiveCheck } from '../../util';

// TODO: rename to ParamaterizedStatement
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
	Predicates supported by DataStore:

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
	// TODO: enable contains for lists (only works with strings now)
	contains: 'LIKE',
	notContains: 'NOT LIKE',
	between: 'BETWEEN',
};

const whereConditionFromPredicateObject = ({
	field,
	operator,
	operand,
}: {
	field: string;
	operator:
		| keyof typeof logicalOperatorMap
		| keyof typeof comparisonOperatorMap;
	operand: any;
}): SQLStatement => {
	const comparisonOperator = comparisonOperatorMap[operator];

	if (comparisonOperator) {
		return [`${field} ${comparisonOperator} ?`, [operand]];
	}

	const logicalOperatorKey = <keyof typeof logicalOperatorMap>operator;
	const logicalOperator = logicalOperatorMap[logicalOperatorKey];

	if (logicalOperator) {
		let rightExp = [];
		switch (logicalOperatorKey) {
			case 'between':
				rightExp = operand; // operand is a 2-tuple
				break;
			case 'beginsWith':
				rightExp = [`${operand}%`];
				break;
			case 'contains':
			case 'notContains':
				rightExp = [`%${operand}%`];
				break;
			default:
				exhaustiveCheck(logicalOperatorKey);
				// Incorrect WHERE clause can result in data loss
				throw new Error('Cannot map predicate to a valid WHERE clause');
		}
		return [
			`${field} ${logicalOperator} ${rightExp.map(_ => '?').join(' AND ')}`,
			rightExp,
		];
	}
};

export function whereClauseFromPredicate<T extends PersistentModel>(
	predicate: PredicatesGroup<T>
): SQLStatement {
	const result = [];
	const params = [];

	recurse(predicate, result, params);
	const whereClause = `WHERE ${result.join(' ')}`;

	return [whereClause, params];

	function recurse(
		predicate: PredicatesGroup<T> | PredicateObject<T>,
		result = [],
		params = []
	): void {
		if (isPredicateGroup(predicate)) {
			const { type: groupType, predicates: groupPredicates } = predicate;
			let filterType: string = '';
			let isNegation = false;
			switch (groupType) {
				case 'not':
					isNegation = true;
					break;
				case 'and':
					filterType = 'AND';
					break;
				case 'or':
					filterType = 'OR';
					break;
				default:
					exhaustiveCheck(groupType);
			}

			const groupResult = [];
			for (const p of groupPredicates) {
				recurse(p, groupResult, params);
			}
			result.push(
				`${isNegation ? 'NOT' : ''}(${groupResult.join(` ${filterType} `)})`
			);
		} else if (isPredicateObj(predicate)) {
			const [condition, conditionParams] = whereConditionFromPredicateObject(
				predicate
			);

			result.push(condition);
			params.push(...conditionParams);
		}
	}
}

const sortDirectionMap = {
	ASCENDING: 'ASC',
	DESCENDING: 'DESC',
};

export function orderByClauseFromSort<T extends PersistentModel>(
	sortPredicate: SortPredicatesGroup<T>
): string {
	return sortPredicate.reduce((acc, { field, sortDirection }, idx) => {
		const orderByDirection = sortDirectionMap[sortDirection];

		if (idx > 0) {
			return acc + `, ${field} ${orderByDirection}`;
		}
		return acc + ` ${field} ${orderByDirection}`;
	}, 'ORDER BY');
}

export function limitClauseFromPagination(
	limit: number,
	page: number = 0
): string {
	let clause = `LIMIT ${limit}`;
	if (page) {
		clause += ` OFFSET ${page}`;
	}

	return clause;
}

export function queryAllStatement<T extends PersistentModel>(
	tableName: string,
	predicate?: PredicatesGroup<T>,
	sort?: SortPredicatesGroup<T>,
	limit?: number,
	page?: number
): SQLStatement {
	let statement = `SELECT * FROM ${tableName}`;
	const params = [];

	if (predicate && predicate.predicates.length) {
		const [whereClause, whereParams] = whereClauseFromPredicate(predicate);
		statement += ` ${whereClause}`;
		Array.prototype.push.apply(params, whereParams);
	}

	if (sort && sort.length) {
		const orderByClause = orderByClauseFromSort(sort);
		statement += ` ${orderByClause}`;
	}

	if (limit) {
		const limitClause = limitClauseFromPagination(limit, page);
		statement += ` ${limitClause}`;
	}

	return [statement, params];
}

export function queryOneStatement(
	firstOrLast,
	tableName: string
): SQLStatement {
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

export function deleteByIdStatement(
	id: string,
	tableName: string
): SQLStatement {
	const deleteStatement = `DELETE FROM ${tableName} WHERE id=?`;
	return [deleteStatement, [id]];
}

export function deleteByPredicateStatement<T extends PersistentModel>(
	tableName: string,
	predicate?: PredicatesGroup<T>
): SQLStatement {
	let statement = `DELETE FROM ${tableName}`;
	const params = [];

	if (predicate && predicate.predicates.length) {
		const [whereClause, whereParams] = whereClauseFromPredicate(predicate);
		statement += ` ${whereClause}`;
		Array.prototype.push.apply(params, whereParams);
	}
	return [statement, params];
}

// Probably won't be using this; leaving for now just in case
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
