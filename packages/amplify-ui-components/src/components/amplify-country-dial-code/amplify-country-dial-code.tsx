import { Component, Prop, Watch, h } from '@stencil/core';
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
	/** The options of the country dial code select input. */
	@Prop() options: CountryCodeDialOptions = countryDialCodes;
	/** The callback, called when the input is modified by the user. */
	@Prop() handleInputChange?: (inputEvent: Event) => void;
	/** Default selected dial code */
	@Prop() dialCode: string | number = '+1';

	private selectedDialCode: string;

	componentWillLoad() {
		console.warn(
			'Version `1.x` of Amplify UI has been deprecated and will be removed in a future major version of `aws-amplify`. Please visit https://ui.docs.amplify.aws/ for the current version of Amplify UI.'
		);

		this.setSelectedDialCode();
	}

	@Watch('dialCode')
	watchDialCodeHandler() {
		this.setSelectedDialCode();
	}

	setSelectedDialCode() {
		if (typeof this.dialCode === 'number') {
			this.selectedDialCode = `+${this.dialCode}`;
		} else {
			this.selectedDialCode = this.dialCode;
		}
	}

	render() {
		return (
			<amplify-select
				fieldId={this.fieldId}
				options={this.options}
				handleInputChange={this.handleInputChange}
				selected={this.selectedDialCode}
			/>
		);
	}
}
