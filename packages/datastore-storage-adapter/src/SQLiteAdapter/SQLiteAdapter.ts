import { CommonSQLiteAdapter } from '../common/CommonSQLiteAdapter';
import SQLiteDatabase from './SQLiteDatabase';

export const SQLiteAdapter: CommonSQLiteAdapter = new CommonSQLiteAdapter(
	new SQLiteDatabase()
);
