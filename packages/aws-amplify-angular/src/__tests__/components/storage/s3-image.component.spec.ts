import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BrowserDynamicTestingModule, platformBrowserDynamicTesting } from '@angular/platform-browser-dynamic/testing';
import { AmplifyService } from '../../../providers/amplify.service'
import { S3ImageComponentCore, S3ImageComponentIonic } from '../../../components/storage/s3-image-component'


describe('S3ImageComponentCore: ', () => {

  let component: S3ImageComponentCore;
  let service: AmplifyService;

  beforeEach(() => { 
    service = new AmplifyService();
    component = new S3ImageComponentCore(service);
  });

  afterEach(() => {
    service = null;
    component = null;
  });

  it('...should be created', () => {
    expect(component).toBeTruthy();
  });
});


describe('S3ImageComponentIonic: ', () => {

  let component: S3ImageComponentIonic;
  let service: AmplifyService;

  beforeEach(() => {
    service = new AmplifyService();
    component = new S3ImageComponentIonic(service);
  });

  afterEach(() => {
    service = null;
    component = null;
  });

  it('...should be created', () => {
    expect(component).toBeTruthy();
  });
});