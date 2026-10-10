// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

/**
 * Type-level assertions that the deprecated `AmplifyServer` compat surface
 * (`Context`, `ContextToken`, `RunOperationWithContext`, `ContextSpec`)
 * resolves from core's `internals/adapter-core` entry (src/adapterCore), and
 * that the shapes stay consistent with the ones exported from
 * `aws-amplify/adapter-core` (packages/aws-amplify/src/adapter-core/AmplifyServer.ts).
 *
 * These checks fail at compile time (ts-jest), so the runtime test below is a
 * smoke assertion only.
 */
import type { AmplifyServer, ContextSpec } from '../../src/adapterCore';
import type { AmplifyContext } from '../../src/context/AmplifyContext';
import type {
	LibraryOptions,
	ResourcesConfig,
} from '../../src/singleton/types';
import { createAmplifyContext } from '../../src/context/createAmplifyContext';

type Equal<X, Y> =
	(<T>() => T extends X ? 1 : 2) extends <T>() => T extends Y ? 1 : 2
		? true
		: false;
type Expect<T extends true> = T;

// `AmplifyServer.ContextSpec` and the flat `ContextSpec` alias both resolve to
// the branded `AmplifyContext`.
type _ContextSpecIsAmplifyContext = Expect<
	Equal<AmplifyServer.ContextSpec, AmplifyContext>
>;
type _FlatContextSpecIsAmplifyContext = Expect<
	Equal<ContextSpec, AmplifyContext>
>;

// `AmplifyServer.ContextToken` keeps the legacy `{ readonly value: symbol }` shape.
type _ContextTokenShape = Expect<
	Equal<AmplifyServer.ContextToken['value'], symbol>
>;
const token: AmplifyServer.ContextToken = { value: Symbol('test') };

// `AmplifyServer.Context` wraps an `AmplifyContext` under the legacy `amplify` key.
type _ContextAmplifyIsAmplifyContext = Expect<
	Equal<AmplifyServer.Context['amplify'], AmplifyContext>
>;
// Real branded context for the assignability + runtime smoke assertions below.
const realContext: AmplifyContext = createAmplifyContext({});
const legacyContext: AmplifyServer.Context = { amplify: realContext };

// `AmplifyServer.RunOperationWithContext` keeps the legacy call signature with
// the operation's `contextSpec` mapped onto `AmplifyContext`.
const runOperation: AmplifyServer.RunOperationWithContext = async <Result>(
	_amplifyConfig: ResourcesConfig,
	_libraryOptions: LibraryOptions,
	operation: (
		contextSpec: AmplifyServer.ContextSpec,
	) => Result | Promise<Result>,
): Promise<Result> => operation(realContext);

describe('adapterCore AmplifyServer compat types', () => {
	it('compiles the deprecated AmplifyServer type surface from the internals/adapter-core entry', () => {
		// The real assertions are the compile-time checks above; this keeps the
		// suite non-empty and the declarations referenced.
		expect(typeof token.value).toBe('symbol');
		expect(legacyContext.amplify).toBe(realContext);
		expect(typeof runOperation).toBe('function');
	});
});
