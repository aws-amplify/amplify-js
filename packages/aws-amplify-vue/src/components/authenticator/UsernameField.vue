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

<template>
    <div v-bind:class="amplifyUI.formField">
        <div v-if="shouldRenderUsernameField">
            <div v-bind:class="amplifyUI.inputLabel">{{$Amplify.I18n.get(getUsernameLabel())}} *</div>
            <input 
                v-bind:class="amplifyUI.input" 
                v-model="username" 
                :placeholder="$Amplify.I18n.get(`Enter your ${getUsernameLabel()}`)" 
                autofocus v-on:keyup="$emit('username-field-changed', {usernameField: 'username', username})" 
                data-test="username-input"
            />
        </div>
        <div v-if="shouldRenderEmailField">
            <div v-bind:class="amplifyUI.inputLabel">{{$Amplify.I18n.get('Email')}} *</div>
            <input 
                v-bind:class="amplifyUI.input" 
                v-model="email" 
                :placeholder="$Amplify.I18n.get('Enter your email')" 
                autofocus v-on:keyup="$emit('username-field-changed', {usernameField: 'email', email})" 
                data-test="email-input"
            />
        </div>
        <div v-if="shouldRenderPhoneNumberField">
            <div v-bind:class="amplifyUI.inputLabel">{{$Amplify.I18n.get('Phone number')}} *</div>
            <div v-bind:class="amplifyUI.selectInput">
                <select v-model="country" v-on:change="$emit(
                        'username-field-changed', 
                        {
                            usernameField: 'phone_number', 
                            countryCode: countries.find(c => c.label === country).value,
                            local_phone_number
                        }
                    )"
                    data-test="dial-code-select">
                    <option v-for="country in countries" v-bind:key="country.label">{{country.label}}</option>
                </select>
                <input
                    v-model="local_phone_number"
                    v-bind:class="amplifyUI.input"
                    :placeholder="$Amplify.I18n.get('Enter your phone number')"
                    autofocus v-on:keyup="$emit(
                        'username-field-changed', 
                        {
                            usernameField: 'phone_number', 
                            countryCode,
                            local_phone_number
                        }
                    )" 
                    data-test="phone-number-input"
                />
            </div>
        </div>
    </div>
</template>

<script>
import * as AmplifyUI from '@aws-amplify/ui';
import countries from '../../assets/countries';
import { labelMap } from './common';

export default {
    name: 'UsernameField',
    props: ['usernameAttributes'],
    data() {
        return {
            username: '',
            email: '',
            countryCode: '1',
            local_phone_number: '',
            country: 'USA (+1)',
            countries,
            amplifyUI: AmplifyUI,
            logger: {},
        }
    },
    computed: {
        shouldRenderEmailField() {
            return this.usernameAttributes === 'email';
        },
        shouldRenderUsernameField() {
            return this.usernameAttributes !== 'email' && this.usernameAttributes !== 'phone_number';
        },
        shouldRenderPhoneNumberField() {
            return this.usernameAttributes === 'phone_number';
        },
    },
    watch: {
        /*
        this operation is in place to avoid making country.value the select box
        bound key, which results in a duplicate key error in console
        */
        country: function() {
            this.countryCode = this.countries.find(c => c.label === this.country).value
        },
    },
    mounted() {
        // this.logger = new this.$Amplify.Logger(this.$options.name);
    },
    methods: {
        getUsernameLabel() {
            return labelMap[this.usernameAttributes] || this.usernameAttributes;
        }
    }
}
</script>
