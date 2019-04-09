import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
<<<<<<< Updated upstream
import { BrowserDynamicTestingModule, platformBrowserDynamicTesting } from '@angular/platform-browser-dynamic/testing';
import { AmplifyService } from '../../../providers/amplify.service'
import { SignUpComponentIonic } from '../../../components/authenticator/sign-up-component/sign-up.component.ionic'
=======
import {
  BrowserDynamicTestingModule,
  platformBrowserDynamicTesting
} from '@angular/platform-browser-dynamic/testing';
import { AmplifyService, AmplifyModules } from '../../../providers';
import { FormsModule } from '@angular/forms';
import { authModule } from '../../../__mocks__/mock_module';
import { SignUpComponentIonic }
from '../../../components/authenticator/sign-up-component/sign-up.component.ionic';
>>>>>>> Stashed changes


describe('SignUpComponentCore: ', () => {

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