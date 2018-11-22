/*
 * Copyright 2017-2017 Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License"). You may not use this file except in compliance with
 * the License. A copy of the License is located at
 *
 *     http://aws.amazon.com/apache2.0/
 *
 * or in the "license" file accompanying this file. This file is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR
 * CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions
 * and limitations under the License.
 */
import { IAmplifyTheme, AmplifyThemeEntry } from './Amplify-UI/Amplify-UI-Theme';

export const Container: AmplifyThemeEntry = {
    fontFamily: `-apple-system,
                BlinkMacSystemFont,
                "Segoe UI",
                Roboto,
                "Helvetica Neue",
                Arial,
                sans-serif,
                "Apple Color Emoji",
                "Segoe UI Emoji",
                "Segoe UI Symbol"`,
    fontWeight: 400,
    lineHeight: '1.5',
    color: '#212529',
    textAlign: 'left',
    paddingLeft: '15px',
    paddingRight: '15px'
};

export const NavBar: AmplifyThemeEntry = {
    position: 'relative',
    border: '1px solid transparent',
    borderColor: '#e7e7e7'
};

export const NavRight: AmplifyThemeEntry = {
    textAlign: 'right'
};

export const Nav: AmplifyThemeEntry = {
    margin: '7.5px'
};

export const NavItem: AmplifyThemeEntry = {
    display: 'inline-block',
    padding: '10px 5px',
    lineHeight: '20px'
};

export const NavButton: AmplifyThemeEntry = {
    display: 'inline-block',
    padding: '6px 12px',
    marginTop: '8px',
    marginBottom: '8px',
    fontSize: '14px',
    fontWeight: 400,
    lineHeight: '1.42857143',
    textAlign: 'center',
    whiteSpace: 'nowrap',
    verticalAlign: 'middle',
    touchAction: 'manipulation',
    cursor: 'pointer',
    userSelect: 'none',
    backgroundImage: 'none',
    border: '1px solid transparent',
    borderRadius: '4px',
    color: '#333',
    backgroundColor: '#fff',
    borderColor: '#ccc'
};

export const FormContainer: AmplifyThemeEntry = {
    textAlign: 'center'
};

export const FormSection: AmplifyThemeEntry = {
    marginBottom: '20px',
    backgroundColor: '#fff',
    border: '1px solid #ddd',
    borderRadius: '4px',
    textAlign: 'left',
    width: '400px',
    display: 'inline-block'
};

export const ErrorSection: AmplifyThemeEntry = {
    marginBottom: '20px',
    color: '#fff',
    backgroundColor: '#f0ad4e',
    border: '1px solid #eea236',
    borderRadius: '4px',
    textAlign: 'left'
};

export const SectionHeader: AmplifyThemeEntry = {
    color: '#fff',
    backgroundColor: '#337ab7',
    borderColor: '#337ab7',
    padding: '10px 15px',
    borderBottom: '1px solid transparent',
    borderTopLeftRadius: '3px',
    borderTopRightRadius: '3px',
    textAlign: 'center'
};

export const SectionFooter: AmplifyThemeEntry = {
    color: '#333',
    backgroundColor: '#f5f5f5',
    padding: '10px 15px',
    borderTop: '1px solid #ddd',
    borderTopLeftRadius: '3px',
    borderTopRightRadius: '3px'
};

export const SectionBody: AmplifyThemeEntry = {
    padding: '15px'
};

export const FormRow: AmplifyThemeEntry = {
    marginBottom: '15px'
};

export const ActionRow: AmplifyThemeEntry = {
    marginBottom: '15px'
};

export const Input: AmplifyThemeEntry = {
    display: 'block',
    width: '100%',
    height: '34px',
    padding: '6px 12px',
    fontSize: '14px',
    lineHeight: '1.42857143',
    color: '#555',
    backgroundColor: '#fff',
    backgroundImage: 'none',
    border: '1px solid #ccc',
    borderRadius: '4px',
    boxShadow: 'inset 0 1px 1px rgba(0,0,0,.075)',
    boxSizing: 'border-box',
    transition: 'border-color ease-in-out .15s,box-shadow ease-in-out .15s'
};

export const Button: AmplifyThemeEntry = {
    display: 'inline-block',
    padding: '6px 12px',
    marginBottom: '0',
    fontSize: '14px',
    fontWeight: 400,
    lineHeight: '1.42857143',
    textAlign: 'center',
    whiteSpace: 'nowrap',
    verticalAlign: 'middle',
    touchAction: 'manipulation',
    cursor: 'pointer',
    userSelect: 'none',
    backgroundImage: 'none',
    border: '1px solid transparent',
    borderRadius: '4px',
    color: '#333',
    backgroundColor: '#fff',
    borderColor: '#ccc'
};

export const SignInButton: AmplifyThemeEntry = {
    position: 'relative',
    padding: '6px 12px 6px 44px',
    fontSize: '14px',
    textAlign: 'left',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    display: 'block',
    width: '100%',
    marginTop: '2px',
    '#google_signin_btn': {
        color: '#fff',
        backgroundColor: '#dd4b39',
        borderColor: 'rgba(0,0,0,0.2)',
    },
    '#facebook_signin_btn': {
        color: '#fff',
        backgroundColor: '#3b5998',
        borderColor: 'rgba(0,0,0,0.2)',
    }
};

export const Space: AmplifyThemeEntry = {
    display: 'inline-block',
    width: '20px'
};

export const A: AmplifyThemeEntry = {
    color: '#007bff',
    cursor: 'pointer'
};

export const Pre: AmplifyThemeEntry = {
    overflow: 'auto',
    fontFamily: `Menlo,
                Monaco,
                Consolas,
                "Courier New",
                monospace`,
    display: 'block',
    padding: '9.5px',
    margin: '0 0 10px',
    fontSize: '13px',
    lineHeight: '1.42857143',
    color: '#333',
    wordBreak: 'break-all',
    wordWrap: 'break-word',
    backgroundColor: '#f5f5f5',
    border: '1px solid #ccc',
    borderRadius: '4px'
};

export const Col1: AmplifyThemeEntry = {
    display: 'inline-block',
    width: '8.33333333%'
};

export const Col2: AmplifyThemeEntry = {
    display: 'inline-block',
    width: '16.66666667%'
};

export const Col3: AmplifyThemeEntry = {
    display: 'inline-block',
    width: '25%'
};

export const Col4: AmplifyThemeEntry = {
    display: 'inline-block',
    width: '33.33333333%'
};

export const Col5: AmplifyThemeEntry = {
    display: 'inline-block',
    width: '41.66666667%'
};

export const Col6: AmplifyThemeEntry = {
    display: 'inline-block',
    width: '50%'
};

export const Col7: AmplifyThemeEntry = {
    display: 'inline-block',
    width: '58.33333333%'
};

export const Col8: AmplifyThemeEntry = {
    display: 'inline-block',
    width: '66.66666667%'
};

export const Col9: AmplifyThemeEntry = {
    display: 'inline-block',
    width: '75%'
};

export const Col10: AmplifyThemeEntry = {
    display: 'inline-block',
    width: '83.33333333%'
};

export const Col11: AmplifyThemeEntry = {
    display: 'inline-block',
    width: '91.66666667%'
};

export const Col12: AmplifyThemeEntry = {
    display: 'inline-block',
    width: '100%'
};

export const Hidden: AmplifyThemeEntry = {
    display: 'none'
};

const Bootstrap: IAmplifyTheme = {
    container: Container,

    navBar: NavBar,
    nav: Nav,
    navRight: NavRight,
    navItem: NavItem,
    navButton: NavButton,

    formContainer: FormContainer,
    formSection: FormSection,
    errorSection: ErrorSection,
    sectionHeader: SectionHeader,
    sectionBody: SectionBody,
    sectionFooter: SectionFooter,

    formRow: FormRow,
    actionRow: ActionRow,

    space: Space,

    signInButton: SignInButton,

    input: Input,
    button: Button,
    a: A,
    pre: Pre,

    col1: Col1,
    col2: Col2,
    col3: Col3,
    col4: Col4,
    col5: Col5,
    col6: Col6,
    col7: Col7,
    col8: Col8,
    col9: Col9,
    col10: Col10,
    col11: Col11,
    col12: Col12,

    hidden: Hidden,
};

export default Bootstrap;
