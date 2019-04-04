import { Component, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import {
  BrowserDynamicTestingModule,
  platformBrowserDynamicTesting
} from '@angular/platform-browser-dynamic/testing';
import { AmplifyService, AmplifyModules } from '../../../providers';
import { storageModule } from '../../../__mocks__/mock_module';
import {
  PhotoPickerIonicComponent
} from '../../../components/storage/photo-picker-component/photo-picker.component.ionic';

    describe('PhotoPickerComponentCore:', () => {

      let component: PhotoPickerIonicComponent;
      let fixtureComponent: PhotoPickerIonicComponent;
      let fixture;
      let service: AmplifyService;
      let uploadFileSpy;
      let putSpy;
    
      beforeEach(() => { 
        service = new AmplifyService(storageModule);
        component = new PhotoPickerIonicComponent(service);
        TestBed.configureTestingModule({
          declarations: [
            PhotoPickerIonicComponent
          ],
          schemas: [CUSTOM_ELEMENTS_SCHEMA],
          providers: [
            {
              provide: AmplifyService,
              useFactory: () => {
                return AmplifyModules({
                  ...storageModule
                });
              }
            }
          ],
        }).compileComponents();
        fixture = TestBed.createComponent(PhotoPickerIonicComponent);
        fixtureComponent = fixture.componentInstance;
        uploadFileSpy = jest.spyOn(fixtureComponent, 'uploadFile');
        putSpy = jest.spyOn(service.storage(), 'put');
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

      it('...should not have an upload button if !hasPhoto', () => {
        const button = fixture.debugElement.nativeElement.querySelector('button');
        expect(button).toBeFalsy();
      });

      it('...should have an upload button if hasPhoto', () => {
        fixtureComponent.hasPhoto = true;
        fixture.detectChanges();
        const button = fixture.debugElement.nativeElement.querySelector('button');
        expect(button).toBeTruthy();
      });

      it('...should not have an img element if !hasPhoto', () => {
        const button = fixture.debugElement.nativeElement.querySelector('img');
        expect(button).toBeFalsy();
      });

      it('...should have an img element if hasPhoto', () => {
        fixtureComponent.hasPhoto = true;
        fixture.detectChanges();
        const img = fixture.debugElement.nativeElement.querySelector('img');
        expect(img).toBeTruthy();
      });

      it('...should call uploadFile when upload button is clicked', () => {
        fixtureComponent.hasPhoto = true;
        fixture.detectChanges();
        const button = fixture.debugElement.nativeElement.querySelector('button');
        button.click();
        expect(uploadFileSpy).toHaveBeenCalled();
        expect(putSpy).toHaveBeenCalled();
      });

      afterAll(() => {
        TestBed.resetTestEnvironment();
      });

    });
