import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BrowserDynamicTestingModule, platformBrowserDynamicTesting } from '@angular/platform-browser-dynamic/testing';
import { AmplifyService } from '../../../providers/amplify.service'
import { AuthenticatorIonicComponent } from '../../../components/authenticator/authenticator/authenticator.component.ionic'


describe('AuthenticatorIonicComponent: ', () => {

  let component: AuthenticatorIonicComponent;
  let service: AmplifyService;

  beforeEach(() => { 
    service = new AmplifyService();
    component = new AuthenticatorIonicComponent(service);
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

  it('...the shouldHide method should return false when receiving a value not in the hide array', () => {
    component.hide = ['value one', 'value two'];
    expect(component.shouldHide('value three')).toEqual(false);
  });

  it('...the shouldHide method should return true when receiving a value in the hide array', () => {
    component.hide = ['value one', 'value two'];
    expect(component.shouldHide('value two')).toEqual(true);
  })

});