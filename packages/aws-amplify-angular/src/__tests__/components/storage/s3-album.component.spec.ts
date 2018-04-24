import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BrowserDynamicTestingModule, platformBrowserDynamicTesting } from '@angular/platform-browser-dynamic/testing';
import { AmplifyService } from '../../../providers/amplify.service'
import { S3AlbumComponent } from '../../../components/storage/s3-album.component'


describe('PhotoPickerComponent: ', () => {

  let component: S3AlbumComponent;
  let service: AmplifyService;

  beforeEach(() => { 
    service = new AmplifyService();
    component = new S3AlbumComponent(service);
  });

  afterEach(() => {
    service = null;
    component = null;
  });


  it('...should be created', () => {
    expect(component).toBeTruthy();
  });

});