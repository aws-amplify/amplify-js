import * as React from 'react';
import { Auth } from '@aws-amplify/auth';
import {
	FederatedSignIn,
	FederatedButtons,
} from '../../src/Auth/FederatedSignIn';

const spyon = jest.spyOn(Auth, 'configure').mockImplementation(() => {
	return {
		hostedUIOptions: {},
	};
});

describe('FederatedSignIn test', () => {
	describe('render test', () => {
		test('render with correct authState', () => {
			const wrapper = shallow(<FederatedSignIn />);

			wrapper.setProps({
				federated: {},
				authState: 'signIn',
				onStateChange: jest.fn(),
			});
			expect(wrapper).toMatchSnapshot();
		});

		test('render nothing with incorrect authState', () => {
			const wrapper = shallow(<FederatedSignIn />);

			wrapper.setProps({
				federated: {},
				authState: 'signedIn',
				onStateChange: jest.fn(),
			});
			expect(wrapper).toMatchSnapshot();
		});

		test('render nothing with no federated prop', () => {
			const wrapper = shallow(<FederatedSignIn />);

			wrapper.setProps({
				federated: undefined,
				authState: 'signIn',
				onStateChange: jest.fn(),
			});
			expect(wrapper).toMatchSnapshot();
		});
	});
});

describe('FederatedButtons test', () => {
	describe('render test', () => {
		test('render with correct authState', () => {
			const wrapper = shallow(<FederatedButtons />);

			wrapper.setProps({
				federated: {
					google_client_id: 'google_client_id',
					facebook_app_id: 'facebook_app_id',
				},
				authState: 'signIn',
			});
			expect(wrapper).toMatchSnapshot();
		});

		test('render with correct authState and only google id', () => {
			const wrapper = shallow(<FederatedButtons />);

			wrapper.setProps({
				federated: {
					facebook_app_id: 'facebook_app_id',
				},
				authState: 'signIn',
			});
			expect(wrapper).toMatchSnapshot();
		});

		test('render with correct authState and only facebook id', () => {
			const wrapper = shallow(<FederatedButtons />);

			wrapper.setProps({
				federated: {
					google_client_id: 'google_client_id',
				},
				authState: 'signIn',
			});
			expect(wrapper).toMatchSnapshot();
		});

		test('render nothing with incorrect authState', () => {
			const wrapper = shallow(<FederatedButtons />);

			wrapper.setProps({
				federated: {},
				authState: 'signedIn',
			});
			expect(wrapper).toMatchSnapshot();
		});

		test('render nothing with no federated prop', () => {
			const wrapper = shallow(<FederatedButtons />);

			wrapper.setProps({
				federated: {},
				authState: 'signIn',
			});
			expect(wrapper).toMatchSnapshot();
		});
	});
});
