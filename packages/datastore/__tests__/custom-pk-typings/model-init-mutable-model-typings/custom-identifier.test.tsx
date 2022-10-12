// TODO: Look at ts-expect-error once we move to TypeScript 3.9 or above
import { ModelInit, __modelMeta__ } from '../../../src';
import {
	expectType,
	CustomIdentifierCustomRO,
	CustomIdentifierDefaultRO,
} from '../../helpers';

describe('Custom Identifier', () => {
	test(`CustomIdentifierDefaultRO`, async () => {
		expectType<
			ModelInit<
				CustomIdentifierDefaultRO,
				CustomIdentifierDefaultRO[typeof __modelMeta__]
			>
		>({
			myId: '',
			name: '',
			description: '',
		});

		expectType<
			ModelInit<
				CustomIdentifierDefaultRO,
				CustomIdentifierDefaultRO[typeof __modelMeta__]
			>
		>({
			myId: '',
			name: '',
			description: '',
			// @ts-expect-error
			// x: 234,
		});

		CustomIdentifierDefaultRO.copyOf({} as CustomIdentifierDefaultRO, d => {
			// @ts-expect-error
			// d.id;
			// @ts-expect-error
			// d.id = '';

			d.myId;
			// @ts-expect-error
			// d.myId = '';

			d.name = '';
			d.description = '';

			d.createdAt;
			// @ts-expect-error
			// d.createdAt = '';

			d.updatedAt;
			// @ts-expect-error
			// d.updatedAt = '';
		});
	});

	test(`CustomIdentifierCustomRO`, async () => {
		expectType<
			ModelInit<
				CustomIdentifierCustomRO,
				CustomIdentifierCustomRO[typeof __modelMeta__]
			>
		>({
			myId: '',
			name: '',
			description: '',
		});

		expectType<
			ModelInit<
				CustomIdentifierCustomRO,
				CustomIdentifierCustomRO[typeof __modelMeta__]
			>
		>({
			myId: '',
			name: '',
			description: '',
			// @ts-expect-error
			// x: 234,
		});

		CustomIdentifierCustomRO.copyOf({} as CustomIdentifierCustomRO, d => {
			// @ts-expect-error
			// d.id;
			// @ts-expect-error
			// d.id = '';

			d.myId;
			// @ts-expect-error
			// d.myId = '';

			d.name = '';
			d.description = '';

			d.createdOn;
			// @ts-expect-error
			// d.createdOn = '';

			d.updatedOn;
			// @ts-expect-error
			// d.updatedOn = '';
		});
	});
});
