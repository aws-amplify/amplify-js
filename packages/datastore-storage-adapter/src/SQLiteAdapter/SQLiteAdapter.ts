// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
import { CommonSQLiteAdapter } from '../common/CommonSQLiteAdapter';
import SQLiteDatabase from './SQLiteDatabase';

/**
 * @deprecated Amplify JavaScript v5 is in maintenance mode. Upgrade to v6.
 * See the migration guide:
 * https://docs.amplify.aws/gen1/javascript/build-a-backend/troubleshooting/migrate-from-javascript-v5-to-v6/
 */
const SQLiteAdapter: CommonSQLiteAdapter = new CommonSQLiteAdapter(
	new SQLiteDatabase()
);

export default SQLiteAdapter;
