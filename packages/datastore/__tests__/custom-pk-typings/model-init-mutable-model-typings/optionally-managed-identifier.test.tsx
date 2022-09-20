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
	OptionallyManagedCustomRO,
	OptionallyManagedDefaultRO,
} from '../../helpers';

describe('Optionally Managed Identifier', () => {
	test(`OptionallyManagedDefaultRO`, async () => {
		expectType<
			ModelInit<
				OptionallyManagedDefaultRO,
				OptionallyManagedDefaultRO[typeof __modelMeta__]
			>
		>({
			id: 'eeeeeee',
			name: '',
			description: '',
		});

		expectType<
			ModelInit<
				OptionallyManagedDefaultRO,
				OptionallyManagedDefaultRO[typeof __modelMeta__]
			>
		>({
			name: '',
			description: '',
			// @ts-expect-error
			// x: 234,
		});

		expectType<
			ModelInit<
				OptionallyManagedDefaultRO,
				OptionallyManagedDefaultRO[typeof __modelMeta__]
			>
		>({
			name: '',
			description: '',
			// @ts-expect-error
			// x: 234,
		});

		OptionallyManagedDefaultRO.copyOf({} as OptionallyManagedDefaultRO, d => {
			d.id;
			// @ts-expect-error
			// d.id = '';

			d.name = '';
			d.description = '';

			d.createdAt;
			// @ts-expect-error
			// d.createdAt = '';

			d.updatedAt;
			// @ts-expect-error
			// d.updatedAt = '';
		});

		// Query
		expectType<OptionallyManagedDefaultRO | undefined>(
			await DataStore.query(OptionallyManagedDefaultRO, 'someid')
		);
		expectType<OptionallyManagedDefaultRO | undefined>(
			await DataStore.query(OptionallyManagedDefaultRO, { id: 'someid' })
		);
		expectType<OptionallyManagedDefaultRO[]>(
			await DataStore.query(OptionallyManagedDefaultRO)
		);
		expectType<OptionallyManagedDefaultRO[]>(
			await DataStore.query(OptionallyManagedDefaultRO, Predicates.ALL)
		);
		expectType<OptionallyManagedDefaultRO[]>(
			await DataStore.query(OptionallyManagedDefaultRO, c =>
				c.createdAt.ge('2019')
			)
		);

		// Save
		expectType<OptionallyManagedDefaultRO>(
			await DataStore.save(dummyInstance<OptionallyManagedDefaultRO>())
		);
		expectType<OptionallyManagedDefaultRO>(
			await DataStore.save(dummyInstance<OptionallyManagedDefaultRO>(), c =>
				c.createdAt('ge', '2019')
			)
		);

		// Delete
		expectType<OptionallyManagedDefaultRO[]>(
			await DataStore.delete(OptionallyManagedDefaultRO, '')
		);
		expectType<OptionallyManagedDefaultRO>(
			await DataStore.delete(dummyInstance<OptionallyManagedDefaultRO>())
		);
		expectType<OptionallyManagedDefaultRO>(
			await DataStore.delete(dummyInstance<OptionallyManagedDefaultRO>(), c =>
				c.description('contains', 'something')
			)
		);
		expectType<OptionallyManagedDefaultRO[]>(
			await DataStore.delete(OptionallyManagedDefaultRO, Predicates.ALL)
		);
		expectType<OptionallyManagedDefaultRO[]>(
			await DataStore.delete(OptionallyManagedDefaultRO, c =>
				c.createdAt('le', '2019')
			)
		);

		// Observe
		DataStore.observe(OptionallyManagedDefaultRO).subscribe(
			({ model, element }) => {
				expectType<PersistentModelConstructor<OptionallyManagedDefaultRO>>(
					model
				);
				expectType<OptionallyManagedDefaultRO>(element);
			}
		);
		DataStore.observe(OptionallyManagedDefaultRO, c =>
			c.description.beginsWith('something')
		).subscribe(({ model, element }) => {
			expectType<PersistentModelConstructor<OptionallyManagedDefaultRO>>(model);
			expectType<OptionallyManagedDefaultRO>(element);
		});
		DataStore.observe(dummyInstance<OptionallyManagedDefaultRO>()).subscribe(
			({ model, element }) => {
				expectType<PersistentModelConstructor<OptionallyManagedDefaultRO>>(
					model
				);
				expectType<OptionallyManagedDefaultRO>(element);
			}
		);

		// Observe query
		DataStore.observeQuery(OptionallyManagedDefaultRO).subscribe(
			({ items }) => {
				expectType<OptionallyManagedDefaultRO[]>(items);
			}
		);
		DataStore.observeQuery(OptionallyManagedDefaultRO, c =>
			c.description.notContains('something')
		).subscribe(({ items }) => {
			expectType<OptionallyManagedDefaultRO[]>(items);
		});
		DataStore.observeQuery(
			OptionallyManagedDefaultRO,
			c => c.description.notContains('something'),
			{ sort: c => c.createdAt('ASCENDING') }
		).subscribe(({ items }) => {
			expectType<OptionallyManagedDefaultRO[]>(items);
		});
	});

	test(`OptionallyManagedCustomRO`, async () => {
		expectType<ModelInit<OptionallyManagedCustomRO>>({
			name: '',
			description: '',
		});

		expectType<
			ModelInit<
				OptionallyManagedCustomRO,
				OptionallyManagedCustomRO[typeof __modelMeta__]
			>
		>({
			id: 'eeeeeee',
			name: '',
			description: '',
		});

		expectType<
			ModelInit<
				OptionallyManagedCustomRO,
				OptionallyManagedCustomRO[typeof __modelMeta__]
			>
		>({
			name: '',
			description: '',
			// @ts-expect-error
			// x: 234,
		});

		expectType<
			ModelInit<
				OptionallyManagedCustomRO,
				OptionallyManagedCustomRO[typeof __modelMeta__]
			>
		>({
			name: '',
			description: '',
			// @ts-expect-error
			// x: 234,
		});

		OptionallyManagedCustomRO.copyOf({} as OptionallyManagedCustomRO, d => {
			d.id;
			// @ts-expect-error
			// d.id = '';

			d.name = '';
			d.description = '';

			d.createdOn;
			// @ts-expect-error
			// d.createdOn = '';

			d.updatedOn;
			// @ts-expect-error
			// d.updatedOn = '';
		});

		// Query
		expectType<OptionallyManagedCustomRO | undefined>(
			await DataStore.query(OptionallyManagedCustomRO, 'someid')
		);
		expectType<OptionallyManagedCustomRO | undefined>(
			await DataStore.query(OptionallyManagedCustomRO, { id: 'someid' })
		);
		expectType<OptionallyManagedCustomRO[]>(
			await DataStore.query(OptionallyManagedCustomRO)
		);
		expectType<OptionallyManagedCustomRO[]>(
			await DataStore.query(OptionallyManagedCustomRO, Predicates.ALL)
		);
		expectType<OptionallyManagedCustomRO[]>(
			await DataStore.query(OptionallyManagedCustomRO, c =>
				c.createdOn.ge('2019')
			)
		);

		// Save
		expectType<OptionallyManagedCustomRO>(
			await DataStore.save(dummyInstance<OptionallyManagedCustomRO>())
		);
		expectType<OptionallyManagedCustomRO>(
			await DataStore.save(dummyInstance<OptionallyManagedCustomRO>(), c =>
				c.createdOn('ge', '2019')
			)
		);

		// Delete
		expectType<OptionallyManagedCustomRO[]>(
			await DataStore.delete(OptionallyManagedCustomRO, '')
		);
		expectType<OptionallyManagedCustomRO>(
			await DataStore.delete(dummyInstance<OptionallyManagedCustomRO>())
		);
		expectType<OptionallyManagedCustomRO>(
			await DataStore.delete(dummyInstance<OptionallyManagedCustomRO>(), c =>
				c.description('contains', 'something')
			)
		);
		expectType<OptionallyManagedCustomRO[]>(
			await DataStore.delete(OptionallyManagedCustomRO, Predicates.ALL)
		);
		expectType<OptionallyManagedCustomRO[]>(
			await DataStore.delete(OptionallyManagedCustomRO, c =>
				c.createdOn('le', '2019')
			)
		);

		// Observe
		DataStore.observe(OptionallyManagedCustomRO).subscribe(
			({ model, element }) => {
				expectType<PersistentModelConstructor<OptionallyManagedCustomRO>>(
					model
				);
				expectType<OptionallyManagedCustomRO>(element);
			}
		);
		DataStore.observe(OptionallyManagedCustomRO, c =>
			c.description.beginsWith('something')
		).subscribe(({ model, element }) => {
			expectType<PersistentModelConstructor<OptionallyManagedCustomRO>>(model);
			expectType<OptionallyManagedCustomRO>(element);
		});
		DataStore.observe(dummyInstance<OptionallyManagedCustomRO>()).subscribe(
			({ model, element }) => {
				expectType<PersistentModelConstructor<OptionallyManagedCustomRO>>(
					model
				);
				expectType<OptionallyManagedCustomRO>(element);
			}
		);

		// Observe query
		DataStore.observeQuery(OptionallyManagedCustomRO).subscribe(({ items }) => {
			expectType<OptionallyManagedCustomRO[]>(items);
		});
		DataStore.observeQuery(OptionallyManagedCustomRO, c =>
			c.description.notContains('something')
		).subscribe(({ items }) => {
			expectType<OptionallyManagedCustomRO[]>(items);
		});
		DataStore.observeQuery(
			OptionallyManagedCustomRO,
			c => c.description.notContains('something'),
			{ sort: c => c.createdOn('ASCENDING') }
		).subscribe(({ items }) => {
			expectType<OptionallyManagedCustomRO[]>(items);
		});
	});
});
