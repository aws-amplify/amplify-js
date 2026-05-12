const isMergeable = (object: unknown): object is Record<string, unknown> => {
	return (
		typeof object === 'object' && object !== null && !Array.isArray(object)
	);
};

export const deepMerge = (target: unknown, source: unknown): unknown => {
	if (!isMergeable(target) || !isMergeable(source)) {
		return source;
	}
	const result: Record<string, unknown> = { ...target };
	for (const key of Object.keys(source)) {
		result[key] = deepMerge(result[key], source[key]);
	}

	return result;
};
