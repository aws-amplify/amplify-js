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

import { StyleSheet } from 'react-native';
export default AmplifyTheme = StyleSheet.create({
    container: {
        flex: 1,
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'space-around',
        paddingTop: 20,
        width: '100%'
    },
    section: {
        flex: 1,
        width: '100%'
    },
    sectionHeader: {},
    sectionHeaderText: {
        width: '100%',
        padding: 10,
        textAlign: 'center',
        backgroundColor: '#007bff',
        color: '#ffffff',
        fontSize: 20,
        fontWeight: '500'
    },
    sectionFooter: {
        width: '100%',
        marginTop: 15,
        padding: 10,
        flexDirection: 'row',
        justifyContent: 'space-between'
    },
    sectionFooterLink: {
        fontSize: 14,
        color: '#007bff',
        alignItems: 'baseline',
        textAlign: 'center'
    },
    sectionBody: {},
    cell: {
        flex: 1,
        width: '50%'
    },
    errorRow: {
        flex: 1
    },

    photo: {
        width: '100%'
    },
    album: {
        width: '100%'
    },

    a: {},
    button: {
        backgroundColor: '#007bff'
    },

    input: {
        margin: 6
    }
});