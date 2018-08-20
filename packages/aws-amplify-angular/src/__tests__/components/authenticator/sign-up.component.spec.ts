import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BrowserDynamicTestingModule, platformBrowserDynamicTesting } from '@angular/platform-browser-dynamic/testing';
import { AmplifyService } from '../../../providers/amplify.service'
import { SignUpComponentCore, SignUpComponentIonic } from '../../../components/authenticator/sign-up-component'


describe('SignUpComponentCore: ', () => {

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
});

describe('SignUpComponentIonic: ', () => {

  let component: SignUpComponentIonic;
  let service: AmplifyService;

  beforeEach(() => {
    service = new AmplifyService();
    component = new SignUpComponentIonic(service);
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
});