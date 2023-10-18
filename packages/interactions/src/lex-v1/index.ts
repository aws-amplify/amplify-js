// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { send, onComplete } from './apis';
import { IInteractions } from '../types/Interactions';

/**
 * @deprecated recommend to migrate to AWS Lex V2 instead
 * */
export const Interactions: IInteractions = {
	send,
	onComplete,
};
