import ExpoSQLiteDatabase from '../src/ExpoSQLiteAdapter/ExpoSQLiteDatabase';
import { openDatabase } from 'expo-sqlite';
import { ParameterizedStatement } from '../src/common/types';
import { HelperStack } from 'typedoc/dist/lib/output/utils/resources/helpers';

// mock out the underlying implementation and only keep openDatabase().
jest.mock('expo-sqlite', () => {
	return {
		__esModule: true,
		openDatabase: jest.fn(() => mockDatabase),
	};
});

// mock out the underlying implementation
jest.mock('expo-file-system', () => 'File System');

const mockDatabase = {
	readTransaction: jest.fn(),
	transaction: jest.fn(),
};

const mockTransaction = {
	executeSql: jest.fn(),
};

const mockResultSet = jest.fn();

const MOCK_SQL_ERROR = {
	code: 400,
	message: 'Error performing the transaction',
};

describe('ExpoSQLiteAdapter', () => {
	const ExpoSQLiteAdapterInstance = new ExpoSQLiteDatabase();
	ExpoSQLiteAdapterInstance.init();

	beforeEach(() => {
		mockDatabase.readTransaction.mockImplementation(func => {
			func(mockTransaction);
		});
		mockDatabase.transaction.mockImplementation(func => {
			func(mockTransaction);
		});

		// mockImplementation of executeSql first two calls should call successCallback, followed by errorCallback
		// and remaining all execution wil call successCallback
		// intended to check behavior if promises are resolved and rejected correctly
		mockTransaction.executeSql
			.mockImplementationOnce(
				(statement, params, successCallback, errorCallback) => {
					successCallback(mockTransaction, mockResultSet());
				}
			)
			.mockImplementationOnce(
				(statement, params, successCallback, errorCallback) => {
					successCallback(mockTransaction, mockResultSet());
				}
			)
			.mockImplementationOnce(
				(statement, params, successCallback, errorCallback) => {
					errorCallback(mockTransaction, MOCK_SQL_ERROR);
				}
			)
			// set default mock function after three calls
			.mockImplementation(
				(statement, params, successCallback, errorCallback) => {
					successCallback(mockTransaction, mockResultSet());
				}
			);

		mockResultSet
			.mockImplementationOnce(() => {
				return {
					rows: {
						_array: MOCK_RESULT_ARRAY_1,
					},
				};
			})
			.mockImplementationOnce(() => {
				return {
					rows: {
						_array: [],
					},
				};
			})
			// set default mock function after two calls
			.mockImplementation(() => {
				return {
					rows: {
						_array: MOCK_RESULT_ARRAY_2,
					},
				};
			});
	});

	afterEach(() => {
		jest.clearAllMocks();
	});

	describe('getAll() Tests', () => {
		beforeAll(() => {
			jest.resetAllMocks();
		});
		it('should resolve promise and return whole result array', () => {
			expect.assertions(1);
			return ExpoSQLiteAdapterInstance.getAll(
				DEFAULT_STATEMENT,
				DEFAULT_STATEMENT_PARAMS
			).then(result => {
				expect(result).toEqual(MOCK_RESULT_ARRAY_1);
			});
		});
		it('should resolve promise and return empty array when no result is found', () => {
			expect.assertions(1);
			return ExpoSQLiteAdapterInstance.getAll(
				DEFAULT_STATEMENT,
				DEFAULT_STATEMENT_PARAMS
			).then(result => {
				expect(result).toEqual([]);
			});
		});

		it('should reject the promise and return SQLError when executeSql encouters an error', () => {
			expect.assertions(1);
			return ExpoSQLiteAdapterInstance.getAll(
				DEFAULT_STATEMENT,
				DEFAULT_STATEMENT_PARAMS
			).catch(result => expect(result).toMatchObject(MOCK_SQL_ERROR));
		});
	});
	describe('get() Tests', () => {
		beforeAll(() => {
			jest.resetAllMocks();
		});

		it('should resolve promise and return first result', () => {
			expect.assertions(1);
			return ExpoSQLiteAdapterInstance.get(
				DEFAULT_STATEMENT,
				DEFAULT_STATEMENT_PARAMS
			).then(result => {
				expect(result).toBe(MOCK_RESULT_ARRAY_1[0]);
			});
		});

		it('should resolve promise and return undefined when no results are found', () => {
			expect.assertions(1);
			return ExpoSQLiteAdapterInstance.get(
				DEFAULT_STATEMENT,
				DEFAULT_STATEMENT_PARAMS
			).then(result => {
				expect(result).toBe(undefined);
			});
		});

		it('should reject the promise and return SQLError when executeSql encouters an error', () => {
			expect.assertions(1);
			return ExpoSQLiteAdapterInstance.get(
				DEFAULT_STATEMENT,
				DEFAULT_STATEMENT_PARAMS
			).catch(result => {
				expect(result).toMatchObject(MOCK_SQL_ERROR);
			});
		});
	});

	describe('save() Tests', () => {
		beforeAll(() => {
			jest.resetAllMocks();
		});

		it('should return promise that resolves to null', () => {
			expect.assertions(1);
			return ExpoSQLiteAdapterInstance.save(
				DEFAULT_STATEMENT,
				DEFAULT_STATEMENT_PARAMS
			).then(result => {
				expect(result).toBe(null);
			});
		});

		it('should return promise that resolves to null', () => {
			expect.assertions(1);
			return ExpoSQLiteAdapterInstance.save(
				DEFAULT_STATEMENT,
				DEFAULT_STATEMENT_PARAMS
			).then(result => {
				expect(result).toBe(null);
			});
		});

		it('should reject the promise and return SQLError when executeSql encouters an error', () => {
			expect.assertions(1);
			return ExpoSQLiteAdapterInstance.save(
				DEFAULT_STATEMENT,
				DEFAULT_STATEMENT_PARAMS
			).catch(result => {
				expect(result).toMatchObject(MOCK_SQL_ERROR);
			});
		});
	});

	describe('batchQuery() Tests', () => {
		beforeAll(() => {
			jest.resetAllMocks();
		});

		const queryParameterizedStatements: Set<ParameterizedStatement> = new Set();
		queryParameterizedStatements.add([
			DEFAULT_STATEMENT,
			DEFAULT_STATEMENT_PARAMS,
		]);
		queryParameterizedStatements.add([
			DEFAULT_STATEMENT,
			DEFAULT_STATEMENT_PARAMS,
		]);
		it('should return promise that resolves to first result element of each statement', () => {
			expect.assertions(1);
			return ExpoSQLiteAdapterInstance.batchQuery(
				queryParameterizedStatements
			).then(result => {
				expect(result).toEqual([MOCK_RESULT_ARRAY_1[0], undefined]);
			});
		});

		it('should return promise that resolves to null', () => {
			expect.assertions(1);
			return ExpoSQLiteAdapterInstance.batchQuery(
				queryParameterizedStatements
			).catch(result => {
				expect(result).toMatchObject(MOCK_SQL_ERROR);
			});
		});
	});

	describe('batchSave() Tests', () => {
		beforeAll(() => {
			jest.resetAllMocks();
		});

		const saveParameterizedStatements: Set<ParameterizedStatement> = new Set();
		saveParameterizedStatements.add([
			DEFAULT_STATEMENT,
			DEFAULT_STATEMENT_PARAMS,
		]);
		const deleteParameterizedStatements: Set<ParameterizedStatement> =
			new Set();
		deleteParameterizedStatements.add([
			DEFAULT_STATEMENT,
			DEFAULT_STATEMENT_PARAMS,
		]);
		it('should return promise that resolves to null executing all saveParameterizedStatements', () => {
			expect.assertions(1);
			return ExpoSQLiteAdapterInstance.batchSave(
				saveParameterizedStatements,
				deleteParameterizedStatements
			).then(result => {
				expect(result).toBe(null);
			});
		});

		it('should reject the promise and return SQLError when executeSql encouters an error', async () => {
			expect.assertions(1);
			return ExpoSQLiteAdapterInstance.batchSave(
				saveParameterizedStatements
			).catch(result => {
				expect(result).toBe(MOCK_SQL_ERROR);
			});
			// expect(batchSave).toThrow();
		});

		it('should return promise that resolves to null after executing all statements', () => {
			expect.assertions(1);
			return ExpoSQLiteAdapterInstance.batchSave(
				saveParameterizedStatements,
				deleteParameterizedStatements
			).then(result => {
				expect(result).toBe(null);
			});
		});
	});
});

const DEFAULT_STATEMENT = 'SELECT * FROM ABCD';
const DEFAULT_STATEMENT_PARAMS = [];
const MOCK_RESULT_ARRAY_1 = [1, 2, 3, 4];
const MOCK_RESULT_ARRAY_2 = ['this', 'is', 'a', 'string'];
