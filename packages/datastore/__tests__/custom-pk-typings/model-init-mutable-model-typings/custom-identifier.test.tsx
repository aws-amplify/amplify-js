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
			// x: 234,
		});

		CustomIdentifierDefaultRO.copyOf({} as CustomIdentifierDefaultRO, d => {
			// d.id;
			// d.id = '';

			d.myId;
			// d.myId = '';

			d.name = '';
			d.description = '';

			d.createdAt;
			// d.createdAt = '';

			d.updatedAt;
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
			// x: 234,
		});

		CustomIdentifierCustomRO.copyOf({} as CustomIdentifierCustomRO, d => {
			// d.id;
			// d.id = '';

			d.myId;
			// d.myId = '';

			d.name = '';
			d.description = '';

			d.createdOn;
			// d.createdOn = '';

			d.updatedOn;
			// d.updatedOn = '';
		});
	});
});
