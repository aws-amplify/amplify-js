import { CommonSQLiteAdapter } from '../commons/CommonSQLiteAdapter';
import ExpoSQLiteDatabase from './ExpoSQLiteDatabase';

const ExpoSQLiteAdapter: CommonSQLiteAdapter = new CommonSQLiteAdapter(
	new ExpoSQLiteDatabase()
);

export default ExpoSQLiteAdapter;
