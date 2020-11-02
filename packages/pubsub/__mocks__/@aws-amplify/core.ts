export * from '@aws-amplify/core';

export const browserOrNode = () => {
	return {
		isBrowser: true,
		isNode: false,
	};
};
