import { AuthClass } from '@aws-amplify/auth';
import { DataStoreClass } from '@aws-amplify/datastore';
import { NextPageContext } from 'next';

// TODO Export all public categories
type Instances = {
	Auth: AuthClass;
	DataStore: DataStoreClass;
};

export function withServerContext(
	context: Pick<NextPageContext, 'req'>
): Instances {
	return {
		// TODO Use UniversalStorage
		Auth: new AuthClass(null),
		// TODO Store models in their own namespace
		DataStore: new DataStoreClass(),
	};
}
