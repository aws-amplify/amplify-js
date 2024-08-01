import { JWT } from '../../../src/singleton/Auth/types';

describe('type validity', () => {
	describe('JWT type', () => {
		it('can contain property that has a value as array of JsonObject', () => {
			const value: JWT = {
				payload: { otherProperty: 'value' },
				toString: () => 'mock',
			};
			const a = value.payload.otherProperty as { key: string }[];

			expect(a).toEqual('value');
		});
	});
});
