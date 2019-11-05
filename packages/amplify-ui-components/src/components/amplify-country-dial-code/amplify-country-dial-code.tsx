import { Component, Prop, h } from '@stencil/core';
import countryDialCodes from '../../common/country-dial-codes';
import { CountryCodeDialOptions } from './amplify-country-dial-code-interface';

@Component({
  tag: 'amplify-country-dial-code',
  shadow: false,
})
export class AmplifyCountryDialCode {
  /** (Optional) Overrides default styling */
  @Prop() overrideStyle: boolean = false;
  /** The options of the country dial code select input. */
  @Prop() options: CountryCodeDialOptions = countryDialCodes;
  /** The callback, called when the input is modified by the user. */
  @Prop() handleInputChange?: (inputEvent: Event) => void;

  render() {
    return (
      <amplify-select
        options={this.options}
        override-style={this.overrideStyle}
        handleInputChange={this.handleInputChange}
      />
    );
  }
}
