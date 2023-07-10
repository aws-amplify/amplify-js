// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
import { CommonSQLiteAdapter } from '../common/CommonSQLiteAdapter';
import ExpoSQLiteDatabase from './ExpoSQLiteDatabase';

const ExpoSQLiteAdapter: CommonSQLiteAdapter = new CommonSQLiteAdapter(
	new ExpoSQLiteDatabase()
);

export default ExpoSQLiteAdapter;
