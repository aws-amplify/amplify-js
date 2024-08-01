import { JWT } from '../../../src/singleton/Auth/types';

describe('type validity', () => {
	describe('JWT type', () => {
		it('can contain property that has a value as array of JsonObject', () => {
			const value: JWT = {
				payload: { otherProperty: [{ key: '123' }] },
				toString: () => 'mock',
			};
			const a = value.payload.otherProperty as { key: string }[];

			expect(a).toEqual([{ key: '123' }]);
		});

		it('can contain property that has a value as array of JsonObject and JsonPrimitive', () => {
			const value: JWT = {
				payload: { otherProperty: [1, 2, 'hi', { key: 'value' }] },
				toString: () => 'mock',
			};
			const a = value.payload.otherProperty as (
				| { key: string }
				| number
				| string
			)[];

			expect(a).toEqual([1, 2, 'hi', { key: 'value' }]);
		});
	});
});
