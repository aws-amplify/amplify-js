import { StrictUnion } from '@aws-amplify/core/internals/utils';
import {
	StorageOperationInputKey,
	StorageOperationInputPath,
} from '../../../types/inputs';
import { STORAGE_INPUT_TYPES } from './constants';

type Input = StrictUnion<StorageOperationInputKey | StorageOperationInputPath>;

const isInputWithKey = (input: Input): input is StorageOperationInputKey => {
	return input.key !== undefined;
};

const isInputWithPath = (
	input: Input,
): input is StorageOperationInputPath => {
	return input.path !== undefined;
};

export const validateStorageOperationInput = (input: Input, identityId: string = '', userSub: string= '') => {
	if (isInputWithPath(input)) {
		const { path } = input;
		return { inputType: STORAGE_INPUT_TYPES.PATH, objectKey: typeof path === 'string' ? path : path({identityId, userSub})  };
	} else if (isInputWithKey(input)) {
		return { inputType: STORAGE_INPUT_TYPES.KEY, objectKey: input.key };
	} else {
		throw new Error('invalid input');
	}
}
