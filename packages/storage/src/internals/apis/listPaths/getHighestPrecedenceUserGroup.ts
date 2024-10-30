// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

export type UserGroupConfig = Record<string, Record<string, number>>[];

/**
 *  Given the Cognito user groups associated to current user session
 *  and all the user group configurations defined by backend.
 *  This function returns the user group with the highest precedence.
 *  Reference: https://docs.aws.amazon.com/cognito/latest/developerguide/cognito-user-pools-user-groups.html#assigning-precedence-values-to-groups
 *
 * @param {UserGroupConfig} userGroupsFromConfig - User groups with their precedence values based on Amplify outputs.
 * @param {string[]} currentUserGroups - The list of current user's groups.
 * @returns {string | undefined} - The user group with the highest precedence (0), or undefined if no matching group is found.
 */
export const getHighestPrecedenceUserGroup = (
	userGroupsFromConfig?: UserGroupConfig,
	currentUserGroups?: string[],
): string | undefined => {
	if (userGroupsFromConfig && currentUserGroups) {
		const precedenceMap = userGroupsFromConfig.reduce(
			(acc, group) => {
				Object.entries(group).forEach(([key, value]) => {
					acc[key] = value.precedence;
				});

				return acc;
			},
			{} as Record<string, number>,
		);

		const sortedUserGroup = currentUserGroups
			.filter(group =>
				Object.prototype.hasOwnProperty.call(precedenceMap, group),
			)
			.sort((a, b) => precedenceMap[a] - precedenceMap[b]);

		return sortedUserGroup[0];
	}

	return undefined;
};
