import * as exported from '../src/internals/index';

describe('import * keys', () => {
	it('should match snapshot', () => {
		expect(Object.keys(exported)).toMatchInlineSnapshot(`
		Array [
		  "addAuthCategoryToCognitoUserAgent",
		  "addFrameworkToCognitoUserAgent",
		]
	`);
	});
});
