import { JWT } from '../../../src/singleton/Auth/types';

describe('type validity', () => {
	describe('JWT type', () => {
		it('can contain property that has a value as array of JsonObjects', () => {
			type OtherProperty1 = (
				| { key: string }
				| number
				| string
				| (
						| { key: string }
						| number
						| string
						| ({ key: string } | number | string)[]
				  )[]
			)[];
			// For testing purpose, use type alias here, as TS will complain while using
			// an interface which triggers structural typing check
			// eslint-disable-next-line @typescript-eslint/consistent-type-definitions
			type OtherProperty2 = {
				key: number;
				array: (
					| { key: string }
					| number
					| string
					| ({ key: string } | number | string)[]
				)[];
			};
			const expectedOtherProperty1 = [
				{ key: '123' },
				1,
				'hi',
				[1, 'hi', { key: '345' }, [2, 'hi', { key: '456' }]],
			];
			const expectedOtherProperty2 = {
				key: 1,
				array: [1, 'hi', { key: '123' }, [2, 'hi', { key: '456' }]],
			};
			const value: JWT = {
				payload: {
					otherProperty1: expectedOtherProperty1,
					otherProperty2: expectedOtherProperty2,
				},
				toString: () => 'mock',
			};

			const extractedOtherProperty1 = value.payload
				.otherProperty1 as OtherProperty1;
			const a: OtherProperty1 = extractedOtherProperty1;
			expect(a).toEqual(expectedOtherProperty1);

			const extractedOtherProperty2 = value.payload
				.otherProperty2 as OtherProperty2;
			const b: OtherProperty2 = extractedOtherProperty2;
			expect(b).toEqual(expectedOtherProperty2);
		});
	});
});
