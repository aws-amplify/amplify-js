import { Component, h, Host } from '@stencil/core';

/**
 * @slot (default) - Content placed within the container
 */
@Component({
	tag: 'amplify-container',
	styleUrl: 'amplify-container.scss',
})
export class AmplifyContainer {
	componentWillLoad() {
		console.warn(
			'Version `1.x` of Amplify UI has been deprecated and will be removed in a future major version of `aws-amplify`. Please visit https://ui.docs.amplify.aws/ for the current version of Amplify UI.'
		);
	}

	render() {
		return (
			<Host>
				<slot></slot>
			</Host>
		);
	}
}
