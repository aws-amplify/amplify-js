// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

export {
	generateServerClientUsingReqRes,
	generateServerClientUsingCookies,
} from './generateServerClient';

export {
	V6ClientSSRCookies as ClientUsingSSRCookies,
	V6ClientSSRRequest as ClientUsingSSRReq,
} from '@aws-amplify/api-graphql';
