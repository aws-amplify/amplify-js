import { Component, h } from '@stencil/core';

/**
 * @slot (default) - Content placed between the two horizontal rules
 */
@Component({
	tag: 'amplify-strike',
	styleUrl: 'amplify-strike.scss',
	scoped: true,
})
export class AmplifyStrike {
	componentWillLoad() {
		console.warn(
			'Version `1.x` of Amplify UI has been deprecated and will be removed in a future major version of `aws-amplify`. Please visit https://ui.docs.amplify.aws/ for the current version of Amplify UI.'
		);
	}

	render() {
		return (
			<span class="strike-content">
				<slot />
			</span>
		);
	}
}
