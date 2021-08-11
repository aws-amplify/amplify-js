const isTypedArray = (x: unknown): x is ArrayBuffer => {
	const TypedArray = Object.getPrototypeOf(Uint8Array);
	return x instanceof TypedArray;
};

export const readFileToArrayBuffer = async (
	file: Blob | ArrayBuffer
): Promise<ArrayBuffer> => {
	return new Promise<ArrayBuffer>((res, rej) => {
		if (isTypedArray(file)) {
			res(file);
		} else {
			const fr = new FileReader();
			fr.onloadend = () => {
				const result = fr.result;
				if (isTypedArray(result)) {
					res(result);
				} else {
					const content = atob(
						result.substr('data:application/octet-stream;base64,'.length)
					);
					const buffer = new ArrayBuffer(content.length);
					const view = new Uint8Array(buffer);
					view.set(Array.from(content).map(c => c.charCodeAt(0)));
					res(buffer);
				}
			};
			fr.onerror = () => {
				rej(fr.error);
			};
			// Uses readAsDataURL because readAsArrayBuffer does not work on React Native
			fr.readAsDataURL(file);
		}
	});
};
