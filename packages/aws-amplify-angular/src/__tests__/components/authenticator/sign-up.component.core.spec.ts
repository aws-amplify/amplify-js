import { Component, DebugElement } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
// tslint:disable
import { By } from '@angular/platform-browser';
import { BrowserDynamicTestingModule, platformBrowserDynamicTesting } from '@angular/platform-browser-dynamic/testing';
import { AmplifyService } from '../../../providers/amplify.service'
import { SignUpComponentCore, SignUpField } from '../../../components/authenticator/sign-up-component/sign-up.component.core'
import Amplify from 'aws-amplify';
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

