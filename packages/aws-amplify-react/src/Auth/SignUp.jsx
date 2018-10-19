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

import React, { Component } from 'react';

import { I18n } from '@aws-amplify/core';
import Auth from '@aws-amplify/auth';

import AuthPiece from './AuthPiece';
import {
    FormSection,
    SectionHeader,
    SectionBody,
    SectionFooter,
    FormField,
    Input,
    InputLabel,
    SelectInput,
    Button,
    Link,
    SectionFooterPrimaryContent,
    SectionFooterSecondaryContent,
} from '../Amplify-UI/Amplify-UI-Components-React';

import countryDialCodes from './common/country-dial-codes.js';

const defaultSignUpFields = [
    {
        label: 'Username',
        key: 'username',
        required: false,
        displayOrder: 1
    },
    {
        label: 'Password',
        key: 'password',
        required: true,
        type: 'password',
        displayOrder: 2,
    },
    {
        label: 'Email',
        key: 'email',
        required: true,
        type: 'email',
        displayOrder: 3
    },
    {
        label: 'Phone Number',
        key: 'phone_number',
        required: true,
        displayOrder: 4
    }
];

export default class SignUp extends AuthPiece {
    constructor(props) {
        super(props);

        this._validAuthStates = ['signUp'];
        this.signUp = this.signUp.bind(this);
        this.sortFields = this.sortFields.bind(this);

        this.inputs = {
            dial_code: "+1",
        }

        if (this.props.signUpConfig &&
            this.props.signUpConfig.signUpFields &&
            this.props.signUpConfig.signUpFields.length > 0
        ) {
            this.signUpFields = this.props.signUpConfig.signUpFields;
        }
    }

    signUp() {
        const validation = this.validate();
        if (validation && validation.length > 0) {
          return this.error(`The following fields need to be filled out: ${validation.join(', ')}`);
        }
        if (!Auth || typeof Auth.signUp !== 'function') {
            throw new Error('No Auth module found, please ensure @aws-amplify/auth is imported');
        }

        let signup_info = {
            username: this.inputs.username,
            password: this.inputs.password,
            attributes: {
                
            }
        };

        const inputKeys = Object.keys(this.inputs);
        const inputVals = Object.values(this.inputs);

        inputKeys.forEach((key, index) => {
            if (!['username', 'password', 'checkedValue'].includes(key)) {
              if (key !== 'phone_line_number' && key !== 'dial_code') {
                signup_info.attributes[key] = inputVals[index];
              } else {
                  signup_info.attributes['phone_number'] = `+${this.inputs.dial_code}${this.inputs.phone_line_number}`
              }
            }
          });

        Auth.signUp(signup_info).then(() => this.changeState('confirmSignUp', username))
        .catch(err => this.error(err));
    }

    showComponent(theme) {
        const { hide } = this.props;
        this.sortFields();
        if (hide && hide.includes(SignUp)) { return null; }

        return (
            <FormSection theme={theme}>
                <SectionHeader theme={theme}>{I18n.get('Create a new account')}</SectionHeader>
                <SectionBody theme={theme}>
                    {
                        this.signUpFields.map((field) => {
                            return field.key !== 'phone_number' ? (
                                <FormField them={theme}>
                                    <InputLabel>{I18n.get(field.label)} *</InputLabel>
                                    <Input
                                        autoFocus
                                        placeholder={I18n.get(field.placeholder)}
                                        theme={theme}
                                        key={field.key}
                                        name={field.key}
                                        onChange={this.handleInputChange}
                                    />
                                </FormField>
                            ) : (
                                <FormField theme={theme}>
                                    <InputLabel>{I18n.get('Phone Number')}</InputLabel>
                                    <SelectInput theme={theme}>
                                        <select key="dial_code" name="dial_code" defaultValue="+1" onChange={this.handleInputChange}>
                                            {countryDialCodes.map(dialCode =>
                                                <option key={dialCode} value={dialCode}>
                                                    {dialCode}
                                                </option>
                                            )}
                                        </select>
                                        <Input
                                            placeholder={I18n.get(field.placeholder)}
                                            theme={theme}
                                            key="phone_line_number"
                                            name="phone_line_number"
                                            onChange={this.handleInputChange}
                                        />
                                    </SelectInput>
                                </FormField>
                            )
                        })
                    }
                </SectionBody>
                <SectionFooter theme={theme}>
                    <SectionFooterPrimaryContent theme={theme}>
                        <Button onClick={this.signUp} theme={theme}>
                            {I18n.get('Create Account')}
                        </Button>
                    </SectionFooterPrimaryContent>
                    <SectionFooterSecondaryContent theme={theme}>
                        {I18n.get('Have an account? ')}
                        <Link theme={theme} onClick={() => this.changeState('signIn')}>
                            {I18n.get('Sign in')}
                        </Link>
                    </SectionFooterSecondaryContent>
                </SectionFooter>
            </FormSection>
        )
    }

    validate() {
        const invalids = [];
        this.signUpFields.map((el) => {
          if (el.key !== 'phone_number') {
            if (el.required && !this.inputs[el.key]) {
              el.invalid = true;
              invalids.push(el.label);
            } else {
              el.invalid = false;
            }        
          } else {
            if (el.required && (!this.inputs.dial_code || !this.inputs.phone_line_number)) {
              el.invalid = true;
              invalids.push(el.label);
            } else {
              el.invalid = false;
            }
          }
        });
        return invalids;
      }

    sortFields() {
        if (this.props.signUpConfig &&
          this.props.signUpConfig.signUpFields &&
          this.props.signUpConfig.signUpFields.length > 0
        ) {
    
          if (!this.props.signUpConfig.hideDefaults) {
            // see if fields passed to component should override defaults
            defaultSignUpFields.forEach((f, i) => {
              const matchKey = this.signUpFields.findIndex((d) => {
                return d.key === f.key;
              });
              if (matchKey === -1) {
                this.signUpFields.push(f);
              }
            });
          }
    
          /* 
            sort fields based on following rules:
            1. Fields with displayOrder are sorted before those without displayOrder
            2. Fields with conflicting displayOrder are sorted alphabetically by key
            3. Fields without displayOrder are sorted alphabetically by key
          */
          this.signUpFields.sort((a, b) => {
            if (a.displayOrder && b.displayOrder) {
              if (a.displayOrder < b.displayOrder) {
                return -1;
              } else if (a.displayOrder > b.displayOrder) {
                return 1;
              } else {
                if (a.key < b.key) {
                  return -1;
                } else {
                  return 1;
                }
              }
            } else if (!a.displayOrder && b.displayOrder) {
              return 1;
            } else if (a.displayOrder && !b.displayOrder) {
              return -1;
            } else if (!a.displayOrder && !b.displayOrder) {
              if (a.key < b.key) {
                return -1;
              } else {
                return 1;
              }
            }
          });
        } else {
          this.signUpFields = defaultSignUpFields;
        }
    
      }
}
