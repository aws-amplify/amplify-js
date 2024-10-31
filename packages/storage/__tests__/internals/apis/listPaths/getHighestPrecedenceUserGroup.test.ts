// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import {
	UserGroupConfig,
	getHighestPrecedenceUserGroup,
} from '../../../../src/internals/apis/listPaths/getHighestPrecedenceUserGroup';

const userGroupsFromConfig: UserGroupConfig = [
	{
		editor: {
			precedence: 0,
		},
	},
	{
		admin: {
			precedence: 1,
		},
	},
	{
		auditor: {
			precedence: 2,
		},
	},
];
const currentUserGroups = ['guest', 'user', 'admin'];

describe('getHighestPrecedenceUserGroup', () => {
	it('should return the user group with the highest precedence', () => {
		const result = getHighestPrecedenceUserGroup(
			userGroupsFromConfig,
			currentUserGroups,
		);
		expect(result).toBe('admin');
	});

	it('should return undefined if userGroupsFromConfig is undefined', () => {
		const result = getHighestPrecedenceUserGroup(undefined, currentUserGroups);
		expect(result).toBeUndefined();
	});

	it('should return undefined if currentUserGroups is undefined', () => {
		const result = getHighestPrecedenceUserGroup(
			userGroupsFromConfig,
			undefined,
		);
		expect(result).toBeUndefined();
	});

	it('should handle currentUserGroups containing groups not present in userGroupsFromConfig', () => {
		const result = getHighestPrecedenceUserGroup(userGroupsFromConfig, [
			'unknown',
			'user',
		]);
		expect(result).toBe(undefined);
	});
});
