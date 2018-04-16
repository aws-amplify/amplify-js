import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BrowserDynamicTestingModule, platformBrowserDynamicTesting } from '@angular/platform-browser-dynamic/testing';
import { AmplifyService } from '../../../providers/amplify.service'
import { ConfirmSignInComponent } from '../../../components/authenticator/confirm-sign-in.component'


describe('ConfirmSignInComponent: ', () => {

  let component: ConfirmSignInComponent;
  let service: AmplifyService;

  beforeEach(() => { 
    service = new AmplifyService();
    component = new ConfirmSignInComponent(service);
  });

  afterEach(() => {
    service = null;
    component = null;
  });


  it('...should be created', () => {
    expect(component).toBeTruthy();
  });

  it('...should have a setCode method', () => {
    expect(component.setCode).toBeTruthy();
  });


  it('...should have a code property that is initally undefined', () => {
    expect(component.code).toBeUndefined();
  })

  it('...the setCode method should set the component\'s code property', () => {
    component.setCode('200');
    expect(component.code).toEqual('200');
  });

  it('...should have an onConfirm method', () => {
    expect(component.onConfirm).toBeTruthy();
  });

  it('...should have an onSignIn method', () => {
    expect(component.onSignIn).toBeTruthy();
  });

  it('...should have a _setError method', () => {
    expect(component._setError).toBeTruthy();
  });

});