import {
	base64URL,
	bufferToString,
	generateChallenge,
	generateRandom,
	generateState,
} from '../src/providers/cognito/utils/signInWithRedirectHelpers';
describe('test OAuth helpers', () => {
	test('base64Url removes special characters', () => {
		const src = 'abcd=abcde+abcde/abcde';
		const expected = 'abcdabcde-abcde_abcde';

		expect(base64URL(src)).toEqual(expected);
	});

	test('bufferToString', () => {
		const uint8array = Uint8Array.from([
			176, 157, 186, 52, 155, 94, 148, 74, 47, 1, 127, 215, 237, 222, 115, 197,
			207, 65, 169, 84, 82, 68, 197, 29, 94, 91, 98, 160, 27, 173, 167, 109, 19,
			16, 225, 79, 254, 88, 90, 237, 146, 237, 59, 16, 191, 135, 236, 145, 61,
			182, 66, 7, 65, 83, 211, 175, 161, 2, 16, 218, 218, 46, 34, 99, 7, 196,
			37, 232, 204, 162, 115, 119, 224, 216, 105, 17, 152, 244, 145, 126, 35,
			130, 96, 247, 198, 54, 155, 185, 152, 254, 5, 198, 193, 94, 117, 134, 88,
			71, 13, 33, 183, 218, 105, 121, 220, 241, 45, 178, 174, 181, 137, 65, 157,
			212, 151, 41, 149, 121, 28, 186, 222, 65, 45, 181, 144, 201, 176, 92,
		]);
		const originalText =
			'0hA0fgYMvBDdzk1LVDtWUGLdgdkkbxrvTQnRGaczWz7QFLyV96EHDVZzlCQgguilHKluSm15merRc6VCjGi9M2f9cGFMHg3KaJNh7gr7i3t2y5NDhabpZ7cAkDt5UP0e';

		expect(bufferToString(uint8array)).toEqual(originalText);
	});

	test('generate random', () => {
		const randomString = generateRandom(100);
		expect(randomString.length).toBe(100);
		const CHARSET =
			'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~';
		for (const character of randomString) {
			expect(CHARSET.indexOf(character) >= 0).toBe(true);
		}
	});

	test('generate state', () => {
		const state = generateState(100);
		const chars =
			'0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
		for (const character of state) {
			expect(chars.indexOf(character) >= 0).toBe(true);
		}
		expect(state.length).toBe(100);
	});

	test('generate challenge', () => {
		const challenge = generateChallenge('secretcode');

		expect(challenge).toEqual('fQ4FWeyu-pGYHJ5D-mUWyJbeYKIRMKFn3VHayaSmIQc');
	});
});
