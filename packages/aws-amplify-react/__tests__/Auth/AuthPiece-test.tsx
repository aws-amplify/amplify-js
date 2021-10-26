import * as React from 'react';
import { AuthPiece } from '../../src/Auth/AuthPiece';

class TestPiece extends AuthPiece {
	constructor(props) {
		super(props);
	}
	render() {
		return <div />;
	}
}

describe('AuthPiece test', () => {
	describe('usernameFromAuthData test', () => {
		test('happy case with string type authdata', () => {
			const props = {
				authData: 'username',
			};
			const wrapper = shallow(<TestPiece />);
			const testPiece = wrapper.instance();
			wrapper.setProps(props);

			expect(testPiece.usernameFromAuthData()).toBe('username');
		});

		test('happy case with object type authdata', () => {
			const props = {
				authData: {
					username: 'username',
				},
			};
			const props2 = {
				authData: {
					user: {
						username: 'username',
					},
				},
			};
			const wrapper = shallow(<TestPiece />);
			const testPiece = wrapper.instance();
			wrapper.setProps(props);

			expect(testPiece.usernameFromAuthData()).toBe('username');

			wrapper.setProps(props2);

			expect(testPiece.usernameFromAuthData()).toBe('username');
		});

		test('no authData', () => {
			const wrapper = shallow(<TestPiece />);
			const testPiece = wrapper.instance();

			expect(testPiece.usernameFromAuthData()).toBe('');
		});
	});

	describe('errorMessage test', () => {
		test('happy case', () => {
			const wrapper = shallow(<TestPiece />);
			const testPiece = wrapper.instance();

			expect(testPiece.errorMessage('err')).toBe('err');
		});

		test('happy case with object param', () => {
			const wrapper = shallow(<TestPiece />);
			const testPiece = wrapper.instance();

			expect(testPiece.errorMessage({ message: 'err' })).toBe('err');
			expect(testPiece.errorMessage({ something: 'something' })).toBe(
				JSON.stringify({ something: 'something' })
			);
		});
	});

	describe('triggerAuthEvent test', () => {
		test('happy case', () => {
			const mockFn = jest.fn();
			const props = {
				authState: 'state',
				onAuthEvent: mockFn,
			};
			const wrapper = shallow(<TestPiece />);
			const testPiece = wrapper.instance();
			wrapper.setProps(props);

			testPiece.triggerAuthEvent('event');

			expect(mockFn).toBeCalledWith('state', 'event');
		});

		test('no onAuthEvent', () => {
			const props = {
				authState: 'state',
			};
			const wrapper = shallow(<TestPiece />);
			const testPiece = wrapper.instance();
			wrapper.setProps(props);

			testPiece.triggerAuthEvent('event');
		});
	});

	describe('changeState test', () => {
		test('happy case', () => {
			const spyon = jest
				.spyOn(AuthPiece.prototype, 'triggerAuthEvent')
				.mockImplementationOnce(() => {
					return;
				});

			const mockFn = jest.fn();
			const props = {
				onStateChange: mockFn,
			};
			const wrapper = shallow(<TestPiece />);
			const testPiece = wrapper.instance();
			wrapper.setProps(props);

			testPiece.changeState('state', 'data');

			expect(mockFn).toBeCalledWith('state', 'data');
			expect(spyon).toBeCalledWith({ data: 'state', type: 'stateChange' });

			spyon.mockClear();
		});

		test('happy case', () => {
			const spyon = jest
				.spyOn(AuthPiece.prototype, 'triggerAuthEvent')
				.mockImplementationOnce(() => {
					return;
				});
			const wrapper = shallow(<TestPiece />);
			const testPiece = wrapper.instance();

			testPiece.changeState('state', 'data');
			expect(spyon).toBeCalledWith({ data: 'state', type: 'stateChange' });

			spyon.mockClear();
		});
	});

	describe('error test', () => {
		test('happy case', () => {
			const spyon = jest
				.spyOn(AuthPiece.prototype, 'triggerAuthEvent')
				.mockImplementationOnce(() => {
					return;
				});

			const spyon2 = jest
				.spyOn(AuthPiece.prototype, 'errorMessage')
				.mockImplementationOnce(() => {
					return 'errMessage';
				});

			const wrapper = shallow(<TestPiece />);
			const testPiece = wrapper.instance();

			testPiece.error('err');

			expect(spyon).toBeCalledWith({ data: 'errMessage', type: 'error' });

			spyon.mockClear();
			spyon2.mockClear();
		});
	});

	describe('handleInputChange test', () => {
		test('happy case', () => {
			const event = {
				target: {
					name: 'name',
					value: 'value',
					type: 'radio',
					checked: true,
				},
			};
			const wrapper = shallow(<TestPiece />);
			const testPiece = wrapper.instance();

			testPiece.handleInputChange(event);

			expect(testPiece.inputs).toEqual({ checkedValue: 'value', name: 'true' });
		});

		test('happy case without checke_type', () => {
			const event = {
				target: {
					name: 'name',
					value: 'value',
					type: 'other_type',
					checked: '',
				},
			};
			const wrapper = shallow(<TestPiece />);
			const testPiece = wrapper.instance();

			testPiece.handleInputChange(event);

			expect(testPiece.inputs).toEqual({ checkedValue: null, name: 'value' });
		});
	});
});
