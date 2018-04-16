import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BrowserDynamicTestingModule, platformBrowserDynamicTesting } from '@angular/platform-browser-dynamic/testing';
import { PhotoPickerComponent } from '../../../components/storage/photo-picker.component';

    describe('PhotoPickerComponent:', () => {

      beforeAll(() => {
        TestBed.initTestEnvironment(BrowserDynamicTestingModule, platformBrowserDynamicTesting());
      })

      let component: PhotoPickerComponent;
      let fixture: ComponentFixture<PhotoPickerComponent>;
    
      beforeEach(() => {
    
        TestBed.configureTestingModule({
          declarations: [PhotoPickerComponent]
        });
    
        // create component and test fixture
        fixture = TestBed.createComponent(PhotoPickerComponent);
    
        // get test component from the fixture
        component = fixture.componentInstance;

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
      })

      afterAll(() => {
        TestBed.resetTestEnvironment();
      })

    });
