import { StorageAccessLevel } from '@aws-amplify/core';

/**
 * bucket is appended at start if it's a sourceKey
 * guest: public/${key}`
 * private: private/${targetIdentityId}/${key}`
 * protected: protected/${targetIdentityId}/${key}`
 */
export const buildClientRequestKey = (
	key: string,
	KeyType: 'source' | 'destination',
	accessLevel: StorageAccessLevel
) => {
	const targetIdentityId = 'targetIdentityId';
	const bucket = 'bucket';
	const finalAccessLevel = accessLevel == 'guest' ? 'public' : accessLevel;
	let finalKey = KeyType == 'source' ? `${bucket}/` : '';
	finalKey += `${finalAccessLevel}/`;
	finalKey += finalAccessLevel != 'public' ? `${targetIdentityId}/` : '';
	finalKey += `${key}`;
	return finalKey;
};
