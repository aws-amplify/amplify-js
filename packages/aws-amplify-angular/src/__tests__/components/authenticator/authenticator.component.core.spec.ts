import { Component } from '@angular/core';
import { ComponentFixture, TestBed, async } from '@angular/core/testing';
import {
	BrowserDynamicTestingModule,
	platformBrowserDynamicTesting,
} from '@angular/platform-browser-dynamic/testing';
import Amplify from 'aws-amplify';
import { AmplifyService } from '../../../providers/amplify.service';
import { AuthenticatorComponentCore } from '../../../components/authenticator/authenticator/authenticator.component.core';

describe('AuthenticatorComponentCore: ', () => {
	let component: AuthenticatorComponentCore;
	let service: AmplifyService;

	beforeEach(() => {
		service = new AmplifyService(Amplify);
		component = new AuthenticatorComponentCore(service);
	});

	afterEach(() => {
		service = null;
		component = null;
	});

	it('...should be created', () => {
		expect(component).toBeTruthy();
	});

	it('...should have a subscribe method', () => {
		expect(component.subscribe).toBeTruthy();
	});

	it('...should have a shouldHide method', () => {
		expect(component.shouldHide).toBeTruthy();
	});

	it('...the shouldHide method should return false when receiving a value not in the hide array', () => {
		component.hide = ['value one', 'value two'];
		expect(component.shouldHide('value three')).toEqual(false);
	});

	it('...the shouldHide method should return true when receiving a value in the hide array', () => {
		component.hide = ['value one', 'value two'];
		expect(component.shouldHide('value two')).toEqual(true);
	});
});
