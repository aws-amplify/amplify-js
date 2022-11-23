// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

export type AuthUserAttributeKey = AuthStandardAttributeKey | string;

export type AuthStandardAttributeKey = 
| 'address'
| 'birthday'
| 'email'
| 'family_name'
| 'gender'
| 'given_name'
| 'locale'
| 'middle_name'
| 'name'
| 'nickname'
| 'phone_number'
| 'picture'
| 'preferred_username'
| 'profile'
| 'update_at'
| 'website'
| 'zoneinfo';
