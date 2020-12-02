import { AbstractPredictionsProvider } from './AbstractPredictionsProvider';
import {
	IdentifyLabelsInput,
	IdentifyCustomLabelsInput,
	IdentifyEntitiesInput,
	isIdentifyLabelsInput,
	isIdentifyCustomLabelsInput,
	isIdentifyEntitiesInput,
	IdentifyTextInput,
	isIdentifyTextInput,
	IdentifyTextOutput,
	IdentifyLabelsOutput,
	IdentifyCustomLabelsOutput,
	IdentifyEntitiesOutput,
} from '../Predictions';
import { Logger } from '@aws-amplify/core';
const logger = new Logger('AbstractIdentifyPredictionsProvider');

export abstract class AbstractIdentifyPredictionsProvider extends AbstractPredictionsProvider {
	getCategory(): string {
		return 'Identify';
	}

	identify(
		input:
			| IdentifyTextInput
			| IdentifyLabelsInput
			| IdentifyCustomLabelsInput
			| IdentifyEntitiesInput
	): Promise<
		| IdentifyTextOutput
		| IdentifyLabelsOutput
		| IdentifyCustomLabelsOutput
		| IdentifyEntitiesOutput
	> {
		if (isIdentifyTextInput(input)) {
			logger.debug('identifyText');
			return this.identifyText(input);
		} else if (isIdentifyLabelsInput(input)) {
			logger.debug('identifyLabels');
			return this.identifyLabels(input);
		} else if (isIdentifyCustomLabelsInput(input)) {
			logger.debug('identifyCustomLabels');
			return this.identifyCustomLabels(input);
		} else if (isIdentifyEntitiesInput(input)) {
			logger.debug('identifyEntities');
			return this.identifyEntities(input);
		}
	}

	protected identifyText(
		input: IdentifyTextInput
	): Promise<IdentifyTextOutput> {
		throw new Error('identifyText is not implemented by this provider.');
	}

	protected identifyLabels(
		input: IdentifyLabelsInput
	): Promise<IdentifyLabelsOutput> {
		throw new Error('identifyLabels is not implemented by this provider');
	}

	protected identifyCustomLabels(
		input: IdentifyCustomLabelsInput
	): Promise<IdentifyCustomLabelsOutput> {
		throw new Error('identifyCustomLabels is not implemented by this provider');
	}

	protected identifyEntities(
		input: IdentifyEntitiesInput
	): Promise<IdentifyEntitiesOutput> {
		throw new Error('identifyEntities is not implemented by this provider');
	}
}
