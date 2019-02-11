import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import {
  BrowserDynamicTestingModule,
  platformBrowserDynamicTesting
} from '@angular/platform-browser-dynamic/testing';
import { AmplifyService } from '../../../providers/amplify.service';
import {
  PhotoPickerComponentCore
} from '../../../components/storage/photo-picker-component/photo-picker.component.core';

    describe('PhotoPickerComponentCore:', () => {

      let component: PhotoPickerComponentCore;
      let service: AmplifyService;

      const modules = {
        Storage: {}
      };
    
      beforeEach(() => { 
        service = new AmplifyService(modules);
        component = new PhotoPickerComponentCore(service);
      });
    
      afterEach(() => {
        component = null;
      });

      it('...should be created', () => {
        expect(component).toBeTruthy();
      });

      it('...should have a pick method', () => {
        expect(component.pick).toBeTruthy();
      });

      it('...should have an onPhotoError method', () => {
        expect(component.onPhotoError).toBeTruthy();
      });

      it('...should have a hasPhoto variable that is false by default', () => {
        expect(component.hasPhoto).toEqual(false);
      });

      afterAll(() => {
        TestBed.resetTestEnvironment();
      });

    });
