import { Component, Prop, h, State } from '@stencil/core';
import { I18n } from '@aws-amplify/core';
import { Translations } from '../../common/Translations';

@Component({
  tag: 'amplify-photo-picker',
  styleUrl: 'amplify-photo-picker.scss',
})
export class AmplifyPhotoPicker {
  @Prop() headerTitle?: string = I18n.get(Translations.PHOTO_PICKER_TITLE);
  @Prop() headerHint?: string = I18n.get(Translations.PHOTO_PICKER_HINT);
  @Prop() placeholderHint?: string = I18n.get(Translations.PHOTO_PICKER_PLACEHOLDER_HINT);
  @Prop() buttonText?: string = I18n.get(Translations.PHOTO_PICKER_BUTTON_TEXT);
  @Prop() previewSrc?: string | object;
  @Prop() onClickHandler?: (file: File) => void = () => {};

  @State() previewState: string;

  @State() file: File;

  componentWillLoad() {
    this.previewState = this.previewSrc as string;
  }

  private handleInput = ev => {
    this.file = ev.target.files[0];

    const reader = new FileReader();
    reader.onload = e => {
      const url = e.target.result;
      this.previewState = url as string;
    };
    reader.readAsDataURL(this.file);
  };

  render() {
    return (
      <div class="photo-picker-container">
        <amplify-section>
          <div class="header">{this.headerTitle}</div>
          <div class="header-hint">{this.headerHint}</div>

          <amplify-picker acceptValue={'image/*'} inputHandler={this.handleInput}>
            <div class="body" slot="picker">
              {this.previewState ? <img src={`${this.previewState}`} /> : <amplify-photo-placeholder />}
            </div>
          </amplify-picker>

          <div class="placeholder-hint">{this.placeholderHint}</div>

          <amplify-button handleButtonClick={() => this.onClickHandler(this.file)}>{this.buttonText}</amplify-button>
        </amplify-section>
      </div>
    );
  }
}
