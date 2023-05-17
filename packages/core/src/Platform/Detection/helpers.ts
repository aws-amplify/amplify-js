export const globalExists = () => {
	return typeof global !== 'undefined';
};

export const globalThisExists = () => {
	return typeof globalThis !== 'undefined';
};

export const windowExists = () => {
	return typeof window !== 'undefined';
};

export const documentExists = () => {
	return typeof document !== 'undefined';
};

export const processExists = () => {
	return typeof process !== 'undefined';
};

export const keyPrefixMatch = (object, prefix) => {
	return !!Object.keys(object).find(key => key.startsWith(prefix));
};
