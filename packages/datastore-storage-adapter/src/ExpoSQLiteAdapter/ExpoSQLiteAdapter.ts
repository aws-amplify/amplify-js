import { CommonSQLiteAdapter } from '../common/CommonSQLiteAdapter';
import ExpoSQLiteDatabase from './ExpoSQLiteDatabase';

const ExpoSQLiteAdapter: CommonSQLiteAdapter = new CommonSQLiteAdapter(
	new ExpoSQLiteDatabase()
);

export default ExpoSQLiteAdapter;
