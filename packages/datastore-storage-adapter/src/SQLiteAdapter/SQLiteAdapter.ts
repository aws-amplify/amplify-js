// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
import { CommonSQLiteAdapter } from '../common/CommonSQLiteAdapter';
import SQLiteDatabase from './SQLiteDatabase';

const SQLiteAdapter: CommonSQLiteAdapter = new CommonSQLiteAdapter(
	new SQLiteDatabase()
);

export default SQLiteAdapter;
