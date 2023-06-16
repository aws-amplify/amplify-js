import { Md5 } from '@aws-sdk/md5-js';
import { toBase64, fromBase64 } from '@aws-sdk/util-base64-browser';

export const calculateContentMd5 = async (
	content: Blob | string
): Promise<string> => {
	const hasher = new Md5();
	if (typeof content === 'string') {
		hasher.update(content);
	} else {
		const buffer = await readFile(content);
		hasher.update(fromBase64(buffer));
	}
	const digest = await hasher.digest();
	return toBase64(digest);
};
const readFile = (blob: Blob): Promise<string> => {
	return new Promise((resolve, reject) => {
		const reader = new FileReader();
		reader.onloadend = () => {
			if (reader.readyState !== 2) {
				return reject(new Error('Reader aborted too early'));
			}
			const result = reader.result as string;
			const dataOffset = result.indexOf(',') + 1;
			resolve(result.substring(dataOffset));
		};
		reader.onabort = () => reject(new Error('Read aborted'));
		reader.onerror = () => reject(reader.error);
		reader.readAsDataURL(blob);
	});
};
