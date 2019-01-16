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

import { Component, DebugElement } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
// tslint:disable
import { By } from '@angular/platform-browser';
import { BrowserDynamicTestingModule, platformBrowserDynamicTesting } from '@angular/platform-browser-dynamic/testing';
import { AmplifyService } from '../../../providers/amplify.service'
import { SignUpComponentCore, SignUpField } from '../../../components/authenticator/sign-up-component/sign-up.component.core'
import Amplify from 'aws-amplify';
import * as AmplifyUI from '@aws-amplify/ui';
// tslint:enable

describe('SignUpComponentCore (basics): ', () => {

  let component: SignUpComponentCore;
  let service: AmplifyService;

  beforeEach(() => { 
    service = new AmplifyService();
    component = new SignUpComponentCore(service);
  });

  afterEach(() => {
    service = null;
    component = null;
  });


  it('...should be created', () => {
    expect(component).toBeTruthy();
  });

  it('...should have an onConfirmSignUp method', () => {
    expect(component.onConfirmSignUp).toBeTruthy();
  });

  it('...should have an onSignIn method', () => {
    expect(component.onSignIn).toBeTruthy();
  });

  it('...should have an onSignUp method', () => {
    expect(component.onSignUp).toBeTruthy();
  });

  it('...should have an sortFields method', () => {
    expect(component.sortFields).toBeTruthy();
  });

  it('...should have a countryList', () => {
    expect(Array.isArray(component.countries)).toBeTruthy();
  });

});

describe('SignUpComponentCore (methods and UI): ', () => {

  let component: SignUpComponentCore;
  let fixture: ComponentFixture<SignUpComponentCore>; 
  let amplifyService: AmplifyService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [SignUpComponentCore],
      providers: [AmplifyService],
      imports: [FormsModule]
    });

    fixture = TestBed.createComponent(SignUpComponentCore); 
    component = fixture.componentInstance; 
    amplifyService = TestBed.get(AmplifyService); 
  });

  afterEach(() => {
    component.signUpConfig = undefined;
  });


  it('...should be created with 4 default signUpFields', () => {
    expect(component.signUpFields.length).toBe(4);
    expect(component.signUpFields.find(e => e.key === 'username')).toBeTruthy();
    expect(component.signUpFields.find(e => e.key === 'password')).toBeTruthy();
    expect(component.signUpFields.find(e => e.key === 'email')).toBeTruthy();
    expect(component.signUpFields.find(e => e.key === 'phone_number')).toBeTruthy();
  });

  describe('...with component ngOnInit...', () => {
    beforeEach(async() => {
      component.signUpConfig = {
        signUpFields: [
          {
            key: 'testkey',
            label: 'testlabel'
          }
        ]
      };
      component.ngOnInit();
      await fixture.whenStable();
    });
    it('...should insert fields passed via signUpConfig', () => {

      expect(component.signUpFields.length).toBe(5);  
      expect(component.signUpFields.find(e => e.key === 'username')).toBeTruthy();
      expect(component.signUpFields.find(e => e.key === 'password')).toBeTruthy();
      expect(component.signUpFields.find(e => e.key === 'email')).toBeTruthy();
      expect(component.signUpFields.find(e => e.key === 'phone_number')).toBeTruthy();
      expect(component.signUpFields.find(e => e.key === 'testkey')).toBeTruthy();
    });
  });

  describe('...with component ngOnInit...', () => {
    beforeEach(async() => {
      component.signUpConfig = {
        signUpFields: [
          {
            key: 'testkey',
            label: 'testlabel'
          }
        ]
      };
      component.ngOnInit();
      await fixture.whenStable();
    });
    it('...should insert only passed fields when hideDefaults is true', () => {
      component.signUpConfig = {
        hideDefaults: true,
        signUpFields: [
          {
            key: 'testkey',
            label: 'testlabel'
          }
        ]
      };
      expect(component.signUpFields.length).toBe(1);  
    });
  });

  describe('...with component ngOnInit...', () => {
    beforeEach(async() => {
      component.signUpConfig = {
        hiddenDefaults: ['email'],
      };
      component.ngOnInit();
      await fixture.whenStable();
    });
    it('...should exclude hiddentDefaults', () => {
      expect(component.defaultSignUpFields.length).toBe(3);  
    });
  });

  describe('...with component ngOnInit...', () => {
    beforeEach(async() => {
      component.signUpConfig = {
        signUpFields: [
          {
            key: 'testkey1',
            label: 'testlabel1',
            displayOrder: 6
          },
          {
            key: 'testkey2',
            label: 'testlabel2',
            displayOrder: 5
          }
        ]
      };
      component.ngOnInit();
      await fixture.whenStable();
    });
    it('...should order fields by display order', () => {
      expect(component.signUpFields[5].key).toBe('testkey1');  
      expect(component.signUpFields[4].key).toBe('testkey2');  
    });
  });
});

describe('SignUpComponentCore (classOverides unused): ', () => {

  let comp: SignUpComponentCore;
  let fixture: ComponentFixture<SignUpComponentCore>; 
  let amplifyService: AmplifyService;
  let ui: any;
  let signUpDe: DebugElement;
  let signUpEl: HTMLDivElement;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [SignUpComponentCore],
      providers: [AmplifyService],
      imports: [FormsModule]
    });

    fixture = TestBed.createComponent(SignUpComponentCore); 
    comp = fixture.componentInstance; 
    comp.authState = { state: 'signUp', user: {} };
    amplifyService = TestBed.get(AmplifyService); 
    ui = AmplifyUI;
    signUpDe = fixture.debugElement;
    signUpEl = signUpDe.nativeElement;
    fixture.detectChanges();
  });

  it('...it should have a formSection with an AmplifyUI class', () => {
    const formSection = signUpEl.querySelector(`.${ui.formSection}`);
    expect(formSection).toBeTruthy();
  });

  it('...it should have a sectionHeader with an AmplifyUI class', () => {
    const sectionHeader = signUpEl.querySelector(`.${ui.sectionHeader}`);
    expect(sectionHeader).toBeTruthy();
  });

  it('...it should have a sectionBody with an AmplifyUI class', () => {
    const sectionBody = signUpEl.querySelector(`.${ui.sectionBody}`);
    expect(sectionBody).toBeTruthy();
  });

  it('...it should have two formFields with an AmplifyUI class', () => {
    const formField = signUpEl.querySelectorAll(`.${ui.formField}`);
    expect(formField.length).toEqual(4);
  });

  it('...it should have two inputs with an AmplifyUI class', () => {
    const input = signUpEl.querySelectorAll(`.${ui.input}`);
    expect(input.length).toEqual(4);
  });

  it('...it should have a sectionFooter with an AmplifyUI class', () => {
    const sectionFooter = signUpEl.querySelector(`.${ui.sectionFooter}`);
    expect(sectionFooter).toBeTruthy();
  });
});
  
describe('SignUpComponentCore (classOverides global only): ', () => {

  let comp: SignUpComponentCore;
  let fixture: ComponentFixture<SignUpComponentCore>; 
  let amplifyService: AmplifyService;
  let ui: any;
  let signUpDe: DebugElement;
  let signUpEl: HTMLDivElement;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [SignUpComponentCore],
      providers: [AmplifyService],
      imports: [FormsModule]
    });

    fixture = TestBed.createComponent(SignUpComponentCore); 
    comp = fixture.componentInstance; 
    comp.authState = { state: 'signUp', user: {} };
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
    signUpDe = fixture.debugElement;
    signUpEl = signUpDe.nativeElement;
    fixture.detectChanges();
  });

  it('...it should have a formSection with an AmplifyUI class and a _classOverrides class', () => {
    const formSection = signUpEl.querySelector(`.${ui.formSection}.formSectionClass`);
    expect(formSection).toBeTruthy();
  });

  it('...it should have a sectionHeader with an AmplifyUI class and _classOverrides class', () => {
    const sectionHeader = signUpEl.querySelector(`.${ui.sectionHeader}.sectionHeaderClass`);
    expect(sectionHeader).toBeTruthy();
  });

  it('...it should have a sectionBody with an AmplifyUI class and a _classOverrides class', () => {
    const sectionBody = signUpEl.querySelector(`.${ui.sectionBody}.sectionBodyClass`);
    expect(sectionBody).toBeTruthy();
  });

  it('...it should have 2 formFields with an AmplifyUI class and _classOverrides class', () => {
    const formField = signUpEl.querySelectorAll(`.${ui.formField}.formFieldClass`);
    expect(formField.length).toEqual(4);
  });

  it('...it should have 2 inputs with an AmplifyUI class and a _classOverrides class', () => {
    const input = signUpEl.querySelectorAll(`.${ui.input}.inputClass`);
    expect(input.length).toEqual(4);
  });

  it('...it should have a sectionFooter with an AmplifyUI class and _classOverrides class', () => {
    const sectionFooter = signUpEl.querySelector(`.${ui.sectionFooter}.sectionFooterClass`);
    expect(sectionFooter).toBeTruthy();
  });
});

describe('SignUpComponentCore (classOverides global and component): ', () => {

  let comp: SignUpComponentCore;
  let fixture: ComponentFixture<SignUpComponentCore>; 
  let amplifyService: AmplifyService;
  let ui: any;
  let signUpDe: DebugElement;
  let signUpEl: HTMLDivElement;

  beforeEach(async() => {
    TestBed.configureTestingModule({
      declarations: [SignUpComponentCore],
      providers: [AmplifyService],
      imports: [FormsModule]
    });

    fixture = TestBed.createComponent(SignUpComponentCore); 
    comp = fixture.componentInstance; 
    comp.authState = { state: 'signUp', user: {} };
    comp._classOverrides = {
      formSection: ['formSectionClassG'],
      sectionHeader: ['sectionHeaderClassG'],
      sectionBody: ['sectionBodyClassG'],
      formField: ['formFieldClassG'],
      input: ['inputClassG'],
      sectionFooter: ['sectionFooterClassG']
    },
    comp._signUpConfig = {
      header: 'testHeader',
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
    signUpDe = fixture.debugElement;
    signUpEl = signUpDe.nativeElement;
    fixture.detectChanges();
    await fixture.whenStable();

  });

  // tslint:disable:max-line-length

  it('...it should have all three types of formSection classes', () => {
    const formSection = signUpEl.querySelector(`.${ui.formSection}.formSectionClassG.formSectionClassC`);
    expect(formSection).toBeTruthy();
  });

  it('...it should have all three types of sectionHeader classes', () => {
    const sectionHeader = signUpEl.querySelector(`.${ui.sectionHeader}.sectionHeaderClassG.sectionHeaderClassC`);
    expect(sectionHeader).toBeTruthy();
  });

  it('...it should have all three types of sectionBody classes', () => {
    const sectionBody = signUpEl.querySelector(`.${ui.sectionBody}.sectionBodyClassG.sectionBodyClassC`);
    expect(sectionBody).toBeTruthy();
  });

  it('...it should have all three types of formField classes', () => {
    const formField = signUpEl.querySelectorAll(`.${ui.formField}.formFieldClassG.formFieldClassC`);
    expect(formField.length).toEqual(4);
  });

  it('...it should have all three types of input classes', () => {
    const input = signUpEl.querySelectorAll(`.${ui.input}.inputClassG.inputClassC`);
    expect(input.length).toEqual(4);
  });

  it('...it should have all three types of sectionFooter classes', () => {
    const sectionFooter = signUpEl.querySelector(`.${ui.sectionFooter}.sectionFooterClassG.sectionFooterClassC`);
    expect(sectionFooter).toBeTruthy();
  });
  // tslint:enable:max-line-length

});

