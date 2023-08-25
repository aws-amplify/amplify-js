import { MethodEmbed } from '../src/utils/MethodEmbed';

describe('Utils', () => {
	test('MethodEmbed', () => {
		const set = new Set();
		const methodEmbed = new MethodEmbed(set, 'add');
		expect(methodEmbed instanceof MethodEmbed).toBe(true);
		methodEmbed.set(() => {
			return 'override';
		});
		methodEmbed.remove();
		MethodEmbed.add(set, 'add', () => {
			return 'override';
		});
		MethodEmbed.remove(set, 'add');
		expect(methodEmbed.context).toBe(set);
		expect(methodEmbed.methodName).toBe('add');
	});
});
