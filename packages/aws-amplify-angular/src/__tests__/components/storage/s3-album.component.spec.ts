import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BrowserDynamicTestingModule, platformBrowserDynamicTesting } from '@angular/platform-browser-dynamic/testing';
<<<<<<< HEAD
import { AmplifyService } from '../../../providers/amplify.service';
import Amplify from 'aws-amplify';
import { S3AlbumComponentCore } from '../../../components/storage/s3-album-component/s3-album.component.core'
=======
import { AmplifyService } from '../../../providers/amplify.service'
import { S3AlbumComponentCore, S3AlbumComponentIonic } from '../../../components/storage/s3-album-component'
>>>>>>> 90760f9f574bb1f552341ae2aa3810b9b960031c


describe('S3AlbumComponentCore: ', () => {

  let component: S3AlbumComponentCore;
  let service: AmplifyService;

  beforeEach(() => { 
    service = new AmplifyService(Amplify);
    component = new S3AlbumComponentCore(service);
  });

  afterEach(() => {
    service = null;
    component = null;
  });

  it('...should be created', () => {
    expect(component).toBeTruthy();
  });
});


describe('S3AlbumComponentIonic: ', () => {

  let component: S3AlbumComponentIonic;
  let service: AmplifyService;

  beforeEach(() => {
    service = new AmplifyService();
    component = new S3AlbumComponentIonic(service);
  });

<<<<<<< HEAD
});
=======
  afterEach(() => {
    service = null;
    component = null;
  });

  it('...should be created', () => {
    expect(component).toBeTruthy();
  });
});
>>>>>>> 90760f9f574bb1f552341ae2aa3810b9b960031c
