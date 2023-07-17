import { AUTH_CATEGORY } from '../src/Platform/constants';
import UserAgent, {
	addAuthCategoryToCognitoUserAgent,
	addFrameworkToCognitoUserAgent,
	appendToCognitoUserAgent,
	getAmplifyUserAgent,
} from '../src/UserAgent';

const DEFAULT_USER_AGENT = 'aws-amplify/0.1.x';
const USER_AGENT_FRAMEWORK0 = 'framework/0';
const USER_AGENT_AUTH = 'auth';

describe('UserAgent test', () => {
	beforeEach(() => {
		UserAgent.prototype.userAgent = DEFAULT_USER_AGENT;
		UserAgent.category = undefined;
		UserAgent.framework = undefined;
	});
	test('userAgent is set by default', () => {
		expect(UserAgent.prototype.userAgent).toBe(DEFAULT_USER_AGENT);
	});

	test('appendToCognitoUserAgent does nothing to the userAgent if nothing is passed into it', () => {
		appendToCognitoUserAgent();
		expect(UserAgent.prototype.userAgent).toBe(DEFAULT_USER_AGENT);
	});

	test('appendToCognitoUserAgent appends content to userAgent', () => {
		appendToCognitoUserAgent('test');
		expect(UserAgent.prototype.userAgent).toBe(`${DEFAULT_USER_AGENT} test`);

		expect(getAmplifyUserAgent()).toBe(`${DEFAULT_USER_AGENT} test`);
	});

	test('appendToCognitoUserAgent does not append duplicate content', () => {
		appendToCognitoUserAgent('test');
		appendToCognitoUserAgent('test');
		expect(UserAgent.prototype.userAgent).not.toBe(
			`${DEFAULT_USER_AGENT} test test`
		);

		expect(UserAgent.prototype.userAgent).toBe(`${DEFAULT_USER_AGENT} test`);

		expect(getAmplifyUserAgent()).toBe(`${DEFAULT_USER_AGENT} test`);
	});

	test('appendToCognitoUserAgent sets userAgent if userAgent has no content', () => {
		UserAgent.prototype.userAgent = '';
		appendToCognitoUserAgent('test');
		expect(UserAgent.prototype.userAgent).toBe('test');

		UserAgent.prototype.userAgent = undefined;
		appendToCognitoUserAgent('test');
		expect(UserAgent.prototype.userAgent).toBe('test');
	});

	test('addAuthCategoryToCognitoUserAgent sets category and shows category/action in user agent', () => {
		addAuthCategoryToCognitoUserAgent();
		expect(UserAgent.category).toBe(AUTH_CATEGORY);

		expect(getAmplifyUserAgent()).toBe(
			`${DEFAULT_USER_AGENT} ${USER_AGENT_AUTH}`
		);
	});

	test('addFrameworkToCognitoUserAgent sets framework and shows framework in user agent', () => {
		addFrameworkToCognitoUserAgent('0');
		expect(UserAgent.framework).toBe('0');

		expect(getAmplifyUserAgent()).toBe(
			`${DEFAULT_USER_AGENT} ${USER_AGENT_FRAMEWORK0}`
		);
	});
});
