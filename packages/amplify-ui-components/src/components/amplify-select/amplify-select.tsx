import { Component, Prop, h, Watch } from '@stencil/core';
import {
	SelectOptionsString,
	SelectOptionsNumber,
	SelectOptionNumber,
	SelectOptionString,
} from './amplify-select-interface';
import { Logger } from '@aws-amplify/core';

const DEFAULT_SELECT_OPTION = [{ label: '', value: 1 }];
const logger = new Logger('amplify-select');

@Component({
	tag: 'amplify-select',
	styleUrl: 'amplify-select.scss',
	shadow: true,
})
export class AmplifySelect {
	/** The options of the select input. Must be an Array of Objects with an Object shape of {label: string, value: string|number} */
	@Prop() options:
		| SelectOptionsString
		| SelectOptionsNumber = DEFAULT_SELECT_OPTION;
	/** Used for id field */
	@Prop() fieldId: string;
	/** The callback, called when the select is modified by the user. */
	@Prop() handleInputChange?: (inputEvent: Event) => void;
	/** Default selected option */
	@Prop() selected?: string | number;

	private selectOptions;

	componentWillLoad() {
		this.selectOptions = this.contructSelectOptions(this.options);
	}

	@Watch('options')
	@Watch('selected')
	handleSelectOptionsChange() {
		this.selectOptions = this.contructSelectOptions(this.options);
	}

	isSelectedOptionValid(selected) {
		if (selected && !this.options.some(option => option.value === selected)) {
			logger.warn(
				'Selected option does not exist in options values, falling back to initial option'
			);
			return false;
		}
		return true;
	}

	private contructSelectOptions(
		opts: SelectOptionsString | SelectOptionsNumber
	) {
		this.isSelectedOptionValid(this.selected);

		const content = [];
		opts.forEach((opt: SelectOptionString | SelectOptionNumber) => {
			content.push(
				<option value={opt.value} selected={opt.value === this.selected}>
					{opt.label}
				</option>
			);
		});

		return content;
	}

	render() {
		return (
			<select
				name={this.fieldId}
				id={this.fieldId}
				class="select"
				onChange={this.handleInputChange}
			>
				{this.selectOptions}
			</select>
		);
	}
}
