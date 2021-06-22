import { Component, h } from '@stencil/core';

@Component({
	tag: 'amplify-loading-spinner',
	styleUrl: 'amplify-loading-spinner.scss',
	shadow: true,
})
export class AmplifyLoadingSpinner {
	render() {
		return <amplify-icon class="loading-spinner" name="loading" />;
	}
}
