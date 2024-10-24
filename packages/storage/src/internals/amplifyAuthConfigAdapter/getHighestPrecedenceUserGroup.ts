// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

export type UserGroupConfig = Record<string, Record<string, number>>[];

/**
 * Given a user group configuration and a list of current user groups,
 * this function returns the user group with the highest precedence.
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
			.sort(
				(a, b) =>
					(precedenceMap[a] ?? Infinity) - (precedenceMap[b] ?? Infinity),
			);

		return sortedUserGroup[0];
	}

	return undefined;
};
