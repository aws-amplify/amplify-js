jest.mock('@aws-amplify/analytics', () => {
	return {
		Analytics: {
			record: jest.fn(),
		},
	};
});

import * as React from 'react';
import { Analytics } from '@aws-amplify/analytics';
import { trackLifecycle } from '../../src/Analytics/trackLifecycle';

describe('trackLifecycle test', () => {
	test('render correctly', () => {
		const spyon = jest.spyOn(Analytics, 'record');
		const MockComp = class extends React.Component {
			render() {
				return <div />;
			}
		};
		const CompWithAuth = trackLifecycle(MockComp, 'trackername');
		const wrapper = shallow(<CompWithAuth />);

		expect(wrapper).toMatchSnapshot();
		expect(spyon).toBeCalled();

		spyon.mockClear();
	});

	test('track when mounting', () => {
		const spyon = jest.spyOn(Analytics, 'record');
		const MockComp = class extends React.Component {
			render() {
				return <div />;
			}
		};
		const CompWithAuth = trackLifecycle(MockComp, 'trackername');
		const wrapper = mount(<CompWithAuth />);

		expect(spyon.mock.calls.length).toBe(2);

		spyon.mockClear();
		wrapper.unmount();
	});

	test('track when unmounting', () => {
		const spyon = jest.spyOn(Analytics, 'record');
		const MockComp = class extends React.Component {
			render() {
				return <div />;
			}
		};
		const CompWithAuth = trackLifecycle(MockComp, 'trackername');
		const wrapper = shallow(<CompWithAuth />);

		wrapper.unmount();
		expect(spyon.mock.calls.length).toBe(2);

		spyon.mockClear();
	});

	test('track when updating', () => {
		const spyon = jest.spyOn(Analytics, 'record');
		const MockComp = class extends React.Component {
			render() {
				return <div />;
			}
		};
		const CompWithAuth = trackLifecycle(MockComp, 'trackername');
		const wrapper = shallow(<CompWithAuth />);

		wrapper.update();

		expect(spyon.mock.calls.length).toBe(2);

		spyon.mockClear();
	});
});
