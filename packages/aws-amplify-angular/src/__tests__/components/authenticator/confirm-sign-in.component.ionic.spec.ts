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

import { Component, DebugElement, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { 
  BrowserDynamicTestingModule,
  platformBrowserDynamicTesting
} from '@angular/platform-browser-dynamic/testing';
import { FormsModule } from '@angular/forms';
import * as AmplifyUI from '@aws-amplify/ui';
import { AmplifyService } from '../../../providers/amplify.service';
import { ConfirmSignInComponentIonic } 
from '../../../components/authenticator/confirm-sign-in-component/confirm-sign-in-component.ionic';


describe('ConfirmSignInComponentIonic: ', () => {

  let component: ConfirmSignInComponentIonic;
  let service: AmplifyService;
  let setAuthStateSpy;
  let confirmSignInSpy;

  beforeEach(() => { 
    service = new AmplifyService();
    component = new ConfirmSignInComponentIonic(service);
    setAuthStateSpy = jest.spyOn(component.amplifyService, 'setAuthState');
    confirmSignInSpy = jest.spyOn(component.amplifyService.auth(), 'confirmSignIn');
  });

  afterEach(() => {
    service = null;
    component = null;
    setAuthStateSpy.mockRestore();
    confirmSignInSpy.mockRestore();
  });


  it('...should be created', () => {
    expect(component).toBeTruthy();
  });

  it('...should have a setCode method', () => {
    expect(component.setCode).toBeTruthy();
  });

  it('...should have a code property that is initally undefined', () => {
    expect(component.code).toBeUndefined();
  });

  it('...the setCode method should set the component\'s code property', () => {
    component.setCode('200');
    expect(component.code).toEqual('200');
  });

  it('...should have an onConfirm method', () => {
    expect(component.onConfirm).toBeTruthy();
  });

  it('...should call confirmSignIn within the onConfirm method', () => {
    component._authState = {user: {challengeName: 'test-challange-name'}, state: 'test-state'};
    const callingAuthState = component.onConfirm();
    expect(component.amplifyService.auth().confirmSignIn).toBeCalled();
  });

  it('...should have an onSignIn method', () => {
    expect(component.onSignIn).toBeTruthy();
  });

  it('...should call setAuthState within the onSignIn method', () => {
    const callingAuthState = component.onSignIn();
    expect(component.amplifyService.setAuthState).toBeCalled();
  });

  it('...should have a _setError method', () => {
    expect(component._setError).toBeTruthy();
  });
});

describe('ConfirmSignInComponentIonic (classOverides unused): ', () => {

  let comp: ConfirmSignInComponentIonic;
  let fixture: ComponentFixture<ConfirmSignInComponentIonic>; 
  let amplifyService: AmplifyService;
  let ui: any;
  let signInDe: DebugElement;
  let signInEl: HTMLDivElement;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ConfirmSignInComponentIonic],
      providers: [AmplifyService],
      schemas: [ CUSTOM_ELEMENTS_SCHEMA ],
      imports: [FormsModule]
    });

    fixture = TestBed.createComponent(ConfirmSignInComponentIonic); 
    comp = fixture.componentInstance; 
    comp.authState = { state: 'confirmSignIn', user: {} };
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

  it('...it should have 1 input with an AmplifyUI class', () => {
    const input = signInEl.querySelectorAll(`.${ui.amplifyIonicInput}`);
    expect(input.length).toEqual(1);
  });

  it('...it should have a sectionFooter with an AmplifyUI class', () => {
    const sectionFooter = signInEl.querySelector(`.${ui.sectionFooter}`);
    expect(sectionFooter).toBeTruthy();
  });
});

describe('ConfirmSignInComponentIonic (classOverides global only): ', () => {

  let comp: ConfirmSignInComponentIonic;
  let fixture: ComponentFixture<ConfirmSignInComponentIonic>; 
  let amplifyService: AmplifyService;
  let ui: any;
  let signInDe: DebugElement;
  let signInEl: HTMLDivElement;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ConfirmSignInComponentIonic],
      schemas: [ CUSTOM_ELEMENTS_SCHEMA ],
      providers: [AmplifyService],
      imports: [FormsModule]
    });

    fixture = TestBed.createComponent(ConfirmSignInComponentIonic); 
    comp = fixture.componentInstance; 
    comp.authState = { state: 'confirmSignIn', user: {} };
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

  it('...it should have 1 input with an AmplifyUI class and a _classOverrides class', () => {
    const input = signInEl.querySelectorAll(`.${ui.amplifyIonicInput}.inputClass`);
    expect(input.length).toEqual(1);
  });

  it('...it should have a sectionFooter with an AmplifyUI class and _classOverrides class', () => {
    const sectionFooter = signInEl.querySelector(`.${ui.sectionFooter}.sectionFooterClass`);
    expect(sectionFooter).toBeTruthy();
  });
});

describe('ConfirmSignInComponentIonic (classOverides global and component): ', () => {

  let comp: ConfirmSignInComponentIonic;
  let fixture: ComponentFixture<ConfirmSignInComponentIonic>; 
  let amplifyService: AmplifyService;
  let ui: any;
  let signInDe: DebugElement;
  let signInEl: HTMLDivElement;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ConfirmSignInComponentIonic],
      providers: [AmplifyService],
      schemas: [ CUSTOM_ELEMENTS_SCHEMA ],
      imports: [FormsModule]
    });

    fixture = TestBed.createComponent(ConfirmSignInComponentIonic); 
    comp = fixture.componentInstance; 
    comp.authState = { state: 'confirmSignIn', user: {} };
    comp._classOverrides = {
      formSection: ['formSectionClassG'],
      sectionHeader: ['sectionHeaderClassG'],
      sectionBody: ['sectionBodyClassG'],
      formField: ['formFieldClassG'],
      amplifyIonicInput: ['inputClassG'],
      sectionFooter: ['sectionFooterClassG']
    },
    comp._confirmSignInConfig = {
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
    expect(input.length).toEqual(1);
  });

  it('...it should have all three types of sectionFooter classes', () => {
    const sectionFooter = signInEl.querySelector(`.${ui.sectionFooter}.sectionFooterClassG.sectionFooterClassC`);
    expect(sectionFooter).toBeTruthy();
  });
  // tslint:enable:max-line-length

});
