import { CommonSQLiteAdapter } from '../common/CommonSQLiteAdapter';
import ExpoSQLiteDatabase from './ExpoSQLiteDatabase';

export const ExpoSQLiteAdapter: CommonSQLiteAdapter = new CommonSQLiteAdapter(
	new ExpoSQLiteDatabase()
);