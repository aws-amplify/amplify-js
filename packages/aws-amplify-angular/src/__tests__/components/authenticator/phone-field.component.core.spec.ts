import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { PhoneFieldComponentCore } from '../../../components/authenticator/phone-field-component/phone-field.component.core';
import { MockComponent } from 'ng-mocks';
import { AmplifyService, AmplifyModules } from '../../../providers';
import { authModule } from '../../../__mocks__/mock_module';

describe('PhoneFieldComponentCore: ', () => {
	let component: PhoneFieldComponentCore;
	let fixtureComponent: PhoneFieldComponentCore;
	let service: AmplifyService;
	let fixture;

	beforeEach(() => {
		service = new AmplifyService(authModule);
		component = new PhoneFieldComponentCore(service);
		TestBed.configureTestingModule({
			declarations: [PhoneFieldComponentCore],
			imports: [FormsModule],
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
		fixture = TestBed.createComponent(PhoneFieldComponentCore);
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
