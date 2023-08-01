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
	OptionallyManagedCompositeDefaultRO,
} from '../../helpers';

describe('Optionally Managed Composite Identifier', () => {
	test(`OptionallyManagedCompositeDefaultRO`, async () => {
		// ID is present:
		expectType<
			ModelInit<
				OptionallyManagedCompositeDefaultRO,
				OptionallyManagedCompositeDefaultRO[typeof __modelMeta__]
			>
		>({
			id: 'eeeeeee',
			name: '',
			description: '',
		});

		// ID is not present:
		expectType<
			ModelInit<
				OptionallyManagedCompositeDefaultRO,
				OptionallyManagedCompositeDefaultRO[typeof __modelMeta__]
			>
		>({
			name: '',
			description: '',
		});

		// Expected `copyOf`
		OptionallyManagedCompositeDefaultRO.copyOf(
			{} as OptionallyManagedCompositeDefaultRO,
			d => {
				d.id;
				d.name;
				/**
				 * TODO:
				 * Current TS error:
				 * Index signature in type 'MutableModel<OptionallyManagedCompositeDefaultRO>'
				 * only permits reading
				 */
				d.description = '';
				d.createdAt;
				d.updatedAt;
			}
		);

		// Expected `copyOf` errors:
		OptionallyManagedCompositeDefaultRO.copyOf(
			{} as OptionallyManagedCompositeDefaultRO,
			d => {
				// @ts-expect-error
				d.id = '';

				// @ts-expect-error
				d.name = '';

				// TODO: same error as above
				// d.description = '';

				// @ts-expect-error
				d.createdAt = '';

				// @ts-expect-error
				d.updatedAt = '';
			}
		);

		// Query
		expectType<OptionallyManagedCompositeDefaultRO | undefined>(
			await DataStore.query(OptionallyManagedCompositeDefaultRO, {
				id: 'someid',
				name: 'somename',
			})
		);
		expectType<OptionallyManagedCompositeDefaultRO | undefined>(
			await DataStore.query(OptionallyManagedCompositeDefaultRO, {
				id: 'someid',
			})
		);
		expectType<OptionallyManagedCompositeDefaultRO[]>(
			await DataStore.query(OptionallyManagedCompositeDefaultRO)
		);
		/**
		 * TODO: the following two tests are failing with the following error:
		 * Argument of type 'OptionallyManagedCompositeDefaultRO | undefined' is
		 * not assignable to parameter of type 'OptionallyManagedCompositeDefaultRO[]'.
		 * Type 'undefined' is not assignable to type 'OptionallyManagedCompositeDefaultRO[]'.
		 */
		expectType<OptionallyManagedCompositeDefaultRO[]>(
			await DataStore.query(OptionallyManagedCompositeDefaultRO, Predicates.ALL)
		);
		expectType<OptionallyManagedCompositeDefaultRO[]>(
			await DataStore.query(OptionallyManagedCompositeDefaultRO, c =>
				c.createdAt.ge('2019')
			)
		);

		// Save
		expectType<OptionallyManagedCompositeDefaultRO>(
			await DataStore.save(dummyInstance<OptionallyManagedCompositeDefaultRO>())
		);
		expectType<OptionallyManagedCompositeDefaultRO>(
			await DataStore.save(
				dummyInstance<OptionallyManagedCompositeDefaultRO>(),
				c => c.createdAt.ge('2019')
			)
		);

		// Delete
		// TODO: should error:
		expectType<OptionallyManagedCompositeDefaultRO[]>(
			await DataStore.delete(OptionallyManagedCompositeDefaultRO, '')
		);
		expectType<OptionallyManagedCompositeDefaultRO[]>(
			await DataStore.delete(OptionallyManagedCompositeDefaultRO, {
				tenant: '',
				dob: '',
			})
		);
		expectType<OptionallyManagedCompositeDefaultRO>(
			await DataStore.delete(
				dummyInstance<OptionallyManagedCompositeDefaultRO>()
			)
		);
		expectType<OptionallyManagedCompositeDefaultRO>(
			await DataStore.delete(
				dummyInstance<OptionallyManagedCompositeDefaultRO>(),
				c => c.description.contains('something')
			)
		);
		expectType<OptionallyManagedCompositeDefaultRO[]>(
			await DataStore.delete(
				OptionallyManagedCompositeDefaultRO,
				Predicates.ALL
			)
		);
		expectType<OptionallyManagedCompositeDefaultRO[]>(
			await DataStore.delete(OptionallyManagedCompositeDefaultRO, c =>
				c.createdAt.le('2019')
			)
		);

		// Observe
		DataStore.observe(OptionallyManagedCompositeDefaultRO).subscribe(
			({ model, element }) => {
				expectType<
					PersistentModelConstructor<OptionallyManagedCompositeDefaultRO>
				>(model);
				expectType<OptionallyManagedCompositeDefaultRO>(element);
			}
		);
		DataStore.observe(OptionallyManagedCompositeDefaultRO, c =>
			c.description.beginsWith('something')
		).subscribe(({ model, element }) => {
			expectType<
				PersistentModelConstructor<OptionallyManagedCompositeDefaultRO>
			>(model);
			expectType<OptionallyManagedCompositeDefaultRO>(element);
		});
		DataStore.observe(
			dummyInstance<OptionallyManagedCompositeDefaultRO>()
		).subscribe(({ model, element }) => {
			expectType<
				PersistentModelConstructor<OptionallyManagedCompositeDefaultRO>
			>(model);
			expectType<OptionallyManagedCompositeDefaultRO>(element);
		});

		// Observe query
		DataStore.observeQuery(OptionallyManagedCompositeDefaultRO).subscribe(
			({ items }) => {
				expectType<OptionallyManagedCompositeDefaultRO[]>(items);
			}
		);
		DataStore.observeQuery(OptionallyManagedCompositeDefaultRO, c =>
			c.description.notContains('something')
		).subscribe(({ items }) => {
			expectType<OptionallyManagedCompositeDefaultRO[]>(items);
		});
		DataStore.observeQuery(
			OptionallyManagedCompositeDefaultRO,
			c => c.description.notContains('something'),
			{ sort: c => c.createdAt('ASCENDING') }
		).subscribe(({ items }) => {
			expectType<OptionallyManagedCompositeDefaultRO[]>(items);
		});
	});
});
