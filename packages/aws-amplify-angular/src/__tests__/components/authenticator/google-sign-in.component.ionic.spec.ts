import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BrowserDynamicTestingModule, platformBrowserDynamicTesting } from '@angular/platform-browser-dynamic/testing';
import { AmplifyService } from '../../../providers/amplify.service'
import { GoogleSignInComponentIonic } from '../../../components/authenticator/federated-sign-in-component/google-sign-in-component/google-sign-in.component.ionic'
import Amplify from 'aws-amplify';

describe('GoogleSignInComponentIonic (basics): ', () => {

  let component: GoogleSignInComponentIonic;
  let service: AmplifyService;

  beforeEach(() => { 
    service = new AmplifyService();
    component = new GoogleSignInComponentIonic(service);
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

  it('...should have a createScript method', () => {
    expect(component.createScript).toBeTruthy();
  });

  it('...should have a initGapi method', () => {
    expect(component.initGapi).toBeTruthy();
  });
});
