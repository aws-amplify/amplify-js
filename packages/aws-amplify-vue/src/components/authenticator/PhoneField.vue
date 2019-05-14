/*
 * Copyright 2017-2019 Amazon.com, Inc. or its affiliates. All Rights Reserved.
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
<div>
    <div v-if="isPhoneNumberRequired" v-bind:class="amplifyUI.inputLabel">{{$Amplify.I18n.get('Phone number')}} *</div>
    <div v-if="!isPhoneNumberRequired" v-bind:class="amplifyUI.inputLabel">{{$Amplify.I18n.get('Phone number')}}</div>
    <div v-bind:class="amplifyUI.selectInput">
        <select v-model="countryCode" v-on:change="emitPhoneNumberChanged"
            data-test="dial-code-select">
             <option v-for="_country in countries" 
                v-bind:key="_country.label" 
                v-bind:value="_country.value" 
               >{{_country.label}}</option> 
               <!-- <option v-bind:value="country">fuck</option> -->
        </select>
        <input
            v-model="local_phone_number"
            v-bind:class="[amplifyUI.input, isInvalid ? 'invalid': '']"
            :placeholder="$Amplify.I18n.get(getPlaceholder)"
            autofocus 
            v-on:keyup="emitPhoneNumberChanged" 
            data-test="phone-number-input"
        />
    </div>
</div>
</template>
<script>
import * as AmplifyUI from '@aws-amplify/ui';
import countries from '../../assets/countries';

export default {
    name: 'PhoneField',
    props: ['required', 'invalid', 'placeholder', 'defaultCountryCode'],
    data() {
        return {
            countryCode: this.defaultCountryCode || '1',
            local_phone_number: '',
            countries,
            amplifyUI: AmplifyUI,
        }
    },
    // watch: {
    //     /*
    //     this operation is in place to avoid making country.value the select box
    //     bound key, which results in a duplicate key error in console
    //     */
    //     country: function() {
    //         this.countryCode = this.countries.find(c => c.label === this.country).value
    //     },
    // },
    computed: {
        isPhoneNumberRequired() {
            return this.required;
        },
        isInvalid() {
            return !!this.invalid;
        },
        getPlaceholder() {
            return this.placeholder || 'Enter your phone number';
        },
    },
    methods: {
        emitPhoneNumberChanged() {
            this.$emit('phone-number-changed', 
                {
                    countryCode,
                    local_phone_number
                }
            );
        }
    }
}


</script>
