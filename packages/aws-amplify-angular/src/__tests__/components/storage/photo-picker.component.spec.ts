import { Component, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { DebugElement } from '@angular/core';
import { By } from '@angular/platform-browser';
import { BrowserDynamicTestingModule, platformBrowserDynamicTesting } from '@angular/platform-browser-dynamic/testing';
import { PhotoPickerComponent } from '../../../components/storage/photo-picker.component';
import AmplifyTheme from '../../../components/AmplifyTheme';

    describe('PhotoPickerComponent:', () => {

      beforeAll(() => {
        TestBed.initTestEnvironment(BrowserDynamicTestingModule, platformBrowserDynamicTesting());
      })

      let component: PhotoPickerComponent;
      let fixture: ComponentFixture<PhotoPickerComponent>;
      let titleEl: DebugElement;
    
      beforeEach(() => {
    
        TestBed.configureTestingModule({
          declarations: [PhotoPickerComponent]
        });
    
        // create component and test fixture
        fixture = TestBed.createComponent(PhotoPickerComponent);
    
        // get test component from the fixture
        component = fixture.componentInstance;
    
        titleEl = fixture.debugElement.query(By.css('.form-title'));

      });

      it('...should be created', () => {
        expect(component).toBeTruthy();
      });

      afterAll(() => {
        TestBed.resetTestEnvironment();
      })

    });
