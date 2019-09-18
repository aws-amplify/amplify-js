import * as React from 'react';
import * as UI from '../../src/Amplify-UI/Amplify-UI-Components-React';

describe('AmplifyUi test', () => {
	test('render Container correctly', () => {
		const wrapper = shallow(<UI.Container />);
		wrapper.setProps({ theme: 'theme' });
		expect(wrapper).toMatchSnapshot();
	});

	test('render FormContainer correctly', () => {
		const wrapper = shallow(<UI.FormContainer />);
		wrapper.setProps({ theme: 'theme' });
		expect(wrapper).toMatchSnapshot();
	});

	test('render SectionHeader correctly', () => {
		const wrapper = shallow(<UI.SectionHeader />);
		wrapper.setProps({ theme: 'theme' });
		expect(wrapper).toMatchSnapshot();
	});

	test('render SectionHeaderContent correctly', () => {
		const wrapper = shallow(<UI.SectionHeaderContent />);
		wrapper.setProps({ theme: 'theme' });
		expect(wrapper).toMatchSnapshot();
	});

	test('render SectionFooter correctly', () => {
		const wrapper = shallow(<UI.SectionFooter />);
		wrapper.setProps({ theme: 'theme' });
		expect(wrapper).toMatchSnapshot();
	});

	test('render SectionFooterPrimaryContent correctly', () => {
		const wrapper = shallow(<UI.SectionFooterPrimaryContent />);
		wrapper.setProps({ theme: 'theme' });
		expect(wrapper).toMatchSnapshot();
	});

	test('render SectionFooterSecondaryContent correctly', () => {
		const wrapper = shallow(<UI.SectionFooterPrimaryContent />);
		wrapper.setProps({ theme: 'theme' });
		expect(wrapper).toMatchSnapshot();
	});

	test('render SectionBody correctly', () => {
		const wrapper = shallow(<UI.SectionBody />);
		wrapper.setProps({ theme: 'theme' });
		expect(wrapper).toMatchSnapshot();
	});

	test('render Strike correctly', () => {
		const wrapper = shallow(<UI.Strike />);
		wrapper.setProps({ theme: 'theme' });
		expect(wrapper).toMatchSnapshot();
	});

	test('render StrikeContent correctly', () => {
		const wrapper = shallow(<UI.StrikeContent />);
		wrapper.setProps({ theme: 'theme' });
		expect(wrapper).toMatchSnapshot();
	});

	test('render FormRow correctly', () => {
		const wrapper = shallow(<UI.FormRow />);
		wrapper.setProps({ theme: 'theme' });
		expect(wrapper).toMatchSnapshot();
	});

	test('render Radio correctly', () => {
		const wrapper = shallow(<UI.Radio />);
		wrapper.setProps({ theme: 'theme' });
		expect(wrapper).toMatchSnapshot();
	});

	test('render RadioRow correctly', () => {
		const wrapper = shallow(<UI.RadioRow />);
		wrapper.setProps({ theme: 'theme' });
		expect(wrapper).toMatchSnapshot();
	});

	test('render InputRow correctly', () => {
		const wrapper = shallow(<UI.InputRow />);
		wrapper.setProps({ theme: 'theme' });
		expect(wrapper).toMatchSnapshot();
	});

	test('render Input correctly', () => {
		const wrapper = shallow(<UI.Input />);
		wrapper.setProps({ theme: 'theme' });
		expect(wrapper).toMatchSnapshot();
	});

	test('render SelectInput correctly', () => {
		const wrapper = shallow(<UI.SelectInput />);
		wrapper.setProps({ theme: 'theme' });
		expect(wrapper).toMatchSnapshot();
	});

	// test('render CheckboxRow correctly', () => {
	//     const wrapper = shallow(<UI.CheckboxRow/>);
	//     wrapper.setProps({ theme: 'theme' });
	//     expect(wrapper).toMatchSnapshot();
	// });

	// test('render MessageRow correctly', () => {
	//     const wrapper = shallow(<UI.MessageRow/>);
	//     wrapper.setProps({ theme: 'theme' });
	//     expect(wrapper).toMatchSnapshot();
	// });

	// test('render ButtonRow correctly', () => {
	//     const wrapper = shallow(<UI.ButtonRow/>);
	//     wrapper.setProps({ theme: 'theme' });
	//     expect(wrapper).toMatchSnapshot();
	// });

	// test('render Link correctly', () => {
	//     const wrapper = shallow(<UI.Link/>);
	//     wrapper.setProps({ theme: 'theme' });
	//     expect(wrapper).toMatchSnapshot();
	// });

	// test('render ErrorSection correctly', () => {
	//     const wrapper = shallow(<UI.ErrorSection/>);
	//     wrapper.setProps({ theme: 'theme' });
	//     expect(wrapper).toMatchSnapshot();
	// });

	// test('render ActionRow correctly', () => {
	//     const wrapper = shallow(<UI.ActionRow/>);
	//     wrapper.setProps({ theme: 'theme' });
	//     expect(wrapper).toMatchSnapshot();
	// });

	// test('render Checkbox correctly', () => {
	//     const wrapper = shallow(<UI.Checkbox/>);
	//     wrapper.setProps({ theme: 'theme' });
	//     expect(wrapper).toMatchSnapshot();
	// });

	// test('render Button correctly', () => {
	//     const wrapper = shallow(<UI.Button/>);
	//     wrapper.setProps({ theme: 'theme' });
	//     expect(wrapper).toMatchSnapshot();
	// });

	// test('render ButtonContent correctly', () => {
	//     const wrapper = shallow(<UI.ButtonContent/>);
	//     wrapper.setProps({ theme: 'theme' });
	//     expect(wrapper).toMatchSnapshot();
	// });

	// test('render SignInButton correctly', () => {
	//     const wrapper = shallow(<UI.SignInButton/>);
	//     wrapper.setProps({ theme: 'theme' });
	//     expect(wrapper).toMatchSnapshot();
	// });

	// test('render Label correctly', () => {
	//     const wrapper = shallow(<UI.Label/>);
	//     wrapper.setProps({ theme: 'theme' });
	//     expect(wrapper).toMatchSnapshot();
	// });

	// test('render Space correctly', () => {
	//     const wrapper = shallow(<UI.Space/>);
	//     wrapper.setProps({ theme: 'theme' });
	//     expect(wrapper).toMatchSnapshot();
	// });

	// test('render NavBar correctly', () => {
	//     const wrapper = shallow(<UI.NavBar/>);
	//     wrapper.setProps({ theme: 'theme' });
	//     expect(wrapper).toMatchSnapshot();
	// });

	// test('render Nav correctly', () => {
	//     const wrapper = shallow(<UI.Nav/>);
	//     wrapper.setProps({ theme: 'theme' });
	//     expect(wrapper).toMatchSnapshot();
	// });

	// test('render NavRight correctly', () => {
	//     const wrapper = shallow(<UI.NavRight/>);
	//     wrapper.setProps({ theme: 'theme' });
	//     expect(wrapper).toMatchSnapshot();
	// });

	// test('render NavItem correctly', () => {
	//     const wrapper = shallow(<UI.NavItem/>);
	//     wrapper.setProps({ theme: 'theme' });
	//     expect(wrapper).toMatchSnapshot();
	// });

	// test('render NavButton correctly', () => {
	//     const wrapper = shallow(<UI.NavButton/>);
	//     wrapper.setProps({ theme: 'theme' });
	//     expect(wrapper).toMatchSnapshot();
	// });
});
