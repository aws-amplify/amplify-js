import { Adapter } from '..';
import adapter from '../AsyncStorageAdapter';

// @ts-ignore
// Type '() => AsyncStorageAdapter' is not assignable to type '() => Adapter'.
//   Call signature return types 'AsyncStorageAdapter' and 'Adapter' are incompatible.
//     The types of 'setUp' are incompatible between these types.
//       Type '(theSchema: InternalSchema, namespaceResolver: NamespaceResolver, modelInstanceCreator: <T extends Readonly<{ id: string; } & Record<string, any>> = Readonly<{ ...; } & Record<...>>>(modelConstructor: PersistentModelConstructor<...>, init: Pick<...> & Partial<...>) => T, getModelConstructorByModelName: (namsespaceNa...' is not assignable to type '(schema: InternalSchema, namespaceResolver: NamespaceResolver, getModelConstructorByModelName: (namsespaceName: string, modelName: string) => PersistentModelConstructor<any>) => Promise<...>'.
const getDefaultAdapter: () => Adapter = () => {
	return adapter;
};

export default getDefaultAdapter;
