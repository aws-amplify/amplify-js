// TODO: Look at ts-expect-error once we move to TypeScript 3.9 or above
import {
	IdentifierFields,
	// ModelInit,
	// PersistentModel,
	// PersistentModelConstructor,
	// Predicates,
	__modelMeta__,
} from '../../src';
import {
	// DataStore,
	// dummyInstance,
	expectType,
	// LegacyCustomROMETA,
	// LegacyDefaultRO,
	LegacyCustomRO,
	LegacyNoMetadata,
	ManagedCustomRO,
	// ManagedDefaultRO,
	OptionallyManagedCustomRO,
	// OptionallyManagedDefaultRO,
	CompositeCustomRO,
	// CompositeDefaultRO,
	CustomIdentifierCustomRO,
	// CustomIdentifierDefaultRO,
	// CustomIdentifierNoRO,
} from '../helpers';

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
