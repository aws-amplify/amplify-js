// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
import { AbstractPredictionsProvider } from './AbstractPredictionsProvider';
import {
	InterpretTextInput,
	InterpretTextOutput,
	isInterpretTextInput,
} from '../Predictions';

export abstract class AbstractInterpretPredictionsProvider extends AbstractPredictionsProvider {
	getCategory(): string {
		return 'Interpret';
	}

	interpret(input: InterpretTextInput): Promise<InterpretTextOutput> {
		if (isInterpretTextInput(input)) {
			return this.interpretText(input);
		}
	}

	protected interpretText(
		input: InterpretTextInput
	): Promise<InterpretTextOutput> {
		throw new Error('interpretText is not implement by this provider');
	}
}
