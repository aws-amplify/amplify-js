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
			// TODO: Uncomment below and update test
			// x: 234,
		});

		CustomIdentifierDefaultRO.copyOf({} as CustomIdentifierDefaultRO, d => {
			// TODO: Uncomment below and update test
			// d.id;
			// TODO: Uncomment below and update test
			// d.id = '';

			d.myId;
			// TODO: Uncomment below and update test
			// d.myId = '';

			d.name = '';
			d.description = '';

			d.createdAt;
			// TODO: Uncomment below and update test
			// d.createdAt = '';

			d.updatedAt;
			// TODO: Uncomment below and update test
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
			// TODO: Uncomment below and update test
			// x: 234,
		});

		CustomIdentifierCustomRO.copyOf({} as CustomIdentifierCustomRO, d => {
			// TODO: Uncomment below and update test
			// d.id;
			// TODO: Uncomment below and update test
			// d.id = '';

			d.myId;
			// TODO: Uncomment below and update test
			// d.myId = '';

			d.name = '';
			d.description = '';

			d.createdOn;
			// TODO: Uncomment below and update test
			// d.createdOn = '';

			d.updatedOn;
			// TODO: Uncomment below and update test
			// d.updatedOn = '';
		});
	});
});
