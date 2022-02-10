// TODO: Look at ts-expect-error once we move to TypeScript 3.9 or above
import Observable from 'zen-observable-ts';
import {
	CompositeIdentifier,
	CustomIdentifier,
	DataStore as DS,
	IdentifierFields,
	ManagedIdentifier,
	ModelInit,
	MutableModel,
	OptionallyManagedIdentifier,
	PersistentModel,
	PersistentModelConstructor,
	Predicates,
	__modelMeta__,
} from '../src';

//#region test helpers
function expectType<T>(_param: T): _param is T {
	return true;
}

function dummyInstance<T extends PersistentModel>(): T {
	return <T>{};
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
//#endregion

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
		return <LegacyCustomRO>(<unknown>undefined);
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
		return <LegacyDefaultRO>(<unknown>undefined);
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
		return <LegacyNoMetadata>(<unknown>undefined);
	}
}

//#endregion

//#region Managed

class ManagedCustomRO {
	readonly [__modelMeta__]: {
		identifier: ManagedIdentifier<ManagedCustomRO, 'id'>;
		readOnlyFields: 'createdOn' | 'updatedOn';
	};
	readonly id: string;
	readonly name: string;
	readonly description?: string;
	readonly createdOn?: string;
	readonly updatedOn?: string;
	constructor(init: ModelInit<ManagedCustomRO>) {}
	static copyOf(
		source: ManagedCustomRO,
		mutator: (
			draft: MutableModel<ManagedCustomRO>
		) => MutableModel<ManagedCustomRO> | void
	): ManagedCustomRO {
		return <ManagedCustomRO>(<unknown>undefined);
	}
}

class ManagedDefaultRO {
	readonly [__modelMeta__]: {
		identifier: ManagedIdentifier<ManagedDefaultRO, 'id'>;
		readOnlyFields: 'createdAt' | 'updatedAt';
	};
	readonly id: string;
	readonly name: string;
	readonly description?: string;
	readonly createdAt?: string;
	readonly updatedAt?: string;
	constructor(init: ModelInit<ManagedDefaultRO>) {}
	static copyOf(
		source: ManagedDefaultRO,
		mutator: (
			draft: MutableModel<ManagedDefaultRO>
		) => MutableModel<ManagedDefaultRO> | void
	): ManagedDefaultRO {
		return <ManagedDefaultRO>(<unknown>undefined);
	}
}

//#endregion

//#region Optionally Managed

class OptionallyManagedCustomRO {
	readonly [__modelMeta__]: {
		identifier: OptionallyManagedIdentifier<OptionallyManagedCustomRO, 'id'>;
		readOnlyFields: 'createdOn' | 'updatedOn';
	};
	readonly id: string;
	readonly name: string;
	readonly description?: string;
	readonly createdOn?: string;
	readonly updatedOn?: string;
	constructor(init: ModelInit<OptionallyManagedCustomRO>) {}
	static copyOf(
		source: OptionallyManagedCustomRO,
		mutator: (
			draft: MutableModel<OptionallyManagedCustomRO>
		) => MutableModel<OptionallyManagedCustomRO> | void
	): OptionallyManagedCustomRO {
		return <OptionallyManagedCustomRO>(<unknown>undefined);
	}
}

class OptionallyManagedDefaultRO {
	readonly [__modelMeta__]: {
		identifier: OptionallyManagedIdentifier<OptionallyManagedDefaultRO, 'id'>;
		readOnlyFields: 'createdAt' | 'updatedAt';
	};
	readonly id: string;
	readonly name: string;
	readonly description?: string;
	readonly createdAt?: string;
	readonly updatedAt?: string;
	constructor(init: ModelInit<OptionallyManagedDefaultRO>) {}
	static copyOf(
		source: OptionallyManagedDefaultRO,
		mutator: (
			draft: MutableModel<OptionallyManagedDefaultRO>
		) => MutableModel<OptionallyManagedDefaultRO> | void
	): OptionallyManagedDefaultRO {
		return <OptionallyManagedDefaultRO>(<unknown>undefined);
	}
}

//#endregion

//#region Composite

class CompositeCustomRO {
	readonly [__modelMeta__]: {
		identifier: CompositeIdentifier<CompositeCustomRO, ['tenant', 'dob']>;
		readOnlyFields: 'createdOn' | 'updatedOn';
	};
	readonly tenant: string;
	readonly dob: string;
	readonly name: string;
	readonly description?: string;
	readonly createdOn?: string;
	readonly updatedOn?: string;
	constructor(init: ModelInit<CompositeCustomRO>) {}
	static copyOf(
		source: CompositeCustomRO,
		mutator: (
			draft: MutableModel<CompositeCustomRO>
		) => MutableModel<CompositeCustomRO> | void
	): CompositeCustomRO {
		return <CompositeCustomRO>(<unknown>undefined);
	}
}

class CompositeDefaultRO {
	readonly [__modelMeta__]: {
		identifier: CompositeIdentifier<CompositeDefaultRO, ['tenant', 'dob']>;
		readOnlyFields: 'createdAt' | 'updatedAt';
	};
	readonly tenant: string;
	readonly dob: string;
	readonly name: string;
	readonly description?: string;
	readonly createdAt?: string;
	readonly updatedAt?: string;
	constructor(init: ModelInit<CompositeDefaultRO>) {}
	static copyOf(
		source: CompositeDefaultRO,
		mutator: (
			draft: MutableModel<CompositeDefaultRO>
		) => MutableModel<CompositeDefaultRO> | void
	): CompositeDefaultRO {
		return <CompositeDefaultRO>(<unknown>undefined);
	}
}

//#endregion

//#region Custom

class CustomIdentifierCustomRO {
	readonly [__modelMeta__]: {
		identifier: CustomIdentifier<CustomIdentifierCustomRO, 'myId'>;
		readOnlyFields: 'createdOn' | 'updatedOn';
	};
	readonly myId: string;
	readonly name: string;
	readonly description?: string;
	readonly createdOn: string;
	readonly updatedOn: string;
	constructor(init: ModelInit<CustomIdentifierCustomRO>) {}
	static copyOf(
		source: CustomIdentifierCustomRO,
		mutator: (
			draft: MutableModel<CustomIdentifierCustomRO>
		) => MutableModel<CustomIdentifierCustomRO> | void
	): CustomIdentifierCustomRO {
		return <CustomIdentifierCustomRO>(<unknown>undefined);
	}
}

class CustomIdentifierDefaultRO {
	readonly [__modelMeta__]: {
		identifier: CustomIdentifier<CustomIdentifierDefaultRO, 'myId'>;
		readOnlyFields: 'createdAt' | 'updatedAt';
	};
	readonly myId: string;
	readonly name: string;
	readonly description?: string;
	readonly createdAt?: string;
	readonly updatedAt?: string;
	constructor(init: ModelInit<CustomIdentifierDefaultRO>) {}
	static copyOf(
		source: CustomIdentifierDefaultRO,
		mutator: (
			draft: MutableModel<CustomIdentifierDefaultRO>
		) => MutableModel<CustomIdentifierDefaultRO> | void
	): CustomIdentifierDefaultRO {
		return <CustomIdentifierDefaultRO>(<unknown>undefined);
	}
}

class CustomIdentifierNoRO {
	readonly [__modelMeta__]: {
		identifier: CustomIdentifier<CustomIdentifierNoRO, 'myId'>;
	};
	readonly myId: string;
	readonly name: string;
	readonly description?: string;
	readonly createdAt?: string;
	readonly updatedAt?: string;
	constructor(init: ModelInit<CustomIdentifierNoRO>) {}
	static copyOf(
		source: CustomIdentifierNoRO,
		mutator: (
			draft: MutableModel<CustomIdentifierNoRO>
		) => MutableModel<CustomIdentifierNoRO> | void
	): CustomIdentifierDefaultRO {
		return undefined;
	}
}

//#endregion

//#endregion

describe('IdentifierFields', () => {
	test('Types for identifiers match model definition', () => {
		expectType<'id'>(undefined as IdentifierFields<LegacyNoMetadata>);

		expectType<'id'>(undefined as IdentifierFields<LegacyCustomRO>);

		expectType<'id'>(
			undefined as IdentifierFields<
				ManagedCustomRO,
				ManagedCustomRO[typeof __modelMeta__]
			>
		);

		expectType<'id'>(
			undefined as IdentifierFields<
				OptionallyManagedCustomRO,
				OptionallyManagedCustomRO[typeof __modelMeta__]
			>
		);

		expectType<'myId'>(
			undefined as IdentifierFields<
				CustomIdentifierCustomRO,
				CustomIdentifierCustomRO[typeof __modelMeta__]
			>
		);

		expectType<'tenant' | 'dob'>(
			undefined as IdentifierFields<
				CompositeCustomRO,
				CompositeCustomRO[typeof __modelMeta__]
			>
		);
	});
});

describe('ModelInit and MutableModel typings (no runtime validation)', () => {
	test('Observe all', () => {
		DataStore.observe().subscribe(({ model, element }) => {
			expectType<PersistentModelConstructor<any>>(model);
			expectType<PersistentModel>(element);

			element.id;
			element.anything;
		});
	});

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
			DataStore.observe(CustomIdentifierNoRO).subscribe(
				({ model, element }) => {
					expectType<PersistentModelConstructor<CustomIdentifierNoRO>>(model);
					expectType<CustomIdentifierNoRO>(element);
				}
			);
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

	describe('Managed Identifier', () => {
		test(`ManagedDefaultRO`, async () => {
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
			expectType<ManagedDefaultRO | undefined>(
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
				expectType<PersistentModelConstructor<ManagedDefaultRO>>(model);
				expectType<ManagedDefaultRO>(element);
			});
			DataStore.observe(ManagedDefaultRO, c =>
				c.description('beginsWith', 'something')
			).subscribe(({ model, element }) => {
				expectType<PersistentModelConstructor<ManagedDefaultRO>>(model);
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

		test(`ManagedCustomRO`, async () => {
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
			expectType<ManagedCustomRO | undefined>(
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
				expectType<PersistentModelConstructor<ManagedCustomRO>>(model);
				expectType<ManagedCustomRO>(element);
			});
			DataStore.observe(ManagedCustomRO, c =>
				c.description('beginsWith', 'something')
			).subscribe(({ model, element }) => {
				expectType<PersistentModelConstructor<ManagedCustomRO>>(model);
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
					expectType<PersistentModelConstructor<OptionallyManagedDefaultRO>>(
						model
					);
					expectType<OptionallyManagedDefaultRO>(element);
				}
			);
			DataStore.observe(OptionallyManagedDefaultRO, c =>
				c.description('beginsWith', 'something')
			).subscribe(({ model, element }) => {
				expectType<PersistentModelConstructor<OptionallyManagedDefaultRO>>(
					model
				);
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
					expectType<PersistentModelConstructor<OptionallyManagedCustomRO>>(
						model
					);
					expectType<OptionallyManagedCustomRO>(element);
				}
			);
			DataStore.observe(OptionallyManagedCustomRO, c =>
				c.description('beginsWith', 'something')
			).subscribe(({ model, element }) => {
				expectType<PersistentModelConstructor<OptionallyManagedCustomRO>>(
					model
				);
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
				expectType<PersistentModelConstructor<CompositeDefaultRO>>(model);
				expectType<CompositeDefaultRO>(element);
			});
			DataStore.observe(CompositeDefaultRO, c =>
				c.description('beginsWith', 'something')
			).subscribe(({ model, element }) => {
				expectType<PersistentModelConstructor<CompositeDefaultRO>>(model);
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
});
