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

import { Component, DebugElement, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import {
  BrowserDynamicTestingModule,platformBrowserDynamicTesting
} from '@angular/platform-browser-dynamic/testing';
import { AmplifyService } from '../../../providers/amplify.service';
import { FormsModule } from '@angular/forms';
import { 
  SignInComponentIonic
} from '../../../components/authenticator/sign-in-component/sign-in.component.ionic';
import Amplify from 'aws-amplify';
import * as AmplifyUI from '@aws-amplify/ui';

describe('SignInComponentIonic: ', () => {

  let component: SignInComponentIonic;
  let service: AmplifyService;
  let setAuthStateSpy;
  let signInSpy;


  beforeEach(() => { 
    service = new AmplifyService();
    component = new SignInComponentIonic(service);
    setAuthStateSpy = jest.spyOn(component.amplifyService, 'setAuthState');
    signInSpy = jest.spyOn(component.amplifyService.auth(), 'signIn');
  });

  afterEach(() => {
    service = null;
    component = null;
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
    setAuthStateSpy.mockRestore();
  });

  it('...should have an onSignIn method', () => {
    expect(component.onSignIn).toBeTruthy();
  });

  it('...should call signIn within the onSignUp method', () => {
    component.username = 'test-username3';
    component.password = 'test-password3';
    const callingAuthState = component.onSignIn();
    expect(component.amplifyService.auth().signIn).toBeCalled();
    signInSpy.mockRestore();
  });

  it('...should have an onSignUp method', () => {
    expect(component.onSignUp).toBeTruthy();
  });

  it('...should call setAuthState within the onSignUp method', () => {
    component.username = 'test-username2';
    const callingAuthState = component.onSignUp();
    expect(component.amplifyService.setAuthState).toBeCalled();
    setAuthStateSpy.mockRestore();
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

describe('SignInComponentIonic (classOverides unused): ', () => {

  let comp: SignInComponentIonic;
  let fixture: ComponentFixture<SignInComponentIonic>; 
  let amplifyService: AmplifyService;
  let ui: any;
  let signInDe: DebugElement;
  let signInEl: HTMLDivElement;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [SignInComponentIonic],
      providers: [AmplifyService],
      schemas: [ CUSTOM_ELEMENTS_SCHEMA ],
      imports: [FormsModule]
    });

    fixture = TestBed.createComponent(SignInComponentIonic); 
    comp = fixture.componentInstance; 
    comp.authState = { state: 'signIn', user: {} };
    amplifyService = TestBed.get(AmplifyService); 
    ui = AmplifyUI;
    signInDe = fixture.debugElement;
    signInEl = signInDe.nativeElement;
    fixture.detectChanges();
  });

  it('...it should have a formSection with an AmplifyUI class', () => {
    const formSection = signInEl.querySelectorAll(`.${ui.formSection}`);
    expect(formSection.length).toEqual(1);
  });

  it('...it should have a sectionHeader with an AmplifyUI class', () => {
    const sectionHeader = signInEl.querySelector(`.${ui.sectionHeader}`);
    expect(sectionHeader).toBeTruthy();
  });

  it('...it should have a sectionBody with an AmplifyUI class', () => {
    const sectionBody = signInEl.querySelector(`.${ui.sectionBody}`);
    expect(sectionBody).toBeTruthy();
  });

  it('...it should have two amplifyIonicInputs with an AmplifyUI class', () => {
    const input = signInEl.querySelectorAll(`.${ui.amplifyIonicInput}`);
    expect(input.length).toEqual(2);
  });

  it('...it should have a sectionFooter with an AmplifyUI class', () => {
    const sectionFooter = signInEl.querySelector(`.${ui.sectionFooter}`);
    expect(sectionFooter).toBeTruthy();
  });
});

describe('SignInComponentIonic (classOverides global only): ', () => {

  let comp: SignInComponentIonic;
  let fixture: ComponentFixture<SignInComponentIonic>; 
  let amplifyService: AmplifyService;
  let ui: any;
  let signInDe: DebugElement;
  let signInEl: HTMLDivElement;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [SignInComponentIonic],
      schemas: [ CUSTOM_ELEMENTS_SCHEMA ],
      providers: [AmplifyService],
      imports: [FormsModule]
    });

    fixture = TestBed.createComponent(SignInComponentIonic); 
    comp = fixture.componentInstance; 
    comp.authState = { state: 'signIn', user: {} };
    comp._classOverrides = {
      formSection: ['formSectionClass'],
      sectionHeader: ['sectionHeaderClass'],
      sectionBody: ['sectionBodyClass'],
      formField: ['formFieldClass'],
      amplifyIonicInput: ['inputClass'],
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

  it('...it should have 2 inputs with an AmplifyUI class and a _classOverrides class', () => {
    const input = signInEl.querySelectorAll(`.${ui.amplifyIonicInput}.inputClass`);
    expect(input.length).toEqual(2);
  });

  it('...it should have a sectionFooter with an AmplifyUI class and _classOverrides class', () => {
    const sectionFooter = signInEl.querySelector(`.${ui.sectionFooter}.sectionFooterClass`);
    expect(sectionFooter).toBeTruthy();
  });
});

describe('SignInComponentIonic (classOverides global and component): ', () => {

  let comp: SignInComponentIonic;
  let fixture: ComponentFixture<SignInComponentIonic>; 
  let amplifyService: AmplifyService;
  let ui: any;
  let signInDe: DebugElement;
  let signInEl: HTMLDivElement;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [SignInComponentIonic],
      providers: [AmplifyService],
      schemas: [ CUSTOM_ELEMENTS_SCHEMA ],
      imports: [FormsModule]
    });

    fixture = TestBed.createComponent(SignInComponentIonic); 
    comp = fixture.componentInstance; 
    comp.authState = { state: 'signIn', user: {} };
    comp._classOverrides = {
      formSection: ['formSectionClassG'],
      sectionHeader: ['sectionHeaderClassG'],
      sectionBody: ['sectionBodyClassG'],
      formField: ['formFieldClassG'],
      amplifyIonicInput: ['inputClassG'],
      sectionFooter: ['sectionFooterClassG']
    },
    comp._signInConfig = {
      classOverrides: {
        formSection: ['formSectionClassC'],
        sectionHeader: ['sectionHeaderClassC'],
        sectionBody: ['sectionBodyClassC'],
        formField: ['formFieldClassC'],
        amplifyIonicInput: ['inputClassC'],
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

  it('...it should have all three types of formSection classes', () => {
    const formSection = signInEl.querySelector(`.${ui.formSection}.formSectionClassG.formSectionClassC`);
    expect(formSection).toBeTruthy();
  });

  it('...it should have all three types of sectionHeader classes', () => {
    const sectionHeader = signInEl.querySelector(`.${ui.sectionHeader}.sectionHeaderClassG.sectionHeaderClassC`);
    expect(sectionHeader).toBeTruthy();
  });

  it('...it should have all three types of sectionBody classes', () => {
    const sectionBody = signInEl.querySelector(`.${ui.sectionBody}.sectionBodyClassG.sectionBodyClassC`);
    expect(sectionBody).toBeTruthy();
  });

  it('...it should have all three types of input classes', () => {
    const input = signInEl.querySelectorAll(`.${ui.amplifyIonicInput}.inputClassG.inputClassC`);
    expect(input.length).toEqual(2);
  });

  it('...it should have all three types of sectionFooter classes', () => {
    const sectionFooter = signInEl.querySelector(`.${ui.sectionFooter}.sectionFooterClassG.sectionFooterClassC`);
    expect(sectionFooter).toBeTruthy();
  });
  // tslint:enable:max-line-length

});
