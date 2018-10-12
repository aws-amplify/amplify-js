import { Component, Input } from '@angular/core';
import { AmplifyService, AuthState } from '../../../providers';
import { countrylist, country }  from '../../../assets/countries';


const template = `
<div class="amplify-container" *ngIf="_show">
  <div class="amplify-form-container">
    <div class="amplify-form-body">

      <div class="amplify-form-header">Create a new account</div>

      <div class="amplify-form-row">
        <label class="amplify-input-label" for="amplifyUsername"> Username *</label>
        <input #amplifyUsername
          (keyup)="setUsername($event.target.value)"
          class="amplify-form-input"
          type="text"
          placeholder="Username"
        />
      </div>
      <div class="amplify-form-row">
        <label class="amplify-input-label" for="password">Password *</label>
        <input #password
          (keyup)="setPassword(password.value)"
          (keyup.enter)="onSignUp()"
          class="amplify-form-input"
          type="password"
          placeholder="Password"
        />
      </div>
      <div class="amplify-form-row">
        <label class="amplify-input-label" for="email">Email Address *</label>
        <input #email
          (keyup)="setEmail(email.value)"
          class="amplify-form-input"
          type="email"
          placeholder="Email"
        />
      </div>
      <div class="amplify-form-row">
        <label class="amplify-input-label" for="tel">Phone Number *</label>
        <div class="amplify-input-group">
          <div class="amplify-input-group-item">
          <select #countryCode
            name="countryCode" 
            class="amplify-select-phone-country" 
            (change)="setCountryCode(countryCode.value)"
            [value]="country_code">
            <option *ngFor="let country of countries"  
            value={{country.value}}>{{country.label}} </option>
          </select>
        </div>
        <div class="amplify-input-group-item">
          <input #phone_number
            (keyup)="setPhoneNumber(phone_number.value)"
            class="amplify-form-input"
            type="text"
            placeholder="Phone Number"
          />
        </div>
      </div>
      </div>
      <div class="amplify-form-actions">
        
        <div class="amplify-form-cell-left">
          <div class="amplify-form-signup">Have an account? <a class="amplify-form-link" (click)="onSignIn()">Sign in</a></div>
        </div>

        <div class="amplify-form-cell-right">
          <button class="amplify-form-button"
          (click)="onSignUp()"
          >Sign Up</button>
        </div>

      </div>

    </div>

  </div>

  <div class="amplify-alert" *ngIf="errorMessage">
    <div class="amplify-alert-body">
      <span class="amplify-alert-icon">&#9888;</span>
      <div class="amplify-alert-message">{{ errorMessage }}</div>
      <a class="amplify-alert-close" (click)="onAlertClose()">&times;</a>
    </div>
  </div>

</div>
`;

@Component({
  selector: 'amplify-auth-sign-up-core',
  template,
})
export class SignUpComponentCore {
  _authState: AuthState;
  _show: boolean;
  username: string;
  password: string;
  email: string;
  phone_number: string;
  _defaultCountryCode: string;
  country_code: string = '1';
  countries: country[];
  complete_phone_number: string;
  errorMessage: string;
  amplifyService: AmplifyService;


  constructor(amplifyService: AmplifyService) {
    this.countries = countrylist;
    this.amplifyService = amplifyService;
  }

  @Input()
  set data(data: any) {
    this._authState = data.authState;
    this._show = data.authState.state === 'signUp';
    this.country_code = data.defaultCountryCode;
  }

  @Input()
  set authState(authState: AuthState) {
    this._authState = authState;
    this._show = authState.state === 'signUp';
  }

  @Input()
  set defaultCountryCode(defaultCountryCode: string) {
    this.country_code = defaultCountryCode;
  }

  setUsername(username: string) {
    this.username = username;
  }

  setPassword(password: string) {
    this.password = password;
  }

  setEmail(email: string) {
    this.email = email;
  }

  setPhoneNumber(phone_number: string) {
    this.phone_number = phone_number;
    this._setFinalPhoneNumber();
  }

  setCountryCode(country_code: string) {
    this.country_code = country_code;
    this._setFinalPhoneNumber();
  }

  onSignUp() {
    this.amplifyService.auth()
      .signUp(
        this.username,
        this.password,
        this.email,
        this.complete_phone_number
      )
      .then(user => this.amplifyService.setAuthState({ state: 'confirmSignUp', user: { 'username': this.username } }))
      .catch(err => this._setError(err));
  }

  onSignIn() {
    this.amplifyService.setAuthState({ state: 'signIn', user: null });
  }

  onConfirmSignUp() {
    this.amplifyService.setAuthState({ state: 'confirmSignUp', user: { 'username': this.username } });
  }

  onAlertClose() {
    this._setError(null);
  }

  _setError(err) {
    if (!err) {
      this.errorMessage = null;
      return;
    }

    this.errorMessage = err.message || err;
  }

  _setFinalPhoneNumber() {
    if (this.country_code && this.phone_number) {
      this.complete_phone_number = "+" + this.country_code + this.phone_number;
    }
  }
}
