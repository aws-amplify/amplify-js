import * as React from 'react';
import { Auth } from '@aws-amplify/auth';
import {
	withAmazon,
	AmazonButton,
} from '../../../src/Auth/Provider/withAmazon';

describe('withAmazon test', () => {
	describe('render test', () => {
		test('render correctly', () => {
			window.amazon = 'amz';
			const MockComp = class extends React.Component {
				render() {
					return <div />;
				}
			};
			const Comp = withAmazon(MockComp);
			const wrapper = shallow(<Comp />);
			expect(wrapper).toMatchSnapshot();
		});
	});

	describe('signIn test', () => {
		test('happy case with connected response', async () => {
			const MockComp = class extends React.Component {
				render() {
					return <div />;
				}
			};

			window.amazon = {
				Login: {
					authorize(options, callback) {
						callback('response');
					},
				},
			};

			const Comp = withAmazon(MockComp);
			const wrapper = shallow(<Comp />);
			const comp = wrapper.instance();

			const spyon = jest
				.spyOn(comp, 'federatedSignIn')
				.mockImplementationOnce(() => {
					return;
				});

			await comp.signIn();

			expect(spyon).toBeCalledWith('response');

			spyon.mockClear();
		});

		test('directly return if error happened in response', async () => {
			const MockComp = class extends React.Component {
				render() {
					return <div />;
				}
			};

			window.amazon = {
				Login: {
					authorize(options, callback) {
						callback({ error: 'error' });
					},
				},
			};

			const Comp = withAmazon(MockComp);
			const wrapper = shallow(<Comp />);
			const comp = wrapper.instance();

			await comp.signIn();
		});
	});

	describe('federatedSignIn', () => {
		test('happy case', async () => {
			const MockComp = class extends React.Component {
				render() {
					return <div />;
				}
			};

			const response = {
				access_token: 'access_token',
				expires_in: 0,
			};

			window.amazon = {
				Login: {
					retrieveProfile(callback) {
						callback({
							success: true,
							profile: { Name: 'name' },
						});
					},
				},
			};

			const Comp = withAmazon(MockComp);
			const wrapper = shallow(<Comp />);
			const comp = wrapper.instance();

			const spyon_currentUser = jest
				.spyOn(Auth, 'currentAuthenticatedUser')
				.mockImplementationOnce(() => {
					return Promise.resolve('user');
				});

			const spyon = jest
				.spyOn(Auth, 'federatedSignIn')
				.mockImplementationOnce(() => {
					return new Promise((res, rej) => {
						res('credentials');
					});
				});
			const spyon2 = jest.spyOn(Date.prototype, 'getTime').mockReturnValue(0);

			await comp.federatedSignIn(response);

			expect(spyon).toBeCalledWith(
				'amazon',
				{ expires_at: 0, token: 'access_token' },
				{ name: 'name' }
			);

			spyon.mockClear();
			spyon2.mockClear();
			spyon_currentUser.mockClear();
		});

		test('happy case with onStateChange exists', async () => {
			const MockComp = class extends React.Component {
				render() {
					return <div />;
				}
			};

			const mockFn = jest.fn();

			const response = {
				access_token: 'access_token',
				expires_in: 0,
			};

			window.amazon = {
				Login: {
					retrieveProfile(callback) {
						callback({
							success: true,
							profile: { Name: 'name' },
						});
					},
				},
			};

			const Comp = withAmazon(MockComp);
			const wrapper = shallow(<Comp />);
			const comp = wrapper.instance();
			wrapper.setProps({
				onStateChange: mockFn,
			});

			const spyon_currentUser = jest
				.spyOn(Auth, 'currentAuthenticatedUser')
				.mockImplementationOnce(() => {
					return Promise.resolve('user');
				});

			const spyon = jest
				.spyOn(Auth, 'federatedSignIn')
				.mockImplementationOnce(() => {
					return new Promise((res, rej) => {
						res('credentials');
					});
				});
			const spyon2 = jest.spyOn(Date.prototype, 'getTime').mockReturnValue(0);

			await comp.federatedSignIn(response);

			expect(spyon).toBeCalledWith(
				'amazon',
				{ expires_at: 0, token: 'access_token' },
				{ name: 'name' }
			);

			spyon.mockClear();
			spyon2.mockClear();
			spyon_currentUser.mockClear();
		});

		test('directly return if access_token is null', async () => {
			const MockComp = class extends React.Component {
				render() {
					return <div />;
				}
			};

			const response = {
				access_token: null,
				expires_in: 0,
			};

			const spyon = jest
				.spyOn(Auth, 'federatedSignIn')
				.mockImplementationOnce(() => {
					return new Promise((res, rej) => {
						res('credentials');
					});
				});

			const spyon_currentUser = jest
				.spyOn(Auth, 'currentAuthenticatedUser')
				.mockImplementationOnce(() => {
					return Promise.resolve('user');
				});

			const Comp = withAmazon(MockComp);
			const wrapper = shallow(<Comp />);
			const comp = wrapper.instance();

			await comp.federatedSignIn(response);

			expect(spyon).not.toBeCalled();
			spyon.mockClear();
			spyon_currentUser.mockClear();
		});

		test('directly return if getting userinfo failed', async () => {
			const MockComp = class extends React.Component {
				render() {
					return <div />;
				}
			};

			const response = {
				access_token: 'access_token',
				expires_in: 0,
			};

			window.amazon = {
				Login: {
					retrieveProfile(callback) {
						callback({
							success: false,
							profile: { Name: 'name' },
						});
					},
				},
			};

			const Comp = withAmazon(MockComp);
			const wrapper = shallow(<Comp />);
			const comp = wrapper.instance();

			const spyon = jest
				.spyOn(Auth, 'federatedSignIn')
				.mockImplementationOnce(() => {
					return new Promise((res, rej) => {
						res('credentials');
					});
				});

			await comp.federatedSignIn(response);

			expect(spyon).not.toBeCalled();

			spyon.mockClear();
		});
	});

	describe('initAmazon test', () => {
		test('happy case', async () => {
			const MockComp = class extends React.Component {
				render() {
					return <div />;
				}
			};

			const mockFn = jest.fn();
			const props = {
				amazon_client_id: 'amazon_client_id',
			};
			window.amazon = {
				Login: {
					setClientId: mockFn,
				},
			};

			const Comp = withAmazon(MockComp);
			const wrapper = shallow(<Comp />);
			const comp = wrapper.instance();
			wrapper.setProps(props);

			await comp.initAmazon();
			expect(mockFn).toBeCalledWith('amazon_client_id');
		});
	});

	describe('amazon signOut', () => {
		test('happy case', () => {
			const MockComp = class extends React.Component {
				render() {
					return <div />;
				}
			};

			const mockFn = jest.fn();

			window.amazon = {
				Login: {
					logout: mockFn,
				},
			};

			const Comp = withAmazon(MockComp);
			const wrapper = shallow(<Comp />);
			const comp = wrapper.instance();

			comp.signOut();
			expect(mockFn).toBeCalled();
		});

		test('return if no amazon sdk', () => {
			const MockComp = class extends React.Component {
				render() {
					return <div />;
				}
			};

			const mockFn = jest.fn();

			window.amazon = undefined;

			const Comp = withAmazon(MockComp);
			const wrapper = shallow(<Comp />);
			const comp = wrapper.instance();

			comp.signOut();
			expect(mockFn).not.toBeCalled();
		});
	});
});

describe('AmazonButton test', () => {
	describe('render test', () => {
		test('render correctly', () => {
			window.amazon = 'amz';
			const wrapper = shallow(<AmazonButton />);

			expect(wrapper).toMatchSnapshot();
		});
	});
});
