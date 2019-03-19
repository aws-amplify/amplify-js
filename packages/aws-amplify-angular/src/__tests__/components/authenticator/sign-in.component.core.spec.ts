import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BrowserDynamicTestingModule, platformBrowserDynamicTesting } from '@angular/platform-browser-dynamic/testing';
import { AmplifyService } from '../../../providers/amplify.service'
import { SignInComponentCore } from '../../../components/authenticator/sign-in-component/sign-in.component.core'
import Amplify from 'aws-amplify';


describe('ConfirmSignUpComponentCore: ', () => {

  let component: SignInComponentCore;
  let service: AmplifyService;
  let setAuthStateSpy;
  let signInSpy;


  beforeEach(() => { 
    service = new AmplifyService();
    component = new SignInComponentCore(service);
    setAuthStateSpy = jest.spyOn(component.amplifyService, 'setAuthState');
    signInSpy = jest.spyOn(component.amplifyService.auth(), 'signIn');
  });

  afterEach(() => {
    service = null;
    component = null;
    setAuthStateSpy.mockRestore();
    signInSpy.mockRestore();
  });


  it('...should be created', () => {
    expect(component).toBeTruthy();
  });

  it('...should have an onForgotPassword method', () => {
    expect(component.onForgotPassword).toBeTruthy();
  });

  it('...should call setAuthState within the onForgotPassword method', () => {
    component.username = 'test-username2'
    const callingAuthState = component.onForgotPassword();
    expect(component.amplifyService.setAuthState).toBeCalled();
  });

  it('...should have an onSignIn method', () => {
    expect(component.onSignIn).toBeTruthy();
  });

  it('...should call signIn within the onSignUp method', () => {
    component.username = 'test-username3';
    component.password = 'test-password3';
    const callingAuthState = component.onSignIn();
    expect(component.amplifyService.auth().signIn).toBeCalled();
  });

  it('...should have an onSignUp method', () => {
    expect(component.onSignUp).toBeTruthy();
  });

  it('...should call setAuthState within the onSignUp method', () => {
    component.username = 'test-username2'
    const callingAuthState = component.onSignUp();
    expect(component.amplifyService.setAuthState).toBeCalled();
  });

  it('...should have a setPassword method', () => {
    expect(component.setPassword).toBeTruthy();
  });

  it('...should set this.password with the setPassword method', () => {
    component.setPassword('my-test-password');
    expect(component.password).toEqual('my-test-password');
  })

  it('...should have a setUsername method', () => {
    expect(component.setUsername).toBeTruthy();
  });

  it('...should set this.username with the setUsername method', () => {
    component.setUsername('my-test-name');
    expect(component.username).toEqual('my-test-name');
  })

});