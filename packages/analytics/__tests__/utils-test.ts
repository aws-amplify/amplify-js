import { isAppInForeground } from '../src/utils/AppUtils';
import MethodEmbed from '../src/utils/MethodEmbed';

jest.mock('../src/utils/AppUtils.native', () => {
	return {
		isAppInForeground: jest.fn(),
	};
});

describe('Utils', () => {
	test('inAppInForeground', () => {
		expect(isAppInForeground()).toBe(true);
	});

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
