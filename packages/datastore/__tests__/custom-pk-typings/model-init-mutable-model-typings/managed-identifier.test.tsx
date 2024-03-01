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
	ManagedCustomRO,
	ManagedDefaultRO,
} from '../../helpers';

describe('Managed Identifier', () => {
	test(`ManagedDefaultRO`, async () => {
		expectType<ModelInit<ManagedDefaultRO>>({
			// TODO: Uncomment below and update test
			// id: 'eeeeeee',
			name: '',
			description: '',
		});

		expectType<ModelInit<ManagedDefaultRO>>({
			name: '',
			description: '',
			// TODO: Uncomment below and update test
			// x: 234,
		});

		expectType<ModelInit<ManagedDefaultRO>>({
			name: '',
			description: '',
			// TODO: Uncomment below and update test
			// x: 234,
		});

		ManagedDefaultRO.copyOf({} as ManagedDefaultRO, d => {
			d.id;
			// TODO: Uncomment below and update test
			// d.id = '';

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
		expectType<ManagedDefaultRO | undefined>(
			await DataStore.query(ManagedDefaultRO, 'someid'),
		);
		expectType<ManagedDefaultRO | undefined>(
			await DataStore.query(ManagedDefaultRO, { id: 'someid' }),
		);
		expectType<ManagedDefaultRO[]>(await DataStore.query(ManagedDefaultRO));
		expectType<ManagedDefaultRO[]>(
			await DataStore.query(ManagedDefaultRO, Predicates.ALL),
		);
		expectType<ManagedDefaultRO[]>(
			await DataStore.query(ManagedDefaultRO, c => c.createdAt.ge('2019')),
		);

		// Save
		expectType<ManagedDefaultRO>(
			await DataStore.save(dummyInstance<ManagedDefaultRO>()),
		);
		expectType<ManagedDefaultRO>(
			await DataStore.save(dummyInstance<ManagedDefaultRO>(), c =>
				c.createdAt.ge('2019'),
			),
		);

		// Delete
		expectType<ManagedDefaultRO[]>(
			await DataStore.delete(ManagedDefaultRO, ''),
		);
		expectType<ManagedDefaultRO>(
			await DataStore.delete(dummyInstance<ManagedDefaultRO>()),
		);
		expectType<ManagedDefaultRO>(
			await DataStore.delete(dummyInstance<ManagedDefaultRO>(), c =>
				c.description.contains('something'),
			),
		);
		expectType<ManagedDefaultRO[]>(
			await DataStore.delete(ManagedDefaultRO, Predicates.ALL),
		);
		expectType<ManagedDefaultRO[]>(
			await DataStore.delete(ManagedDefaultRO, c => c.createdAt.le('2019')),
		);

		// Observe
		DataStore.observe(ManagedDefaultRO).subscribe(({ model, element }) => {
			expectType<PersistentModelConstructor<ManagedDefaultRO>>(model);
			expectType<ManagedDefaultRO>(element);
		});
		DataStore.observe(ManagedDefaultRO, c =>
			c.description.beginsWith('something'),
		).subscribe(({ model, element }) => {
			expectType<PersistentModelConstructor<ManagedDefaultRO>>(model);
			expectType<ManagedDefaultRO>(element);
		});
		DataStore.observe(dummyInstance<ManagedDefaultRO>()).subscribe(
			({ model, element }) => {
				expectType<PersistentModelConstructor<ManagedDefaultRO>>(model);
				expectType<ManagedDefaultRO>(element);
			},
		);

		// Observe query
		DataStore.observeQuery(ManagedDefaultRO).subscribe(({ items }) => {
			expectType<ManagedDefaultRO[]>(items);
		});
		DataStore.observeQuery(ManagedDefaultRO, c =>
			c.description.notContains('something'),
		).subscribe(({ items }) => {
			expectType<ManagedDefaultRO[]>(items);
		});
		DataStore.observeQuery(
			ManagedDefaultRO,
			c => c.description.notContains('something'),
			{ sort: c => c.createdAt('ASCENDING') },
		).subscribe(({ items }) => {
			expectType<ManagedDefaultRO[]>(items);
		});
	});

	test(`ManagedCustomRO`, async () => {
		expectType<ModelInit<ManagedCustomRO>>({
			// TODO: Uncomment below and update test
			// id: 'eeeeeee',
			name: '',
			description: '',
		});

		expectType<ModelInit<ManagedCustomRO>>({
			name: '',
			description: '',
			// TODO: Uncomment below and update test
			// x: 234,
		});

		expectType<ModelInit<ManagedCustomRO>>({
			name: '',
			description: '',
			// TODO: Uncomment below and update test
			// x: 234,
		});

		ManagedCustomRO.copyOf({} as ManagedCustomRO, d => {
			d.id;
			// TODO: Uncomment below and update test
			// d.id = '';

			d.name = '';
			d.description = '';

			d.createdOn;
			// TODO: Uncomment below and update test
			// d.createdOn = '';

			d.updatedOn;
			// TODO: Uncomment below and update test
			// d.updatedOn = '';
		});

		// Query
		expectType<ManagedCustomRO | undefined>(
			await DataStore.query(ManagedCustomRO, 'someid'),
		);
		expectType<ManagedCustomRO[]>(await DataStore.query(ManagedCustomRO));
		expectType<ManagedCustomRO[]>(
			await DataStore.query(ManagedCustomRO, Predicates.ALL),
		);
		expectType<ManagedCustomRO[]>(
			await DataStore.query(ManagedCustomRO, c => c.createdOn.ge('2019')),
		);

		// Save
		expectType<ManagedCustomRO>(
			await DataStore.save(dummyInstance<ManagedCustomRO>()),
		);
		expectType<ManagedCustomRO>(
			await DataStore.save(dummyInstance<ManagedCustomRO>(), c =>
				c.createdOn.ge('2019'),
			),
		);

		// Delete
		expectType<ManagedCustomRO[]>(await DataStore.delete(ManagedCustomRO, ''));
		expectType<ManagedCustomRO>(
			await DataStore.delete(dummyInstance<ManagedCustomRO>()),
		);
		expectType<ManagedCustomRO>(
			await DataStore.delete(dummyInstance<ManagedCustomRO>(), c =>
				c.description.contains('something'),
			),
		);
		expectType<ManagedCustomRO[]>(
			await DataStore.delete(ManagedCustomRO, Predicates.ALL),
		);
		expectType<ManagedCustomRO[]>(
			await DataStore.delete(ManagedCustomRO, c => c.createdOn.le('2019')),
		);

		// Observe
		DataStore.observe(ManagedCustomRO).subscribe(({ model, element }) => {
			expectType<PersistentModelConstructor<ManagedCustomRO>>(model);
			expectType<ManagedCustomRO>(element);
		});
		DataStore.observe(ManagedCustomRO, c =>
			c.description.beginsWith('something'),
		).subscribe(({ model, element }) => {
			expectType<PersistentModelConstructor<ManagedCustomRO>>(model);
			expectType<ManagedCustomRO>(element);
		});
		DataStore.observe(dummyInstance<ManagedCustomRO>()).subscribe(
			({ model, element }) => {
				expectType<PersistentModelConstructor<ManagedCustomRO>>(model);
				expectType<ManagedCustomRO>(element);
			},
		);

		// Observe query
		DataStore.observeQuery(ManagedCustomRO).subscribe(({ items }) => {
			expectType<ManagedCustomRO[]>(items);
		});
		DataStore.observeQuery(ManagedCustomRO, c =>
			c.description.notContains('something'),
		).subscribe(({ items }) => {
			expectType<ManagedCustomRO[]>(items);
		});
		DataStore.observeQuery(
			ManagedCustomRO,
			c => c.description.notContains('something'),
			{ sort: c => c.createdOn('ASCENDING') },
		).subscribe(({ items }) => {
			expectType<ManagedCustomRO[]>(items);
		});
	});
});
