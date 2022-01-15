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
} from '../src';
import Observable from 'zen-observable-ts';

function expectType<T>(param: T): param is T {
	return true;
}

function dummyInstance<T>(): T {
	return undefined;
}

const DataStore: typeof DS = (function (): typeof DS {
	class clazz {}

	const proxy = new Proxy(clazz, {
		get: function (_, prop) {
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

describe('ModelInit and MutableModel typings (no runtime validation)', () => {
	test('Observe all', () => {
		DataStore.observe().subscribe(({ model, element }) => {
			expectType<PersistentModelConstructor<any>>(model);
			expectType<PersistentModel<any>>(element);
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
