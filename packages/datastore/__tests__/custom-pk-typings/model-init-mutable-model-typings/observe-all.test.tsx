import {
	PersistentModel,
	PersistentModelConstructor,
	__modelMeta__,
} from '../../../src';
import { DataStore, expectType } from '../../helpers';

test('Observe all', () => {
	DataStore.observe().subscribe(({ model, element }) => {
		expectType<PersistentModelConstructor<any>>(model);
		expectType<PersistentModel>(element);

		element.id;
		element.anything;
	});
});
