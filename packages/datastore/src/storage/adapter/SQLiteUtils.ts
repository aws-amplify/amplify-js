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
import { USER, exhaustiveCheck, isNonModelConstructor } from '../../util';

// TODO: rename to ParamaterizedStatement
export type SQLStatement = [string, any[]];

const keysFromModel = model => Object.keys(model).join(', ');

const valuesFromModel = (model): [string, any[]] => {
	const values = Object.values(model).map(prepareValueForDML);
	const paramaterized = values.map(() => '?').join(', ');

	return [paramaterized, values];
};

const updateSet = model => {
	const values = [];
	const paramaterized = Object.entries(model)
		.filter(([k]) => k !== 'id')
		.map(([k, v]) => {
			values.push(prepareValueForDML(v));
			return `${k}=?`;
		})
		.join(', ');

	return [paramaterized, values];
};

function prepareValueForDML(value: unknown): any {
	if (value === null || value === undefined) {
		return value;
	}

	if (typeof value === 'string') {
		return value;
	}

	if (typeof value === 'number') {
		return value;
	}

	if (typeof value === 'boolean') {
		return value;
	}

	if (Array.isArray(value)) {
		return JSON.stringify(value);
	}

	if (typeof value === 'object') {
		if (Object.getPrototypeOf(value).constructor === Object) {
			return JSON.stringify(value);
		}
		if (isNonModelConstructor(Object.getPrototypeOf(value).constructor)) {
			return JSON.stringify(value);
		}
	}

	return `${value}`;
}

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
		fields += ', _version INTEGER, _lastChangedAt INTEGER, _deleted NUMERIC';
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
	sortPredicate: SortPredicatesGroup<T> = []
): string {
	const orderByParts = sortPredicate.map(
		({ field, sortDirection }) => `${field} ${sortDirectionMap[sortDirection]}`
	);

	// We always sort by _rowid_ last
	orderByParts.push(`_rowid_ ${sortDirectionMap.ASCENDING}`);

	return `ORDER BY ${orderByParts.join(', ')}`;
}

export function limitClauseFromPagination(
	limit: number,
	page: number = 0
): SQLStatement {
	const params = [limit];
	let clause = 'LIMIT ?';
	if (page) {
		const offset = limit * page;
		params.push(offset);
		clause += ' OFFSET ?';
	}

	return [clause, params];
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
		params.push(...whereParams);
	}

	const orderByClause = orderByClauseFromSort(sort);
	statement += ` ${orderByClause}`;

	if (limit) {
		const [limitClause, limitParams] = limitClauseFromPagination(limit, page);
		statement += ` ${limitClause}`;
		params.push(...limitParams);
	}

	return [statement, params];
}

export function queryOneStatement(
	firstOrLast,
	tableName: string
): SQLStatement {
	if (firstOrLast === QueryOne.FIRST) {
		// ORDER BY rowid will no longer work as expected if a customer has
		// a field by that name in their schema. We may want to enforce it
		// as a reserved keyword in Codegen
		return [`SELECT * FROM ${tableName} ORDER BY _rowid_ LIMIT 1`, []];
	} else {
		return [`SELECT * FROM ${tableName} ORDER BY _rowid_ DESC LIMIT 1`, []];
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
		params.push(...whereParams);
	}
	return [statement, params];
}
