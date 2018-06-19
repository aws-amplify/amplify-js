import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BrowserDynamicTestingModule, platformBrowserDynamicTesting } from '@angular/platform-browser-dynamic/testing';
import { AmplifyService } from '../../../providers/amplify.service'
import { SignInComponent } from '../../../components/authenticator/sign-in.component'


describe('ConfirmSignUpComponent: ', () => {

  let component: SignInComponent;
  let service: AmplifyService;

  beforeEach(() => { 
    service = new AmplifyService();
    component = new SignInComponent(service);
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

  it('...should have an onSignIn method', () => {
    expect(component.onSignIn).toBeTruthy();
  });

  it('...should have an onSignUp method', () => {
    expect(component.onSignUp).toBeTruthy();
  });

  it('...should have a setPassword method', () => {
    expect(component.setPassword).toBeTruthy();
  });

  it('...should have a setUsername method', () => {
    expect(component.setUsername).toBeTruthy();
  });

});