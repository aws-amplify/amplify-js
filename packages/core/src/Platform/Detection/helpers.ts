export const globalExists = () => {
	return typeof global !== 'undefined';
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

export const keyPrefixMatch = (object, key) => {
	return !!Object.keys(object).find(key => key.startsWith(key));
};

export const packageExists = (packageToTest: string) => {
	try {
		typeof require == 'function' && require(packageToTest);
		return true;
	} catch {
		return false;
	}
};
