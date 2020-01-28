// tslint:disable
/*
 * Copyright 2017-2018 Amazon.com, Inc. or its affiliates. All Rights Reserved.
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
// tslint:enable
export function includes(ary, match) {
    return ary.filter(function (item) { return item === match; }).length > 0;
}
export var labelMap = {
    email: 'Email',
    phone_number: 'Phone Number',
    username: 'Username',
};
export var composePhoneNumber = function (countryCode, local_phone_number) {
    return "+" + countryCode + local_phone_number.replace(/[-()]/g, '');
};
//# sourceMappingURL=common.js.map