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

import { Component , DebugElement } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { 
  BrowserDynamicTestingModule,
  platformBrowserDynamicTesting
} from '@angular/platform-browser-dynamic/testing';
import { By } from "@angular/platform-browser";
import { FormsModule } from '@angular/forms';
import { AmplifyService } from '../../../providers/amplify.service';
import {
   SignInComponentCore
} from '../../../components/authenticator/sign-in-component/sign-in.component.core';
import Amplify from 'aws-amplify';
import * as AmplifyUI from '@aws-amplify/ui';

describe('SignInComponentCore: ', () => {

  let component: SignInComponentCore;
  let service: AmplifyService;
  let setAuthStateSpy;
  let signInSpy;

  beforeEach(() => { 
    service = new AmplifyService();
    component = new SignInComponentCore(service);
    setAuthStateSpy = jest.spyOn(component.amplifyService, 'setAuthState');
    signInSpy = jest.spyOn(component.amplifyService.auth(), 'signIn');
  });

  afterEach(() => {
    service = null;
    component = null;
    setAuthStateSpy.mockRestore();
    signInSpy.mockRestore();
  });


  it('...should be created', () => {
    expect(component).toBeTruthy();
  });

  it('...should have an onForgotPassword method', () => {
    expect(component.onForgotPassword).toBeTruthy();
  });

  it('...should call setAuthState within the onForgotPassword method', () => {
    component.username = 'test-username2';
    const callingAuthState = component.onForgotPassword();
    expect(component.amplifyService.setAuthState).toBeCalled();
  });

  it('...should have an onSignIn method', () => {
    expect(component.onSignIn).toBeTruthy();
  });

  it('...should call signIn within the onSignUp method', () => {
    component.username = 'test-username3';
    component.password = 'test-password3';
    const callingAuthState = component.onSignIn();
    expect(component.amplifyService.auth().signIn).toBeCalled();
  });

  it('...should have an onSignUp method', () => {
    expect(component.onSignUp).toBeTruthy();
  });

  it('...should call setAuthState within the onSignUp method', () => {
    component.username = 'test-username2';
    const callingAuthState = component.onSignUp();
    expect(component.amplifyService.setAuthState).toBeCalled();
  });

  it('...should have a setPassword method', () => {
    expect(component.setPassword).toBeTruthy();
  });

  it('...should set this.password with the setPassword method', () => {
    component.setPassword('my-test-password');
    expect(component.password).toEqual('my-test-password');
  });

  it('...should have a setUsername method', () => {
    expect(component.setUsername).toBeTruthy();
  });

  it('...should set this.username with the setUsername method', () => {
    component.setUsername('my-test-name');
    expect(component.username).toEqual('my-test-name');
  });
});

describe('SignInComponentCore (classOverides unused): ', () => {

  let comp: SignInComponentCore;
  let fixture: ComponentFixture<SignInComponentCore>; 
  let amplifyService: AmplifyService;
  let ui: any;
  let signInDe: DebugElement;
  let signInEl: HTMLDivElement;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [SignInComponentCore],
      providers: [AmplifyService],
      imports: [FormsModule]
    });

    fixture = TestBed.createComponent(SignInComponentCore); 
    comp = fixture.componentInstance; 
    comp.authState = { state: 'signIn', user: {} };
    amplifyService = TestBed.get(AmplifyService); 
    ui = AmplifyUI;
    signInDe = fixture.debugElement;
    signInEl = signInDe.nativeElement;
    fixture.detectChanges();
  });

  it('...it should have a formSection with an AmplifyUI class', () => {
    const formSection = signInEl.querySelector(`.${ui.formSection}`);
    expect(formSection).toBeTruthy();
  });

  it('...it should have a sectionHeader with an AmplifyUI class', () => {
    const sectionHeader = signInEl.querySelector(`.${ui.sectionHeader}`);
    expect(sectionHeader).toBeTruthy();
  });

  it('...it should have a sectionBody with an AmplifyUI class', () => {
    const sectionBody = signInEl.querySelector(`.${ui.sectionBody}`);
    expect(sectionBody).toBeTruthy();
  });

  it('...it should have two formFields with an AmplifyUI class', () => {
    const formField = signInEl.querySelectorAll(`.${ui.formField}`);
    expect(formField.length).toEqual(2);
  });

  it('...it should have two inputs with an AmplifyUI class', () => {
    const input = signInEl.querySelectorAll(`.${ui.input}`);
    expect(input.length).toEqual(2);
  });

  it('...it should have a sectionFooter with an AmplifyUI class', () => {
    const sectionFooter = signInEl.querySelector(`.${ui.sectionFooter}`);
    expect(sectionFooter).toBeTruthy();
  });
});
  
describe('SignInComponentCore (classOverides global only): ', () => {

  let comp: SignInComponentCore;
  let fixture: ComponentFixture<SignInComponentCore>; 
  let amplifyService: AmplifyService;
  let ui: any;
  let signInDe: DebugElement;
  let signInEl: HTMLDivElement;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [SignInComponentCore],
      providers: [AmplifyService],
      imports: [FormsModule]
    });

    fixture = TestBed.createComponent(SignInComponentCore); 
    comp = fixture.componentInstance; 
    comp.authState = { state: 'signIn', user: {} };
    comp._classOverrides = {
      formSection: ['formSectionClass'],
      sectionHeader: ['sectionHeaderClass'],
      sectionBody: ['sectionBodyClass'],
      formField: ['formFieldClass'],
      input: ['inputClass'],
      sectionFooter: ['sectionFooterClass']
    },
    amplifyService = TestBed.get(AmplifyService); 
    ui = AmplifyUI;
    signInDe = fixture.debugElement;
    signInEl = signInDe.nativeElement;
    fixture.detectChanges();
  });

  it('...it should have a formSection with an AmplifyUI class and a _classOverrides class', () => {
    const formSection = signInEl.querySelector(`.${ui.formSection}.formSectionClass`);
    expect(formSection).toBeTruthy();
  });

  it('...it should have a sectionHeader with an AmplifyUI class and _classOverrides class', () => {
    const sectionHeader = signInEl.querySelector(`.${ui.sectionHeader}.sectionHeaderClass`);
    expect(sectionHeader).toBeTruthy();
  });

  it('...it should have a sectionBody with an AmplifyUI class and a _classOverrides class', () => {
    const sectionBody = signInEl.querySelector(`.${ui.sectionBody}.sectionBodyClass`);
    expect(sectionBody).toBeTruthy();
  });

  it('...it should have 2 formFields with an AmplifyUI class and a _classOverrides class', () => {
    const formField = signInEl.querySelectorAll(`.${ui.formField}.formFieldClass`);
    expect(formField.length).toEqual(2);
  });

  it('...it should have 2 inputs with an AmplifyUI class and a _classOverrides class', () => {
    const input = signInEl.querySelectorAll(`.${ui.input}.inputClass`);
    expect(input.length).toEqual(2);
  });

  it('...it should have a sectionFooter with an AmplifyUI class and _classOverrides class', () => {
    const sectionFooter = signInEl.querySelector(`.${ui.sectionFooter}.sectionFooterClass`);
    expect(sectionFooter).toBeTruthy();
  });
});

describe('SignInComponentCore (classOverides global and component): ', () => {

  let comp: SignInComponentCore;
  let fixture: ComponentFixture<SignInComponentCore>; 
  let amplifyService: AmplifyService;
  let ui: any;
  let signInDe: DebugElement;
  let signInEl: HTMLDivElement;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [SignInComponentCore],
      providers: [AmplifyService],
      imports: [FormsModule]
    });

    fixture = TestBed.createComponent(SignInComponentCore); 
    comp = fixture.componentInstance; 
    comp.authState = { state: 'signIn', user: {} };
    comp._classOverrides = {
      formSection: ['formSectionClassG'],
      sectionHeader: ['sectionHeaderClassG'],
      sectionBody: ['sectionBodyClassG'],
      formField: ['formFieldClassG'],
      input: ['inputClassG'],
      sectionFooter: ['sectionFooterClassG']
    },
    comp._signInConfig = {
      classOverrides: {
        formSection: ['formSectionClassC'],
        sectionHeader: ['sectionHeaderClassC'],
        sectionBody: ['sectionBodyClassC'],
        formField: ['formFieldClassC'],
        input: ['inputClassC'],
        sectionFooter: ['sectionFooterClassC']
      }
    };
    amplifyService = TestBed.get(AmplifyService); 
    ui = AmplifyUI;
    signInDe = fixture.debugElement;
    signInEl = signInDe.nativeElement;
    fixture.detectChanges();
  });

  // tslint:disable:max-line-length

  it('...it should have all three types of formSection clases', () => {
    const formSection = signInEl.querySelector(`.${ui.formSection}.formSectionClassG.formSectionClassC`);
    expect(formSection).toBeTruthy();
  });

  it('...it should have all three types of sectionHeader clases', () => {
    const sectionHeader = signInEl.querySelector(`.${ui.sectionHeader}.sectionHeaderClassG.sectionHeaderClassC`);
    expect(sectionHeader).toBeTruthy();
  });

  it('...it should have all three types of sectionBody clases', () => {
    const sectionBody = signInEl.querySelector(`.${ui.sectionBody}.sectionBodyClassG.sectionBodyClassC`);
    expect(sectionBody).toBeTruthy();
  });

  it('...it should have all three types of formField clases', () => {
    const formField = signInEl.querySelectorAll(`.${ui.formField}.formFieldClassG.formFieldClassC`);
    expect(formField.length).toEqual(2);
  });

  it('...it should have all three types of input clases', () => {
    const input = signInEl.querySelectorAll(`.${ui.input}.inputClassG.inputClassC`);
    expect(input.length).toEqual(2);
  });

  it('...it should have all three types of sectionFooter clases', () => {
    const sectionFooter = signInEl.querySelector(`.${ui.sectionFooter}.sectionFooterClassG.sectionFooterClassC`);
    expect(sectionFooter).toBeTruthy();
  });
  // tslint:enable:max-line-length

});

