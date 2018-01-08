import { withAuthenticator, AuthenticatorWrapper } from '../../src/Auth/index'
import React, {Component} from 'react';

describe('hoc tests', () => {
    describe('withAuthenticator test', () => {
        test('when signed in', () => {
            const MockComp = class extends Component {
                render() {
                    return <div />;
                }
            }
            const CompWithAuth = withAuthenticator(MockComp);
            const wrapper = shallow(<CompWithAuth authState={'signedIn'}/>);
            expect(wrapper).toMatchSnapshot();
        });

        test('when not signed in', () => {
            const MockComp = class extends Component {
                render() {
                    return <div />;
                }
            }
            const CompWithAuth = withAuthenticator(MockComp);
            const wrapper = shallow(<CompWithAuth amplifyConfig={'amplifyConfig'}/>);
            expect(wrapper).toMatchSnapshot();
        });
    });
});

describe('AuthenticatorWrapper test', () => {
    describe('render test', () => {
        test('render correctly', () => {
            const mockfn = jest.fn();
            const wrapper = shallow(<AuthenticatorWrapper children={mockfn}/>)

            expect(wrapper).toMatchSnapshot();
        });
    }); 
});
