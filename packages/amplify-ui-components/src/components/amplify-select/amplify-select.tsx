import { Component, Prop, h } from '@stencil/core';
import { select } from './amplify-select.style';
import { styleNuker } from '../../common/helpers';
import { AMPLIFY_UI_SELECT } from '../../common/constants';
import { SelectOptions } from '../../common/types';
import countryDialCodes from '../../common/country-dial-codes';

const splitIntoSeparateOptionsForSelect = (opts: any) => {
  let content = [];
  opts.forEach(opt => content.push(<option value={opt.value}>{opt.label}</option>));

  return content;
};

@Component({
  tag: 'amplify-select',
  shadow: false,
})
export class AmplifySelect {
  @Prop() styleOverride: boolean = false;
  @Prop() options: SelectOptions;

  render() {
    return (
      <select class={styleNuker(this.styleOverride, AMPLIFY_UI_SELECT, select)}>
        {this.options ? splitIntoSeparateOptionsForSelect(this.options): splitIntoSeparateOptionsForSelect(countryDialCodes)}
      </select>
    );
  }
}