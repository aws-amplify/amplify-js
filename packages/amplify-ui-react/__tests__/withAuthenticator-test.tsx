import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { withAuthenticator } from '../src/withAuthenticator';

const App = () => <h1>My App</h1>;

describe('withAuthenticator', () => {
	it('should not render App initially', () => {
		const Wrapped = withAuthenticator(App);

		expect(renderToStaticMarkup(<Wrapped />)).toMatchInlineSnapshot(
			`"<div class=\"amplify-authenticator-wrapper\" style=\"display:flex;align-items:center;justify-content:center;height:100vh\"><amplify-authenticator></amplify-authenticator></div>"`
		);
	});
});
