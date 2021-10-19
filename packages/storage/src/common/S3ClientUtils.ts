import { Credentials, ICredentials } from '@aws-amplify/core';
import { StorageAccessLevel, CustomPrefix } from '../types';
import { InitializeMiddleware, InitializeHandlerOptions } from '@aws-sdk/types';

export const getPrefix = (config: {
	level?: StorageAccessLevel;
	customPrefix?: CustomPrefix;
	identityId?: string;
	credentials: ICredentials;
}): string => {
	const { credentials, level } = config;

	const customPrefix = config.customPrefix || {};
	const identityId = config.identityId || credentials.identityId;
	const privatePath = (customPrefix.private !== undefined ? customPrefix.private : 'private/') + identityId + '/';
	const protectedPath =
		(customPrefix.protected !== undefined ? customPrefix.protected : 'protected/') + identityId + '/';
	const publicPath = customPrefix.public !== undefined ? customPrefix.public : 'public/';

	switch (level) {
		case 'private':
			return privatePath;
		case 'protected':
			return protectedPath;
		default:
			return publicPath;
	}
};

export const createPrefixMiddleware = (opt: Record<string, any>, key: string): InitializeMiddleware<any, any> => (
	next,
	_context
) => async args => {
	if (Object.prototype.hasOwnProperty.call(args.input, 'Key')) {
		const credentials = await Credentials.get();
		const cred = Credentials.shear(credentials);
		const prefix = getPrefix({ ...opt, credentials: cred });
		if (Object.prototype.hasOwnProperty.call(args.input, 'Key')) {
			const clonedInput = Object.assign({}, args.input) as { Key: string };
			clonedInput.Key = prefix + key;
			args.input = clonedInput;
		}
	}
	const result = next(args);
	return result;
};

export const prefixMiddlewareOptions: InitializeHandlerOptions = {
	step: 'initialize',
	name: 'addPrefixMiddleware',
};
