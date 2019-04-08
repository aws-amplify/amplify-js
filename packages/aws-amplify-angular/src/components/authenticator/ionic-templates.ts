export const emailFieldTemplate = `
    <ion-label class="amplify-input-label" for="emailField" position="stacked">{{ this.amplifyService.i18n().get('Email *') }}</ion-label>
    <ion-input type="text"
        #emailField
        class="amplify-form-input"
        (keyup)="setEmail($event.target.value)"
        [value]="email"
    ></ion-input>`;

export const phoneNumberFieldTemplate = `
    <ion-grid class="amplify-ionic-grid-padding-left">
        <ion-row>
        <ion-col size="6" class="amplify-ionic-grid-padding-left">
            <ion-label class="amplify-input-label push-right"
            position="stacked" 
            for="phoneNumberField">
            {{ this.amplifyService.i18n().get("Phone Number") }} *
            </ion-label>
            <ion-select #countryCodeField
            name="countryCode"
            class="amplify-select-phone-country"
            [value]="country_code"
            (ionChange)="onCodeChange($event.target.value)">
            <ion-select-option *ngFor="let country of countries"
            value={{country.value}}>
                {{country.label}}
            </ion-select-option>
            </ion-select>
        </ion-col>

        <ion-col size="6">
            <ion-label class="amplify-input-label push-right">&nbsp;</ion-label>
            <ion-input
            #phoneNumberField
            type="text"
            class="amplify-form-input-phone-ionic"
            [placeholder]="this.amplifyService.i18n().get('Enter your phone number')"
            (ionChange)="onNumberChange($event.target.value)"
            name="local_phone_number"
            ></ion-input>
        </ion-col>
        </ion-row>
    </ion-grid>`;

export const usernameFieldTemplate = `
    <ion-label class="amplify-input-label" for="usernameField" position="stacked">{{ this.amplifyService.i18n().get('Username *') }}</ion-label>
        <ion-input type="text"
        #usernameField
        class="amplify-form-input"
        (keyup)="setUsername($event.target.value)"
        [value]="username"
    ></ion-input>`;