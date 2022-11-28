// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

export type AuthFlowType = 
	| 'USER_SRP_AUTH'
	| 'CUSTOM_WITH_SRP'
	| 'CUSTOM_WITHOUT_SRP'
	| 'USER_PASSWORD_AUTH';
