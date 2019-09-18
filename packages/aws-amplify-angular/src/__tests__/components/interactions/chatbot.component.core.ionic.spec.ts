import { Component, ChangeDetectorRef } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import {
	BrowserDynamicTestingModule,
	platformBrowserDynamicTesting,
} from '@angular/platform-browser-dynamic/testing';
import { AmplifyService } from '../../../providers/amplify.service';
import { ChatbotComponentIonic } from '../../../components/interactions/chatbot/chatbot.component.ionic';
import Amplify from 'aws-amplify';

describe('ChatbotComponentIonic: ', () => {
	let component: ChatbotComponentIonic;
	let service: AmplifyService;
	let ref: ChangeDetectorRef;

	beforeEach(() => {
		service = new AmplifyService(Amplify);
		component = new ChatbotComponentIonic(ref, service);
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
});
