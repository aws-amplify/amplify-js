// TODO: Look at ts-expect-error once we move to TypeScript 3.9 or above

import {
	ModelInit,
	PersistentModelConstructor,
	Predicates,
	__modelMeta__,
} from '../../../src';
import {
	DataStore,
	dummyInstance,
	expectType,
	CompositeCustomRO,
	CompositeDefaultRO,
} from '../../helpers';

describe('Composite Identifier', () => {
	test(`CompositeDefaultRO`, async () => {
		expectType<
			ModelInit<CompositeDefaultRO, CompositeDefaultRO[typeof __modelMeta__]>
		>({
			tenant: '',
			dob: '',
			name: '',
			description: '',
		});

		expectType<
			ModelInit<CompositeDefaultRO, CompositeDefaultRO[typeof __modelMeta__]>
		>({
			tenant: '',
			dob: '',
			name: '',
			description: '',
			// TODO: Uncomment below and update test
			// x: 234,
		});

		CompositeDefaultRO.copyOf({} as CompositeDefaultRO, d => {
			// TODO: Uncomment below and update test
			// d.id;
			// TODO: Uncomment below and update test
			// d.id = '';

			d.tenant;
			// TODO: Uncomment below and update test
			// d.tenant = '';
			d.dob;
			// TODO: Uncomment below and update test
			// d.dob = '';

			d.name = '';
			d.description = '';

			d.createdAt;
			// TODO: Uncomment below and update test
			// d.createdAt = '';

			d.updatedAt;
			// TODO: Uncomment below and update test
			// d.updatedAt = '';
		});

		// Query
		// TODO: Uncomment below and update test
		// await DataStore.query(CompositeDefaultRO, 'someid');
		// TODO: Uncomment below and update test
		// await DataStore.query(CompositeDefaultRO, { id: 'someid' });

		expectType<CompositeDefaultRO | undefined>(
			await DataStore.query(CompositeDefaultRO, { tenant: '', dob: '' }),
		);
		expectType<CompositeDefaultRO[]>(await DataStore.query(CompositeDefaultRO));
		expectType<CompositeDefaultRO[]>(
			await DataStore.query(CompositeDefaultRO, Predicates.ALL),
		);
		expectType<CompositeDefaultRO[]>(
			await DataStore.query(CompositeDefaultRO, c => c.createdAt.ge('2019')),
		);

		// Save
		expectType<CompositeDefaultRO>(
			await DataStore.save(dummyInstance<CompositeDefaultRO>()),
		);
		expectType<CompositeDefaultRO>(
			await DataStore.save(dummyInstance<CompositeDefaultRO>(), c =>
				c.createdAt.ge('2019'),
			),
		);

		// Delete

		// TODO: Uncomment below and update test
		// await DataStore.delete(CompositeDefaultRO, '')

		expectType<CompositeDefaultRO[]>(
			await DataStore.delete(CompositeDefaultRO, { tenant: '', dob: '' }),
		);
		expectType<CompositeDefaultRO>(
			await DataStore.delete(dummyInstance<CompositeDefaultRO>()),
		);
		expectType<CompositeDefaultRO>(
			await DataStore.delete(dummyInstance<CompositeDefaultRO>(), c =>
				c.description.contains('something'),
			),
		);
		expectType<CompositeDefaultRO[]>(
			await DataStore.delete(CompositeDefaultRO, Predicates.ALL),
		);
		expectType<CompositeDefaultRO[]>(
			await DataStore.delete(CompositeDefaultRO, c => c.createdAt.le('2019')),
		);

		// Observe
		DataStore.observe(CompositeDefaultRO).subscribe(({ model, element }) => {
			expectType<PersistentModelConstructor<CompositeDefaultRO>>(model);
			expectType<CompositeDefaultRO>(element);
		});
		DataStore.observe(CompositeDefaultRO, c =>
			c.description.beginsWith('something'),
		).subscribe(({ model, element }) => {
			expectType<PersistentModelConstructor<CompositeDefaultRO>>(model);
			expectType<CompositeDefaultRO>(element);
		});

		// Observe query
		DataStore.observeQuery(CompositeDefaultRO).subscribe(({ items }) => {
			expectType<CompositeDefaultRO[]>(items);
		});
		DataStore.observeQuery(CompositeDefaultRO, c =>
			c.description.notContains('something'),
		).subscribe(({ items }) => {
			expectType<CompositeDefaultRO[]>(items);
		});
		DataStore.observeQuery(
			CompositeDefaultRO,
			c => c.description.notContains('something'),
			{ sort: c => c.createdAt('ASCENDING') },
		).subscribe(({ items }) => {
			expectType<CompositeDefaultRO[]>(items);
		});
	});

	test(`CompositeCustomRO`, async () => {
		expectType<
			ModelInit<CompositeCustomRO, CompositeCustomRO[typeof __modelMeta__]>
		>({
			tenant: '',
			dob: '',
			name: '',
			description: '',
		});

		expectType<
			ModelInit<CompositeCustomRO, CompositeCustomRO[typeof __modelMeta__]>
		>({
			tenant: '',
			dob: '',
			name: '',
			description: '',
			// TODO: Uncomment below and update test
			// x: 234,
		});

		CompositeCustomRO.copyOf({} as CompositeCustomRO, d => {
			// TODO: Uncomment below and update test
			// d.id;
			// TODO: Uncomment below and update test
			// d.id = '';

			d.tenant;
			// TODO: Uncomment below and update test
			// d.tenant = '';
			d.dob;
			// TODO: Uncomment below and update test
			// d.dob = '';

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
