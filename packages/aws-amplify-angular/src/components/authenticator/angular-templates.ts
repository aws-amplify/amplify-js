export const emailFieldTemplate = 
    `<label class="amplify-input-label" for="emailField"> {{ this.amplifyService.i18n().get('Email') }} *</label>
    <input
        #emailField
        class="amplify-form-input"
        type="text"
        required
        placeholder="{{ this.amplifyService.i18n().get('Enter your email') }}"
        [(ngModel)]="email"
    />`;

export const phoneNumberFieldTemplate = 
    `<label class="amplify-input-label" for="localPhoneNumberField">
        {{ this.amplifyService.i18n().get("Phone Number") }} *
    </label>
    <div class="amplify-input-group">
        <div class="amplify-input-group-item">
            <select 
            #countryCodeField
            name="countryCode"
            class="amplify-select-phone-country"
            [(ngModel)]="country_code">
            <option *ngFor="let country of countries"
                value={{country.value}}>{{country.label}}
            </option>
            </select>
        </div>
        <div class="amplify-input-group-item">
            <input
            #localPhoneNumberField
            class="amplify-form-input"
            [placeholder]="this.amplifyService.i18n().get('Enter your phone number')"
            [(ngModel)]="local_phone_number"
            name="local_phone_number"
            type="text"
            />
        </div>
    </div>`

export const usernameFieldTemplate = 
    `<label class="amplify-input-label" for="usernameField"> {{ this.amplifyService.i18n().get('Username *') }}</label>
    <input
    #usernameField
    class="amplify-form-input"
    type="text"
    required
    placeholder="{{ this.amplifyService.i18n().get('Username') }}"
    [(ngModel)]="username"
    />`
    
