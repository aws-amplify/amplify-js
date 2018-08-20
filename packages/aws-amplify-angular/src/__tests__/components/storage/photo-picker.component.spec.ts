import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BrowserDynamicTestingModule, platformBrowserDynamicTesting } from '@angular/platform-browser-dynamic/testing';
import { PhotoPickerComponentCore, PhotoPickerIonicComponent } from '../../../components/storage/photo-picker-component';

describe('PhotoPickerComponentCore:', () => {

  beforeAll(() => {
    TestBed.initTestEnvironment(BrowserDynamicTestingModule, platformBrowserDynamicTesting());
  });

  let component: PhotoPickerComponentCore;
  let fixture: ComponentFixture<PhotoPickerComponentCore>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [PhotoPickerComponentCore]
    });

    // create component and test fixture
    fixture = TestBed.createComponent(PhotoPickerComponentCore);

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
  });

  afterAll(() => {
    TestBed.resetTestEnvironment();
  })
});

describe('PhotoPickerIonicComponent:', () => {

  beforeAll(() => {
    TestBed.initTestEnvironment(BrowserDynamicTestingModule, platformBrowserDynamicTesting());
  });

  let component: PhotoPickerIonicComponent;
  let fixture: ComponentFixture<PhotoPickerIonicComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [PhotoPickerIonicComponent]
    });

    // create component and test fixture
    fixture = TestBed.createComponent(PhotoPickerIonicComponent);

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
  });

  afterAll(() => {
    TestBed.resetTestEnvironment();
  })
});