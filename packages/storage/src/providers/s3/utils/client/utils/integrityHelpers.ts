export const isNil = <T>(value?: T) => {
	return value === undefined || value === null;
};

export const bothNilOrEqual = (original?: string, output?: string): boolean => {
	return (isNil(original) && isNil(output)) || original === output;
};
