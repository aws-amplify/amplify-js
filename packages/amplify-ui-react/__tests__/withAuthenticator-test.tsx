import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { withAuthenticator } from '../src/withAuthenticator';

const App = () => <h1>My App</h1>;

describe('withAuthenticator', () => {
	it('should not render App initially', () => {
		const Wrapped = withAuthenticator(App);

		expect(renderToStaticMarkup(<Wrapped />)).toMatchInlineSnapshot(
			`"<amplify-container><amplify-auth-container><amplify-authenticator></amplify-authenticator></amplify-auth-container></amplify-container>"`
		);
	});

	it('should pass through props to the wrapped component', () => {
		const Dummy = ({ prop1 }) => <div>{prop1}</div>;
		const mockProp = 'mockProp';

		const useStateSpy = jest.spyOn(React, 'useState');
		useStateSpy.mockReturnValue([true, () => {}]);

		const Wrapped = withAuthenticator(Dummy);

		expect(
			renderToStaticMarkup(<Wrapped prop1={mockProp} />)
		).toMatchInlineSnapshot(`"<div>${mockProp}</div>"`);

		useStateSpy.mockRestore();
	});
});
