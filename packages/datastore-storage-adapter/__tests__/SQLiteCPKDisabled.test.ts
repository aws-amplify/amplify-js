/*
 * SQLiteCPKDisabled.test.ts and SQLiteCPKEnabled.test.ts exist in two separate
 * files in order to test DataStore with two separate schemas.
 * jest.isolateModules was not correctly isolating the instances of DataStore
 * resulting in the DataStore singleton being shared between the tests.
 * The schema can only be initialized once in DataStore, making it impossible to
 * test the effect of different schemas.
 *
 * Both files should be removed when CPK support is added.
 */
import { of } from 'rxjs';
import SQLiteAdapter from '../src/SQLiteAdapter/SQLiteAdapter';
import { testSchema, InnerSQLiteDatabase } from './helpers';

jest.mock('@aws-amplify/datastore/src/sync/datastoreConnectivity', () => {
	return {
		status: () => of(false) as any,
		unsubscribe: () => {},
		socketDisconnected: () => {},
	};
});

jest.mock('react-native-sqlite-storage', () => {
	return {
		async openDatabase(name, version, displayname, size) {
			return new InnerSQLiteDatabase();
		},
		async deleteDatabase(name) {},
		enablePromise(enabled) {},
		DEBUG(debug) {},
	};
});

describe('SQLite CPK Disabled', () => {
	test('does not log error when schema is generated with targetName (cpk disabled)', async () => {
		console.error = jest.fn();
		const { initSchema, DataStore } = require('@aws-amplify/datastore');
		DataStore.configure({
			storageAdapter: SQLiteAdapter,
		});
		initSchema(testSchema());
		await DataStore.start();
		expect(console.error as any).not.toHaveBeenCalled();
	});
});
