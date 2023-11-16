// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

export {
	generateServerClientUsingReqRes,
	generateServerClientUsingCookies,
} from './generateServerClient';

import {
	V6ClientSSRCookies,
	V6ClientSSRRequest,
} from '@aws-amplify/api-graphql';

// explicitly defaulting to `never` here resolves
// TS2589: Type instantiation is excessively deep and possibly infinite.
// When this type is used without a generic type arg, i.e. `let client: Client`
type ClientUsingSSRCookies<T extends Record<any, any> = never> =
	V6ClientSSRCookies<T>;

type ClientUsingSSRReq<T extends Record<any, any> = never> =
	V6ClientSSRRequest<T>;

export { ClientUsingSSRCookies, ClientUsingSSRReq };
