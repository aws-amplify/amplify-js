import { ServiceError } from '@aws-amplify/core/internals/utils';

import { StorageError } from '../../../../errors/StorageError';
import { ResolvedS3Config } from '../../types/options';
import { HeadObjectInput, headObject } from '../../utils/client/s3data';

export const validateObjectNotExists = async (
	s3Config: ResolvedS3Config,
	input: HeadObjectInput,
): Promise<void> => {
	try {
		await headObject(s3Config, input);

		throw new StorageError({
			name: 'PreconditionFailed',
			message: 'At least one of the pre-conditions you specified did not hold',
		});
	} catch (error) {
		const serviceError = error as ServiceError;
		if (serviceError.name !== 'NotFound') {
			throw error;
		}
	}
};
