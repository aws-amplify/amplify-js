// tslint:disable
/*
 * Copyright 2017-2018 Amazon.com, Inc. or its affiliates. All Rights Reserved.
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
// tslint:enable

import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { 
  BrowserDynamicTestingModule,
  platformBrowserDynamicTesting
} from '@angular/platform-browser-dynamic/testing';
import { AmplifyService } from '../../../providers/amplify.service';
import { 
  AuthenticatorIonicComponent
} from '../../../components/authenticator/authenticator/authenticator.component.ionic';


describe('AuthenticatorIonicComponent: ', () => {

  let component: AuthenticatorIonicComponent;
  let service: AmplifyService;

  beforeEach(() => { 
    service = new AmplifyService();
    component = new AuthenticatorIonicComponent(service);
  });

  afterEach(() => {
    service = null;
    component = null;
  });


  it('...should be created', () => {
    expect(component).toBeTruthy();
  });

  it('...should have a subscribe method', () => {
    expect(component.subscribe).toBeTruthy();
  });

  it('...should have a shouldHide method', () => {
    expect(component.shouldHide).toBeTruthy();
  });

  it('...the shouldHide method returns false when receiving a value not in the hide array', () => {
    component.hide = ['value one', 'value two'];
    expect(component.shouldHide('value three')).toEqual(false);
  });

  it('...the shouldHide method should return true when receiving a value in the hide array', () => {
    component.hide = ['value one', 'value two'];
    expect(component.shouldHide('value two')).toEqual(true);
  });
});
