import * as React from 'react';
import { withFederated } from '../../../src/Auth/Provider/index';

describe('withFederated test', () => {
	describe('render test', () => {
		test('render correctly', () => {
			const MockComp = class extends React.Component {
				render() {
					return <div />;
				}
			};
			const Comp = withFederated(MockComp);
			const wrapper = shallow(<Comp />);
			expect(wrapper).toMatchSnapshot();
		});
	});
});
