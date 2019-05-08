import * as React from 'react';
import { 
    FormField,
    Input,
    InputLabel,
    SelectInput
 } from '../Amplify-UI/Amplify-UI-Components-React';
import AmplifyTheme from '../Amplify-UI/Amplify-UI-Theme';
import countryDialCodes from './common/country-dial-codes.js';
import { I18n } from '@aws-amplify/core';

class PhoneField extends React.Component {
    constructor(props) {
        super(props);
        this.handleInputChange = this.handleInputChange.bind(this);
        this.composePhoneNumber = this.composePhoneNumber.bind(this);

        this.inputs = {
            dial_code: this.props.defaultDialCode || '+1',
            phone_line_number: ''
        }
    }

    composePhoneNumber() {
        return `${this.inputs.dial_code || '+1'}${this.inputs.phone_line_number.replace(/[-()]/g, '')}`;
    }

    handleInputChange(evt) {
        const { name, value } = evt.target;
        this.inputs[name] = value;

        if (this.props.onChangeText) this.props.onChangeText(this.composePhoneNumber());
    }

    render() {
        const { 
            theme=AmplifyTheme, 
            required=true, 
            defaultDialCode='+1', 
            label='Phone Number',
            placeholder='Enter your phone number'
        } = this.props;
        
        return (
            <FormField theme={theme} key="phone_number">
            {
                required ? 
                <InputLabel theme={theme}>{I18n.get(label)} *</InputLabel> :
                <InputLabel theme={theme}>{I18n.get(label)}</InputLabel>
            }
                <SelectInput theme={theme}>
                    <select name="dial_code" defaultValue={defaultDialCode} 
                    onChange={this.handleInputChange}
                    data-test="dial-code-select">
                        {countryDialCodes.map(dialCode =>
                            <option key={dialCode} value={dialCode}>
                                {dialCode}
                            </option>
                        )}
                    </select>
                    <Input
                        placeholder={I18n.get(placeholder)}
                        theme={theme}
                        type="tel"
                        id="phone_line_number"
                        key="phone_line_number"
                        name="phone_line_number"
                        onChange={this.handleInputChange}
                        data-test="phone-number-input"
                    />
                </SelectInput>
            </FormField>
        )
    }
}

export { PhoneField };
export default PhoneField;
