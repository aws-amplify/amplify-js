import { Component, Prop, h } from '@stencil/core';
import { I18n } from '@aws-amplify/core';
import { Translations } from '../../common/Translations';

@Component({
	tag: 'amplify-picker',
	styleUrl: 'amplify-picker.scss',
	shadow: true,
})
export class AmplifyPicker {
	/** Picker button text */
	@Prop() pickerText: string = Translations.PICKER_TEXT;
	/** File input accept value */
	@Prop() acceptValue: string = '*/*';
	/** File input onChange handler */
	@Prop() inputHandler: (e: Event) => void;

	componentWillLoad() {
		console.warn(
			'Version `1.x` of Amplify UI has been deprecated and will be removed in a future major version of `aws-amplify`. Please visit https://ui.docs.amplify.aws/ for the current version of Amplify UI.'
		);
	}

	render() {
		return (
			<div class="picker">
				<slot name="picker">
					<amplify-button>{I18n.get(this.pickerText)}</amplify-button>
				</slot>
				<input
					title={I18n.get(this.pickerText)}
					type="file"
					accept={this.acceptValue}
					onChange={e => this.inputHandler(e)}
				/>
			</div>
		);
	}
}
