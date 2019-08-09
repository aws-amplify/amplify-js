import { Component, Prop, h } from '@stencil/core';
import { select } from './amplify-select.style';
import { styleNuker } from '../../common/helpers';
import { AMPLIFY_UI_SELECT } from '../../common/constants';
import { SelectOptions } from './amplify-select-interface';
import countryDialCodes from '../../common/country-dial-codes';

@Component({
  tag: 'amplify-select',
})
export class AmplifySelect {
  /** (Optional) Overrides default styling */
  @Prop() styleOverride: boolean = false;
  /** Must be an Array of Objects with an Object shape of {label: string, value: string|number} */
  @Prop() options?: SelectOptions;

  splitIntoSeparateOptionsForSelect(opts: SelectOptions) {
    let content = [];
    opts.forEach(opt => content.push(<option value={opt.value}>{opt.label}</option>));
  
    return content;
  };

  render() {
    return (
      <select class={styleNuker(this.styleOverride, AMPLIFY_UI_SELECT, select)}>
        {this.options ? this.splitIntoSeparateOptionsForSelect(this.options): this.splitIntoSeparateOptionsForSelect(countryDialCodes)}
      </select>
    );
  }
}