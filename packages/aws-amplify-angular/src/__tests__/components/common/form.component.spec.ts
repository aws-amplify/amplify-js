import { Component, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { DebugElement } from '@angular/core';
import { By } from '@angular/platform-browser';
import { BrowserDynamicTestingModule, platformBrowserDynamicTesting } from '@angular/platform-browser-dynamic/testing';
import { FormComponent } from '../../../components/common/form.component';

    describe('FormComponent:', () => {

      // beforeAll(() => {
      //   TestBed.initTestEnvironment(BrowserDynamicTestingModule, platformBrowserDynamicTesting());
      // })

      let component: FormComponent;
      let fixture: ComponentFixture<FormComponent>;
      let titleEl: DebugElement;
    
      beforeEach(() => {
    
        TestBed.configureTestingModule({
          declarations: [FormComponent]
        });
    
        // create component and test fixture
        fixture = TestBed.createComponent(FormComponent);
    
        // get test component from the fixture
        component = fixture.componentInstance;
    
        titleEl = fixture.debugElement.query(By.css('.form-title'));

      });

      it('...should be created', () => {
        expect(component).toBeTruthy();
      });

      it('...should have not have a default title', () => {
        expect(component.title).toBeUndefined();
      })

      afterAll(() => {
        TestBed.resetTestEnvironment();
      })

    });
