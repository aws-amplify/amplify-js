import { Component, Prop, h } from '@stencil/core';
import countryDialCodes from '../../common/country-dial-codes';
import { CountryCodeDialOptions } from './amplify-country-dial-code-interface';
import { COUNTRY_DIAL_CODE_SUFFIX } from '../../common/constants';

@Component({
  tag: 'amplify-country-dial-code',
  shadow: true,
})
export class AmplifyCountryDialCode {
  /** The ID of the field.  Should match with its corresponding input's ID. */
  @Prop() fieldId: string = COUNTRY_DIAL_CODE_SUFFIX;
  /** (Optional) Overrides default styling */
  @Prop() overrideStyle: boolean = false;
  /** The options of the country dial code select input. */
  @Prop() options: CountryCodeDialOptions = countryDialCodes;
  /** The callback, called when the input is modified by the user. */
  @Prop() handleInputChange?: (inputEvent: Event) => void;

  render() {
    return (
      <amplify-select
        fieldId={this.fieldId}
        options={this.options}
        overrideStyle={this.overrideStyle}
        handleInputChange={this.handleInputChange}
      />
    );
  }
}
