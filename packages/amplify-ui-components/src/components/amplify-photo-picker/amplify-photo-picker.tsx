import { Component, Prop, h, State } from '@stencil/core';
import { I18n } from '@aws-amplify/core';
import { Translations } from '../../common/Translations';

@Component({
	tag: 'amplify-photo-picker',
	styleUrl: 'amplify-photo-picker.scss',
	shadow: true,
})
export class AmplifyPhotoPicker {
	/** Title string value */
	@Prop() headerTitle?: string = Translations.PHOTO_PICKER_TITLE;
	/** Header Hint value in string */
	@Prop() headerHint?: string = Translations.PHOTO_PICKER_HINT;
	/** Placeholder hint that goes under the placeholder image */
	@Prop() placeholderHint?: string = Translations.PHOTO_PICKER_PLACEHOLDER_HINT;
	/** Picker button text as string */
	@Prop() buttonText?: string = Translations.PHOTO_PICKER_BUTTON_TEXT;
	/** Source of the image to be previewed */
	@Prop() previewSrc?: string | object;
	/** Function that handles file pick onClick */
	@Prop() handleClick?: (file: File) => void = () => {};
	/** Preview State tracks the change in preview source */
	@State() previewState: string;
	/** File slected through picker */
	@State() file: File;

	componentWillLoad() {
		console.warn(
			'Version `1.x` of Amplify UI has been deprecated and will be removed in a future major version of `aws-amplify`. Please visit https://ui.docs.amplify.aws/ for the current version of Amplify UI.'
		);

		this.previewState = this.previewSrc as string;
	}

	private handleInput = (ev: Event) => {
		this.file = (ev.target as HTMLInputElement).files[0];

		const reader = new FileReader();
		reader.onload = (_e: Event) => {
			const url = reader.result;
			this.previewState = url as string;
		};
		reader.readAsDataURL(this.file);
	};

	render() {
		return (
			<div class="photo-picker-container">
				<amplify-section>
					<div class="header">{I18n.get(this.headerTitle)}</div>
					<div class="header-hint">{I18n.get(this.headerHint)}</div>

					<amplify-picker
						acceptValue={'image/*'}
						inputHandler={this.handleInput}
					>
						<div class="picker-body" slot="picker">
							{this.previewState ? (
								<img src={`${this.previewState}`} />
							) : (
								<amplify-icon name="photoPlaceholder" />
							)}
						</div>
					</amplify-picker>

					<div class="placeholder-hint">{I18n.get(this.placeholderHint)}</div>

					<amplify-button handleButtonClick={() => this.handleClick(this.file)}>
						{I18n.get(this.buttonText)}
					</amplify-button>
				</amplify-section>
			</div>
		);
	}
}
