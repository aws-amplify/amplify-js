import { PersistentModel } from '@aws-amplify/datastore';
import { ParameterizedStatement } from '../commons/SQLiteUtils';

export interface Database {
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
