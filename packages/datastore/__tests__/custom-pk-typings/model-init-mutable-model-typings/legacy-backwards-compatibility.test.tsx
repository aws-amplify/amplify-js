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
	LegacyCustomROMETA,
	LegacyDefaultRO,
	LegacyCustomRO,
	LegacyNoMetadata,
	CustomIdentifierNoRO,
} from '../../helpers';

describe('Legacy - backwards compatibility', () => {
	test(`LegacyNoMetadata`, async () => {
		expectType<ModelInit<LegacyNoMetadata>>({
			// @ts-expect-error
			// id: '234',
			name: '',
			description: '',
		});

		expectType<ModelInit<LegacyNoMetadata>>({
			name: '',
			description: '',
			// @ts-expect-error
			// x: 234,
		});

		expectType<ModelInit<LegacyNoMetadata>>({
			name: '',
			description: '',
			createdAt: '',
		});

		LegacyNoMetadata.copyOf({} as LegacyNoMetadata, d => {
			d.id;
			// @ts-expect-error
			// d.id = '';

			d.name = '';
			d.description = '';

			d.createdAt;
			d.createdAt = '';

			d.updatedAt;
			d.updatedAt = '';
		});

		// Query
		expectType<LegacyNoMetadata | undefined>(
			await DataStore.query(LegacyNoMetadata, 'someid')
		);
		expectType<LegacyNoMetadata | undefined>(
			await DataStore.query(LegacyNoMetadata, { id: 'someid' })
		);
		expectType<LegacyNoMetadata[]>(await DataStore.query(LegacyNoMetadata));
		expectType<LegacyNoMetadata[]>(
			await DataStore.query(LegacyNoMetadata, Predicates.ALL)
		);
		expectType<LegacyNoMetadata[]>(
			await DataStore.query(LegacyNoMetadata, c => c.createdAt('ge', '2019'))
		);

		// Save
		expectType<LegacyNoMetadata>(
			await DataStore.save(dummyInstance<LegacyNoMetadata>())
		);
		expectType<LegacyNoMetadata>(
			await DataStore.save(dummyInstance<LegacyNoMetadata>(), c =>
				c.createdAt('ge', '2019')
			)
		);

		// Delete
		expectType<LegacyNoMetadata[]>(
			await DataStore.delete(LegacyNoMetadata, '')
		);
		expectType<LegacyNoMetadata>(
			await DataStore.delete(dummyInstance<LegacyNoMetadata>())
		);
		expectType<LegacyNoMetadata>(
			await DataStore.delete(dummyInstance<LegacyNoMetadata>(), c =>
				c.description('contains', 'something')
			)
		);
		expectType<LegacyNoMetadata[]>(
			await DataStore.delete(LegacyNoMetadata, Predicates.ALL)
		);
		expectType<LegacyNoMetadata[]>(
			await DataStore.delete(LegacyNoMetadata, c => c.createdAt('le', '2019'))
		);

		// Observe
		DataStore.observe(LegacyNoMetadata).subscribe(({ model, element }) => {
			expectType<PersistentModelConstructor<LegacyNoMetadata>>(model);
			expectType<LegacyNoMetadata>(element);
		});
		DataStore.observe(LegacyNoMetadata, c =>
			c.description('beginsWith', 'something')
		).subscribe(({ model, element }) => {
			expectType<PersistentModelConstructor<LegacyNoMetadata>>(model);
			expectType<LegacyNoMetadata>(element);
		});
		DataStore.observe(dummyInstance<LegacyNoMetadata>()).subscribe(
			({ model, element }) => {
				new model({
					name: '',
					description: '',
				});
				expectType<PersistentModelConstructor<LegacyNoMetadata>>(model);
				expectType<LegacyNoMetadata>(element);
			}
		);

		// Observe query
		DataStore.observeQuery(LegacyNoMetadata).subscribe(({ items }) => {
			expectType<LegacyNoMetadata[]>(items);
		});
		DataStore.observeQuery(LegacyNoMetadata, c =>
			c.description('notContains', 'something')
		).subscribe(({ items }) => {
			expectType<LegacyNoMetadata[]>(items);
		});
		DataStore.observeQuery(
			LegacyNoMetadata,
			c => c.description('notContains', 'something'),
			{ sort: c => c.createdAt('ASCENDING') }
		).subscribe(({ items }) => {
			expectType<LegacyNoMetadata[]>(items);
		});
	});

	test(`LegacyDefaultRO`, async () => {
		expectType<ModelInit<LegacyDefaultRO>>({
			// @ts-expect-error
			// id: '234',
			name: '',
			description: '',
		});

		expectType<ModelInit<LegacyDefaultRO>>({
			name: '',
			description: '',
			// @ts-expect-error
			// x: 234,
		});

		LegacyDefaultRO.copyOf({} as LegacyDefaultRO, d => {
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
		expectType<LegacyDefaultRO>(
			await DataStore.query(LegacyDefaultRO, 'someid')
		);
		expectType<LegacyDefaultRO[]>(await DataStore.query(LegacyDefaultRO));
		expectType<LegacyDefaultRO[]>(
			await DataStore.query(LegacyDefaultRO, Predicates.ALL)
		);
		expectType<LegacyDefaultRO[]>(
			await DataStore.query(LegacyDefaultRO, c => c.createdAt('ge', '2019'))
		);

		// Save
		expectType<LegacyDefaultRO>(
			await DataStore.save(dummyInstance<LegacyDefaultRO>())
		);
		expectType<LegacyDefaultRO>(
			await DataStore.save(dummyInstance<LegacyDefaultRO>(), c =>
				c.createdAt('ge', '2019')
			)
		);

		// Delete
		expectType<LegacyDefaultRO[]>(await DataStore.delete(LegacyDefaultRO, ''));
		expectType<LegacyDefaultRO>(
			await DataStore.delete(dummyInstance<LegacyDefaultRO>())
		);
		expectType<LegacyDefaultRO>(
			await DataStore.delete(dummyInstance<LegacyDefaultRO>(), c =>
				c.description('contains', 'something')
			)
		);
		expectType<LegacyDefaultRO[]>(
			await DataStore.delete(LegacyDefaultRO, Predicates.ALL)
		);
		expectType<LegacyDefaultRO[]>(
			await DataStore.delete(LegacyDefaultRO, c => c.createdAt('le', '2019'))
		);

		// Observe
		DataStore.observe(LegacyDefaultRO).subscribe(({ model, element }) => {
			expectType<PersistentModelConstructor<LegacyDefaultRO>>(model);
			expectType<LegacyDefaultRO>(element);
		});
		DataStore.observe(LegacyDefaultRO, c =>
			c.description('beginsWith', 'something')
		).subscribe(({ model, element }) => {
			expectType<PersistentModelConstructor<LegacyDefaultRO>>(model);
			expectType<LegacyDefaultRO>(element);
		});
		DataStore.observe(dummyInstance<LegacyDefaultRO>()).subscribe(
			({ model, element }) => {
				expectType<PersistentModelConstructor<LegacyDefaultRO>>(model);
				expectType<LegacyDefaultRO>(element);
			}
		);

		// Observe query
		DataStore.observeQuery(LegacyDefaultRO).subscribe(({ items }) => {
			expectType<LegacyDefaultRO[]>(items);
		});
		DataStore.observeQuery(LegacyDefaultRO, c =>
			c.description('notContains', 'something')
		).subscribe(({ items }) => {
			expectType<LegacyDefaultRO[]>(items);
		});
		DataStore.observeQuery(
			LegacyDefaultRO,
			c => c.description('notContains', 'something'),
			{ sort: c => c.createdAt('ASCENDING') }
		).subscribe(({ items }) => {
			expectType<LegacyDefaultRO[]>(items);
		});
	});

	test(`LegacyCustomRO`, async () => {
		expectType<ModelInit<LegacyCustomRO, LegacyCustomROMETA>>({
			// @ts-expect-error
			// id: '234',
			name: '',
			description: '',
		});

		expectType<ModelInit<LegacyCustomRO, LegacyCustomROMETA>>({
			name: '',
			description: '',
			// @ts-expect-error
			// createdOn: '',
		});

		expectType<ModelInit<LegacyCustomRO, LegacyCustomROMETA>>({
			name: '',
			description: '',
			// @ts-expect-error
			// createdAt: '',
		});

		LegacyCustomRO.copyOf({} as LegacyCustomRO, d => {
			d.id;
			// @ts-expect-error
			// d.id = '';

			d.name = '';
			d.description = '';

			// @ts-expect-error
			// d.createdAt;

			// @ts-expect-error
			// d.updatedAt;

			d.createdOn;
			// @ts-expect-error
			// d.createdOn = '';

			d.updatedOn;
			// @ts-expect-error
			// d.updatedOn = '';
		});

		// Query
		expectType<LegacyCustomRO>(await DataStore.query(LegacyCustomRO, 'someid'));
		expectType<LegacyCustomRO[]>(await DataStore.query(LegacyCustomRO));
		expectType<LegacyCustomRO[]>(
			await DataStore.query(LegacyCustomRO, Predicates.ALL)
		);
		expectType<LegacyCustomRO[]>(
			await DataStore.query(LegacyCustomRO, c => c.createdOn('ge', '2019'))
		);

		// Save
		expectType<LegacyCustomRO>(
			await DataStore.save(dummyInstance<LegacyCustomRO>())
		);
		expectType<LegacyCustomRO>(
			await DataStore.save(dummyInstance<LegacyCustomRO>(), c =>
				c.createdOn('ge', '2019')
			)
		);

		// Delete
		expectType<LegacyCustomRO[]>(await DataStore.delete(LegacyCustomRO, ''));
		expectType<LegacyCustomRO>(
			await DataStore.delete(dummyInstance<LegacyCustomRO>())
		);
		expectType<LegacyCustomRO>(
			await DataStore.delete(dummyInstance<LegacyCustomRO>(), c =>
				c.description('contains', 'something')
			)
		);
		expectType<LegacyCustomRO[]>(
			await DataStore.delete(LegacyCustomRO, Predicates.ALL)
		);
		expectType<LegacyCustomRO[]>(
			await DataStore.delete(LegacyCustomRO, c => c.createdOn('le', '2019'))
		);

		// Observe
		DataStore.observe(LegacyCustomRO).subscribe(({ model, element }) => {
			expectType<PersistentModelConstructor<LegacyCustomRO>>(model);
			expectType<LegacyCustomRO>(element);
		});
		DataStore.observe(LegacyCustomRO, c =>
			c.description('beginsWith', 'something')
		).subscribe(({ model, element }) => {
			expectType<PersistentModelConstructor<LegacyCustomRO>>(model);
			expectType<LegacyCustomRO>(element);
		});
		DataStore.observe(dummyInstance<LegacyCustomRO>()).subscribe(
			({ model, element }) => {
				expectType<PersistentModelConstructor<LegacyCustomRO>>(model);
				expectType<LegacyCustomRO>(element);
			}
		);

		// Observe query
		DataStore.observeQuery(LegacyCustomRO).subscribe(({ items }) => {
			expectType<LegacyCustomRO[]>(items);
		});
		DataStore.observeQuery(LegacyCustomRO, c =>
			c.description('notContains', 'something')
		).subscribe(({ items }) => {
			expectType<LegacyCustomRO[]>(items);
		});
		DataStore.observeQuery(
			LegacyCustomRO,
			c => c.description('notContains', 'something'),
			{ sort: c => c.createdOn('ASCENDING') }
		).subscribe(({ items }) => {
			expectType<LegacyCustomRO[]>(items);
		});
	});

	test(`CustomIdentifierNoRO`, async () => {
		expectType<ModelInit<CustomIdentifierNoRO>>({
			// @ts-expect-error
			// id: '234',
			myId: '23342',
			name: '',
			description: '',
		});

		expectType<ModelInit<CustomIdentifierNoRO>>({
			myId: '23342',
			name: '',
			description: '',
			createdAt: '',
		});

		expectType<ModelInit<CustomIdentifierNoRO>>({
			myId: '23342',
			name: '',
			description: '',
			createdAt: '',
		});

		CustomIdentifierNoRO.copyOf({} as CustomIdentifierNoRO, d => {
			d.myId;
			// @ts-expect-error
			// d.myId = '';

			d.name = '';
			d.description = '';

			d.createdAt;
			d.createdAt = '';

			d.updatedAt;
			d.updatedAt = '';

			// @ts-expect-error
			// d.createdOn;

			// @ts-expect-error
			// d.updatedOn;
		});

		// Query
		expectType<CustomIdentifierNoRO>(
			await DataStore.query(CustomIdentifierNoRO, 'someid')
		);
		expectType<CustomIdentifierNoRO>(
			await DataStore.query(CustomIdentifierNoRO, { myId: 'someid' })
		);
		expectType<CustomIdentifierNoRO[]>(
			await DataStore.query(CustomIdentifierNoRO)
		);
		expectType<CustomIdentifierNoRO[]>(
			await DataStore.query(CustomIdentifierNoRO, Predicates.ALL)
		);
		expectType<CustomIdentifierNoRO[]>(
			await DataStore.query(CustomIdentifierNoRO, c =>
				c.createdAt('ge', '2019')
			)
		);

		// Save
		expectType<CustomIdentifierNoRO>(
			await DataStore.save(dummyInstance<CustomIdentifierNoRO>())
		);
		expectType<CustomIdentifierNoRO>(
			await DataStore.save(dummyInstance<CustomIdentifierNoRO>(), c =>
				c.createdAt('ge', '2019')
			)
		);

		// Delete
		expectType<CustomIdentifierNoRO[]>(
			await DataStore.delete(CustomIdentifierNoRO, '')
		);
		expectType<CustomIdentifierNoRO>(
			await DataStore.delete(dummyInstance<CustomIdentifierNoRO>())
		);
		expectType<CustomIdentifierNoRO>(
			await DataStore.delete(dummyInstance<CustomIdentifierNoRO>(), c =>
				c.description('contains', 'something')
			)
		);
		expectType<CustomIdentifierNoRO[]>(
			await DataStore.delete(CustomIdentifierNoRO, Predicates.ALL)
		);
		expectType<CustomIdentifierNoRO[]>(
			await DataStore.delete(CustomIdentifierNoRO, c =>
				c.createdAt('le', '2019')
			)
		);

		// Observe
		DataStore.observe(CustomIdentifierNoRO).subscribe(({ model, element }) => {
			expectType<PersistentModelConstructor<CustomIdentifierNoRO>>(model);
			expectType<CustomIdentifierNoRO>(element);
		});
		DataStore.observe(CustomIdentifierNoRO, c =>
			c.description('beginsWith', 'something')
		).subscribe(({ model, element }) => {
			expectType<PersistentModelConstructor<CustomIdentifierNoRO>>(model);
			expectType<CustomIdentifierNoRO>(element);
		});
		DataStore.observe(dummyInstance<CustomIdentifierNoRO>()).subscribe(
			({ model, element }) => {
				expectType<PersistentModelConstructor<CustomIdentifierNoRO>>(model);
				expectType<CustomIdentifierNoRO>(element);
			}
		);

		// Observe query
		DataStore.observeQuery(CustomIdentifierNoRO).subscribe(({ items }) => {
			expectType<CustomIdentifierNoRO[]>(items);
		});
		DataStore.observeQuery(CustomIdentifierNoRO, c =>
			c.description('notContains', 'something')
		).subscribe(({ items }) => {
			expectType<CustomIdentifierNoRO[]>(items);
		});
		DataStore.observeQuery(
			CustomIdentifierNoRO,
			c => c.description('notContains', 'something'),
			{ sort: c => c.createdAt('ASCENDING') }
		).subscribe(({ items }) => {
			expectType<CustomIdentifierNoRO[]>(items);
		});
	});
});
