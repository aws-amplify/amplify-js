import { MapEntries, AmplifyMessageMap } from '../src/AmplifyMessageMap';

test('MapEntries', () => {
	expect(MapEntries).toEqual([
		['User does not exist', /user.*not.*exist/i],
		['User already exists', /user.*already.*exist/i],
		['Incorrect username or password', /incorrect.*username.*password/i],
		['Invalid password format', /validation.*password/i],
		[
			'Invalid phone number format',
			/invalid.*phone/i,
			'Invalid phone number format. Please use a phone number format of +12345678900',
		],
	]);
});

test('AmplifyMessageMap error message', () => {
	expect(AmplifyMessageMap('user not exist')).toBe('User does not exist');
});

test('AmplifyMessageMap happy case', () => {
	expect(AmplifyMessageMap('')).toBe('');
});

test('AmplifyMessageMap no match', () => {
	expect(AmplifyMessageMap('abc')).toBe('abc');
});

test('AmplifyMessageMap return message instead of i18n token if message exists', () => {
	expect(AmplifyMessageMap('invalid phone')).toBe(
		'Invalid phone number format. Please use a phone number format of +12345678900'
	);
});
