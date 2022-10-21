import { Component, h, Host } from '@stencil/core';

/**
 * @slot (default) - Content placed within the container
 */
@Component({
	tag: 'amplify-container',
	styleUrl: 'amplify-container.scss',
})
export class AmplifyContainer {
	render() {
		return (
			<Host>
				<slot></slot>
			</Host>
		);
	}
}
