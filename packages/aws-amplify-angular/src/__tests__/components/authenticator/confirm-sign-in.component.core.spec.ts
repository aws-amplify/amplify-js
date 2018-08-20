import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BrowserDynamicTestingModule, platformBrowserDynamicTesting } from '@angular/platform-browser-dynamic/testing';
import { AmplifyService } from '../../../providers/amplify.service';
import { AmplifyAngularModule } from '../../../aws-amplify-angular.module';
import { ConfirmSignInComponentCore } from '../../../components/authenticator/confirm-sign-in-component/confirm-sign-in-component.core';


describe('ConfirmSignInComponentCore: ', () => {

  let component: ConfirmSignInComponentCore;
  let service: AmplifyService;
  let setAuthStateSpy;
  let confirmSignInSpy;

  beforeEach(() => { 
    service = new AmplifyService();
    component = new ConfirmSignInComponentCore(service);
    setAuthStateSpy = jest.spyOn(component.amplifyService, 'setAuthState');
    confirmSignInSpy = jest.spyOn(component.amplifyService.auth(), 'confirmSignIn');
  });

  afterEach(() => {
    service = null;
    component = null;
    setAuthStateSpy.mockRestore();
    confirmSignInSpy.mockRestore();
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

  it('...should call confirmSignIn within the onConfirm method', () => {
    component._authState = {user: {challengeName: 'test-challange-name'}, state: 'test-state'}
    const callingAuthState = component.onConfirm();
    expect(component.amplifyService.auth().confirmSignIn).toBeCalled();
  });

  it('...should have an onSignIn method', () => {
    expect(component.onSignIn).toBeTruthy();
  });

  it('...should call setAuthState within the onSignIn method', () => {
    const callingAuthState = component.onSignIn();
    expect(component.amplifyService.setAuthState).toBeCalled();
  });

  it('...should have a _setError method', () => {
    expect(component._setError).toBeTruthy();
  });


});