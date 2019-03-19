import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BrowserDynamicTestingModule, platformBrowserDynamicTesting } from '@angular/platform-browser-dynamic/testing';
import { AmplifyService } from '../../../providers/amplify.service'
import { FacebookSignInComponentCore } from '../../../components/authenticator/federated-sign-in-component/facebook-sign-in-component/facebook-sign-in.component.core'
import Amplify from 'aws-amplify';

describe('FacebookSignInComponentCore (basics): ', () => {

  let component: FacebookSignInComponentCore;
  let service: AmplifyService;

  beforeEach(() => { 
    service = new AmplifyService();
    component = new FacebookSignInComponentCore(service);
  });

  afterEach(() => {
    service = null;
    component = null;
  });


  it('...should be created', () => {
    expect(component).toBeTruthy();
  });
  it('...should have a onSignIn method', () => {
    expect(component.onSignIn).toBeTruthy();
  });
  it('...should have a facebookApi method', () => {
    expect(component.facebookApi).toBeTruthy();
  });
  it('...should have a facebookLoginStatus method', () => {
    expect(component.facebookLoginStatus).toBeTruthy();
  });
  it('...should have a facebookLogin method', () => {
    expect(component.facebookLogin).toBeTruthy();
  });
  it('...should have a fbAsyncInit method', () => {
    expect(component.fbAsyncInit).toBeTruthy();
  });
  it('...should have a createScript method', () => {
    expect(component.createScript).toBeTruthy();
  });
});