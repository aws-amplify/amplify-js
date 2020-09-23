import { toHex, fromHex } from '@aws-sdk/util-hex-encoding';

export function urlSafeEncode(str: string) {
	return toHex(new TextEncoder().encode(str));
}

export function urlSafeDecode(hex: string) {
	return new TextDecoder().decode(fromHex(hex));
}
