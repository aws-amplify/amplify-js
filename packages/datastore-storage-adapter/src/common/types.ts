import { PersistentModel } from '@aws-amplify/datastore';

export interface CommonSQLiteDatabase {
	init(): Promise<void>;
	createSchema(statements: string[]): Promise<void>;
	clear(): Promise<void>;
	get<T extends PersistentModel>(
		statement: string,
		params: (string | number)[]
	): Promise<T>;
	getAll<T extends PersistentModel>(
		statement: string,
		params: (string | number)[]
	): Promise<T[]>;
	save(statement: string, params: (string | number)[]): Promise<void>;
	batchQuery<T = any>(
		queryStatements: Set<ParameterizedStatement>
	): Promise<T[]>;
	batchSave(
		saveStatements: Set<ParameterizedStatement>,
		deleteStatements?: Set<ParameterizedStatement>
	): Promise<void>;
	selectAndDelete<T = any>(
		queryParameterizedStatement: ParameterizedStatement,
		deleteParameterizedStatement: ParameterizedStatement
	): Promise<T[]>;
}

export type ParameterizedStatement = [string, any[]];
