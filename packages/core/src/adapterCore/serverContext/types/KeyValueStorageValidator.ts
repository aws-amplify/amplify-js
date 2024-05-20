// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { KeyValueStorageInterface } from '../../../types/storage';

export type KeyValueStorageValidator = Partial<
	Record<keyof KeyValueStorageInterface, ValidatorFunction>
>;

type ValidatorFunction = (...args: any[]) => Promise<boolean>;
