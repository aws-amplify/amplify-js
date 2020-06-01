import { Component, Prop, h, State } from '@stencil/core';

@Component({
  tag: 'amplify-photo-picker',
  styleUrl: 'amplify-photo-picker.scss',
})
export class AmplifyPhotoPicker {
  @Prop() headerTitle?: string = 'Header Title';
  @Prop() headerHint?: string = 'Ancilliary text or content may occupy this space here.';
  @Prop() placeholderHint?: string = 'Placeholder hint';
  @Prop() buttonText?: string = 'Button';
  @Prop() previewSrc?: string | object;
  @Prop() onClickHandler?: (file: File) => void = () => {};

  @State() previewState: string = this.previewSrc as string;
  @State() file: File;

  private handleInput = ev => {
    this.file = ev.target.files[0];
    console.log('finished', this.file);

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
