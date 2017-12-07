import React, { Component } from 'react';
import withFacebook, { FacebookButton } from '../../../src/Auth/Provider/withFacebook';
import { SignInButton, Button } from '../../../src/AmplifyUI';
import { Auth } from 'aws-amplify';


describe('FacebookButton test', () => {
    test('render correctly', () => {
        const wrapper = shallow(<FacebookButton/>)

       // expect(wrapper).toMatchSnapshot();
    });

    test.only('directly return if closing the poped up window', async () => {
        const Button = (props) => (
            <SignInButton
                id="facebook_signin_btn"
                onClick={props.facebookSignIn}
            >
                Sign In with Facebook
            </SignInButton>
        )

        const CompWithFacebook = withFacebook(Button);
        const wrapper = shallow(<CompWithFacebook/>);


     //   expect(wrapper.find(Button).length).toBe(1);
        await wrapper.find(Button).simulate('click');
    });
});

// describe('withFacebook test', () => {
//     test('directly return if closing the poped up window', () => {
//         const MockComp = class extends Component {
//             render() {
//                 return <div />;
//             }
//         }
        
//         const CompWithFacebook = withFacebook(MockComp);
//         const wrapper = shallow(<CompWithFacebook authState={'signedIn'}/>);
//         expect(wrapper).toMatchSnapshot();
//     });
// });
