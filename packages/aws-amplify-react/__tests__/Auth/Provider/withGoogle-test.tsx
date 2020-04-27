import * as React from 'react';
import { Auth } from '@aws-amplify/auth';
import {
	withGoogle,
	GoogleButton,
} from '../../../src/Auth/Provider/withGoogle';

describe('withGoogle test', () => {
	describe('render test', () => {
		test('render correctly', () => {
			window.gapi = null;
			const MockComp = class extends React.Component {
				render() {
					return <div />;
				}
			};
			const Comp = withGoogle(MockComp);
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

			window.gapi = {
				auth2: {
					getAuthInstance() {
						return {
							signIn() {
								return new Promise((res, rej) => {
									res('googleUser');
								});
							},
						};
					},
				},
			};

			const Comp = withGoogle(MockComp);
			const wrapper = shallow(<Comp />);
			const comp = wrapper.instance();

			const spyon = jest
				.spyOn(comp, 'federatedSignIn')
				.mockImplementationOnce(() => {
					return;
				});

			await comp.signIn();

			expect(spyon).toBeCalledWith('googleUser');

			spyon.mockClear();
		});

		test('with an onError handler', async () => {
			const onErrorMock = jest.fn();

			const MockComp = class extends React.Component {
				render() {
					return <div />;
				}
			};

			window.gapi = {
				auth2: {
					getAuthInstance() {
						return {
							signIn() {
								return {
									then: (success, error) => error('error'),
								};
							},
						};
					},
				},
			};

			const Comp = withGoogle(MockComp);
			const wrapper = shallow(<Comp onError={onErrorMock} />);
			const comp = wrapper.instance();

			comp.signIn();

			expect(onErrorMock).toBeCalledWith('error');

			onErrorMock.mockClear();
		});

		test('without an onError handler', async () => {
			const MockComp = class extends React.Component {
				render() {
					return <div />;
				}
			};

			window.gapi = {
				auth2: {
					getAuthInstance() {
						return {
							signIn() {
								return {
									then: (success, error) => error('error'),
								};
							},
						};
					},
				},
			};

			const Comp = withGoogle(MockComp);
			const wrapper = shallow(<Comp />);
			const comp = wrapper.instance();

			expect(() => comp.signIn()).toThrowError('error');
		});
	});

	describe('federatedSignIn', () => {
		test('happy case', async () => {
			const MockComp = class extends React.Component {
				render() {
					return <div />;
				}
			};

			const googleUser = {
				getAuthResponse() {
					return {
						id_token: 'id_token',
						expires_at: 0,
					};
				},
				getBasicProfile() {
					return {
						getEmail() {
							return 'email';
						},
						getName() {
							return 'name';
						},
						getImageUrl() {
							return 'picture';
						},
					};
				},
			};

			const Comp = withGoogle(MockComp);
			const wrapper = shallow(<Comp />);
			const comp = wrapper.instance();

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

			await comp.federatedSignIn(googleUser);

			expect(spyon).toBeCalledWith(
				'google',
				{ expires_at: 0, token: 'id_token' },
				{ email: 'email', name: 'name', picture: 'picture' }
			);

			spyon.mockClear();
			spyon_currentUser.mockClear();
		});

		test('happy case with onStateChange exists', async () => {
			const MockComp = class extends React.Component {
				render() {
					return <div />;
				}
			};

			const mockFn = jest.fn();

			const googleUser = {
				getAuthResponse() {
					return {
						id_token: 'id_token',
						expires_at: 0,
					};
				},
				getBasicProfile() {
					return {
						getEmail() {
							return 'email';
						},
						getName() {
							return 'name';
						},
						getImageUrl() {
							return 'picture';
						},
					};
				},
			};

			const Comp = withGoogle(MockComp);
			const wrapper = shallow(<Comp />);
			const comp = wrapper.instance();
			wrapper.setProps({
				onStateChange: mockFn,
			});

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

			await comp.federatedSignIn(googleUser);

			expect(spyon).toBeCalledWith(
				'google',
				{ expires_at: 0, token: 'id_token' },
				{ email: 'email', name: 'name', picture: 'picture' }
			);
			expect(mockFn).toBeCalledWith('signedIn', 'user');

			spyon.mockClear();
			spyon_currentUser.mockClear();
		});
	});

	describe('initGapi test', () => {
		test('happy case', async () => {
			const MockComp = class extends React.Component {
				render() {
					return <div />;
				}
			};

			window.gapi = {
				load(path, callback) {
					callback();
				},
				auth2: {
					init(params) {
						return new Promise((res, rej) => {
							res('ga');
						});
					},
					getAuthInstance() {
						return {
							signIn() {
								return new Promise((res, rej) => {
									res('googleUser');
								});
							},
						};
					},
				},
			};

			const Comp = withGoogle(MockComp);
			const wrapper = shallow(<Comp />);
			const comp = wrapper.instance();

			await comp.initGapi();
		});
	});

	describe.skip('refreshGoogleToken test', () => {
		test('happy case', async () => {
			const MockComp = class extends React.Component {
				render() {
					return <div />;
				}
			};

			const authResponse = {
				id_token: 'id_token',
				expires_at: 0,
			};

			const googleAuth = {
				currentUser: {
					get() {
						// google User
						return {
							isSignedIn() {
								return true;
							},
							reloadAuthResponse() {
								return new Promise((res, rej) => {
									res(authResponse);
								});
							},
							getBasicProfile() {
								return {
									getEmail() {
										return 'email';
									},
									getName() {
										return 'name';
									},
									getImageUrl() {
										return 'picture';
									},
								};
							},
						};
					},
				},
			};

			window.gapi = {
				auth2: {
					getAuthInstance() {
						// googleAuth
						return new Promise((res, rej) => {
							res(googleAuth);
						});
					},
				},
			};

			const Comp = withGoogle(MockComp);
			const wrapper = shallow(<Comp />);
			const comp = wrapper.instance();

			const spyon = jest
				.spyOn(Auth, 'federatedSignIn')
				.mockImplementationOnce(() => {
					return Promise.resolve();
				});

			await comp.refreshGoogleToken();

			spyon.mockClear();
		});

		test('not signed in', async () => {
			const MockComp = class extends React.Component {
				render() {
					return <div />;
				}
			};

			const authResponse = {
				id_token: 'id_token',
				expires_at: 0,
			};

			const googleAuth = {
				currentUser: {
					get() {
						// google User
						return {
							isSignedIn() {
								return false;
							},
						};
					},
				},
			};

			window.gapi = {
				auth2: {
					getAuthInstance() {
						// googleAuth
						return new Promise((res, rej) => {
							res(googleAuth);
						});
					},
				},
			};

			const Comp = withGoogle(MockComp);
			const wrapper = shallow(<Comp />);
			const comp = wrapper.instance();
			await comp.refreshGoogleToken();
		});

		test('no auth2', async () => {
			const MockComp = class extends React.Component {
				render() {
					return <div />;
				}
			};
			window.gapi = null;

			const Comp = withGoogle(MockComp);
			const wrapper = shallow(<Comp />);
			const comp = wrapper.instance();

			await comp.refreshGoogleToken();
		});

		test('no googleAuth instance', async () => {
			const MockComp = class extends React.Component {
				render() {
					return <div />;
				}
			};
			window.gapi = {
				auth2: {
					getAuthInstance() {
						// googleAuth
						return new Promise((res, rej) => {
							res(null);
						});
					},
				},
			};

			const Comp = withGoogle(MockComp);
			const wrapper = shallow(<Comp />);
			const comp = wrapper.instance();

			await comp.refreshGoogleToken();
		});
	});

	describe('google signOut test', () => {
		test('happy case', async () => {
			const MockComp = class extends React.Component {
				render() {
					return <div />;
				}
			};

			const mockFn = jest.fn();
			window.gapi = {
				auth2: {
					getAuthInstance() {
						return Promise.resolve({
							signOut: mockFn,
						});
					},
				},
			};

			const Comp = withGoogle(MockComp);
			const wrapper = shallow(<Comp />);
			const comp = wrapper.instance();

			await comp.signOut();

			expect(mockFn).toBeCalled();
		});

		test('no auth2', async () => {
			window.gapi = null;
			const MockComp = class extends React.Component {
				render() {
					return <div />;
				}
			};
			const Comp = withGoogle(MockComp);
			const wrapper = shallow(<Comp />);
			const comp = wrapper.instance();

			expect(await comp.signOut()).toBeUndefined();
		});
	});
});

describe('GoogleButton test', () => {
	describe('render test', () => {
		test('render correctly', () => {
			window.gapi = null;
			const wrapper = shallow(<GoogleButton />);

			expect(wrapper).toMatchSnapshot();
		});
	});
});
