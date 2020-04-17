import { TestBed } from '@angular/core/testing';
import { authDecorator } from '../../providers/auth.decorator';
import { authModule } from '../../__mocks__/mock_module';
import { AuthState } from '../../providers';
import { BehaviorSubject } from 'rxjs';

describe('AuthDecorator', () => {

	beforeEach(() => {
		TestBed.configureTestingModule({
			providers: [authDecorator],
		});
	});

	it('should be created', () => {
		expect(authDecorator).toBeTruthy();
	});

	describe('set correct authState', () => {

		const undecoratedAuth = Object.assign({}, authModule.Auth);
		let authState: BehaviorSubject<AuthState>;

		beforeEach(() => {
			authState = new BehaviorSubject<AuthState>({ state: '', user: undefined });
			authModule.Auth = undecoratedAuth;
		});

		it('should set correct authState on signIn where confirm required and using legacy signup args', async () => {
			const username = 'fakeusername';
			spyOn(authModule.Auth, 'signUp').and.callFake((username: string, password: string) => {
				return Promise.resolve({
					username,
					challengeName: 'SMS_MFA'
				});
			});
			authDecorator(authState, authModule.Auth);
			await authModule.Auth.signUp(username, 'fakepassword');
			expect(authState.getValue()).toStrictEqual({ state: 'confirmSignUp', user: { username }});
		});

		it('should set correct authState on signIn where confirm required and using signUpParams', async () => {
			const username = 'fakeusername';
			spyOn(authModule.Auth, 'signUp').and.callFake((signUpParams: { username: string }) => {
				return Promise.resolve({
					username: signUpParams.username,
					challengeName: 'SMS_MFA'
				});
			});
			authDecorator(authState, authModule.Auth);
			await authModule.Auth.signUp({ username });
			expect(authState.getValue()).toStrictEqual({ state: 'confirmSignUp', user: { username }});
		});

	});

	afterAll(() => {
		TestBed.resetTestEnvironment();
	});
});
