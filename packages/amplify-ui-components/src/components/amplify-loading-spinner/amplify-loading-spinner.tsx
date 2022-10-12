import { Component, h } from '@stencil/core';

@Component({
	tag: 'amplify-loading-spinner',
	styleUrl: 'amplify-loading-spinner.scss',
	shadow: true,
})
export class AmplifyLoadingSpinner {
	componentWillLoad() {
		console.warn(
			'Version `1.x` of Amplify UI has been deprecated and will be removed in a future major version of `aws-amplify`. Please visit https://ui.docs.amplify.aws/ for the current version of Amplify UI.'
		);
	}
	render() {
		return <amplify-icon class="loading-spinner" name="loading" />;
	}
}
