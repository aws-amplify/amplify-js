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

export default class JS {
    static isEmpty(obj) {
        return Object.keys(obj).length === 0;
    }

    static sortByField(list, field, dir) {
        if (!list || !list.sort) { return; }

        const dirX = (dir && dir === 'desc')? -1 : 1;
        list.sort(function(a, b) {
            const a_val = a[field];
            const b_val = b[field];

            if (typeof b_val === 'undefined') {
                return (typeof a_val === 'undefined')? 0 : 1 * dirX;
            }

            if (typeof a_val === 'undefined') {
                return -1 * dirX;
            }

            if (a_val < b_val) { return -1 * dirX; }
            if (a_val > b_val) { return 1 * dirX; }

            return 0;
        });
    }

    static objectLessAttributes(obj, less) {
        let ret = Object.assign({}, obj);
        if (less) {
            if (typeof less === 'string') {
                delete ret[less];
            } else {
                less.forEach(attr => {
                    delete ret[attr];
                });
            }
        }

        return ret;
    }
}
