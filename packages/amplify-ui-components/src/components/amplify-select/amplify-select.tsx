import { Component, Prop, h } from '@stencil/core';
import { select } from './amplify-select.style';
import { styleNuker } from '../../common/helpers';
import { SelectOptions } from './amplify-select-interface';
import countryDialCodes from '../../common/country-dial-codes';

const AMPLIFY_UI_SELECT = 'amplify-ui-select';

const splitIntoSeparateOptionsForSelect = (opts: SelectOptions) => {
  let content = [];
  opts.forEach(opt => content.push(<option value={opt.value}>{opt.label}</option>));

  return content;
};

@Component({
  tag: 'amplify-select',
  shadow: false,
})
export class AmplifySelect {
  /** (Optional) Overrides default styling */
  @Prop() styleOverride: boolean = false;
  /** Must be an Array of Objects with an Object shape of {label: string, value: string|number} */
  @Prop() options?: SelectOptions;

  render() {
    return (
      <select class={styleNuker(this.styleOverride, AMPLIFY_UI_SELECT, select)}>
        {this.options ? splitIntoSeparateOptionsForSelect(this.options): splitIntoSeparateOptionsForSelect(countryDialCodes)}
      </select>
    );
  }
}