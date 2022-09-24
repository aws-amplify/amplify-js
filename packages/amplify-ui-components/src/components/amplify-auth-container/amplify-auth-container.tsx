import { Component, h, Host } from '@stencil/core';

/**
 * @slot (default) - Content placed within the container
 */
@Component({
	tag: 'amplify-auth-container',
})
export class AmplifyAuthContainer {
	componentWillLoad() {
		console.warn(
			'Version `1.x` of Amplify UI has been deprecated and will be removed in a future major version of `aws-amplify`. Please visit https://ui.docs.amplify.aws/ for the current version of Amplify UI.'
		);
	}
	render() {
		return (
			<Host>
				<form autoComplete="on" hidden>
					<input name="username"></input>
					<input name="password" type="password"></input>
					<input type="submit"></input>
				</form>
				<slot></slot>
			</Host>
		);
	}
}
