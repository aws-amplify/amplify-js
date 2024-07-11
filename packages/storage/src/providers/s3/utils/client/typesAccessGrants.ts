// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

/*
This file contains manually curated AWS service types that are not yet available via the AWS SDK and the `dts-bundler`
script. Once these APIs have been released to the AWS SDK, this file can be removed in favor of the `dts-bundler`
types.

These types were harvested from Trebuchet.
*/

import { MetadataBearer as __MetadataBearer } from '@aws-sdk/types';

declare const Permission: {
	readonly READ: 'READ';
	readonly READWRITE: 'READWRITE';
	readonly WRITE: 'WRITE';
};
declare const Privilege: {
	readonly Default: 'Default';
	readonly Minimal: 'Minimal';
};
declare const S3PrefixType: {
	readonly Object: 'Object';
};

/**
 * @public
 */
export type Permission = (typeof Permission)[keyof typeof Permission];

/**
 * @public
 */
export type Privilege = (typeof Privilege)[keyof typeof Privilege];

/**
 * @public
 */
export type S3PrefixType = (typeof S3PrefixType)[keyof typeof S3PrefixType];

/**
 * @public
 *
 * The input for {@link ListCallerAccessGrantsCommand}.
 */
export type ListCallerAccessGrantsCommandInput = ListCallerAccessGrantsRequest;

/**
 * @public
 *
 * The output of {@link ListCallerAccessGrantsCommand}.
 */
export interface ListCallerAccessGrantsCommandOutput
	extends ListCallerAccessGrantsResult,
		__MetadataBearer {}

/**
 * @public
 */
export interface ListCallerAccessGrantsRequest {
	AccountId?: string;
	GrantScope?: string;
	NextToken?: string;
	MaxResults?: number;
}

/**
 * @public
 */
export interface ListCallerAccessGrantsEntry {
	Permission?: Permission | string;
	GrantScope?: string;
	ApplicationArn?: string;
}

/**
 * @public
 */
export interface ListCallerAccessGrantsResult {
	NextToken?: string;
	CallerAccessGrantsList?: ListCallerAccessGrantsEntry[];
}

/**
 * @public
 *
 * The input for {@link GetDataAccessCommand}.
 */
export type GetDataAccessCommandInput = GetDataAccessRequest;

/**
 * @public
 *
 * The output of {@link GetDataAccessCommand}.
 */
export interface GetDataAccessCommandOutput
	extends GetDataAccessResult,
		__MetadataBearer {}

/**
 * <p>The Amazon Web Services Security Token Service temporary credential that S3 Access Grants vends to grantees and client applications. </p>
 * @public
 */
export interface Credentials {
	/**
	 * <p>The unique access key ID of the Amazon Web Services STS temporary credential that S3 Access Grants vends to grantees and client applications. </p>
	 * @public
	 */
	AccessKeyId?: string;

	/**
	 * <p>The secret access key of the Amazon Web Services STS temporary credential that S3 Access Grants vends to grantees and client applications. </p>
	 * @public
	 */
	SecretAccessKey?: string;

	/**
	 * <p>The Amazon Web Services STS temporary credential that S3 Access Grants vends to grantees and client applications. </p>
	 * @public
	 */
	SessionToken?: string;

	/**
	 * <p>The expiration date and time of the temporary credential that S3 Access Grants vends to grantees and client applications. </p>
	 * @public
	 */
	Expiration?: Date;
}

/**
 * @public
 */
export interface GetDataAccessRequest {
	/**
	 * <p>The ID of the Amazon Web Services account that is making this request.</p>
	 * @public
	 */
	AccountId?: string;

	/**
	 * <p>The S3 URI path of the data to which you are requesting temporary access credentials. If the requesting account has an access grant for this data, S3 Access Grants vends temporary access credentials in the response.</p>
	 * @public
	 */
	Target: string | undefined;

	/**
	 * <p>The type of permission granted to your S3 data, which can be set to one of the following values:</p>
	 *          <ul>
	 *             <li>
	 *                <p>
	 *                   <code>READ</code> – Grant read-only access to the S3 data.</p>
	 *             </li>
	 *             <li>
	 *                <p>
	 *                   <code>WRITE</code> – Grant write-only access to the S3 data.</p>
	 *             </li>
	 *             <li>
	 *                <p>
	 *                   <code>READWRITE</code> – Grant both read and write access to the S3 data.</p>
	 *             </li>
	 *          </ul>
	 * @public
	 */
	Permission: Permission | undefined;

	/**
	 * <p>The session duration, in seconds, of the temporary access credential that S3 Access Grants vends to the grantee or client application. The default value is 1 hour, but the grantee can specify a range from 900 seconds (15 minutes) up to 43200 seconds (12 hours). If the grantee requests a value higher than this maximum, the operation fails. </p>
	 * @public
	 */
	DurationSeconds?: number;

	/**
	 * <p>The scope of the temporary access credential that S3 Access Grants vends to the grantee or client application. </p>
	 *          <ul>
	 *             <li>
	 *                <p>
	 *                   <code>Default</code> – The scope of the returned temporary access token is the scope of the grant that is closest to the target scope.</p>
	 *             </li>
	 *             <li>
	 *                <p>
	 *                   <code>Minimal</code> – The scope of the returned temporary access token is the same as the requested target scope as long as the requested scope is the same as or a subset of the grant scope. </p>
	 *             </li>
	 *          </ul>
	 * @public
	 */
	Privilege?: Privilege;

	/**
	 * <p>The type of <code>Target</code>. The only possible value is <code>Object</code>. Pass this value if the target data that you would like to access is a path to an object. Do not pass this value if the target data is a bucket or a bucket and a prefix. </p>
	 * @public
	 */
	TargetType?: S3PrefixType;
}

/**
 * @public
 */
export interface GetDataAccessResult {
	/**
	 * <p>The temporary credential token that S3 Access Grants vends.</p>
	 * @public
	 */
	Credentials?: Credentials;

	/**
	 * <p>The S3 URI path of the data to which you are being granted temporary access credentials. </p>
	 * @public
	 */
	MatchedGrantTarget?: string;
}
