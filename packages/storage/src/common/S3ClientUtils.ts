import { Credentials, ICredentials } from '@aws-amplify/core';
import { StorageAccessLevel, CustomPrefix } from '../types';
import { InitializeMiddleware, InitializeHandlerOptions } from '@aws-sdk/types';

export const getPrefix = (config: {
	level?: StorageAccessLevel;
	customPrefix?: CustomPrefix;
	identityId?: string;
	credentials: ICredentials;
}): string => {
	const { credentials, level, customPrefix, identityId } = config;

	const resolvedCustomPrefix = customPrefix || {};
	const resolvedIdentityId = identityId || credentials.identityId;
	const privatePath =
		(resolvedCustomPrefix.private !== undefined
			? resolvedCustomPrefix.private
			: 'private/') +
		resolvedIdentityId +
		'/';
	const protectedPath =
		(resolvedCustomPrefix.protected !== undefined
			? resolvedCustomPrefix.protected
			: 'protected/') +
		resolvedIdentityId +
		'/';
	const publicPath =
		resolvedCustomPrefix.public !== undefined
			? resolvedCustomPrefix.public
			: 'public/';

	switch (level) {
		case 'private':
			return privatePath;
		case 'protected':
			return protectedPath;
		default:
			return publicPath;
	}
};

export const createPrefixMiddleware = (
	opt: Record<string, any>,
	key: string
): InitializeMiddleware<any, any> => (next, _context) => async args => {
	if (Object.prototype.hasOwnProperty.call(args.input, 'Key')) {
		const credentials = await Credentials.get();
		const cred = Credentials.shear(credentials);
		const prefix = getPrefix({ ...opt, credentials: cred });
		const clonedInput = Object.assign({}, args.input);
		if (Object.prototype.hasOwnProperty.call(args.input, 'Key')) {
			clonedInput.Key = prefix + key;
			args.input = clonedInput;
		} else if (Object.prototype.hasOwnProperty.call(args.input, 'Prefix')) {
			clonedInput.Prefix = prefix + key;
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
