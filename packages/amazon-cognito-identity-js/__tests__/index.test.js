import * as index from '../src/index';

test('Index modules are imported/exported properly', () => {
	const modules = Object.keys(index);
	modules.forEach(module => {
		expect(module).toBeTruthy();
	});
});
