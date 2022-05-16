import { CommonSQLiteAdapter } from '../common/CommonSQLiteAdapter';
import SQLiteDatabase from './SQLiteDatabase';

const SQLiteAdapter: CommonSQLiteAdapter = new CommonSQLiteAdapter(
	new SQLiteDatabase()
);

export default SQLiteAdapter;
