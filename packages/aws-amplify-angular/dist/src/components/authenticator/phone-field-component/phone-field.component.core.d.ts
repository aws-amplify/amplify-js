import { OnInit, EventEmitter } from '@angular/core';
import { AmplifyService } from '../../../providers/amplify.service';
import { PhoneFieldOutput } from '../types';
import { country } from '../../../assets/countries';
export declare class PhoneFieldComponentCore implements OnInit {
    amplifyService: AmplifyService;
    _placeholder: string;
    _label: string;
    _required: boolean;
    _country_code: string;
    _local_phone_number: string;
    _countries: country[];
    constructor(amplifyService: AmplifyService);
    data: any;
    placeholder: string;
    label: string;
    required: boolean;
    defaultCountryCode: string;
    phoneFieldChanged: EventEmitter<PhoneFieldOutput>;
    ngOnInit(): void;
    ngOnDestroy(): void;
    setCountryCode(country_code: string): void;
    setLocalPhoneNumber(local_phone_number: string): void;
    getPlaceholder(): any;
}
