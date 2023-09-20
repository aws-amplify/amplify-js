// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { DefaultStorage } from './DefaultStorage';
import { InMemoryStorage } from './InMemoryStorage';
import { KeyValueStorage } from './KeyValueStorage';
import { SessionStorage } from './SessionStorage';

export { CookieStorage } from './CookieStorage';

export const defaultStorage = new DefaultStorage();
export const sessionStorage = new SessionStorage();
export const sharedInMemoryStorage = new KeyValueStorage(new InMemoryStorage());
