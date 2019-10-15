import Amplify from '../src';

describe('Amplify config test', () => {
	test('happy case', () => {
		const mockComp = {
			configure: jest.fn(),
		};

		Amplify.register(mockComp);
		const res = Amplify.configure({
			attr: 'attr',
		});

		expect(mockComp.configure).toBeCalled();
		expect(res).toEqual({ attr: 'attr' });
	});

	test('empty config', () => {
		const mockComp = {
			configure: jest.fn(),
		};

		Amplify.register(mockComp);
		const res = Amplify.configure(null);

		expect(mockComp.configure).not.toBeCalled();
	});
});

describe('addPluggable test', () => {
	test('happy case', () => {
		const pluggable = {
			getCategory: jest.fn(),
		};

		const mockComp = {
			addPluggable: jest.fn(),
		};

		Amplify.register(mockComp);
		Amplify.addPluggable(pluggable);

		expect(mockComp.addPluggable).toBeCalled();
	});

	test('no pluggable', () => {
		const pluggable = {
			getCategory: jest.fn(),
		};

		const mockComp = {
			addPluggable: jest.fn(),
		};

		Amplify.addPluggable({});

		expect(mockComp.addPluggable).not.toBeCalled();
	});
});
