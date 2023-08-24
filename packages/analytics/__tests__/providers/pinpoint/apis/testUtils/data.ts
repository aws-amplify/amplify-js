export const appId = 'app-id';
export const region = 'region';
export const accessKeyId = 'access-key-id';
export const secretAccessKey = 'secret-access-key';
export const identityId = 'identity-id';

export const event = {
	name: 'event',
	attributes: {
		property: 'property-value',
	},
	metrics: {
		metric: 5,
	},
};

export const credentials = {
	accessKeyId,
	secretAccessKey,
};

export const config = {
	appId,
	region,
};

export const authSession = {
	credentials,
	identityId,
};
