import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import {
	BrowserDynamicTestingModule,
	platformBrowserDynamicTesting,
} from '@angular/platform-browser-dynamic/testing';
import { AmplifyService, AmplifyModules } from '../../../providers';
import { GreetingComponentCore } from '../../../components/authenticator/greeting-component/greeting.component.core';
import { authModule } from '../../../__mocks__/mock_module';

describe('GreetingsComponentCore: ', () => {
	let component: GreetingComponentCore;
	let fixtureComponent: GreetingComponentCore;
	let service: AmplifyService;
	let fixture;
	let onSignOutSpy;
	let signOutSpy;

	beforeEach(() => {
		service = new AmplifyService(authModule);
		component = new GreetingComponentCore(service);
		TestBed.configureTestingModule({
			declarations: [GreetingComponentCore],
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
		fixture = TestBed.createComponent(GreetingComponentCore);
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
		const rootEl = fixture.debugElement.nativeElement.querySelector(
			'.amplify-greeting'
		);
		expect(rootEl).toBeFalsy();
	});

	it('...should display if _show is set', () => {
		fixtureComponent.signedIn = true;
		fixture.detectChanges();
		const rootEl = fixture.debugElement.nativeElement.querySelector(
			'.amplify-greeting'
		);
		expect(rootEl).toBeTruthy();
	});

	it('...should call onSignOut when "a" tag is clicked', () => {
		fixtureComponent.signedIn = true;
		fixtureComponent.authState = {
			state: 'signedIn',
			user: {},
		};
		fixture.detectChanges();
		const a = fixture.debugElement.nativeElement.querySelector('a');
		a.click();
		expect(onSignOutSpy).toHaveBeenCalled();
		expect(signOutSpy).toHaveBeenCalled();
	});
});
