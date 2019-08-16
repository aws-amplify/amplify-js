import { Component, Prop, h } from '@stencil/core';
import { select } from './amplify-select.style';
import { styleNuker } from '../../common/helpers';
import { AMPLIFY_UI_PREFIX } from '../../common/constants';
import countryDialCodes from '../../common/country-dial-codes';
import { SelectOptionsString, SelectOptionsNumber } from './amplify-select-interface';

const staticSelectClassName = `${AMPLIFY_UI_PREFIX}--amplify-select`;

@Component({
  tag: 'amplify-select',
  shadow: false,
})
export class AmplifySelect {
  /** (Optional) Overrides default styling */
  @Prop() styleOverride: boolean = false;
  /** The options of the select input. Must be an Array of Objects with an Object shape of {label: string, value: string|number} */
  @Prop() options?: SelectOptionsString | SelectOptionsNumber  = countryDialCodes;
  /** Used for id field */
  @Prop() fieldId: string;

  splitIntoSeparateOptionsForSelect(opts: SelectOptionsString | SelectOptionsNumber) {
    let content = [];
    opts.forEach(opt => content.push(<option value={opt.value}>{opt.label}</option>));
  
    return content;
  };

  render() {
    return (
      <select id={this.fieldId} class={styleNuker(this.styleOverride, staticSelectClassName, select)}>
        {this.splitIntoSeparateOptionsForSelect(this.options)}
      </select>
    );
  }
}