import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BrowserDynamicTestingModule, platformBrowserDynamicTesting } from '@angular/platform-browser-dynamic/testing';
import { AmplifyService } from '../../../providers/amplify.service'
import { RequireNewPasswordComponentCore } from '../../../components/authenticator/require-new-password-component/require-new-password.component.core';


describe('RequireNewPasswordComponentCore: ', () => {

  let component: RequireNewPasswordComponentCore;
  let service: AmplifyService;

  beforeEach(() => { 
    service = new AmplifyService();
    component = new RequireNewPasswordComponentCore(service);
  });

  afterEach(() => {
    service = null;
    component = null;
  });


  it('...should be created', () => {
    expect(component).toBeTruthy();
  });

  it('...should have an onSignIn method', () => {
    expect(component.onSignIn).toBeTruthy();
  });

  it('...should have an onSubmit method', () => {
    expect(component.onSubmit).toBeTruthy();
  });

  it('...should have a setPassword method', () => {
    expect(component.setPassword).toBeTruthy();
  });

  it('...should have a _setError method', () => {
    expect(component._setError).toBeTruthy();
  });

});