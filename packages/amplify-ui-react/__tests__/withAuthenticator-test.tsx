import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { withAuthenticator } from '../src/withAuthenticator';

const App = () => <h1>My App</h1>;

describe('withAuthenticator', () => {
	it('should wrap App with AmplifyAuthenticator', () => {
		const Wrapped = withAuthenticator(App);

		expect(renderToStaticMarkup(<Wrapped />)).toMatchInlineSnapshot(
			`"<amplify-authenticator><h1>My App</h1></amplify-authenticator>"`
		);
	});
});
