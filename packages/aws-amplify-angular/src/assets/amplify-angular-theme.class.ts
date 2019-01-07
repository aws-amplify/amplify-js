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

interface AmplifyUIInterface {
  formSection?: string[];
  sectionHeader?: string[];
  sectionBody?: string[];
  formField?: string[];
  inputLabel?: string[];
  input?: string[];
  hint?: string[];
  a?: string[];
  sectionFooter?: string[];
  sectionFooterPrimaryContent?: string[];
  sectionFooterSecondaryContent?: string[];
  button?: string[];
  alert?: string[];
  alertBody?: string[];
  alertIcon?: string[];
  alertMessage?: string[];
  alertClose?: string[];
}

class AmplifyUIClass { 
  formSection?: string[];
  sectionHeader?: string[];
  sectionBody?: string[];
  formField?: string[];
  inputLabel?: string[];
  input?: string[];
  hint?: string[];
  a?: string[];
  sectionFooter?: string[];
  sectionFooterPrimaryContent?: string[];
  sectionFooterSecondaryContent?: string[];
  button?: string[];
  alert?: string[];
  alertBody?: string[];
  alertIcon?: string[];
  alertMessage?: string[];
  alertClose?: string[];

  constructor(props) {
    this.formSection = props.formSection || [];
    this.sectionHeader = props.sectionHeader || [];
    this.sectionBody =  props.sectionBody || [];
    this.formField = props.formField || [];
    this.inputLabel = props.inputLabel || [];
    this.input = props.input || [];
    this.hint = props.hint || [];
    this.a = props.a || [];
    this.sectionFooter = props.sectionFooter || [];
    this.sectionFooterPrimaryContent = props.sectionFooterPrimaryContent || [];
    this.sectionFooterSecondaryContent = props.sectionFooterSecondaryContent || [];
    this.button = props.button || [];
    this.alert = props.alert || [];
    this.alertBody = props.alertBody || [];
    this.alertIcon = props.alertIcon || [];
    this.alertMessage = props.alertMessage || [];
    this.alertClose = props.alertClose || [];
  }
}

export { AmplifyUIClass, AmplifyUIInterface };
