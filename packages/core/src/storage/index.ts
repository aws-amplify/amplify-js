// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { InMemoryStorage } from './InMemoryStorage';
import { KeyValueStorage } from './KeyValueStorage';
import { LocalStorage } from './LocalStorage';
import { SessionStorage } from './SessionStorage';

export { CookieStorage } from './CookieStorage';

export const localStorage = new LocalStorage();
export const sessionStorage = new SessionStorage();
export const sharedInMemoryStorage = new KeyValueStorage(new InMemoryStorage());
