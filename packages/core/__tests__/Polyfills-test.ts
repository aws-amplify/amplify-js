(<any>global).window.localStorage = null;

import '../src/Polyfills';

describe('Polyfills unit test', () => {
    describe('add-get remove-get case', () => {
        test('adding and getting object', () => {
            (<any>global).window.localStorage.setItem('key', 'value');

            expect.assertions(2);

            const result1 = (<any>global).window.localStorage.getItem('key');
            expect(result1).toBe('value');

            (<any>global).window.localStorage.removeItem('key');
            const result2 = (<any>global).window.localStorage.getItem('key');
            expect(result2).toBe(null);
        });
    });
});
