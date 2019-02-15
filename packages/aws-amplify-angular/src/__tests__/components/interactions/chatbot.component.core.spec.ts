import { Component, ChangeDetectorRef } from '@angular/core';
import { ComponentFixture, TestBed, async} from '@angular/core/testing';
import {
  BrowserDynamicTestingModule,
  platformBrowserDynamicTesting
} from '@angular/platform-browser-dynamic/testing';
import { AmplifyService, AmplifyModules } from '../../../providers';
import { interactionsModule } from '../../../__mocks__/mock_module';
import { ChatbotComponentCore } 
from '../../../components/interactions/chatbot/chatbot.component.core';

describe('ChatbotComponentCore: ', () => {

  let component: ChatbotComponentCore;
  let fixtureComponent: ChatbotComponentCore;
  let service: AmplifyService;
  let fixture;
  let ref: ChangeDetectorRef;
  let micButtonHandlerSpy;
  let resetSpy;

  beforeEach(() => { 
    service = new AmplifyService(interactionsModule);
    component = new ChatbotComponentCore(ref, service);
    TestBed.configureTestingModule({
      declarations: [
        ChatbotComponentCore
      ],
      providers: [
        {
          provide: AmplifyService,
          useFactory: () => {
            return AmplifyModules({
              ...interactionsModule
            });
          }
        }
      ],
    }).compileComponents();
    fixture = TestBed.createComponent(ChatbotComponentCore);
    fixtureComponent = fixture.componentInstance;
    fixtureComponent.audioControl = {
      clear: () => {},
      startRecording: jest.fn(() => {})
    };
    micButtonHandlerSpy = jest.spyOn(fixtureComponent, 'micButtonHandler');
    resetSpy = jest.spyOn(fixtureComponent, 'reset');
  });

  afterEach(() => {
    service = null;
    component = null;
  });


  it('...should be created', () => {
    expect(component).toBeTruthy();
  });

  it('...should have a performOnComplete method', () => {
    expect(component.performOnComplete).toBeTruthy();
  });

  it('...should have an onInputChange method', () => {
    expect(component.onInputChange).toBeTruthy();
  });

  it('...should have an onSubmit method', () => {
    expect(component.onSubmit).toBeTruthy();
  });

  it('...should call micButtonHandler when voice button is clicked', () => {
    fixtureComponent.textEnabled = false;
    fixtureComponent.voiceEnabled = true;
    fixture.detectChanges();
    const button = fixture.debugElement.nativeElement.querySelector('button');
    button.click();
    expect(micButtonHandlerSpy).toHaveBeenCalled();
  });

  it('...the micButtonHandler should call reset() if continue conversation is true', async () => {
    fixtureComponent.continueConversation = true;
    fixtureComponent.audioControl = {
      clear: () => {}
    };
    fixture.detectChanges();
    await fixtureComponent.micButtonHandler();
    expect(resetSpy).toHaveBeenCalled();
  });

  // tslint:disable
  it('...the micButtonHandler should call audioControl.startRecording if continue conversation is true', async () => {
    fixtureComponent.continueConversation = false;
    fixture.detectChanges();
    await fixtureComponent.micButtonHandler();
    expect(fixtureComponent.audioControl.startRecording).toHaveBeenCalled();
  });

});
