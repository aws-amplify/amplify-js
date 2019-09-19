import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { UsernameFieldComponentCore } from '../../../components/authenticator/username-field-component/username-field.component.core';
import { MockComponent } from 'ng-mocks';
import { AmplifyService, AmplifyModules } from '../../../providers';
import { authModule } from '../../../__mocks__/mock_module';
import { PhoneFieldComponentCore } from '../../../components/authenticator/phone-field-component/phone-field.component.core';

describe('UsernameFieldComponentCore: ', () => {
	let component: UsernameFieldComponentCore;
	let fixtureComponent: UsernameFieldComponentCore;
	let service: AmplifyService;
	let fixture;

	beforeEach(() => {
		service = new AmplifyService(authModule);
		component = new UsernameFieldComponentCore(service);
		TestBed.configureTestingModule({
			declarations: [
				UsernameFieldComponentCore,
				MockComponent(PhoneFieldComponentCore),
			],
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
		fixture = TestBed.createComponent(UsernameFieldComponentCore);
		fixtureComponent = fixture.componentInstance;
	});

	afterEach(() => {
		service = null;
		component = null;
	});

	it('...should be created', () => {
		expect(component).toBeTruthy();
	});
});
