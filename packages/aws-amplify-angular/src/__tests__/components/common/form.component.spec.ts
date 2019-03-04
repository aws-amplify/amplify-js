import { Component, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { DebugElement } from '@angular/core';
import { By } from '@angular/platform-browser';
import { BrowserDynamicTestingModule, platformBrowserDynamicTesting } from '@angular/platform-browser-dynamic/testing';
import { FormComponent } from '../../../components/common/form.component';

    describe('FormComponent:', () => {

      let component: FormComponent;
    
      beforeEach(() => { 
        component = new FormComponent();
      });
    
      afterEach(() => {
        component = null;
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
