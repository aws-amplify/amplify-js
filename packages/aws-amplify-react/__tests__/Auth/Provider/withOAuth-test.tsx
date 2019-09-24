import * as React from 'react';
import { Auth } from '@aws-amplify/auth';
import { withOAuth, OAuthButton } from '../../../src/Auth/Provider/withOAuth';

describe('withOAuth test', () => {
	describe('render test', () => {
		test('render correctly', () => {
			const MockComp = class extends React.Component {
				render() {
					return <div />;
				}
			};

			const Comp = withOAuth(MockComp);
			const wrapper = shallow(<Comp />);
			expect(wrapper).toMatchSnapshot();
		});

		test('render correctly with button', () => {
			const wrapper = shallow(<OAuthButton />);
			expect(wrapper).toMatchSnapshot();
		});
	});

	describe('signIn test', () => {
		test('happy case with connected response', () => {
			const mockFn = jest.fn();
			window.location.assign = mockFn;
			const MockComp = class extends React.Component {
				render() {
					return <div />;
				}
			};

			const spyon = jest.spyOn(Auth, 'federatedSignIn');

			const Comp = withOAuth(MockComp);
			const wrapper = mount(<Comp />);
			const comp = wrapper.instance();

			comp.signIn();

			expect(spyon).toBeCalledWith({ provider: undefined });
			spyon.mockClear();
		});

		test('Passing in a social provider', () => {
			const MockComp = class extends React.Component {
				render() {
					return <div />;
				}
			};

			const spyon = jest.spyOn(Auth, 'federatedSignIn');

			const Comp = withOAuth(MockComp);
			const wrapper = mount(<Comp />);
			const comp = wrapper.instance();

			comp.signIn(expect.anything(), 'Facebook');

			expect(spyon).toBeCalledWith({ provider: 'Facebook' });
			spyon.mockClear();
		});
	});
});
