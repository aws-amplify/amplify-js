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
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 20,
    width: '100%'
  },
  padding: {
    flex: -1,
    height: 120,
    minHeight: 60
  },
  section: {
    flex: 1,
    width: '100%',
    justifyContent: 'flex-start'
  },
  sectionHeader: {
    flex: 0,
    minHeight: 30,
    padding: 10,
    alignSelf: 'stretch',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#337ab7'
  },
  sectionHeaderText: {
    color: '#ffffff',
    fontSize: 24
  },
  sectionFooter: {
    flex: 0,
    minHeight: 30,
    marginTop: 30,
    padding: 10,
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  sectionFooterLink: {
    fontSize: 16,
    color: '#007bff',
    alignItems: 'baseline',
    textAlign: 'center',
    textDecorationLine: 'underline'
  },
  sectionBody: {
    padding: 10,
    flexDirection: 'column',
    justifyContent: 'space-around'
  },
  sectionActions: {
    flex: 0,
    minHeight: 30,
    padding: 10,
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end'
  },
  cell: {
    flex: 1
  },
  errorRow: {
    flex: 0,
    minHeight: 30,
    padding: 10,
    backgroundColor: '#f0ad4e'
  },
  errorRowText: {
    color: '#fff'
  },

  navBar: {
    flex: 0,
    minHeight: 30
  },

  photo: {
    width: '100%'
  },
  album: {
    width: '100%'
  },

  a: {
  },
  buttonWrap: {
    borderWidth: 1,
    borderColor: '#ccc',
    paddingTop: 6,
    paddingBottom: 6,
    paddingLeft: 16,
    paddingRight: 16,
  },
  buttonText: {
    color: '#333',
    fontSize: 18
  },

  input: {
    margin: 10,
    fontSize: 18
  }
});

