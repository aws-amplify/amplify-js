import * as React from 'react';
import { Auth } from '@aws-amplify/auth';
import { withAuth0, Auth0Button } from '../../../src/Auth/Provider/withAuth0';

const auth0_config = {
	domain: 'your auth0 domain',
	clientID: 'your client id',
	redirectUri: 'your call back url',
	audience: 'https://your_domain/userinfo',
	responseType: 'token id_token', // for now we only support implicit grant flow
	scope: 'openid profile email', // the scope used by your app
	returnTo: 'your sign out url',
};

describe('withAuth0 test', () => {
	describe('render test', () => {
		test('render correctly', () => {
			const MockComp = class extends React.Component {
				render() {
					return <div />;
				}
			};

			const Comp = withAuth0(MockComp);
			const wrapper = shallow(<Comp />);
			expect(wrapper).toMatchSnapshot();
		});
	});

	describe('signIn test', () => {
		test('happy case', async () => {
			const MockComp = class extends React.Component {
				render() {
					return <div />;
				}
			};
			const mockFn = jest.fn();

			const Comp = withAuth0(MockComp);
			const wrapper = shallow(<Comp />);
			const comp = wrapper.instance();

			comp._auth0 = {
				authorize: mockFn,
			};
			try {
				await comp.signIn();
				expect(mockFn).toBeCalled();
			} catch (e) {}
		});
	});

	describe('initialize test', () => {
		test('happy case', async () => {
			const MockComp = class extends React.Component {
				render() {
					return <div />;
				}
			};
			const mockFn = jest.fn().mockImplementationOnce(callback => {
				callback(null, {
					idToken: 'idToken',
					expiresIn: 3000,
					accessToken: 'accessToken',
				});
			});
			const mockFn2 = jest.fn().mockImplementationOnce((token, callback) => {
				callback(null, {
					name: 'name',
					email: 'email',
				});
			});
			const spyon = jest
				.spyOn(Auth, 'federatedSignIn')
				.mockImplementationOnce(() => {
					return Promise.resolve();
				});

			const Comp = withAuth0(MockComp);
			const wrapper = shallow(
				<Comp authState={'signIn'} auth0={auth0_config} />
			);
			const comp = wrapper.instance();

			comp._auth0 = {
				parseHash: mockFn,
				client: {
					userInfo: mockFn2,
				},
			};

			comp.initialize();
			expect(mockFn).toBeCalled();
			expect(mockFn2).toBeCalled();
			expect(spyon).toBeCalled();

			spyon.mockClear();
		});

		test('return if parse hash failed', async () => {
			const MockComp = class extends React.Component {
				render() {
					return <div />;
				}
			};
			const mockFn = jest.fn().mockImplementationOnce(callback => {
				callback('err', null);
			});
			const mockFn2 = jest.fn().mockImplementationOnce((token, callback) => {
				callback(null, {
					name: 'name',
					email: 'email',
				});
			});
			const spyon = jest
				.spyOn(Auth, 'federatedSignIn')
				.mockImplementationOnce(() => {
					return Promise.resolve();
				});

			const Comp = withAuth0(MockComp);
			const wrapper = shallow(
				<Comp authState={'signIn'} auth0={auth0_config} />
			);
			const comp = wrapper.instance();

			comp._auth0 = {
				parseHash: mockFn,
				client: {
					userInfo: mockFn2,
				},
			};

			comp.initialize();
			expect(mockFn).toBeCalled();
			expect(mockFn2).not.toBeCalled();
			expect(spyon).not.toBeCalled();
		});

		test('directly return if in signedin state', async () => {
			const MockComp = class extends React.Component {
				render() {
					return <div />;
				}
			};
			const mockFn = jest.fn().mockImplementationOnce(callback => {
				callback('err', null);
			});
			const mockFn2 = jest.fn().mockImplementationOnce((token, callback) => {
				callback(null, {
					name: 'name',
					email: 'email',
				});
			});
			const spyon = jest
				.spyOn(Auth, 'federatedSignIn')
				.mockImplementationOnce(() => {
					return Promise.resolve();
				});

			const Comp = withAuth0(MockComp);
			const wrapper = shallow(
				<Comp authState={'signedIn'} auth0={auth0_config} />
			);
			const comp = wrapper.instance();

			comp._auth0 = {
				parseHash: mockFn,
				client: {
					userInfo: mockFn2,
				},
			};

			comp.initialize();
			expect(mockFn).not.toBeCalled();
			expect(mockFn2).not.toBeCalled();
			expect(spyon).not.toBeCalled();
		});

		test('directly return if no auth0 config', async () => {
			const MockComp = class extends React.Component {
				render() {
					return <div />;
				}
			};
			const mockFn = jest.fn().mockImplementationOnce(callback => {
				callback('err', null);
			});
			const mockFn2 = jest.fn().mockImplementationOnce((token, callback) => {
				callback(null, {
					name: 'name',
					email: 'email',
				});
			});
			const spyon = jest
				.spyOn(Auth, 'federatedSignIn')
				.mockImplementationOnce(() => {
					return Promise.resolve();
				});

			const Comp = withAuth0(MockComp);
			const wrapper = shallow(<Comp authState={'signIn'} auth0={undefined} />);
			const comp = wrapper.instance();

			comp._auth0 = {
				parseHash: mockFn,
				client: {
					userInfo: mockFn2,
				},
			};

			comp.initialize();
			expect(mockFn).not.toBeCalled();
			expect(mockFn2).not.toBeCalled();
			expect(spyon).not.toBeCalled();
		});
	});
});

describe('Auth0Button test', () => {
	describe('render test', () => {
		test('render correctly', () => {
			const wrapper = shallow(<Auth0Button />);

			expect(wrapper).toMatchSnapshot();
		});
	});
});
