import { Observable, of } from 'rxjs';
import { ModelInit, __modelMeta__ } from '../../../src/types';
import {
	DataStore as DS,
	CompositeIdentifier,
	CustomIdentifier,
	ManagedIdentifier,
	MutableModel,
	OptionallyManagedIdentifier,
} from '../../../src';

export const DataStore: typeof DS = (() => {
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
					return () => of({});
			}
		},
	}) as unknown as typeof DS;

	return proxy;
})();

//#region Types

//#region Legacy

export type LegacyCustomROMETA = {
	readOnlyFields: 'createdOn' | 'updatedOn';
};

export class LegacyCustomRO {
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

export type LegacyDefaultROMETA = {
	readOnlyFields: 'createdAt' | 'updatedAt';
};

export class LegacyDefaultRO {
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

export class LegacyNoMetadata {
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

export class ManagedCustomRO {
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

export class ManagedDefaultRO {
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

export class OptionallyManagedCustomRO {
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

export class OptionallyManagedDefaultRO {
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

export class CompositeCustomRO {
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

export class CompositeDefaultRO {
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

export class CustomIdentifierCustomRO {
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

export class CustomIdentifierDefaultRO {
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

export class CustomIdentifierNoRO {
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
		return undefined!;
	}
}

//#endregion

//#endregion
