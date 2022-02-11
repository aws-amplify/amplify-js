import { GraphQLScalarType } from '@aws-amplify/datastore';
import { PersistentModel } from '@aws-amplify/datastore';
import { ParameterizedStatement } from './SQLiteUtils';

export function getSQLiteType(
	scalar: keyof Omit<
		typeof GraphQLScalarType,
		'getJSType' | 'getValidationFunction' | 'getSQLiteType'
	>
): 'TEXT' | 'INTEGER' | 'REAL' | 'BLOB' {
	switch (scalar) {
		case 'Boolean':
		case 'Int':
		case 'AWSTimestamp':
			return 'INTEGER';
		case 'ID':
		case 'String':
		case 'AWSDate':
		case 'AWSTime':
		case 'AWSDateTime':
		case 'AWSEmail':
		case 'AWSJSON':
		case 'AWSURL':
		case 'AWSPhone':
		case 'AWSIPAddress':
			return 'TEXT';
		case 'Float':
			return 'REAL';
		default:
			const _: never = scalar as never;
			throw new Error(`unknown type ${scalar as string}`);
	}
}

export interface CommonSQLiteDatabase {
	init(): Promise<void>;
	createSchema(statements: string[]): Promise<void>;
	clear(): Promise<void>;
	get<T extends PersistentModel>(statement: string, params: any[]): Promise<T>;
	getAll<T extends PersistentModel>(
		statement: string,
		params: any[]
	): Promise<T[]>;
	save(statement: string, params: any[]): Promise<void>;
	batchQuery(queryStatements: Set<ParameterizedStatement>): Promise<any[]>;
	batchSave(
		saveStatements: Set<ParameterizedStatement>,
		deleteStatements?: Set<ParameterizedStatement>
	): Promise<void>;
	selectAndDelete(
		query: ParameterizedStatement,
		_delete: ParameterizedStatement
	): Promise<any[]>;
}
