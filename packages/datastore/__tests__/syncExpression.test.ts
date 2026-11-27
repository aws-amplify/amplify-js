import { syncExpression, PerModelSyncConfig } from '../src/types';
import { Predicates } from '../src/predicates';

// Minimal fake model constructor — syncExpression only stores the reference,
// it doesn't inspect it.
const FakeModel: any = function FakeModel() {};
FakeModel.copyOf = () => {};

describe('syncExpression', () => {
	test('returns syncConfig when provided', async () => {
		const config: PerModelSyncConfig = { syncPageSize: 50 };
		const result = await syncExpression(
			FakeModel,
			() => Predicates.ALL,
			config,
		);

		expect(result.syncConfig).toEqual({ syncPageSize: 50 });
		expect(result.modelConstructor).toBe(FakeModel);
	});

	test('returns syncConfig with both fields', async () => {
		const config: PerModelSyncConfig = {
			syncPageSize: 100,
			maxRecordsToSync: 500,
		};
		const result = await syncExpression(
			FakeModel,
			() => Predicates.ALL,
			config,
		);

		expect(result.syncConfig).toEqual({
			syncPageSize: 100,
			maxRecordsToSync: 500,
		});
	});

	test('syncConfig is undefined when omitted (backward compatible)', async () => {
		const result = await syncExpression(FakeModel, () => Predicates.ALL);

		expect(result.syncConfig).toBeUndefined();
		expect(result.modelConstructor).toBe(FakeModel);
		expect(result.conditionProducer).toBeDefined();
	});

	test('syncConfig is undefined when explicitly passed as undefined', async () => {
		const result = await syncExpression(
			FakeModel,
			() => Predicates.ALL,
			undefined,
		);

		expect(result.syncConfig).toBeUndefined();
	});
});
