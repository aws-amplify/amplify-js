// TODO: Look at ts-expect-error once we move to TypeScript 3.9 or above
import {
	CompositeIdentifier,
	CustomIdentifier,
	ManagedIdentifier,
	ModelInit,
	MutableModel,
	OptionallyManagedIdentifier,
	DataStore as DS,
	Predicates,
	PersistentModel,
	PersistentModelConstructor,
	DefaultPersistentModelMetaData,
	PersistentModelMetaData,
	IdentifierFields,
} from '../src';
import Observable from 'zen-observable-ts';

function expectType<T>(param: T): param is T {
	return true;
}

function dummyInstance<
	T extends PersistentModel<
		M extends never ? DefaultPersistentModelMetaData : M
	>,
	M extends PersistentModelMetaData = unknown
>(): T {
	return undefined;
}

const DataStore: typeof DS = (() => {
	class clazz {}

	const proxy = new Proxy(clazz, {
		get: (_, prop) => {
			const p = prop as keyof typeof DS;

			switch (p) {
				case 'query':
				case 'save':
				case 'delete':
					return () => new Proxy({}, {});
				case 'observe':
				case 'observeQuery':
					return () => Observable.of();
			}
		},
	}) as unknown as typeof DS;

	return proxy;
})();

//#region Types

//#region Legacy

type LegacyCustomROMETA = {
	readOnlyFields: 'createdOn' | 'updatedOn';
};
class LegacyCustomRO {
	readonly id: string;
	readonly name: string;
	readonly description?: string;
	readonly createdOn?: string;
	readonly updatedOn?: string;
	constructor(init: ModelInit<LegacyCustomRO, LegacyCustomROMETA>) {}
	static copyOf(
		source: LegacyCustomRO,
		mutator: (
			draft: MutableModel<LegacyCustomRO, LegacyCustomROMETA>
		) => MutableModel<LegacyCustomRO, LegacyCustomROMETA> | void
	): LegacyCustomRO {
		return undefined;
	}
}

type LegacyDefaultROMETA = {
	readOnlyFields: 'createdAt' | 'updatedAt';
};
class LegacyDefaultRO {
	readonly id: string;
	readonly name: string;
	readonly description?: string;
	readonly createdAt?: string;
	readonly updatedAt?: string;
	constructor(init: ModelInit<LegacyDefaultRO, LegacyDefaultROMETA>) {}
	static copyOf(
		source: LegacyDefaultRO,
		mutator: (
			draft: MutableModel<LegacyDefaultRO, LegacyDefaultROMETA>
		) => MutableModel<LegacyDefaultRO, LegacyDefaultROMETA> | void
	): LegacyDefaultRO {
		return undefined;
	}
}

class LegacyNoMetadata {
	readonly id: string;
	readonly name: string;
	readonly description?: string;
	readonly createdAt?: string;
	readonly updatedAt?: string;
	constructor(init: ModelInit<LegacyNoMetadata>) {}
	static copyOf(
		source: LegacyNoMetadata,
		mutator: (
			draft: MutableModel<LegacyNoMetadata>
		) => MutableModel<LegacyNoMetadata> | void
	): LegacyNoMetadata {
		return undefined;
	}
}

//#endregion

//#region Managed

type ManagedCustomROMETA = {
	identifier: ManagedIdentifier<ManagedCustomRO>;
	readOnlyFields: 'createdOn' | 'updatedOn';
};
class ManagedCustomRO {
	readonly id: string;
	readonly name: string;
	readonly description?: string;
	readonly createdOn?: string;
	readonly updatedOn?: string;
	constructor(init: ModelInit<ManagedCustomRO, ManagedCustomROMETA>) {}
	static copyOf(
		source: ManagedCustomRO,
		mutator: (
			draft: MutableModel<ManagedCustomRO, ManagedCustomROMETA>
		) => MutableModel<ManagedCustomRO, ManagedCustomROMETA> | void
	): ManagedCustomRO {
		return undefined;
	}
}

type ManagedDefaultROMETA = {
	identifier: ManagedIdentifier<ManagedDefaultRO>;
	readOnlyFields: 'createdAt' | 'updatedAt';
};
class ManagedDefaultRO {
	readonly id: string;
	readonly name: string;
	readonly description?: string;
	readonly createdAt?: string;
	readonly updatedAt?: string;
	constructor(init: ModelInit<ManagedDefaultRO, ManagedDefaultROMETA>) {}
	static copyOf(
		source: ManagedDefaultRO,
		mutator: (
			draft: MutableModel<ManagedDefaultRO, ManagedDefaultROMETA>
		) => MutableModel<ManagedDefaultRO, ManagedDefaultROMETA> | void
	): ManagedDefaultRO {
		return undefined;
	}
}

//#endregion

//#region Optionally Managed

type OptionallyManagedCustomROMETA = {
	identifier: OptionallyManagedIdentifier<OptionallyManagedCustomRO>;
	readOnlyFields: 'createdOn' | 'updatedOn';
};
class OptionallyManagedCustomRO {
	readonly id: string;
	readonly name: string;
	readonly description?: string;
	readonly createdOn?: string;
	readonly updatedOn?: string;
	constructor(
		init: ModelInit<OptionallyManagedCustomRO, OptionallyManagedCustomROMETA>
	) {}
	static copyOf(
		source: OptionallyManagedCustomRO,
		mutator: (
			draft: MutableModel<
				OptionallyManagedCustomRO,
				OptionallyManagedCustomROMETA
			>
		) => MutableModel<
			OptionallyManagedCustomRO,
			OptionallyManagedCustomROMETA
		> | void
	): OptionallyManagedCustomRO {
		return undefined;
	}
}

type OptionallyManagedDefaultROMETA = {
	identifier: OptionallyManagedIdentifier<OptionallyManagedDefaultRO>;
	readOnlyFields: 'createdAt' | 'updatedAt';
};
class OptionallyManagedDefaultRO {
	readonly id: string;
	readonly name: string;
	readonly description?: string;
	readonly createdAt?: string;
	readonly updatedAt?: string;
	constructor(
		init: ModelInit<OptionallyManagedDefaultRO, OptionallyManagedDefaultROMETA>
	) {}
	static copyOf(
		source: OptionallyManagedDefaultRO,
		mutator: (
			draft: MutableModel<
				OptionallyManagedDefaultRO,
				OptionallyManagedDefaultROMETA
			>
		) => MutableModel<
			OptionallyManagedDefaultRO,
			OptionallyManagedDefaultROMETA
		> | void
	): OptionallyManagedDefaultRO {
		return undefined;
	}
}

//#endregion

//#region Composite

type CompositeCustomROMETA = {
	identifier: CompositeIdentifier<CompositeCustomRO, ['tenant', 'dob']>;
	readOnlyFields: 'createdOn' | 'updatedOn';
};

class CompositeCustomRO {
	readonly tenant: string;
	readonly dob: string;
	readonly name: string;
	readonly description?: string;
	readonly createdOn?: string;
	readonly updatedOn?: string;
	constructor(init: ModelInit<CompositeCustomRO, CompositeCustomROMETA>) {}
	static copyOf(
		source: CompositeCustomRO,
		mutator: (
			draft: MutableModel<CompositeCustomRO, CompositeCustomROMETA>
		) => MutableModel<CompositeCustomRO, CompositeCustomROMETA> | void
	): CompositeCustomRO {
		return undefined;
	}
}

type CompositeDefaultROMETA = {
	identifier: CompositeIdentifier<CompositeDefaultRO, ['tenant', 'dob']>;
	readOnlyFields: 'createdAt' | 'updatedAt';
};
class CompositeDefaultRO {
	readonly tenant: string;
	readonly dob: string;
	readonly name: string;
	readonly description?: string;
	readonly createdAt?: string;
	readonly updatedAt?: string;
	constructor(init: ModelInit<CompositeDefaultRO, CompositeDefaultROMETA>) {}
	static copyOf(
		source: CompositeDefaultRO,
		mutator: (
			draft: MutableModel<CompositeDefaultRO, CompositeDefaultROMETA>
		) => MutableModel<CompositeDefaultRO, CompositeDefaultROMETA> | void
	): CompositeDefaultRO {
		return undefined;
	}
}

//#endregion

//#region Custom

type CustomIdentifierCustomROMETA = {
	identifier: CustomIdentifier<CustomIdentifierCustomRO, 'myId'>;
	readOnlyFields: 'createdOn' | 'updatedOn';
};

class CustomIdentifierCustomRO {
	readonly myId: string;
	readonly name: string;
	readonly description?: string;
	readonly createdOn?: string;
	readonly updatedOn?: string;
	constructor(
		init: ModelInit<CustomIdentifierCustomRO, CustomIdentifierCustomROMETA>
	) {}
	static copyOf(
		source: CustomIdentifierCustomRO,
		mutator: (
			draft: MutableModel<
				CustomIdentifierCustomRO,
				CustomIdentifierCustomROMETA
			>
		) => MutableModel<
			CustomIdentifierCustomRO,
			CustomIdentifierCustomROMETA
		> | void
	): CustomIdentifierCustomRO {
		return undefined;
	}
}

type CustomIdentifierDefaultROMETA = {
	identifier: CustomIdentifier<CustomIdentifierDefaultRO, 'myId'>;
	readOnlyFields: 'createdAt' | 'updatedAt';
};
class CustomIdentifierDefaultRO {
	readonly myId: string;
	readonly name: string;
	readonly description?: string;
	readonly createdAt?: string;
	readonly updatedAt?: string;
	constructor(
		init: ModelInit<CustomIdentifierDefaultRO, CustomIdentifierDefaultROMETA>
	) {}
	static copyOf(
		source: CustomIdentifierDefaultRO,
		mutator: (
			draft: MutableModel<
				CustomIdentifierDefaultRO,
				CustomIdentifierDefaultROMETA
			>
		) => MutableModel<
			CustomIdentifierDefaultRO,
			CustomIdentifierDefaultROMETA
		> | void
	): CustomIdentifierDefaultRO {
		return undefined;
	}
}

//#endregion

//#endregion

describe('IdentifierFields', () => {
	test('Types for identifiers match model definition', () => {
		expectType<{ id: string }>({} as IdentifierFields<ManagedIdentifier<any>>);
		expectType<{ id: string }>(
			{} as IdentifierFields<ManagedIdentifier<{ id: string }>>
		);

		expectType<{ id?: string }>(
			{} as IdentifierFields<OptionallyManagedIdentifier<{ id: string }>>
		);
		expectType<{ id?: string }>(
			{} as IdentifierFields<OptionallyManagedIdentifier<{ id: string }>>
		);

		expectType<{ id: string }>(
			{} as IdentifierFields<CustomIdentifier<any, 'id'>>
		);
		expectType<{ id: string }>(
			{} as IdentifierFields<CustomIdentifier<{ id: string }, 'id'>>
		);
		expectType<{ myId: string }>(
			{} as IdentifierFields<CustomIdentifier<{ myId: string }, 'myId'>>
		);

		expectType<{ tenant: string; company: number }>(
			{} as IdentifierFields<
				CompositeIdentifier<
					{ tenant: string; company: number; someOtherField: boolean },
					['tenant', 'company']
				>
			>
		);

		expectType<{ tenant: string; company: string }>(
			{} as IdentifierFields<
				CompositeIdentifier<
					{ tenant: string; company: string; someOtherField: boolean },
					['tenant', 'company']
				>
			>
		);
	});
});

describe('ModelInit and MutableModel typings (no runtime validation)', () => {
	test('Observe all', () => {
		DataStore.observe().subscribe(({ model, element }) => {
			expectType<PersistentModelConstructor<unknown, unknown>>(model);
			expectType<PersistentModel<any>>(element);

			// @ts-expect-error
			// element.id;
		});
	});

	describe('Legacy - backwards compatibility', () => {
		test(`${LegacyNoMetadata.name}`, async () => {
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

			LegacyNoMetadata.copyOf({} as LegacyNoMetadata, d => {
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
			expectType<LegacyNoMetadata>(
				await DataStore.query(LegacyNoMetadata, 'someid')
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

		test(`${LegacyDefaultRO.name}`, async () => {
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
			expectType<LegacyDefaultRO[]>(
				await DataStore.delete(LegacyDefaultRO, '')
			);
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

		test(`${LegacyCustomRO.name}`, async () => {
			expectType<ModelInit<LegacyCustomRO>>({
				// @ts-expect-error
				// id: '234',
				name: '',
				description: '',
			});

			expectType<ModelInit<LegacyCustomRO>>({
				name: '',
				description: '',
				// @ts-expect-error
				// x: 234,
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
			expectType<LegacyCustomRO>(
				await DataStore.query(LegacyCustomRO, 'someid')
			);
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
				expectType<
					PersistentModelConstructor<LegacyCustomRO, LegacyCustomROMETA>
				>(model);
				expectType<LegacyCustomRO>(element);
			});
			DataStore.observe(LegacyCustomRO, c =>
				c.description('beginsWith', 'something')
			).subscribe(({ model, element }) => {
				expectType<
					PersistentModelConstructor<LegacyCustomRO, LegacyCustomROMETA>
				>(model);
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
	});

	describe('Managed Identifier', () => {
		test(`${ManagedDefaultRO.name}`, async () => {
			expectType<ModelInit<ManagedDefaultRO>>({
				// @ts-expect-error
				// id: 'eeeeeee',
				name: '',
				description: '',
			});

			expectType<ModelInit<ManagedDefaultRO>>({
				name: '',
				description: '',
				// @ts-expect-error
				// x: 234,
			});

			expectType<ModelInit<ManagedDefaultRO>>({
				name: '',
				description: '',
				// @ts-expect-error
				// x: 234,
			});

			ManagedDefaultRO.copyOf({} as ManagedDefaultRO, d => {
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
			expectType<ManagedDefaultRO>(
				await DataStore.query(ManagedDefaultRO, 'someid')
			);
			expectType<ManagedDefaultRO[]>(await DataStore.query(ManagedDefaultRO));
			expectType<ManagedDefaultRO[]>(
				await DataStore.query(ManagedDefaultRO, Predicates.ALL)
			);
			expectType<ManagedDefaultRO[]>(
				await DataStore.query(ManagedDefaultRO, c => c.createdAt('ge', '2019'))
			);

			// Save
			expectType<ManagedDefaultRO>(
				await DataStore.save(dummyInstance<ManagedDefaultRO>())
			);
			expectType<ManagedDefaultRO>(
				await DataStore.save(dummyInstance<ManagedDefaultRO>(), c =>
					c.createdAt('ge', '2019')
				)
			);

			// Delete
			expectType<ManagedDefaultRO[]>(
				await DataStore.delete(ManagedDefaultRO, '')
			);
			expectType<ManagedDefaultRO>(
				await DataStore.delete(dummyInstance<ManagedDefaultRO>())
			);
			expectType<ManagedDefaultRO>(
				await DataStore.delete(dummyInstance<ManagedDefaultRO>(), c =>
					c.description('contains', 'something')
				)
			);
			expectType<ManagedDefaultRO[]>(
				await DataStore.delete(ManagedDefaultRO, Predicates.ALL)
			);
			expectType<ManagedDefaultRO[]>(
				await DataStore.delete(ManagedDefaultRO, c => c.createdAt('le', '2019'))
			);

			// Observe
			DataStore.observe(ManagedDefaultRO).subscribe(({ model, element }) => {
				expectType<
					PersistentModelConstructor<ManagedDefaultRO, ManagedDefaultROMETA>
				>(model);
				expectType<ManagedDefaultRO>(element);
			});
			DataStore.observe(ManagedDefaultRO, c =>
				c.description('beginsWith', 'something')
			).subscribe(({ model, element }) => {
				expectType<
					PersistentModelConstructor<ManagedDefaultRO, ManagedDefaultROMETA>
				>(model);
				expectType<ManagedDefaultRO>(element);
			});
			DataStore.observe(dummyInstance<ManagedDefaultRO>()).subscribe(
				({ model, element }) => {
					expectType<PersistentModelConstructor<ManagedDefaultRO>>(model);
					expectType<ManagedDefaultRO>(element);
				}
			);

			// Observe query
			DataStore.observeQuery(ManagedDefaultRO).subscribe(({ items }) => {
				expectType<ManagedDefaultRO[]>(items);
			});
			DataStore.observeQuery(ManagedDefaultRO, c =>
				c.description('notContains', 'something')
			).subscribe(({ items }) => {
				expectType<ManagedDefaultRO[]>(items);
			});
			DataStore.observeQuery(
				ManagedDefaultRO,
				c => c.description('notContains', 'something'),
				{ sort: c => c.createdAt('ASCENDING') }
			).subscribe(({ items }) => {
				expectType<ManagedDefaultRO[]>(items);
			});
		});

		test(`${ManagedCustomRO.name}`, async () => {
			expectType<ModelInit<ManagedCustomRO>>({
				// @ts-expect-error
				// id: 'eeeeeee',
				name: '',
				description: '',
			});

			expectType<ModelInit<ManagedCustomRO>>({
				name: '',
				description: '',
				// @ts-expect-error
				// x: 234,
			});

			expectType<ModelInit<ManagedCustomRO>>({
				name: '',
				description: '',
				// @ts-expect-error
				// x: 234,
			});

			ManagedCustomRO.copyOf({} as ManagedCustomRO, d => {
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
			expectType<ManagedCustomRO>(
				await DataStore.query(ManagedCustomRO, 'someid')
			);
			expectType<ManagedCustomRO[]>(await DataStore.query(ManagedCustomRO));
			expectType<ManagedCustomRO[]>(
				await DataStore.query(ManagedCustomRO, Predicates.ALL)
			);
			expectType<ManagedCustomRO[]>(
				await DataStore.query(ManagedCustomRO, c => c.createdOn('ge', '2019'))
			);

			// Save
			expectType<ManagedCustomRO>(
				await DataStore.save(dummyInstance<ManagedCustomRO>())
			);
			expectType<ManagedCustomRO>(
				await DataStore.save(dummyInstance<ManagedCustomRO>(), c =>
					c.createdOn('ge', '2019')
				)
			);

			// Delete
			expectType<ManagedCustomRO[]>(
				await DataStore.delete(ManagedCustomRO, '')
			);
			expectType<ManagedCustomRO>(
				await DataStore.delete(dummyInstance<ManagedCustomRO>())
			);
			expectType<ManagedCustomRO>(
				await DataStore.delete(dummyInstance<ManagedCustomRO>(), c =>
					c.description('contains', 'something')
				)
			);
			expectType<ManagedCustomRO[]>(
				await DataStore.delete(ManagedCustomRO, Predicates.ALL)
			);
			expectType<ManagedCustomRO[]>(
				await DataStore.delete(ManagedCustomRO, c => c.createdOn('le', '2019'))
			);

			// Observe
			DataStore.observe(ManagedCustomRO).subscribe(({ model, element }) => {
				expectType<
					PersistentModelConstructor<ManagedCustomRO, ManagedCustomROMETA>
				>(model);
				expectType<ManagedCustomRO>(element);
			});
			DataStore.observe(ManagedCustomRO, c =>
				c.description('beginsWith', 'something')
			).subscribe(({ model, element }) => {
				expectType<
					PersistentModelConstructor<ManagedCustomRO, ManagedCustomROMETA>
				>(model);
				expectType<ManagedCustomRO>(element);
			});
			DataStore.observe(dummyInstance<ManagedCustomRO>()).subscribe(
				({ model, element }) => {
					expectType<PersistentModelConstructor<ManagedCustomRO>>(model);
					expectType<ManagedCustomRO>(element);
				}
			);

			// Observe query
			DataStore.observeQuery(ManagedCustomRO).subscribe(({ items }) => {
				expectType<ManagedCustomRO[]>(items);
			});
			DataStore.observeQuery(ManagedCustomRO, c =>
				c.description('notContains', 'something')
			).subscribe(({ items }) => {
				expectType<ManagedCustomRO[]>(items);
			});
			DataStore.observeQuery(
				ManagedCustomRO,
				c => c.description('notContains', 'something'),
				{ sort: c => c.createdOn('ASCENDING') }
			).subscribe(({ items }) => {
				expectType<ManagedCustomRO[]>(items);
			});
		});
	});

	describe('Optionally Managed Identifier', () => {
		test(`${OptionallyManagedDefaultRO.name}`, async () => {
			expectType<
				ModelInit<OptionallyManagedDefaultRO, OptionallyManagedDefaultROMETA>
			>({
				id: 'eeeeeee',
				name: '',
				description: '',
			});

			expectType<
				ModelInit<OptionallyManagedDefaultRO, OptionallyManagedDefaultROMETA>
			>({
				name: '',
				description: '',
				// @ts-expect-error
				// x: 234,
			});

			expectType<
				ModelInit<OptionallyManagedDefaultRO, OptionallyManagedDefaultROMETA>
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
			expectType<OptionallyManagedDefaultRO>(
				await DataStore.query(OptionallyManagedDefaultRO, 'someid')
			);
			expectType<OptionallyManagedDefaultRO[]>(
				await DataStore.query(OptionallyManagedDefaultRO)
			);
			expectType<OptionallyManagedDefaultRO[]>(
				await DataStore.query(OptionallyManagedDefaultRO, Predicates.ALL)
			);
			expectType<OptionallyManagedDefaultRO[]>(
				await DataStore.query(OptionallyManagedDefaultRO, c =>
					c.createdAt('ge', '2019')
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
					expectType<
						PersistentModelConstructor<
							OptionallyManagedDefaultRO,
							OptionallyManagedDefaultROMETA
						>
					>(model);
					expectType<OptionallyManagedDefaultRO>(element);
				}
			);
			DataStore.observe(OptionallyManagedDefaultRO, c =>
				c.description('beginsWith', 'something')
			).subscribe(({ model, element }) => {
				expectType<
					PersistentModelConstructor<
						OptionallyManagedDefaultRO,
						OptionallyManagedDefaultROMETA
					>
				>(model);
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
				c.description('notContains', 'something')
			).subscribe(({ items }) => {
				expectType<OptionallyManagedDefaultRO[]>(items);
			});
			DataStore.observeQuery(
				OptionallyManagedDefaultRO,
				c => c.description('notContains', 'something'),
				{ sort: c => c.createdAt('ASCENDING') }
			).subscribe(({ items }) => {
				expectType<OptionallyManagedDefaultRO[]>(items);
			});
		});

		test(`${OptionallyManagedCustomRO.name}`, async () => {
			expectType<
				ModelInit<OptionallyManagedCustomRO, OptionallyManagedCustomROMETA>
			>({
				name: '',
				description: '',
			});

			expectType<
				ModelInit<OptionallyManagedCustomRO, OptionallyManagedCustomROMETA>
			>({
				id: 'eeeeeee',
				name: '',
				description: '',
			});

			expectType<
				ModelInit<OptionallyManagedCustomRO, OptionallyManagedCustomROMETA>
			>({
				name: '',
				description: '',
				// @ts-expect-error
				// x: 234,
			});

			expectType<
				ModelInit<OptionallyManagedCustomRO, OptionallyManagedCustomROMETA>
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
			expectType<OptionallyManagedCustomRO>(
				await DataStore.query(OptionallyManagedCustomRO, 'someid')
			);
			expectType<OptionallyManagedCustomRO[]>(
				await DataStore.query(OptionallyManagedCustomRO)
			);
			expectType<OptionallyManagedCustomRO[]>(
				await DataStore.query(OptionallyManagedCustomRO, Predicates.ALL)
			);
			expectType<OptionallyManagedCustomRO[]>(
				await DataStore.query(OptionallyManagedCustomRO, c =>
					c.createdOn('ge', '2019')
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
					expectType<
						PersistentModelConstructor<
							OptionallyManagedCustomRO,
							OptionallyManagedCustomROMETA
						>
					>(model);
					expectType<OptionallyManagedCustomRO>(element);
				}
			);
			DataStore.observe(OptionallyManagedCustomRO, c =>
				c.description('beginsWith', 'something')
			).subscribe(({ model, element }) => {
				expectType<
					PersistentModelConstructor<
						OptionallyManagedCustomRO,
						OptionallyManagedCustomROMETA
					>
				>(model);
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
			DataStore.observeQuery(OptionallyManagedCustomRO).subscribe(
				({ items }) => {
					expectType<OptionallyManagedCustomRO[]>(items);
				}
			);
			DataStore.observeQuery(OptionallyManagedCustomRO, c =>
				c.description('notContains', 'something')
			).subscribe(({ items }) => {
				expectType<OptionallyManagedCustomRO[]>(items);
			});
			DataStore.observeQuery(
				OptionallyManagedCustomRO,
				c => c.description('notContains', 'something'),
				{ sort: c => c.createdOn('ASCENDING') }
			).subscribe(({ items }) => {
				expectType<OptionallyManagedCustomRO[]>(items);
			});
		});
	});

	describe('Composite Identifier', () => {
		test(`${CompositeDefaultRO.name}`, async () => {
			expectType<ModelInit<CompositeDefaultRO, CompositeDefaultROMETA>>({
				tenant: '',
				dob: '',
				name: '',
				description: '',
			});

			expectType<ModelInit<CompositeDefaultRO, CompositeDefaultROMETA>>({
				tenant: '',
				dob: '',
				name: '',
				description: '',
				// @ts-expect-error
				// x: 234,
			});

			CompositeDefaultRO.copyOf({} as CompositeDefaultRO, d => {
				// @ts-expect-error
				// d.id;
				// @ts-expect-error
				// d.id = '';

				d.tenant;
				// @ts-expect-error
				// d.tenant = '';
				d.dob;
				// @ts-expect-error
				// d.dob = '';

				d.name = '';
				d.description = '';

				d.createdAt;
				// @ts-expect-error
				// d.createdAt = '';

				d.updatedAt;
				// @ts-expect-error
				// d.updatedAt = '';
			});

			// Save
			expectType<CompositeDefaultRO>(
				await DataStore.save(dummyInstance<CompositeDefaultRO>())
			);
			expectType<CompositeDefaultRO>(
				await DataStore.save(dummyInstance<CompositeDefaultRO>(), c =>
					c.createdAt('ge', '2019')
				)
			);

			// Delete
			expectType<CompositeDefaultRO[]>(
				await DataStore.delete(CompositeDefaultRO, '')
			);
			expectType<CompositeDefaultRO>(
				await DataStore.delete(dummyInstance<CompositeDefaultRO>())
			);
			expectType<CompositeDefaultRO>(
				await DataStore.delete(dummyInstance<CompositeDefaultRO>(), c =>
					c.description('contains', 'something')
				)
			);
			expectType<CompositeDefaultRO[]>(
				await DataStore.delete(CompositeDefaultRO, Predicates.ALL)
			);
			expectType<CompositeDefaultRO[]>(
				await DataStore.delete(CompositeDefaultRO, c =>
					c.createdAt('le', '2019')
				)
			);

			// Observe
			DataStore.observe(CompositeDefaultRO).subscribe(({ model, element }) => {
				expectType<
					PersistentModelConstructor<CompositeDefaultRO, CompositeDefaultROMETA>
				>(model);
				expectType<CompositeDefaultRO>(element);
			});
			DataStore.observe(CompositeDefaultRO, c =>
				c.description('beginsWith', 'something')
			).subscribe(({ model, element }) => {
				expectType<
					PersistentModelConstructor<CompositeDefaultRO, CompositeDefaultROMETA>
				>(model);
				expectType<CompositeDefaultRO>(element);
			});

			// Observe query
			DataStore.observeQuery(CompositeDefaultRO).subscribe(({ items }) => {
				expectType<CompositeDefaultRO[]>(items);
			});
			DataStore.observeQuery(CompositeDefaultRO, c =>
				c.description('notContains', 'something')
			).subscribe(({ items }) => {
				expectType<CompositeDefaultRO[]>(items);
			});
			DataStore.observeQuery(
				CompositeDefaultRO,
				c => c.description('notContains', 'something'),
				{ sort: c => c.createdAt('ASCENDING') }
			).subscribe(({ items }) => {
				expectType<CompositeDefaultRO[]>(items);
			});
		});

		test(`${CompositeCustomRO.name}`, async () => {
			expectType<ModelInit<CompositeCustomRO, CompositeCustomROMETA>>({
				tenant: '',
				dob: '',
				name: '',
				description: '',
			});

			expectType<ModelInit<CompositeCustomRO, CompositeCustomROMETA>>({
				tenant: '',
				dob: '',
				name: '',
				description: '',
				// @ts-expect-error
				// x: 234,
			});

			CompositeCustomRO.copyOf({} as CompositeCustomRO, d => {
				// @ts-expect-error
				// d.id;
				// @ts-expect-error
				// d.id = '';

				d.tenant;
				// @ts-expect-error
				// d.tenant = '';
				d.dob;
				// @ts-expect-error
				// d.dob = '';

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

	describe('Custom Identifier', () => {
		test(`${CustomIdentifierDefaultRO.name}`, async () => {
			expectType<
				ModelInit<CustomIdentifierDefaultRO, CustomIdentifierDefaultROMETA>
			>({
				myId: '',
				name: '',
				description: '',
			});

			expectType<
				ModelInit<CustomIdentifierDefaultRO, CustomIdentifierDefaultROMETA>
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

		test(`${CustomIdentifierCustomRO.name}`, async () => {
			expectType<
				ModelInit<CustomIdentifierCustomRO, CustomIdentifierCustomROMETA>
			>({
				myId: '',
				name: '',
				description: '',
			});

			expectType<
				ModelInit<CustomIdentifierCustomRO, CustomIdentifierCustomROMETA>
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
});
