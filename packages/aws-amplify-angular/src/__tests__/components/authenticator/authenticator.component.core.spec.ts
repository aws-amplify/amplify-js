import { Component } from '@angular/core';
import { ComponentFixture, TestBed, async } from '@angular/core/testing';
import {
  BrowserDynamicTestingModule,
  platformBrowserDynamicTesting
} from '@angular/platform-browser-dynamic/testing';
import { AmplifyService, AmplifyModules } from '../../../providers';
import {
  AuthenticatorComponentCore
} from '../../../components/authenticator/authenticator/authenticator.component.core';
import { AmplifyAngularModule } from '../../../aws-amplify-angular.module';


describe('AuthenticatorComponentCore: ', () => {

  let component: AuthenticatorComponentCore;
  let service: AmplifyService;
  let fixture;

  beforeEach(() => { 
    service = new AmplifyService();
    component = new AuthenticatorComponentCore(service);
    TestBed.configureTestingModule({
      imports: [
        AmplifyAngularModule
      ],
      providers: [
        AmplifyService
      ],
    }).compileComponents();
    fixture = TestBed.createComponent(AuthenticatorComponentCore);


  });

  afterEach(() => {
    service = null;
    component = null;
  });


  it('...should be created', () => {
    expect(component).toBeTruthy();
  });

  it('...should have a subscribe method', () => {
    expect(component.subscribe).toBeTruthy();
  });

  it('...should have a shouldHide method', () => {
    expect(component.shouldHide).toBeTruthy();
  });

  it('...the shouldHide method returns false when receiving a value not in the hide array', () => {
    component.hide = ['value one', 'value two'];
    expect(component.shouldHide('value three')).toEqual(false);
  });

  it('...the shouldHide method should return true when receiving a value in the hide array', () => {
    component.hide = ['value one', 'value two'];
    expect(component.shouldHide('value two')).toEqual(true);
  });
});
