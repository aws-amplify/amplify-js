/* eslint-disable */
/*
 * Copyright 2017-2017 Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License"). You may not use this file except in compliance with
 * the License. A copy of the License is located at
 *
 *     http://aws.amazon.com/apache2.0/
 *
 * or in the "license" file accompanying this file. This file is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR
 * CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions
 * and limitations under the License.
 */
/* eslint-enable */

import Vue from 'vue';

import SignIn from './SignIn.vue';
import SignUp from './SignUp.vue';
import SignOut from './SignOut.vue';
import ConfirmSignUp from './ConfirmSignUp.vue';
import ConfirmSignIn from './ConfirmSignIn.vue';
import ForgotPassword from './ForgotPassword.vue';
import Authenticator from './Authenticator.vue';
import SetMfa from './SetMFA.vue';

Vue.component('amplify-authenticator', Authenticator);
Vue.component('amplify-sign-in', SignIn);
Vue.component('amplify-sign-up', SignUp);
Vue.component('amplify-sign-out', SignOut);
Vue.component('amplify-confirm-sign-up', ConfirmSignUp);
Vue.component('amplify-confirm-sign-in', ConfirmSignIn);
Vue.component('amplify-forgot-password', ForgotPassword);
Vue.component('amplify-set-mfa', SetMfa);


export {
  Authenticator,
  SignIn,
  SignUp,
  SignOut,
  ConfirmSignUp,
  ConfirmSignIn,
  ForgotPassword,
  SetMfa,
};
