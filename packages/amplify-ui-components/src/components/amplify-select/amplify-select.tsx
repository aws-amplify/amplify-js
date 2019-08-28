import { Component, Prop, h } from '@stencil/core';
import { select } from './amplify-select.style';
import { styleNuker } from '../../common/helpers';
import { AMPLIFY_UI_PREFIX } from '../../common/constants';
import { SelectOptionsString, SelectOptionsNumber, SelectOptionNumber, SelectOptionString } from './amplify-select-interface';

const STATIC_SELECT_CLASS_NAME = `${AMPLIFY_UI_PREFIX}--amplify-select`;
const DEFAULT_SELECT_OPTION = [{label: '', value: 1}];

@Component({
  tag: 'amplify-select',
  shadow: false,
})
export class AmplifySelect {
  /** (Optional) Overrides default styling */
  @Prop() overrideStyle: boolean = false;
  /** The options of the select input. Must be an Array of Objects with an Object shape of {label: string, value: string|number} */
  @Prop() options: SelectOptionsString | SelectOptionsNumber = DEFAULT_SELECT_OPTION;
  /** Used for id field */
  @Prop() fieldId: string;

  contructSelectOptions(opts: SelectOptionsString | SelectOptionsNumber) {
    let content = [];
    opts.forEach((opt: SelectOptionString | SelectOptionNumber) => content.push(<option value={opt.value}>{opt.label}</option>));
  
    return content;
  };

  render() {
    return (
      <select id={this.fieldId} class={styleNuker(this.overrideStyle, STATIC_SELECT_CLASS_NAME, select)}>
        {this.contructSelectOptions(this.options)}
      </select>
    );
  }
}