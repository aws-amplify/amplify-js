import React from 'react';
import { Header, Footer, InputRow, RadioRow, CheckboxRow, MessageRow, ButtonRow, Link } from '../src/AmplifyUI';

describe('AmplifyUi test', () => {
    test('render Header correctly', () => {
        const wrapper = shallow(<Header/>);
        expect(wrapper).toMatchSnapshot();
    });

    test('render Footer correctly', () => {
        const wrapper = shallow(<Footer/>);
        expect(wrapper).toMatchSnapshot();
    });

    test('render InputRow correctly', () => {
        const wrapper = shallow(<InputRow/>);
        expect(wrapper).toMatchSnapshot();
    });

    test('render RadioRow correctly', () => {
        const wrapper = shallow(<RadioRow/>);
        expect(wrapper).toMatchSnapshot();
    });

    test('render CheckboxRow correctly', () => {
        const wrapper = shallow(<CheckboxRow/>);
        expect(wrapper).toMatchSnapshot();
    });

    test('render MessageRow correctly', () => {
        const wrapper = shallow(<MessageRow/>);
        expect(wrapper).toMatchSnapshot();
    });

    test('render ButtonRow correctly', () => {
        const wrapper = shallow(<ButtonRow/>);
        expect(wrapper).toMatchSnapshot();
    });

    test('render Link correctly', () => {
        const wrapper = shallow(<Link/>);
        expect(wrapper).toMatchSnapshot();
    });
});