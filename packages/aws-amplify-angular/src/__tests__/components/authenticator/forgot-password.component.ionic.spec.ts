import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BrowserDynamicTestingModule, platformBrowserDynamicTesting } from '@angular/platform-browser-dynamic/testing';
import { AmplifyService } from '../../../providers/amplify.service'
import { ForgotPasswordComponentIonic } from '../../../components/authenticator/forgot-password-component/forgot-password.component.ionic'


describe('ForgotPasswordComponentIonic: ', () => {

  let component: ForgotPasswordComponentIonic;
  let service: AmplifyService;

  beforeEach(() => { 
    service = new AmplifyService();
    component = new ForgotPasswordComponentIonic(service);
  });

  afterEach(() => {
    service = null;
    component = null;
  });


  it('...should be created', () => {
    expect(component).toBeTruthy();
  });

  it('...should have an onSend method', () => {
    expect(component.onSend).toBeTruthy();
  });
  
  it('...should have an onSignIn method', () => {
    expect(component.onSignIn).toBeTruthy();
  });

  it('...should have an onSubmit method', () => {
    expect(component.onSubmit).toBeTruthy();
  });

  it('...should have an setCode method', () => {
    expect(component.setCode).toBeTruthy();
  });

  it('...should have an _setError method', () => {
    expect(component._setError).toBeTruthy();
  });

});