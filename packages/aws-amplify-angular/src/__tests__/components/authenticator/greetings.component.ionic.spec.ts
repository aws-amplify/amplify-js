import { Component, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import {
	BrowserDynamicTestingModule,
	platformBrowserDynamicTesting,
} from '@angular/platform-browser-dynamic/testing';
import { AmplifyService, AmplifyModules } from '../../../providers';
import { authModule } from '../../../__mocks__/mock_module';
import { GreetingComponentIonic } from '../../../components/authenticator/greeting-component/greeting.component.ionic';

describe('GreetingsComponentCore: ', () => {
	let component: GreetingComponentIonic;
	let fixtureComponent: GreetingComponentIonic;
	let service: AmplifyService;
	let fixture;
	let onSignOutSpy;
	let signOutSpy;

	beforeEach(() => {
		service = new AmplifyService(authModule);
		component = new GreetingComponentIonic(service);
		TestBed.configureTestingModule({
			declarations: [GreetingComponentIonic],
			schemas: [CUSTOM_ELEMENTS_SCHEMA],
			providers: [
				{
					provide: AmplifyService,
					useFactory: () => {
						return AmplifyModules({
							...authModule,
						});
					},
				},
			],
		}).compileComponents();
		fixture = TestBed.createComponent(GreetingComponentIonic);
		fixtureComponent = fixture.componentInstance;
		signOutSpy = jest.spyOn(service.auth(), 'signOut');
		onSignOutSpy = jest.spyOn(fixtureComponent, 'onSignOut');
	});

	afterEach(() => {
		service = null;
		component = null;
	});

	it('...should be created', () => {
		expect(component).toBeTruthy();
	});

	it('...should have an onSignOut method', () => {
		expect(component.onSignOut).toBeTruthy();
	});

	it('...should have a setAuthState method', () => {
		expect(component.setAuthState).toBeTruthy();
	});

	it('...should have a subscribe method', () => {
		expect(component.subscribe).toBeTruthy();
	});

	it('...should not display if _show is not set', () => {
		const rootEl =
			fixture.debugElement.nativeElement.querySelector('.amplify-greeting');
		expect(rootEl).toBeFalsy();
	});

	it('...should display if _show is set', () => {
		fixtureComponent.signedIn = true;
		fixture.detectChanges();
		const rootEl =
			fixture.debugElement.nativeElement.querySelector('.amplify-greeting');
		expect(rootEl).toBeTruthy();
	});
});
