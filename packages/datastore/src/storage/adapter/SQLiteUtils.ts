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
	isModelFieldType,
	isTargetNameAssociation,
} from '../../types';
import {
	USER,
	exhaustiveCheck,
	isNonModelConstructor,
	isModelConstructor,
} from '../../util';

export type ParameterizedStatement = [string, any[]];

const keysFromModel = model =>
	Object.keys(model)
		.map(k => `"${k}"`)
		.join(', ');

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
			return `"${k}"=?`;
		})
		.join(', ');

	return [paramaterized, values];
};

function prepareValueForDML(value: unknown): any {
	const scalarTypes = ['string', 'number', 'boolean'];

	const isScalarType =
		value === null || value === undefined || scalarTypes.includes(typeof value);

	if (isScalarType) {
		return value;
	}

	const isObjectType =
		typeof value === 'object' &&
		(Object.getPrototypeOf(value).constructor === Object ||
			isNonModelConstructor(Object.getPrototypeOf(value).constructor) ||
			isModelConstructor(Object.getPrototypeOf(value).constructor));

	if (Array.isArray(value) || isObjectType) {
		return JSON.stringify(value);
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
				return acc + '"id" PRIMARY KEY NOT NULL';
			}

			let columnParam = `"${field.name}" ${GraphQLScalarType.getSQLiteType(
				field.type
			)}`;

			if (field.isRequired) {
				columnParam += ' NOT NULL';
			}

			return acc + `, ${columnParam}`;
		}

		if (isModelFieldType(field.type)) {
			// add targetName as well as field name for BELONGS_TO relations
			if (isTargetNameAssociation(field.association)) {
				const columnParam = `"${field.association.targetName}" TEXT, "${field.name}" TEXT`;
				return acc + `, ${columnParam}`;
			}
		}

		// default to TEXT
		let columnParam = `"${field.name}" TEXT`;

		if (field.isRequired) {
			columnParam += ' NOT NULL';
		}

		return acc + `, ${columnParam}`;
	}, '');

	if (userModel) {
		fields +=
			', "_version" INTEGER, "_lastChangedAt" INTEGER, "_deleted" NUMERIC';
	}

	const createTableStatement = `CREATE TABLE IF NOT EXISTS "${model.name}" (${fields});`;
	return createTableStatement;
}

export function modelInsertStatement(
	model: PersistentModel,
	tableName: string
): ParameterizedStatement {
	const keys = keysFromModel(model);
	const [paramaterized, values] = valuesFromModel(model);

	const insertStatement = `INSERT INTO "${tableName}" (${keys}) VALUES (${paramaterized})`;

	return [insertStatement, values];
}

export function modelUpdateStatement(
	model: PersistentModel,
	tableName: string
): ParameterizedStatement {
	const [paramaterized, values] = updateSet(model);

	const updateStatement = `UPDATE "${tableName}" SET ${paramaterized} WHERE id=?`;

	return [updateStatement, [...values, model.id]];
}

export function queryByIdStatement(
	id: string,
	tableName: string
): ParameterizedStatement {
	return [`SELECT * FROM "${tableName}" WHERE "id" = ?`, [id]];
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
}): ParameterizedStatement => {
	const comparisonOperator = comparisonOperatorMap[operator];

	if (comparisonOperator) {
		return [`"${field}" ${comparisonOperator} ?`, [operand]];
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
			`"${field}" ${logicalOperator} ${rightExp.map(_ => '?').join(' AND ')}`,
			rightExp,
		];
	}
};

export function whereClauseFromPredicate<T extends PersistentModel>(
	predicate: PredicatesGroup<T>
): ParameterizedStatement {
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
		({ field, sortDirection }) =>
			`"${field}" ${sortDirectionMap[sortDirection]}`
	);

	// We always sort by _rowid_ last
	orderByParts.push(`_rowid_ ${sortDirectionMap.ASCENDING}`);

	return `ORDER BY ${orderByParts.join(', ')}`;
}

export function limitClauseFromPagination(
	limit: number,
	page: number = 0
): ParameterizedStatement {
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
): ParameterizedStatement {
	let statement = `SELECT * FROM "${tableName}"`;
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
): ParameterizedStatement {
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
): ParameterizedStatement {
	const deleteStatement = `DELETE FROM "${tableName}" WHERE "id"=?`;
	return [deleteStatement, [id]];
}

export function deleteByPredicateStatement<T extends PersistentModel>(
	tableName: string,
	predicate?: PredicatesGroup<T>
): ParameterizedStatement {
	let statement = `DELETE FROM "${tableName}"`;
	const params = [];

	if (predicate && predicate.predicates.length) {
		const [whereClause, whereParams] = whereClauseFromPredicate(predicate);
		statement += ` ${whereClause}`;
		params.push(...whereParams);
	}
	return [statement, params];
}
