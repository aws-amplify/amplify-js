import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AmplifyService } from './providers/amplify.service';

import {
  PhotoPickerComponent,
  S3ImageComponent,
  S3AlbumComponent
} from './components/storage';
import {
  SignInComponent,
  AuthenticatorComponent,
  RequireNewPasswordComponent,
  ConfirmSignInComponent,
  SignUpComponent,
  ConfirmSignUpComponent,
  ForgotPasswordComponent,
  GreetingsComponent,
  FormComponent
} from './components';


import { HeroJobAdComponent }   from './components/authenticator/hero-job-add.component';
import { AdBannerComponent }    from './components/authenticator/ad.banner.component';
import { HeroProfileComponent } from './components/authenticator/hero-profile.component';
import { AdDirective }          from './directives/ad.directive';
import { AdService }            from './providers/ad.service';
import { AdComponent } from './components/authenticator/ad.component'
import { AppComponent } from './components/authenticator/app.component'


@NgModule({
  imports: [
    CommonModule
  ],
  declarations: [
  	PhotoPickerComponent,
    S3ImageComponent,
    S3AlbumComponent,
    SignInComponent,
    AuthenticatorComponent,
    RequireNewPasswordComponent,
    ConfirmSignInComponent,
    SignUpComponent,
    ConfirmSignUpComponent,
    ForgotPasswordComponent,
    GreetingsComponent,
    FormComponent,
    AdBannerComponent,
    HeroJobAdComponent,
    HeroProfileComponent,
    AdDirective,
    AppComponent
  ],
  providers: [ AmplifyService, AdService ],
  exports: [
  	PhotoPickerComponent,
    S3ImageComponent,
    S3AlbumComponent,
    SignInComponent,
    AuthenticatorComponent,
    RequireNewPasswordComponent,
    ConfirmSignInComponent,
    SignUpComponent,
    ConfirmSignUpComponent,
    ForgotPasswordComponent,
    GreetingsComponent,
    AdBannerComponent,
    HeroJobAdComponent,
    HeroProfileComponent,
    AdDirective,
    AppComponent
  ]
})
export class AmplifyAngularModule { }
