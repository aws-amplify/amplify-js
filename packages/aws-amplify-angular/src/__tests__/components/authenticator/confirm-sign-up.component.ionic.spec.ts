import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BrowserDynamicTestingModule, platformBrowserDynamicTesting } from '@angular/platform-browser-dynamic/testing';
import { AmplifyService } from '../../../providers/amplify.service'
import { ConfirmSignUpComponentIonic } from '../../../components/authenticator/confirm-sign-up-component/confirm-sign-up.component.ionic'


describe('ConfirmSignUpComponentIonic: ', () => {

  let component: ConfirmSignUpComponentIonic;
  let service: AmplifyService;

  beforeEach(() => { 
    service = new AmplifyService();
    component = new ConfirmSignUpComponentIonic(service);
  });

  afterEach(() => {
    service = null;
    component = null;
  });


  it('...should be created', () => {
    expect(component).toBeTruthy();
  });

  it('...should have an onConfirm method', () => {
    expect(component.onConfirm).toBeTruthy();
  });

  it('...should have an onResend method', () => {
    expect(component.onResend).toBeTruthy();
  }); 

  it('...should have an onSignIn method', () => {
    expect(component.onSignIn).toBeTruthy();
  }); 

  it('...should have an setCode method', () => {
    expect(component.setCode).toBeTruthy();
  });

  it('...should have an setUsername method', () => {
    expect(component.setUsername).toBeTruthy();
  });

});