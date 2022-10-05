import { Component, h } from '@stencil/core';

/**
 * @slot (default) - Content for the hint
 */
@Component({
	tag: 'amplify-hint',
	styleUrl: 'amplify-hint.scss',
	shadow: true,
})
export class AmplifyHint {
	componentWillLoad() {
		console.warn(
			'Version `1.x` of Amplify UI has been deprecated and will be removed in a future major version of `aws-amplify`. Please visit https://ui.docs.amplify.aws/ for the current version of Amplify UI.'
		);
	}

	render() {
		return (
			<div class="hint">
				<slot />
			</div>
		);
	}
}
